import 'dotenv/config';
import { handler } from './build/handler.js';
import express from 'express';
import { createServer as createHttpsServer } from 'https';
import { WebSocketServer } from 'ws';
import Dockerode from 'dockerode';
import fs from 'fs';

const PORT = process.env.PORT || 4173;
const isProduction = process.env.NODE_ENV === 'production';

// Always use HTTPS for production domain
const useHttps = isProduction || process.env.NODE_ENV === 'production';

console.log('=== Server Configuration ===');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Use HTTPS:', useHttps);

const isWindows = process.platform === 'win32';
const docker = new Dockerode({
  socketPath: isWindows ? '//./pipe/docker_engine' : '/var/run/docker.sock'
});

const app = express();

// Create HTTP or HTTPS server - ALWAYS use HTTPS in production
let server;
const httpsOptions = {
  key: fs.readFileSync('./cert/localhost+1-key.pem'),
  cert: fs.readFileSync('./cert/localhost+1.pem'),
};
server = createHttpsServer(httpsOptions, app);

// Terminal WebSocket server
const wss = new WebSocketServer({ noServer: true });

// Persistent terminal sessions — survive WebSocket disconnects
const SESSION_GRACE_MS = 30 * 60 * 1000; // 30 minutes before cleaning up an orphaned session
const sessions = new Map();

console.log('Setting up upgrade handler for /terminal');

server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request received:', request.url);
  const url = new URL(request.url || '', `http://localhost:${PORT}`);
  
  if (url.pathname === '/terminal' || request.url?.startsWith('/terminal')) {
    console.log('Handling WebSocket upgrade for /terminal');
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    console.log('Destroying non-terminal upgrade request');
    socket.destroy();
  }
});

function detachWsFromSession(ws, execStream) {
  if (ws) {
    ws.removeAllListeners('message');
    ws.removeAllListeners('close');
  }
  if (execStream) {
    execStream.removeAllListeners('data');
  }
}

// Inline command blacklist (mirrors src/lib/utils/terminal-command-blacklist.ts)
// Keep in sync with the TS module. server.js runs outside the SvelteKit build,
// so it cannot import from $lib/utils.
const COMMAND_BLACKLIST = [
  { pattern: /^vimi?$/, reason: 'Text editors are not allowed' },
  { pattern: /^nano$/, reason: 'Text editors are not allowed' },
  { pattern: /^emacs$/, reason: 'Text editors are not allowed' },
  { pattern: /^nvim$/, reason: 'Text editors are not allowed' },
  { pattern: /^ed$/, reason: 'Text editors are not allowed' },
  { pattern: /^visudo$/, reason: 'Text editors are not allowed' },

  { pattern: /^sudo\b/, reason: 'Privilege escalation not allowed' },
  { pattern: /^su\b/, reason: 'Privilege escalation not allowed' },
  { pattern: /^doas\b/, reason: 'Privilege escalation not allowed' },

  { pattern: /^rm\s+-r[f]?\s+\/$/, reason: 'Cannot remove root filesystem' },
  { pattern: /^rm\s+-r[f]?\s+\/\*/, reason: 'Cannot remove root filesystem' },
  { pattern: /^rm\s+-r[f]?\s+~\/?$/, reason: 'Cannot remove home directory' },
  { pattern: /^rm\s+-r[f]?\s+\/workspace\/?$/, reason: 'Cannot remove workspace' },
  { pattern: /^rm\s+-[a-zA-Z]*r[a-zA-Z]*f/, reason: 'Recursive force delete not allowed' },
  { pattern: /^dd\b/, reason: 'Disk operations not allowed' },
  { pattern: /^mkfs/, reason: 'Filesystem formatting not allowed' },
  { pattern: /^fdisk\b/, reason: 'Disk partitioning not allowed' },
  { pattern: /^parted\b/, reason: 'Disk partitioning not allowed' },
  { pattern: /^blkid$/, reason: 'Disk operations not allowed' },
  { pattern: /^wipefs\b/, reason: 'Disk operations not allowed' },

  { pattern: /^reboot$/, reason: 'System control not allowed' },
  { pattern: /^shutdown/, reason: 'System control not allowed' },
  { pattern: /^poweroff$/, reason: 'System control not allowed' },
  { pattern: /^halt$/, reason: 'System control not allowed' },
  { pattern: /^init\s+[06]$/, reason: 'System control not allowed' },

  { pattern: /^systemctl\b/, reason: 'Service management not allowed' },
  { pattern: /^service\b/, reason: 'Service management not allowed' },

  { pattern: /^docker\b/, reason: 'Container commands not allowed' },
  { pattern: /^podman\b/, reason: 'Container commands not allowed' },
  { pattern: /^kubectl\b/, reason: 'Container commands not allowed' },
  { pattern: /^containerd\b/, reason: 'Container commands not allowed' },

  { pattern: /^ssh\b/, reason: 'Remote access not allowed' },
  { pattern: /^scp\b/, reason: 'Remote access not allowed' },
  { pattern: /^sftp\b/, reason: 'Remote access not allowed' },

  { pattern: /^mount\s/, reason: 'Filesystem mounting not allowed' },
  { pattern: /^umount\s/, reason: 'Filesystem mounting not allowed' },
  { pattern: /^mount$/, reason: 'Filesystem mounting not allowed' },
  { pattern: /^umount$/, reason: 'Filesystem mounting not allowed' },

  { pattern: /^crontab\b/, reason: 'Scheduled tasks not allowed' },
  { pattern: /^at\b/, reason: 'Scheduled tasks not allowed' },

  { pattern: /:\s*\(\s*\)\s*\{.*\|.*&.*\}\s*;/, reason: 'Fork bomb not allowed' },

  { pattern: /^env\b/, reason: 'Environment variables cannot be modified' },
  { pattern: /^printenv\b/, reason: 'Environment variables cannot be modified' },
  { pattern: /^unset\b/, reason: 'Environment variables cannot be modified' },
  { pattern: /^export\b/, reason: 'Environment variables cannot be modified' },
  { pattern: /^setenv\b/, reason: 'Environment variables cannot be modified' },
  { pattern: /\benv\s+[A-Za-z_][A-Za-z0-9_]*=/, reason: 'Environment variables cannot be modified' },
  { pattern: /\b[A-Z_][A-Z0-9_]*=[A-Za-z0-9_\-\/\.]+\s+/, reason: 'Environment variables cannot be modified' },

  { pattern: /^iptables\b/, reason: 'Network manipulation not allowed' },
  { pattern: /^nft\b/, reason: 'Network manipulation not allowed' },
  { pattern: /^ifconfig\b/, reason: 'Network manipulation not allowed' },

  { pattern: /^chown\s+root/, reason: 'Ownership change not allowed' },
  { pattern: /^chmod\s+(777|000|077)/, reason: 'Dangerous permission change not allowed' },
];

function extractCommand(input) {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';
  const firstSpace = trimmed.indexOf(' ');
  const cmdWithFlags = firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace);
  const lastSlash = cmdWithFlags.lastIndexOf('/');
  const cmd = lastSlash !== -1 ? cmdWithFlags.substring(lastSlash + 1) : cmdWithFlags;
  return cmd.toLowerCase();
}

function checkCommandBlacklist(input) {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { blocked: false };
  const cmd = extractCommand(trimmed);
  for (const entry of COMMAND_BLACKLIST) {
    if (entry.pattern.test(cmd)) return { blocked: true, reason: entry.reason };
  }
  for (const entry of COMMAND_BLACKLIST) {
    if (entry.pattern.test(trimmed)) return { blocked: true, reason: entry.reason };
  }
  return { blocked: false };
}

function attachWsToSession(ws, execStream, resizeExec) {
  let inputBuffer = '';

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'resize' && typeof msg.cols === 'number' && typeof msg.rows === 'number') {
        resizeExec?.({ h: msg.rows, w: msg.cols }).catch(() => {});
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
            if (ws.readyState === ws.OPEN) {
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

  execStream.on('data', (chunk) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(chunk);
    }
  });
}

wss.on('connection', async (ws, request) => {
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

  let execStream = null;
  let exec = null;

  try {
    // Check for existing persistent session
    const existing = sessions.get(sessionKey);
    if (existing) {
      console.log(`♻️  Reattaching to existing session: ${sessionKey}`);
      clearTimeout(existing.graceTimer);
      existing.graceTimer = null;

      // Detach old WS
      detachWsFromSession(existing.ws, existing.execStream);
      if (existing.ws && (existing.ws.readyState === existing.ws.OPEN || existing.ws.readyState === existing.ws.CONNECTING)) {
        existing.ws.close();
      }

      // Attach new WS
      execStream = existing.execStream;
      existing.ws = ws;
      attachWsToSession(ws, execStream, (dims) => existing.exec?.resize(dims).catch(() => {}));

      // Resize to match new client dimensions
      try {
        await existing.exec?.resize({ h: initialRows, w: initialCols });
      } catch {}

      ws.send('\x1b[1;33m🔗 Reconnected to existing terminal session. Press Ctrl + C to activate\x1b[0m\r\n');
      existing.execStream.write('\x1b[1;32m$ \x1b[0m');

      // Handle new WS close — only start grace timer, don't kill process
      ws.on('close', () => {
        console.log(`🔌 WebSocket disconnected (session kept alive): ${sessionKey}`);
        detachWsFromSession(existing.ws, existing.execStream);
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

      // Handle exec stream end/error — full cleanup (process actually died)
      const cleanupExec = () => {
        clearTimeout(existing.graceTimer);
        try { execStream?.destroy(); } catch {}
        if (ws.readyState === ws.OPEN) ws.close();
        sessions.delete(sessionKey);
      };
      execStream.on('end', cleanupExec);
      execStream.on('error', (err) => {
        console.error('Exec stream error:', err);
        cleanupExec();
      });

      return;
    }

    // No existing session — spawn a new shell
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

    // Store as persistent session
    const session = {
      ws,
      execStream,
      exec,
      containerId,
      sessionId,
      graceTimer: null,
    };
    sessions.set(sessionKey, session);

    attachWsToSession(ws, execStream, (dims) => exec.resize(dims).catch(() => {}));

    const cleanupExisting = () => {
      clearTimeout(session.graceTimer);
      try {
        if (execStream?.writable) {
          execStream.write('exit\r\n');
        }
        setTimeout(() => {
          try { execStream?.destroy(); } catch {}
        }, 500);
      } catch {}
      if (ws.readyState === ws.OPEN) {
        ws.close();
      }
      sessions.delete(sessionKey);
    };

    ws.on('close', () => {
      console.log(`🔌 WebSocket disconnected (session kept alive): ${sessionKey}`);
      detachWsFromSession(session.ws, session.execStream);
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
    execStream.on('error', (err) => {
      console.error('Exec stream error:', err);
      cleanupExisting();
    });

    console.log(`✅ Terminal shell created for: ${sessionKey}`);

  } catch (error) {
    console.error('Terminal setup failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'unknown';
    ws.send(`\x1b[31m💥 Terminal error: ${errorMessage}\x1b[0m\r\n`);
    ws.close(1011, 'Internal error');
  }
});

// Let SvelteKit handle all other requests
app.use(handler);

server.listen(PORT, () => {
  console.log(`✅ Server ready`);
  console.log(`   HTTPS: https://localhost:${PORT}`);
  console.log(`   WebSocket Terminal: wss://localhost:${PORT}/terminal`);
});
