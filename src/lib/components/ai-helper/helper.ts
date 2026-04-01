import { writable, derived, get } from 'svelte/store';
import { 
  AI_NAME, COSTS, LIMITS, SOURCE_EXTENSIONS 
} from './constants';
import type { 
  ChatMessage, AttachedFile, AiMode 
} from './types';
import { type ITask } from '$lib/types';

// Global stores (moved from PrimarySidebar.svelte)
export const aiChatHistory = writable<ChatMessage[]>([]);
export const aiCoins = writable<number>(1000);
export const aiSelectedFile = writable<string>('');
export const aiFileTree = writable<string[]>([]);
export const aiFileContents = writable<Record<string, string>>({});

export interface HintRequest {
  message: string;
  context: string;
  containerId: string;
  userId: string;
  hintType: AiMode;
  attachedFilesCount: number;
  attachedFiles: AttachedFile[];
  level: number;
}

export interface HintResponse {
  success: boolean;
  hint?: string;
  coinsRemaining?: number;
  error?: string;
}

export function createAiHelper(options: {
  containerId: string;
  userId: string;
  projectName: string;
  scenario: string;
  tasks: ITask[];
  level: number;
  mode: AiMode;
  getFileTree: () => string[];
  getFileContents: () => Record<string, string>;
  getSelectedFile: () => string;
}) {
  const { 
    containerId, userId, projectName, scenario, 
    tasks, level, mode, getFileTree, getFileContents, getSelectedFile 
  } = options;

  console.log("file tree: ", getFileTree());
  console.log("file contents: ", getFileContents());
  console.log("selected file: ", getSelectedFile());

  // Local state
  const attachedFiles = writable<AttachedFile[]>([]);
  const isLoading = writable(false);
  const userMessage = writable('');
  const showQuickHint = writable(false);
  const quickHintMessage = writable('');
  const quickHintLoading = writable(false);
  const showFilePicker = writable(false);
  const avatarFailed = writable(false);

  // Derived state
  const hintCost = derived(
    [attachedFiles], 
    ([$files]) => (mode === 'quick' ? COSTS.QUICK_HINT : COSTS.CHAT_HINT) + 
                  ($files.length * COSTS.PER_ATTACHED_FILE)
  );

  const canAttachMore = derived(
    attachedFiles, 
    $files => $files.length < LIMITS.MAX_ATTACHED_FILES
  );

  // TODO: fix this because it only detects files under server and tests directory.
  const filteredFileTree = derived(
    [attachedFiles],
    ([$attached]) => {
      const tree = getFileTree();
      const attachedPaths = new Set($attached.map(f => f.path));
      return tree
        .filter(f => SOURCE_EXTENSIONS.some(ext => f.endsWith(ext)))
        .filter(f => !attachedPaths.has(f))
        .slice(0, 50);
    }
  );

  const canSend = derived(
    [userMessage, isLoading],
    ([$msg, $loading]) => $msg.trim().length > 0 && !$loading
  );

  // Actions
  function attachFile(filePath: string) {
    const name = filePath.split('/').pop() || filePath;
    attachedFiles.update(files => [...files, { path: filePath, name }]);
    showFilePicker.set(false);
  }

  function removeAttachedFile(filePath: string) {
    attachedFiles.update(files => files.filter(f => f.path !== filePath));
  }

  function clearAttachedFiles() {
    attachedFiles.set([]);
  }

  async function fetchFileContent(filePath: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `/workspace/${filePath}` }),
      });
      const data = await res.json();
      return data.success ? data.content : null;
    } catch (e) {
      console.error(`Error reading file ${filePath}:`, e);
      return null;
    }
  }

  async function generateContext(): Promise<string> {
    let context = `=== PROJECT OVERVIEW ===\n`;
    context += `Project: ${projectName || 'DevSim Workspace'}\n`;
    context += `Scenario: ${scenario}\n\n`;

    // Chat history
    if (mode === 'chat') {
      const history = get(aiChatHistory);
      if (history.length > 0) {
        context += `=== RECENT CONVERSATION ===\n`;
        history.slice(-LIMITS.MAX_CHAT_HISTORY).forEach(msg => {
          const role = msg.role === 'user' ? 'User' : AI_NAME;
          const content = msg.content.length > 500 
            ? msg.content.substring(0, 500) + '...' 
            : msg.content;
          context += `${role}: ${content}\n`;
        });
        context += '\n';
      }
    }

    // File tree
    const fileTree = getFileTree();
    if (fileTree.length > 0) {
      context += `Project Files (${fileTree.length} files):\n`;
      fileTree.slice(0, LIMITS.MAX_CONTEXT_FILES).forEach(f => {
        context += `- ${f}\n`;
      });
      if (fileTree.length > LIMITS.MAX_CONTEXT_FILES) {
        context += `- ... and ${fileTree.length - LIMITS.MAX_CONTEXT_FILES} more files\n`;
      }
      context += '\n';
    }

    // Important source files
    const importantFiles = fileTree.filter(f => 
      SOURCE_EXTENSIONS.some(ext => f.endsWith(ext))
    );

    const filesToRead: string[] = [];
    const selectedFile = getSelectedFile();
    const fileContents = { ...getFileContents() }; // Copy to avoid mutations

    if (selectedFile) filesToRead.push(selectedFile);

    for (const file of importantFiles) {
      if (filesToRead.length >= 21) break;
      if (!fileContents[file] && file !== selectedFile) {
        filesToRead.push(file);
      }
    }

    // Fetch missing contents
    if (filesToRead.length > 0 && containerId) {
      const results = await Promise.all(
        filesToRead.map(async file => {
          const content = await fetchFileContent(file);
          return content ? { file, content } : null;
        })
      );
      
      results.forEach(result => {
        if (result) fileContents[result.file] = result.content;
      });
    }

    // Add file contents to context
    filesToRead.filter(f => fileContents[f]).forEach(file => {
      context += `=== File: ${file} ===\n`;
      const lines = fileContents[file].split('\n');
      const shown = lines.slice(0, LIMITS.MAX_LINES_PER_FILE);
      shown.forEach((line, i) => {
        context += `${i + 1}: ${line}\n`;
      });
      if (lines.length > LIMITS.MAX_LINES_PER_FILE) {
        context += `... (showing first ${LIMITS.MAX_LINES_PER_FILE} of ${lines.length} lines)\n`;
      }
      context += '\n';
    });

    // Attached files
    const attached = get(attachedFiles);
    if (attached.length > 0) {
      context += `=== ATTACHED FILES (${attached.length}/${LIMITS.MAX_ATTACHED_FILES}) ===\n`;
      
      const attachedResults = await Promise.all(
        attached.map(async ({ path, name }) => {
          const filePath = path.startsWith('/workspace/') ? path : `/workspace/${path}`;
          const content = await fetchFileContent(filePath.replace('/workspace/', ''));
          return { name, path, content: content || `// Error: Could not read file ${name}` };
        })
      );

      attachedResults.forEach(({ name, path, content }) => {
        context += `--- File: ${name} ---\n`;
        context += `// Path: ${path}\n`;
        const lines = content.split('\n');
        const shown = lines.slice(0, LIMITS.MAX_LINES_PER_FILE);
        shown.forEach((line, i) => {
          context += `${i + 1}: ${line}\n`;
        });
        if (lines.length > LIMITS.MAX_LINES_PER_FILE) {
          context += `... (showing first ${LIMITS.MAX_LINES_PER_FILE} of ${lines.length} lines)\n`;
        }
        context += '\n';
      });
    }

    // Tasks
    const completedCount = tasks.filter(t => t.isCompleted).length;
    context += `Tasks (${completedCount}/${tasks.length} completed):\n`;
    
    if (tasks.length === 0) {
      if (scenario) context += `Current scenario: ${scenario}\n`;
      context += `No tasks loaded. Please provide general guidance based on the project files.\n`;
    } else {
      tasks.forEach(task => {
        context += `${task.isCompleted ? '[√]' : '[ ]'} ${task.taskName}\n`;
        
        // Add acceptance criteria
        if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
          context += `  Acceptance Criteria:\n`;
          task.acceptanceCriteria
            .sort((a, b) => a.order - b.order)
            .forEach(ac => {
              context += `    - ${ac.description}${ac.isRequired ? ' (Required)' : ''}\n`;
            });
        }
        
        // Add hints
        if (task.hints && task.hints.length > 0) {
          context += `  Hints:\n`;
          task.hints
            .sort((a, b) => a.order - b.order)
            .forEach(hint => {
              context += `    - ${hint.description}\n`;
            });
        }
      });
    }

    context += `\n=== HINT INSTRUCTIONS ===\n`;
    if (tasks.length > 0) {
      context += `Based on the user's current task progress above, please provide a helpful hint that:\n`;
      context += `1. Focus on the next incomplete task (tasks marked with [ ])\n`;
      context += `2. Consider the current state of the project files\n`;
      context += `3. Be specific and actionable\n`;
      context += `4. If all tasks are completed (all show [√]), congratulate the user and offer to help\n`;
    } else {
      context += `Provide helpful guidance based on the scenario and project files provided above.\n`;
    }

    return context;
  }

  async function sendHintRequest(request: HintRequest): Promise<HintResponse> {
    const res = await fetch('/api/ai/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return res.json();
  }

  async function sendMessage() {
    const message = get(userMessage).trim();
    if (!message || get(isLoading)) return;

    userMessage.set('');

    // Validation checks (isAskingForCode, coins) would go here
    // Using your existing validation functions...

    const filesToInclude = get(attachedFiles);
    aiChatHistory.update(msgs => [
      ...msgs, 
      { role: 'user', content: message, attachedFiles: filesToInclude }
    ]);
    
    clearAttachedFiles();
    isLoading.set(true);

    try {
      const context = await generateContext();
      const cost = get(hintCost);
      const currentCoinsVal = get(aiCoins);

      if (currentCoinsVal < cost) {
        // Handle insufficient coins
        isLoading.set(false);
        return;
      }

      const response = await sendHintRequest({
        message,
        context,
        containerId,
        userId,
        hintType: mode,
        attachedFilesCount: filesToInclude.length,
        attachedFiles: filesToInclude,
        level,
      });

      if (response.success) {
        aiChatHistory.update(msgs => [
          ...msgs, 
          { role: 'ai', content: response.hint! }
        ]);
        if (response.coinsRemaining !== undefined) {
          aiCoins.set(response.coinsRemaining);
        }
      } else {
        aiChatHistory.update(msgs => [
          ...msgs,
          { role: 'ai', content: response.error || 'Failed to get hint', isWarning: true }
        ]);
      }
    } catch (error) {
      console.error('Error getting AI hint:', error);
      aiChatHistory.update(msgs => [
        ...msgs,
        { role: 'ai', content: 'An error occurred. Please try again.', isWarning: true }
      ]);
    } finally {
      isLoading.set(false);
    }
  }

  async function requestQuickHint() {
    if (get(isLoading) || !containerId || !userId) return;

    const cost = get(hintCost);
    const currentCoinsVal = get(aiCoins);

    if (currentCoinsVal < cost) {
      quickHintMessage.set(`Not enough coins (${currentCoinsVal}/${cost})`);
      showQuickHint.set(true);
      return;
    }

    quickHintLoading.set(true);
    showQuickHint.set(true);
    quickHintMessage.set('');

    const currentTask = tasks.find(t => !t.isCompleted);
    const attached = get(attachedFiles);

    try {
      const context = await generateContext();
      clearAttachedFiles();

      let hintMessage: string;
      if (currentTask) {
        hintMessage = `Current task: "${currentTask.taskName}" (${tasks.filter(t => t.isCompleted).length}/${tasks.length} done). Give me a SHORT, specific hint - which file and exactly what to do?`;
      } else if (tasks.every(t => t.isCompleted)) {
        hintMessage = `All tasks done! Quick congrats and ask if they need help with anything else.`;
      } else {
        hintMessage = `Give me a SHORT hint for my current sprint task. Which file should I work on and what specifically needs to be done?`;
      }

      const response = await sendHintRequest({
        message: hintMessage,
        context,
        containerId,
        userId,
        hintType: 'quick',
        attachedFilesCount: attached.length,
        attachedFiles: attached,
        level,
      });

      if (response.success) {
        quickHintMessage.set(response.hint!);
        if (response.coinsRemaining !== undefined) {
          aiCoins.set(response.coinsRemaining);
        }
      } else {
        quickHintMessage.set(response.error || 'Failed to get hint');
      }
    } catch (error) {
      console.error('Error getting quick hint:', error);
      quickHintMessage.set('An error occurred. Please try again.');
    } finally {
      quickHintLoading.set(false);
    }
  }

  return {
    // Stores
    attachedFiles,
    isLoading,
    userMessage,
    showQuickHint,
    quickHintMessage,
    quickHintLoading,
    showFilePicker,
    avatarFailed,
    hintCost,
    canAttachMore,
    filteredFileTree,
    canSend,
    // Actions
    attachFile,
    removeAttachedFile,
    clearAttachedFiles,
    sendMessage,
    requestQuickHint,
    closeQuickHint: () => { showQuickHint.set(false); quickHintMessage.set(''); },
  };
}