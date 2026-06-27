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
  private sessionId: string = "default";
  private dataListenerRegistered: boolean = false;
  private commandBuffer: string = "";
  private outputBuffer: string = "";
  private pendingCommandForCompletion: string | null = null;
  private waitingForFreshPrompt: boolean = false;

  async initializeDockerTerminal(terminalRef: HTMLElement, containerId: string, sessionId?: string) {
    if (typeof window === "undefined") return;

    this.containerId = containerId;
    if (sessionId) this.sessionId = sessionId;

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
        this.fit();
        this.sendResize();
      });

      return this.terminal;
    } catch (error) {
      console.error("Failed to initialize Docker terminal:", error);
      throw error;
    }
  }

  private sendResize() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    if (!this.terminal) return;
    this.socket.send(JSON.stringify({ type: "resize", cols: this.terminal.cols, rows: this.terminal.rows }));
  }

  private connectSocket() {
    const cols = this.terminal?.cols ?? 80;
    const rows = this.terminal?.rows ?? 24;
    const wsUrl = `${getTerminalWsUrl(this.containerId)}&sessionId=${encodeURIComponent(this.sessionId)}&cols=${cols}&rows=${rows}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.terminal?.writeln("\x1b[1;32mCONNECTED TO DOCKER CONTAINER\x1b[0m");
      this.sendResize();
    };

    this.socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        this.trackCommandCompletion(event.data);
        this.terminal?.write(event.data);
      } else {
        event.data.arrayBuffer().then((buffer: ArrayBuffer) => {
          const chunk = new TextDecoder().decode(new Uint8Array(buffer));
          this.trackCommandCompletion(chunk);
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
        this.trackCommandInput(data);
        if (this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(data);
        }
      });
      this.dataListenerRegistered = true;
    }
  }

  private trackCommandInput(data: string) {
    if (typeof window === "undefined") return;

    // Remove xterm control/escape sequences so only real typed text is evaluated.
    const sanitizedData = data
      .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "")
      .replace(/\[(?:200|201)~/g, "");

    for (const ch of sanitizedData) {
      if (ch === "\r") {
        const command = this.commandBuffer.trim().replace(/\s+/g, " ");
        if (command.length > 0) {
          if (!this.pendingCommandForCompletion) {
            this.pendingCommandForCompletion = command;
            // Reset buffer so we only detect the next prompt produced after this command.
            this.outputBuffer = "";
            this.waitingForFreshPrompt = true;
            window.dispatchEvent(
              new CustomEvent("devsim-terminal-command", {
                detail: { command, containerId: this.containerId },
              }),
            );
          }
          // If there is already a pending command, this Enter is likely interactive input
          // for the running process (e.g., prisma migration name prompt), so we ignore it.
        }
        this.commandBuffer = "";
        continue;
      }

      if (ch === "\u007f") {
        this.commandBuffer = this.commandBuffer.slice(0, -1);
        continue;
      }

      if (ch < " " || ch === "\u001b") {
        continue;
      }

      this.commandBuffer += ch;
    }
  }

  private stripAnsi(value: string) {
    return value.replace(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, "");
  }

  private trackCommandCompletion(chunk: string) {
    if (typeof window === "undefined") return;
    if (!this.pendingCommandForCompletion) return;
    if (!this.waitingForFreshPrompt) return;

    const clean = this.stripAnsi(chunk);
    this.outputBuffer = `${this.outputBuffer}${clean}`.slice(-1200);

    // Prompt format in the tutorial shell is similar to: /workspace #
    const promptDetected = /(^|\n)[^\n]*\s#\s*$/.test(this.outputBuffer);
    if (!promptDetected) return;

    const completedCommand = this.pendingCommandForCompletion;
    this.pendingCommandForCompletion = null;
    this.waitingForFreshPrompt = false;
    window.dispatchEvent(
      new CustomEvent("devsim-terminal-command-complete", {
        detail: { command: completedCommand, containerId: this.containerId },
      }),
    );
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
    if (!this.terminal || !this.fitAddon) return;
    this.fitAddon.fit();
    this.terminal.refresh(0, this.terminal.rows - 1);
  }

  dispose() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.terminal?.dispose();
    this.terminal = null;
    this.fitAddon = null;
    this.commandBuffer = "";
    this.outputBuffer = "";
    this.pendingCommandForCompletion = null;
    this.waitingForFreshPrompt = false;
    this.sessionId = "default";
  }
}