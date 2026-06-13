<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Toast from '$lib/components/ui/Toast.svelte';
  import SessionExpiredModal from '$lib/components/ui/SessionExpiredModal.svelte';
  import { notifyAchievementUnlocks } from '$lib/stores/achievementToast';
  import { sessionInvalidated } from '$lib/stores/sessionInvalidated';
  import { signOut } from '@auth/sveltekit/client';
  import { onMount } from 'svelte';
  import { beforeNavigate } from '$app/navigation';

  let { children, data } = $props();

  let showSessionExpired = $state(false);
  let lastCheckAt = 0;
  const CHECK_DEBOUNCE_MS = 2000;

  sessionInvalidated.subscribe((v: boolean) => {
    showSessionExpired = v;
  });

  // Catch-all: toast achievements unlocked by actions that don't refresh the
  // page themselves. Deduped session-wide inside notifyAchievementUnlocks.
  $effect(() => {
    notifyAchievementUnlocks(data?.newlyUnlocked);
  });

  async function checkSession(force = false) {
    if (showSessionExpired) return;

    const now = Date.now();
    if (!force && now - lastCheckAt < CHECK_DEBOUNCE_MS) return;
    lastCheckAt = now;

    try {
      const res = await fetch('/api/user/verify', { method: 'GET', cache: 'no-store' });
      if (!res.ok) {
        sessionInvalidated.set(true);
        return;
      }
      const payload = await res.json();
      if (!payload?.valid) {
        sessionInvalidated.set(true);
      }
    } catch {
      // If /api/user/verify is unreachable, assume the session is invalid
      sessionInvalidated.set(true);
    }
  }

  function handleSessionExpired() {
    sessionInvalidated.set(false);
    signOut({ callbackUrl: '/login' });
  }

  onMount(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // 1. Immediate check on mount / refresh
    checkSession(true);

    // 2. Patch fetch to intercept 401 errors globally on any API call
    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const response = await originalFetch(input, init);
      let url: string | undefined;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.href;
      } else if (typeof input === 'object' && 'url' in input) {
        url = (input as Request).url;
      }
      if (
        response.status === 401 &&
        url &&
        (url.startsWith('/api/') || url.startsWith('/auth/'))
      ) {
        sessionInvalidated.set(true);
      }
      return response;
    };

    // 3. Check before every navigation
    beforeNavigate(() => {
      checkSession(true);
    });

    // 4. Check on any click to interactive elements (buttons, links, inputs, forms)
    let clickCheckTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select, [role="button"], form, [data-interactive]')) {
        if (clickCheckTimeout) clearTimeout(clickCheckTimeout);
        clickCheckTimeout = setTimeout(() => {
          checkSession();
        }, 0);
      }
    };
    document.addEventListener('click', handleClick);

    // 5. Check immediately when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.fetch = originalFetch;
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
<Toast />

{#if showSessionExpired}
  <SessionExpiredModal open={true} on:confirm={handleSessionExpired} />
{/if}
