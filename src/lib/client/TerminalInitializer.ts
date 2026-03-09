import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import type { WebLinksAddon } from "@xterm/addon-web-links";

export class TerminalInitializer {
  private terminal: Terminal | null = null;
  private fitAddon: FitAddon | null = null;

  constructor() { }

  async initializeDockerTerminal(terminalRef: HTMLElement, containerId: string) {
    if (typeof window === "undefined") return;

    try {
      const xtermPkg = await import("@xterm/xterm");
      const fitPkg = await import("@xterm/addon-fit");
      const linksPkg = await import("@xterm/addon-web-links");
      await import("@xterm/xterm/css/xterm.css");

      const TerminalConstructor = (xtermPkg as any).Terminal || (xtermPkg as any).default?.Terminal || (xtermPkg as any).default;
      const FitAddonConstructor = (fitPkg as any).FitAddon || (fitPkg as any).default?.FitAddon || (fitPkg as any).default;
      const WebLinksAddonConstructor = (linksPkg as any).WebLinksAddon || (linksPkg as any).default?.WebLinksAddon || (linksPkg as any).default;

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
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/terminal?containerId=${containerId}`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("🚀 Terminal WebSocket Connected");
        this.terminal?.writeln("\x1b[1;32mCONNECTED TO DOCKER CONTAINER\x1b[0m");
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          this.terminal?.write(event.data);
        } else {
          event.data.arrayBuffer().then((buffer: ArrayBuffer) => {
            this.terminal?.write(new Uint8Array(buffer));
          });
        }
      };

      socket.onclose = () => {
        this.terminal?.writeln("\r\n\x1b[31m🔌 Terminal disconnected\x1b[0m");
      };

      this.terminal!.onData((data) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data);
        }
      });

      window.addEventListener("resize", () => {
        this.fitAddon?.fit();
      });

      return this.terminal;
    } catch (error) {
      console.error("Failed to initialize Docker terminal:", error);
      throw error;
    }
  }

  write(data: string) {
    this.terminal?.write(data);
  }

  fit() {
    this.fitAddon?.fit();
  }

  dispose() {
    this.terminal?.dispose();
    this.terminal = null;
    this.fitAddon = null;
  }
}
