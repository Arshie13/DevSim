<script>
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Toast from '$lib/components/ui/Toast.svelte';
  import { page } from '$app/state';
  import { notifyAchievementUnlocks } from '$lib/stores/achievementToast';

  let { children, data } = $props();

  // Catch-all: toast achievements unlocked by actions that don't refresh the
  // page themselves. Deduped session-wide inside notifyAchievementUnlocks.
  // The public landing page (route '/') is excluded — toasts belong inside the
  // app. The server load already withholds unlocks there; this is a guard in
  // case the landing page is reached with stale layout data.
  $effect(() => {
    if (page.route.id === '/') return;
    notifyAchievementUnlocks(data?.newlyUnlocked);
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
<Toast />
