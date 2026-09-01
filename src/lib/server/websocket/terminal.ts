import { WebSocketServer, WebSocket } from 'ws';
import Dockerode from 'dockerode';
import { docker } from '$lib/server/docker/client';
import http from 'http';
import type { Duplex } from 'stream';
import { checkCommandBlacklist } from '$lib/utils/terminal-command-blacklist';

// Server configuration
const PORT = parseInt(process.env.PORT || '8080', 10);

interface TerminalSession {
  ws: WebSocket | null;
  containerId: string;
  sessionId: string;
  execStream: Duplex;
  exec: Dockerode.Exec;
  graceTimer: ReturnType<typeof setTimeout> | null;
}

const SESSION_GRACE_MS = 30 * 60 * 1000; // 30 minutes
const sessions: Map<string, TerminalSession> = new Map();

function detachWs(ws: WebSocket | null, execStream: Duplex) {
  if (ws) {
    ws.removeAllListeners('message');
    ws.removeAllListeners('close');
  }
  execStream.removeAllListeners('data');
}

function attachWs(ws: WebSocket, execStream: Duplex, resizeExec: (dims: { h: number; w: number }) => Promise<void>) {
  let inputBuffer = '';

  ws.on('message', (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'resize' && typeof msg.cols === 'number' && typeof msg.rows === 'number') {
        resizeExec({ h: msg.rows, w: msg.cols }).catch(() => {});
        return;
      }
    } catch { /* not JSON — treat as raw terminal input */ }

    const text = data.toString();
    let output = '';
    for (const ch of text) {
      if (ch === '\r') {
        const command = inputBuffer.trim().replace(/\s+/g, ' ');
        inputBuffer = '';
        if (command.length > 0) {
          const result = checkCommandBlacklist(command);
          if (result.blocked) {
            if (execStream?.writable) {
              execStream.write('\x15');
            }
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(`\r\n\x1b[31m⚠️ ${result.reason}: ${command}\x1b[0m\r\n`);
              ws.send('\x1b[1;32m$ \x1b[0m');
            }
            return;
          }
        }
        output += ch;
        continue;
      }
      if (ch === '\u007f' || ch === '\b') {
        if (inputBuffer.length > 0) inputBuffer = inputBuffer.slice(0, -1);
        output += ch;
        continue;
      }
      if (ch === '\u0003') {
        inputBuffer = '';
        output += ch;
        continue;
      }
      if (ch === '\u001b' || ch < ' ') {
        output += ch;
        continue;
      }
      inputBuffer += ch;
      output += ch;
    }

    if (output && execStream?.writable) {
      execStream.write(output);
    }
  });

  execStream.on('data', (chunk: Buffer) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  });
}

export function createTerminalWSServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://localhost:${PORT}`);
    
    if (url.pathname === '/terminal' || request.url?.startsWith('/terminal')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', async (ws: WebSocket, request: http.IncomingMessage) => {
    const url = new URL(request.url || '', `http://localhost:${PORT}`);
    const containerId = url.searchParams.get('containerId');
    const sessionId = url.searchParams.get('sessionId') || 'default';
    const initialCols = parseInt(url.searchParams.get('cols') || '80', 10);
    const initialRows = parseInt(url.searchParams.get('rows') || '24', 10);

    if (!containerId) {
      ws.close(1008, 'Missing containerId parameter');
      return;
    }

    const sessionKey = `${containerId}-${sessionId}`;
    console.log(`🔌 Terminal connected: ${sessionKey}`);

    let execStream: any = null;
    let exec: Dockerode.Exec | null = null;

    try {
      const existing = sessions.get(sessionKey);
      if (existing) {
        console.log(`♻️  Reattaching to existing session: ${sessionKey}`);
        clearTimeout(existing.graceTimer as ReturnType<typeof setTimeout>);
        existing.graceTimer = null;

        detachWs(existing.ws, existing.execStream);
        if (existing.ws?.readyState === WebSocket.OPEN || existing.ws?.readyState === WebSocket.CONNECTING) {
          existing.ws.close();
        }

        execStream = existing.execStream;
        existing.ws = ws;
        attachWs(ws, execStream, (dims) => existing.exec.resize(dims).catch(() => {}));

        try {
          await existing.exec.resize({ h: initialRows, w: initialCols });
        } catch {}

        ws.send('\x1b[1;33m🔗 Reconnected to existing terminal session. Press Ctrl + C to activate\x1b[0m\r\n');
        existing.execStream.write('\x1b[1;32m$ \x1b[0m');

        ws.on('close', () => {
          console.log(`🔌 WebSocket disconnected (session kept alive): ${sessionKey}`);
          detachWs(existing.ws, existing.execStream);
          existing.ws = null;
          existing.graceTimer = setTimeout(() => {
            console.log(`⏰ Session grace period expired, cleaning up: ${sessionKey}`);
            try {
              if (existing.execStream?.writable) {
                existing.execStream.write('exit\r\n');
              }
              setTimeout(() => {
                try { existing.execStream?.destroy(); } catch {}
              }, 500);
            } catch {}
            sessions.delete(sessionKey);
          }, SESSION_GRACE_MS);
        });

        const cleanupExec = () => {
          clearTimeout(existing.graceTimer as ReturnType<typeof setTimeout>);
          try { execStream?.destroy(); } catch {}
          if (ws.readyState === WebSocket.OPEN) ws.close();
          sessions.delete(sessionKey);
        };
        execStream.on('end', cleanupExec);
        execStream.on('error', (err: Error) => {
          console.error('Exec stream error:', err);
          cleanupExec();
        });

        return;
      }

      const container = docker.getContainer(containerId);

      const info = await container.inspect();
      if (info.State.Status !== 'running') {
        ws.send('\x1b[31m⚠️ Container is not running.\x1b[0m\r\n');
        ws.close(1011, 'Container not running');
        return;
      }

      exec = await container.exec({
        Cmd: ['/bin/sh'],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
      });

      execStream = await exec.start({
        hijack: true,
        stdin: true,
        Tty: true,
      });

      await exec.resize({ h: initialRows, w: initialCols }).catch(() => {});

      execStream.write('cd /workspace && clear\r\n');
      execStream.write('\x1b[1;32m$ \x1b[0m');

      const session: TerminalSession = {
        ws,
        containerId,
        sessionId,
        execStream,
        exec,
        graceTimer: null,
      };
      sessions.set(sessionKey, session);

      attachWs(ws, execStream, (dims) => exec!.resize(dims).catch(() => {}));

      const cleanupExisting = () => {
        clearTimeout(session.graceTimer as ReturnType<typeof setTimeout>);
        try {
          if (execStream?.writable) {
            execStream.write('exit\r\n');
          }
          setTimeout(() => {
            try { execStream?.destroy(); } catch {}
          }, 500);
        } catch {}
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        sessions.delete(sessionKey);
      };

      ws.on('close', () => {
        console.log(`🔌 WebSocket disconnected (session kept alive): ${sessionKey}`);
        detachWs(session.ws as WebSocket, session.execStream);
        session.ws = null;
        session.graceTimer = setTimeout(() => {
          console.log(`⏰ Session grace period expired, cleaning up: ${sessionKey}`);
          try {
            if (session.execStream?.writable) {
              session.execStream.write('exit\r\n');
            }
            setTimeout(() => {
              try { session.execStream?.destroy(); } catch {}
            }, 500);
          } catch {}
          sessions.delete(sessionKey);
        }, SESSION_GRACE_MS);
      });

      execStream.on('end', cleanupExisting);
      execStream.on('error', (err: Error) => {
        console.error('Exec stream error:', err);
        cleanupExisting();
      });

      console.log(`✅ Terminal shell created for: ${sessionKey}`);

    } catch (error: any) {
      console.error('Terminal setup failed:', error);
      ws.send(`\x1b[31m💥 Terminal error: ${error.message || 'unknown'}\x1b[0m\r\n`);
      ws.close(1011, 'Internal error');
    }
  });

  return wss;
}

export function gracefulTerminalShutdown(wss: WebSocketServer, server: http.Server) {
  console.log('🛑 Shutting down Terminal WebSocket server...');
  
  sessions.forEach((session) => {
    try {
      clearTimeout(session.graceTimer as ReturnType<typeof setTimeout>);
      session.execStream?.destroy();
      session.ws?.close();
    } catch { }
  });
  sessions.clear();

  wss.close(() => {
    console.log('✅ Terminal WebSocket server closed');
  });
}

function gracefulShutdown(wss: WebSocketServer, server: http.Server) {
  console.log('🛑 Shutting down WebSocket server...');
  
  sessions.forEach((session) => {
    try {
      clearTimeout(session.graceTimer as ReturnType<typeof setTimeout>);
      session.execStream?.destroy();
      session.ws?.close();
    } catch { }
  });
  sessions.clear();

  wss.close(() => {
    server.close(() => {
      console.log('✅ WebSocket server closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('Forced exit after timeout');
    process.exit(1);
  }, 10000);
}

async function main() {
  const server = http.createServer();
  const wss = createTerminalWSServer(server);

  server.listen(PORT, () => {
    console.log(`✅ Terminal WebSocket server ready`);
    console.log(`   WS endpoint: ws://localhost:${PORT}/terminal`);
    console.log(`   Press Ctrl+C to stop`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });

  process.on('SIGINT', () => gracefulShutdown(wss, server));
  process.on('SIGTERM', () => gracefulShutdown(wss, server));
}

main().catch(console.error);
