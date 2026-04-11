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

// Docker client setup (inline since build doesn't include $lib)
const docker = new Dockerode({
  socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock'
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

wss.on('connection', async (ws, request) => {
  const url = new URL(request.url || '', `http://localhost:${PORT}`);
  const containerId = url.searchParams.get('containerId');

  if (!containerId) {
    ws.close(1008, 'Missing containerId parameter');
    return;
  }

  console.log(`🔌 Terminal connected to container: ${containerId}`);

  let execStream = null;

  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    
    if (info.State.Status !== 'running') {
      ws.send('\x1b[31m⚠️ Container is not running.\x1b[0m\r\n');
      ws.close(1011, 'Container not running');
      return;
    }

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

    execStream.write('cd /workspace && clear\r\n');
    execStream.write('\x1b[1;32m$ \x1b[0m');

    ws.on('message', (data) => {
      if (execStream?.writable) {
        execStream.write(data);
      }
    });

    execStream.on('data', (chunk) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(chunk);
      }
    });

    const cleanup = () => {
      try {
        if (execStream?.writable) {
          execStream.write('exit\r\n');
        }
        setTimeout(() => {
          try {
            execStream?.destroy();
          } catch { }
        }, 500);
      } catch { }
      if (ws.readyState === ws.OPEN) {
        ws.close();
      }
    };

    ws.on('close', cleanup);
    execStream.on('end', cleanup);
    execStream.on('error', (err) => {
      console.error('Exec stream error:', err);
      cleanup();
    });

    console.log(`✅ Terminal shell created for container: ${containerId}`);

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
