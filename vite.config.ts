// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { WebSocketServer } from 'ws';
import Docker from 'dockerode';
import type { Server } from 'http';
import os from 'os';

// Docker client
const docker = new Docker({
  socketPath: os.platform() === 'win32'
    ? '//./pipe/docker_engine'
    : '/var/run/docker.sock'
});

export default defineConfig({
  plugins: [
    sveltekit(),
    
    // 👇 Terminal WebSocket Plugin (dev only)
    {
      name: 'devsim-terminal-ws',
      configureServer(server) {
        if (!server.httpServer) return;

        const wss = new WebSocketServer({ noServer: true });

        // 🔑 CRITICAL: Only intercept /terminal — let Vite handle the rest!
        server.httpServer.on('upgrade', (request, socket, head) => {
          // ✅ Only handle /terminal — forward everything else to Vite
          if (request.url?.startsWith('/terminal')) {
            wss.handleUpgrade(request, socket, head, (ws) => {
              wss.emit('connection', ws, request);
            });
          }
          // 🚫 DO NOT call socket.destroy() — Vite needs other upgrades!
          // If it's not /terminal, Vite will handle it automatically.
        });

        // Terminal logic
        wss.on('connection', async (ws, request) => {
          const url = new URL(request.url || '', 'http://localhost');
          const containerId = url.searchParams.get('containerId');

          if (!containerId) {
            ws.close(1008, '❌ Missing containerId');
            return;
          }

          console.log(`🔌 Terminal connected to container: ${containerId}`);

          let execStream: any = null;

          try {
            const container = docker.getContainer(containerId);
            
            // Optional: verify container exists & is running
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

            // Send welcome + clear
            execStream.write('cd /workspace && clear\r\n');
            execStream.write('\x1b[1;32m$ \x1b[0m');

            // Forward browser → container
            ws.on('message', (data) => {
              if (execStream?.writable) {
                execStream.write(data);
              }
            });

            // Forward container → browser
            execStream.on('data', (chunk: Buffer) => {
              if (ws.readyState === ws.OPEN) {
                ws.send(chunk);
              }
            });

            // Cleanup
            const cleanup = () => {
              try {
                execStream?.destroy();
              } catch {}
              if (ws.readyState === ws.OPEN) ws.close();
            };

            ws.on('close', cleanup);
            execStream.on('end', cleanup);
            execStream.on('error', (err: Error) => {
              console.error('Exec stream error:', err);
              cleanup();
            });

          } catch (error: any) {
            console.error('Terminal setup failed:', error);
            ws.send(`\x1b[31m💥 Terminal error: ${error.message || 'unknown'}\x1b[0m\r\n`);
            ws.close(1011, 'Internal error');
          }
        });

        console.log('✅ Terminal WebSocket ready at /terminal');
      }
    }
  ]
});