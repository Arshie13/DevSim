<script lang="ts">
  import { goto, invalidateAll } from "$app/navigation";
  import { Play, Layers } from "lucide-svelte";
  import { toast } from "$lib/stores/toast";

  export let open: boolean = false;
  export let newContainerId: string = "";

  let busy = false;

  async function continueToWorkspace() {
    if (!newContainerId || busy) return;
    busy = true;
    await goto(`/workspace/${newContainerId}`);
  }

  async function backToProjects() {
    if (busy) return;
    busy = true;
    open = false;
    await invalidateAll();
    busy = false;
  }

  // Show toast when modal opens for success notification
  $: if (open) {
    toast.success("Workspace restored successfully! 🎉");
  }
</script>
