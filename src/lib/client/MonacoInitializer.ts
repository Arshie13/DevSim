import loader, { type Monaco as MonaocType } from "@monaco-editor/loader";
import type { editor } from "monaco-editor";

export class MonacoInitializer {
  private editor: editor.IStandaloneCodeEditor | null = null;
  private monaco: MonaocType = null;

  async initialize(
    editorRef: HTMLElement,
    initialValue: string,
    onSave?: () => void,
    onChange?: (value: string) => void
  ) {
    if (typeof window === "undefined") return;

    try {
      this.monaco = await loader.init();
      this.editor = this.monaco.editor.create(editorRef, {
        value: initialValue,
        language: "typescript",
        theme: "vs-dark",
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });

      // Disable TypeScript/JavaScript diagnostics (linting)
      this.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });

      // Listen for editor changes
      if (onChange) {
        this.editor!.onDidChangeModelContent(() => {
          const value = this.editor?.getValue() || "";
          onChange(value);
        });
      }

      // Add save keyboard shortcut
      if (onSave) {
        this.editor!.addCommand(
          this.monaco.KeyMod.CtrlCmd | this.monaco.KeyCode.KeyS,
          () => {
            onSave();
          }
        );
      }

      return this.editor;
    } catch (error) {
      console.error("Failed to initialize Monaco editor:", error);
      throw error;
    }
  }

  getLanguageFromFilename(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      case "md":
        return "markdown";
      default:
        return "plaintext";
    }
  }

  setValue(value: string) {
    if (this.editor && this.editor.getValue() !== value) {
      this.editor.setValue(value);
    }
  }

  getValue(): string {
    return this.editor?.getValue() || "";
  }

  setReadOnly(readOnly: boolean) {
    if (!this.editor) return;
    this.editor.updateOptions({
      readOnly,
      domReadOnly: readOnly,
    });
  }

  setLanguageFromFilename(filename: string) {
    const language = this.getLanguageFromFilename(filename);
    if (this.editor && this.monaco) {
      const model = this.editor.getModel();
      if (model) {
        this.monaco.editor.setModelLanguage(model, language);
      }
    }
  }

  revealLine(lineNumber: number, searchTerm?: string) {
    if (!this.editor) return;

    this.editor.revealLineInCenter(lineNumber);

    if (searchTerm) {
      const model = this.editor.getModel();
      if (model) {
        const lineContent = model.getLineContent(lineNumber);
        const matchIndex = lineContent.toLowerCase().indexOf(searchTerm.toLowerCase());
        if (matchIndex !== -1) {
          const startColumn = matchIndex + 1;
          const endColumn = startColumn + searchTerm.length;
          this.editor.setSelection({
            startLineNumber: lineNumber,
            startColumn,
            endLineNumber: lineNumber,
            endColumn,
          });
          this.editor.createDecorationsCollection([
            {
              range: {
                startLineNumber: lineNumber,
                startColumn,
                endLineNumber: lineNumber,
                endColumn,
              },
              options: {
                className: 'search-highlight-match',
                inlineClassName: 'search-highlight-match-inline',
              },
            },
          ]);
        } else {
          this.editor.setPosition({ lineNumber, column: 1 });
        }
      }
    } else {
      this.editor.setPosition({ lineNumber, column: 1 });
    }

    this.editor.focus();
  }

  dispose() {
    this.editor?.dispose();
    this.editor = null;
    this.monaco = null;
  }
}
