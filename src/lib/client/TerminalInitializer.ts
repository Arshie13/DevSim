import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import { PUBLIC_WS_URL } from "$env/static/public";

// Get WebSocket URL for terminal connection
// In production, set PUBLIC_WS_URL environment variable to the WebSocket server URL
// e.g., PUBLIC_WS_URL=ws://localhost:3001
function getTerminalWsUrl(containerId: string): string {
  // Check for custom WebSocket URL (set in production)
  // const wsUrl = (typeof window !== 'undefined' 
  //   ? (window as string).ENV?.PUBLIC_WS_URL 
  //   : null) || process.env.PUBLIC_WS_URL;

  const wsUrl = process.env.NODE_ENV === 'production' ? PUBLIC_WS_URL : 'ws://localhost:8080'; // Default to localhost with Vite dev server port
  
  if (wsUrl) {
    return `${wsUrl}/terminal?containerId=${containerId}`;
  }
  
  // Development: use same host
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/terminal?containerId=${containerId}`;
}

export class TerminalInitializer {
  private terminal: Terminal | null = null;
  private fitAddon: FitAddon | null = null;
  private socket: WebSocket | null = null;
  private containerId: string = "";
  private dataListenerRegistered: boolean = false;

  async initializeDockerTerminal(terminalRef: HTMLElement, containerId: string) {
    if (typeof window === "undefined") return;

    this.containerId = containerId;

    try {
      const xtermPkg = await import("@xterm/xterm");
      const fitPkg = await import("@xterm/addon-fit");
      const linksPkg = await import("@xterm/addon-web-links");
      await import("@xterm/xterm/css/xterm.css");

      const TerminalConstructor = xtermPkg.Terminal || xtermPkg.default?.Terminal || xtermPkg.default;
      const FitAddonConstructor = fitPkg.FitAddon || fitPkg.default?.FitAddon || fitPkg.default;
      const WebLinksAddonConstructor = linksPkg.WebLinksAddon || linksPkg.default?.WebLinksAddon || linksPkg.default;

      this.terminal = new TerminalConstructor({
        convertEol: true,
        fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
        fontSize: 14,
        theme: {
          background: "#1e1e1e",
          foreground: "#d4d4d4",
          cursor: "#aeafad",
          selectionBackground: "#3e4451",
          black: "#1e1e1e",
          red: "#e06c75",
          green: "#98c379",
          yellow: "#d19a66",
          blue: "#61afef",
          magenta: "#c678dd",
          cyan: "#56b6c2",
          white: "#d4d4d4",
        },
      });

      this.fitAddon = new FitAddonConstructor();
      this.terminal!.loadAddon(this.fitAddon!);
      this.terminal!.loadAddon(new WebLinksAddonConstructor());

      this.terminal!.open(terminalRef);
      this.fitAddon!.fit();

      // Connect to Socket
      this.connectSocket();

      window.addEventListener("resize", () => {
        this.fitAddon?.fit();
      });

      return this.terminal;
    } catch (error) {
      console.error("Failed to initialize Docker terminal:", error);
      throw error;
    }
  }

  private connectSocket() {
    const wsUrl = getTerminalWsUrl(this.containerId);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.terminal?.writeln("\x1b[1;32mCONNECTED TO DOCKER CONTAINER\x1b[0m");
    };

    this.socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        this.terminal?.write(event.data);
      } else {
        event.data.arrayBuffer().then((buffer: ArrayBuffer) => {
          this.terminal?.write(new Uint8Array(buffer));
        });
      }
    };

    this.socket.onclose = () => {
      this.terminal?.writeln("\r\n\x1b[31m🔌 Terminal disconnected\x1b[0m");
    };

    // Only register the data listener once - don't add duplicate listeners on reconnect
    if (!this.dataListenerRegistered) {
      this.terminal!.onData((data) => {
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(data);
        }
      });
      this.dataListenerRegistered = true;
    }
  }

  reconnect() {
    if (!this.containerId || !this.terminal) return;
    
    // Close existing socket
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Clear terminal and show reconnecting message
    this.terminal.clear();
    this.terminal.writeln("\x1b[1;33mReconnecting terminal...\x1b[0m");
    
    // Reconnect - this will reuse the existing onData listener
    this.connectSocket();
  }

  write(data: string) {
    this.terminal?.write(data);
  }

  fit() {
    this.fitAddon?.fit();
  }

  dispose() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.terminal?.dispose();
    this.terminal = null;
    this.fitAddon = null;
  }
}
