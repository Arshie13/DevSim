<!-- src/lib/components/MonacoEditor.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

  export let value = '';
  export let language = 'typescript';
  export let onChange: (value: string) => void = () => {};

  // ✅ Correct types:
  let container: HTMLDivElement;
  let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

  onMount(() => {
    editorInstance = monaco.editor.create(container, {
      value,
      language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'on'
    });

    editorInstance.onDidChangeModelContent(() => {
      if (onChange) onChange(editorInstance!.getValue());
    });

    return () => {
      editorInstance?.dispose();
      editorInstance = null;
    };
  });

  $: if (editorInstance) {
    const current = editorInstance.getValue();
    if (current !== value) {
      editorInstance.setValue(value);
    }
  }
</script>

<div
  bind:this={container}
  class="w-full h-full"
></div>