// Context builder - creates context from user's progress, files, and tasks

export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export interface ContextOptions {
  scenario: string;
  tasks: Task[];
  fileTree: string[];
  fileContents: Record<string, string>;
  selectedFile: string;
  containerId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  maxFiles?: number;
  maxLinesPerFile?: number;
}

// Source code file extensions
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.cs', '.rb', '.php'];

/**
 * Build comprehensive context for the AI from user's current progress
 * @param options - Context building options
 * @returns Formatted context string
 */
export async function buildContext(options: ContextOptions): Promise<string> {
  const {
    scenario,
    tasks,
    fileTree,
    fileContents,
    selectedFile,
    containerId,
    conversationHistory = [],
    maxFiles = 5,
    maxLinesPerFile = 100,
  } = options;

  let context = `Current Scenario: ${scenario}\n\n`;

  // Add conversation history for context
  if (conversationHistory.length > 0) {
    context += `Conversation History:\n`;
    conversationHistory.forEach((msg) => {
      const role = msg.role === "user" ? "User" : "AI";
      // Truncate very long messages
      const content = msg.content.length > 300
        ? msg.content.substring(0, 300) + "..."
        : msg.content;
      context += `${role}: ${content}\n`;
    });
    context += "\n";
  }

  // Add file tree - show all files for context
  if (fileTree.length > 0) {
    context += `Project Files (${fileTree.length} files):\n`;
    // Show first 30 files to avoid context overflow
    const filesToShow = fileTree.slice(0, 30);
    filesToShow.forEach((file) => {
      context += `- ${file}\n`;
    });
    if (fileTree.length > 30) {
      context += `- ... and ${fileTree.length - 30} more files\n`;
    }
    context += "\n";
  }

  // Get important source files
  const importantFiles = fileTree.filter(f => 
    SOURCE_EXTENSIONS.some(ext => f.endsWith(ext))
  );

  // Prioritize files to read: selected file first, then others
  const filesToRead: string[] = [];

  // Always include the selected file if we have one
  if (selectedFile) {
    filesToRead.push(selectedFile);
  }

  // Add more important files we don't have content for
  for (const file of importantFiles) {
    if (filesToRead.length >= maxFiles) break;
    if (!fileContents[file] && file !== selectedFile) {
      filesToRead.push(file);
    }
  }

  // Fetch missing file contents from the container
  const fileContentsWithData = await fetchMissingFileContents(
    containerId,
    filesToRead,
    fileContents
  );

  // Add content of files with line numbers
  const filesWithContent = filesToRead.filter(f => fileContentsWithData[f]);

  for (const file of filesWithContent) {
    const content = fileContentsWithData[file];
    if (content) {
      context += `=== File: ${file} ===\n`;
      // Add line numbers to help with context
      const lines = content.split('\n');
      const linesToShow = lines.slice(0, maxLinesPerFile);

      linesToShow.forEach((line, index) => {
        const lineNum = index + 1;
        context += `${lineNum}: ${line}\n`;
      });

      if (lines.length > maxLinesPerFile) {
        context += `... (showing first ${maxLinesPerFile} of ${lines.length} lines)\n`;
      }
      context += "\n";
    }
  }

  // Add tasks with completion status
  context += `Tasks (${tasks.filter(t => t.completed).length}/${tasks.length} completed):\n`;
  tasks.forEach((task) => {
    const status = task.completed ? "[✓]" : "[ ]";
    context += `${status} ${task.text}\n`;
  });

  return context;
}

/**
 * Fetch missing file contents from the container
 */
async function fetchMissingFileContents(
  containerId: string,
  filesToRead: string[],
  existingContents: Record<string, string>
): Promise<Record<string, string>> {
  const result = { ...existingContents };

  if (filesToRead.length === 0 || !containerId) {
    return result;
  }

  try {
    const fetchPromises = filesToRead.map(async (file) => {
      // Skip if we already have the content
      if (existingContents[file]) {
        return { file, content: existingContents[file] };
      }

      try {
        const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `/workspace/${file}` }),
        });
        const data = await res.json();
        if (data.success) {
          return { file, content: data.content };
        }
      } catch (e) {
        console.error(`Error reading file ${file}:`, e);
      }
      return null;
    });

    const results = await Promise.all(fetchPromises);
    for (const res of results) {
      if (res) {
        result[res.file] = res.content;
      }
    }
  } catch (e) {
    console.error("Error fetching file contents:", e);
  }

  return result;
}

/**
 * Get a simple context string without fetching files (for quick operations)
 */
export function getSimpleContext(options: ContextOptions): string {
  const { scenario, tasks, fileTree } = options;

  let context = `Scenario: ${scenario}\n\n`;
  context += `Tasks (${tasks.filter(t => t.completed).length}/${tasks.length} completed):\n`;
  tasks.forEach((task) => {
    const status = task.completed ? "[✓]" : "[ ]";
    context += `${status} ${task.text}\n`;
  });

  if (fileTree.length > 0) {
    context += `\nProject Files (${fileTree.length} total):\n`;
    const filesToShow = fileTree.slice(0, 20);
    filesToShow.forEach((file) => {
      context += `- ${file}\n`;
    });
    if (fileTree.length > 20) {
      context += `- ... and ${fileTree.length - 20} more files\n`;
    }
  }

  return context;
}
