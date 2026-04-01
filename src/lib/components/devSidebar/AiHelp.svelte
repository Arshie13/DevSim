<script lang="ts">
  import { onMount } from 'svelte';
  import { aiChatHistory, aiCoins, aiSelectedFile, aiFileTree, aiFileContents } from './PrimarySidebar.svelte';
  import { createAiHelper } from '$lib/components/ai-helper/helper';
  // import { COSTS } from '$lib/components/ai-helper/constants';
  import type { AiMode, ITask } from '$lib/types';
  
  import AIHeader from '$lib/components/ai-helper/AIHeader.svelte';
  import ChatContainer from '$lib/components/ai-helper/ChatContainer.svelte';
  import ChatInput from '$lib/components/ai-helper/ChatInput.svelte';
  import QuickHintModal from '$lib/components/ai-helper/QuickHintModal.svelte';
  import FilePickerModal from '$lib/components/ai-helper/FilePickerModal.svelte';

  // Props
  export let scenario: string = "";
  export let tasks: ITask[] = [];
  export let containerId: string = "";
  export let userId: string = "";
  export let projectName: string = "DevSim Project";
  export let level: number = 1;
  export let mode: AiMode = "quick";
  
  export let initialSelectedFile: string = "";
  export let initialFileTree: string[] = [];
  export let initialFileContents: Record<string, string> = {};
  export let initialCoins: number = 1000;

  // Reactive current values (merge props with stores)
  $: currentSelectedFile = initialSelectedFile || $aiSelectedFile;
  $: currentFileTree = initialFileTree.length > 0 ? initialFileTree : $aiFileTree;
  $: currentFileContents = Object.keys(initialFileContents).length > 0 ? initialFileContents : $aiFileContents;
  $: currentCoins = $aiCoins !== 1000 || initialCoins === 1000 ? $aiCoins : initialCoins;

  // Update stores from props
  $: if (initialSelectedFile) aiSelectedFile.set(initialSelectedFile);
  $: if (initialFileTree.length > 0) aiFileTree.set(initialFileTree);
  $: if (Object.keys(initialFileContents).length > 0) aiFileContents.set(initialFileContents);
  $: if (initialCoins !== 1000) aiCoins.set(initialCoins);

  // Initialize helper logic
  const helper = createAiHelper({
    containerId,
    userId,
    projectName,
    scenario,
    tasks,
    level,
    mode,
    getFileTree: () => currentFileTree,
    getFileContents: () => currentFileContents,
    getSelectedFile: () => currentSelectedFile,
  });

  // Destructure for template
  const {
    attachedFiles, isLoading, userMessage, showQuickHint, quickHintMessage,
    quickHintLoading, showFilePicker, avatarFailed, hintCost, canAttachMore,
    filteredFileTree, canSend,
    attachFile, removeAttachedFile, clearAttachedFiles, sendMessage,
    requestQuickHint, closeQuickHint
  } = helper;

  console.log("filtered file tree: ", filteredFileTree);

  // Scroll handling
  let chatContainer: HTMLDivElement;
  let userScrolling = false;
  let previousMessageCount = 0;

  $: {
    const currentCount = $aiChatHistory.length;
    if (currentCount > previousMessageCount && !userScrolling && chatContainer) {
      setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 50);
    }
    previousMessageCount = currentCount;
  }

  function handleScroll() {
    if (!chatContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainer;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    userScrolling = !isAtBottom;
  }
</script>

<div class="flex flex-col h-full bg-[#0f172a]">
  <AIHeader
    {currentCoins}
    onRequestHint={requestQuickHint}
    quickHintLoading={$quickHintLoading}
    disabled={!containerId || !userId}
    bind:avatarFailed={$avatarFailed}
  />

  <div class="flex flex-col flex-1 min-h-0 overflow-hidden">
    <ChatContainer
      messages={$aiChatHistory}
      isLoading={$isLoading}
      bind:avatarFailed={$avatarFailed}
      bind:chatContainer
      onScroll={handleScroll}
    />
    
    <ChatInput
      bind:value={$userMessage}
      isLoading={$isLoading}
      canSend={$canSend}
      attachedFiles={$attachedFiles}
      canAttachMore={$canAttachMore}
      onSend={sendMessage}
      onAttachClick={() => showFilePicker.set(true)}
      onRemoveFile={removeAttachedFile}
    />
  </div>
</div>

<QuickHintModal
  show={$showQuickHint}
  message={$quickHintMessage}
  loading={$quickHintLoading}
  {initialCoins}
  onClose={closeQuickHint}
  bind:avatarFailed={$avatarFailed}
/>

<FilePickerModal
  show={$showFilePicker}
  files={$filteredFileTree}
  attachedCount={$attachedFiles.length}
  onClose={() => showFilePicker.set(false)}
  onSelect={attachFile}
/>

<style>
  :global(.overflow-y-auto::-webkit-scrollbar) {
    width: 6px;
  }
  :global(.overflow-y-auto::-webkit-scrollbar-track) {
    background: transparent;
  }
  :global(.overflow-y-auto::-webkit-scrollbar-thumb) {
    background: #27272a;
    border-radius: 3px;
  }
  :global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
    background: #3f3f46;
  }
</style>