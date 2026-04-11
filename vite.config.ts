// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  optimizeDeps: {
    include: [
      '@xterm/xterm',
      '@xterm/addon-fit',
      '@xterm/addon-web-links'
    ]
  },
  ssr: {
    noExternal: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-web-links']
  },
  plugins: [
    sveltekit()
  ],
  server: {
    https: {
      key: fs.readFileSync('./cert/localhost+1-key.pem'),
      cert: fs.readFileSync('./cert/localhost+1.pem'),
    },
    proxy: {
      // Forward /terminal WebSocket connections to the standalone ws:terminal
      // server (pnpm ws:terminal) during development.  This makes the fallback
      // URL in TerminalInitializer work even when PUBLIC_WS_URL is not set.
      '/terminal': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      }
    },
    allowedHosts: true,
  }
});
