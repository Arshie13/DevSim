import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import { PUBLIC_WS_URL } from "$env/static/public";

// Get WebSocket URL for terminal connection
// In production, set PUBLIC_WS_URL environment variable to the WebSocket server URL
// e.g., PUBLIC_WS_URL=ws://localhost:3001
function getTerminalWsUrl(containerId: string, sessionId: string): string {
  const wsUrl = process.env.NODE_ENV === 'production' ? PUBLIC_WS_URL : 'ws://localhost:8080';
  
  if (wsUrl) {
    return `${wsUrl}/terminal?containerId=${containerId}&sessionId=${sessionId}`;
  }
  
  // Development: use same host
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/terminal?containerId=${containerId}&sessionId=${sessionId}`;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

export class TerminalInitializer {
  private terminal: Terminal | null = null;
  private fitAddon: FitAddon | null = null;
  private socket: WebSocket | null = null;
  private containerId: string = "";
  private sessionId: string = "";
  private dataListenerRegistered: boolean = false;
  private commandBuffer: string = "";
  private outputBuffer: string = "";
  private pendingCommandForCompletion: string | null = null;
  private waitingForFreshPrompt: boolean = false;
  private intentionalClose: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  async initializeDockerTerminal(terminalRef: HTMLElement, containerId: string, sessionId: string) {
    if (typeof window === "undefined") return;

    this.containerId = containerId;
    this.sessionId = sessionId;

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
      this.intentionalClose = false;
      this.connectSocket(false);

      window.addEventListener("resize", () => {
        this.fitAddon?.fit();
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

  private connectSocket(isReconnect: boolean) {
    const cols = this.terminal?.cols ?? 80;
    const rows = this.terminal?.rows ?? 24;
    const wsUrl = `${getTerminalWsUrl(this.containerId, this.sessionId)}&cols=${cols}&rows=${rows}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      if (!isReconnect) {
        this.terminal?.writeln("\x1b[1;32mCONNECTED TO DOCKER CONTAINER\x1b[0m");
      }
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
      if (!this.intentionalClose) {
        this.terminal?.writeln("\r\n\x1b[31m🔌 Terminal disconnected\x1b[0m");
        this.scheduleReconnect();
      }
    };

    this.socket.onerror = () => {
      // onclose will fire after this
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

  private scheduleReconnect() {
    if (this.intentionalClose) return;
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.terminal?.writeln("\r\n\x1b[31m⚠️ Max reconnect attempts reached. Click Refresh to try again.\x1b[0m");
      return;
    }

    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY
    );
    this.reconnectAttempts++;

    this.terminal?.writeln(`\r\n\x1b[1;33m⟳ Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})\x1b[0m`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.intentionalClose) return;
      this.connectSocket(true);
    }, delay);
  }

  private trackCommandInput(data: string) {
    if (typeof window === "undefined") return;

    const sanitizedData = data
      .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, "")
      .replace(/\[(?:200|201)~/g, "");

    for (const ch of sanitizedData) {
      if (ch === "\r") {
        const command = this.commandBuffer.trim().replace(/\s+/g, " ");
        if (command.length > 0) {
          if (!this.pendingCommandForCompletion) {
            this.pendingCommandForCompletion = command;
            this.outputBuffer = "";
            this.waitingForFreshPrompt = true;
            window.dispatchEvent(
              new CustomEvent("devsim-terminal-command", {
                detail: { command, containerId: this.containerId },
              }),
            );
          }
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
    
    this.intentionalClose = false;
    this.cancelReconnect();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.terminal.clear();
    this.terminal.writeln("\x1b[1;33mReconnecting terminal...\x1b[0m");
    
    this.connectSocket(false);
  }

  write(data: string) {
    this.terminal?.write(data);
  }

  fit() {
    this.fitAddon?.fit();
  }

  dispose() {
    this.intentionalClose = true;
    this.cancelReconnect();
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
  }

  private cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }
}
