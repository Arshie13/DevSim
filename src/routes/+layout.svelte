<script>
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { notifyAchievementUnlocks } from '$lib/stores/achievementToast';

  let { children, data } = $props();

  // Catch-all: toast achievements unlocked by actions that don't refresh the
  // page themselves. Deduped session-wide inside notifyAchievementUnlocks.
  $effect(() => {
    notifyAchievementUnlocks(data?.newlyUnlocked);
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
<Toast />
