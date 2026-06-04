import { WebSocketServer, WebSocket } from 'ws';
import Dockerode from 'dockerode';
import { docker } from '$lib/server/docker/client';
import http from 'http';
import type { Duplex } from 'stream';

// Server configuration
const PORT = parseInt(process.env.PORT || '8080', 10);

interface TerminalConnection {
  ws: WebSocket;
  containerId: string;
  execStream: Duplex;
}

const activeConnections: Map<string, TerminalConnection> = new Map();

export function createTerminalWSServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://localhost:${PORT}`);
    
    // Only handle /terminal path
    if (url.pathname === '/terminal' || request.url?.startsWith('/terminal')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Handle connections
  wss.on('connection', async (ws: WebSocket, request: http.IncomingMessage) => {
    const url = new URL(request.url || '', `http://localhost:${PORT}`);
    const containerId = url.searchParams.get('containerId');
    const initialCols = parseInt(url.searchParams.get('cols') || '80', 10);
    const initialRows = parseInt(url.searchParams.get('rows') || '24', 10);

    if (!containerId) {
      ws.close(1008, 'Missing containerId parameter');
      return;
    }

    console.log(`🔌 Terminal connected to container: ${containerId}`);

    let execStream: any = null;
    const connectionKey = `${containerId}-${Date.now()}`;

    try {
      const container = docker.getContainer(containerId);

      // Verify container exists & is running
      const info = await container.inspect();
      if (info.State.Status !== 'running') {
        ws.send('\x1b[31m⚠️ Container is not running.\x1b[0m\r\n');
        ws.close(1011, 'Container not running');
        return;
      }

      // Create interactive shell
      const exec = await container.exec({
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

      // Set PTY dimensions immediately so interactive CLIs (e.g. shadcn init) get correct size
      await exec.resize({ h: initialRows, w: initialCols }).catch(() => {});

      // Store connection for cleanup
      activeConnections.set(connectionKey, {
        ws,
        containerId,
        execStream,
      });

      // Send welcome message
      execStream.write('cd /workspace && clear\r\n');
      execStream.write('\x1b[1;32m$ \x1b[0m');

      // Forward browser → container (handle resize messages separately)
      ws.on('message', (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'resize' && typeof msg.cols === 'number' && typeof msg.rows === 'number') {
            exec.resize({ h: msg.rows, w: msg.cols }).catch(() => {});
            return;
          }
        } catch { /* not JSON — treat as raw terminal input */ }
        if (execStream?.writable) {
          execStream.write(data);
        }
      });

      // Forward container → browser
      execStream.on('data', (chunk: Buffer) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(chunk);
        }
      });

      // Cleanup function
      const cleanup = () => {
        activeConnections.delete(connectionKey);
        try {
          // Try graceful exit first
          if (execStream?.writable) {
            execStream.write('exit\r\n');
          }
          // Give it a moment then force destroy
          setTimeout(() => {
            try {
              execStream?.destroy();
            } catch { }
          }, 500);
        } catch { }
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };

      ws.on('close', cleanup);
      execStream.on('end', cleanup);
      execStream.on('error', (err: Error) => {
        console.error('Exec stream error:', err);
        cleanup();
      });

      console.log(`✅ Terminal shell created for container: ${containerId}`);

    } catch (error: any) {
      console.error('Terminal setup failed:', error);
      ws.send(`\x1b[31m💥 Terminal error: ${error.message || 'unknown'}\x1b[0m\r\n`);
      ws.close(1011, 'Internal error');
    }
  });

  return wss;
}

// Graceful shutdown helper
export function gracefulTerminalShutdown(wss: WebSocketServer, server: http.Server) {
  console.log('🛑 Shutting down Terminal WebSocket server...');
  
  // Close all connections
  activeConnections.forEach((conn, key) => {
    try {
      conn.execStream?.destroy();
      conn.ws.close();
    } catch { }
  });
  activeConnections.clear();

  wss.close(() => {
    console.log('✅ Terminal WebSocket server closed');
  });
}

// Standalone mode (for development with pnpm ws:terminal)
function gracefulShutdown(wss: WebSocketServer, server: http.Server) {
  console.log('🛑 Shutting down WebSocket server...');
  
  // Close all connections
  activeConnections.forEach((conn, key) => {
    try {
      conn.execStream?.destroy();
      conn.ws.close();
    } catch { }
  });
  activeConnections.clear();

  wss.close(() => {
    server.close(() => {
      console.log('✅ WebSocket server closed');
      process.exit(0);
    });
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced exit after timeout');
    process.exit(1);
  }, 10000);
}

// Main function for standalone terminal server (development)
async function main() {
  const server = http.createServer();
  const wss = createTerminalWSServer(server);

  server.listen(PORT, () => {
    console.log(`✅ Terminal WebSocket server ready`);
    console.log(`   WS endpoint: ws://localhost:${PORT}/terminal`);
    console.log(`   Press Ctrl+C to stop`);
  });

  // Handle errors
  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => gracefulShutdown(wss, server));
  process.on('SIGTERM', () => gracefulShutdown(wss, server));
}

main().catch(console.error);
