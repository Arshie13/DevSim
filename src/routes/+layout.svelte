<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/devsim-logo.svg';
  import Toast from '$lib/components/ui/Toast.svelte';
  import ErrorPopup from '$lib/components/ui/ErrorPopup.svelte';
  import { page } from '$app/state';
  import SessionExpiredModal from '$lib/components/ui/SessionExpiredModal.svelte';
  import DisclaimerModal from '$lib/components/landing/DisclaimerModal.svelte';
  import { notifyAchievementUnlocks } from '$lib/stores/achievementToast';
  import { sessionInvalidated } from '$lib/stores/sessionInvalidated';
  import { toast } from '$lib/stores/toast';
  import { signOut } from '@auth/sveltekit/client';
  import { onMount } from 'svelte';
  import { beforeNavigate, goto } from '$app/navigation';

  let { children, data } = $props();

  let showSessionExpired = $state(false);
  let lastCheckAt = 0;
  const CHECK_DEBOUNCE_MS = 2000;

  // Flag used to prevent recursive session checks when we manually resume a cancelled navigation
  let pendingNavigationUrl: string | null = null;

  // Pages where the session modal should never appear
  const PUBLIC_PATHS = ['/', '/login'];

  /** Check if the current page is a public (login/auth) page */
  function isPublicPage(): boolean {
    return PUBLIC_PATHS.some((p) => page.url.pathname === p);
  }

  sessionInvalidated.subscribe((v: boolean) => {
    showSessionExpired = v;
  });

  // Catch-all: toast achievements unlocked by actions that don't refresh the
  // page themselves. Deduped session-wide inside notifyAchievementUnlocks.
  // The public landing page (route '/') is excluded — toasts belong inside the
  // app. The server load already withholds unlocks there; this is a guard in
  // case the landing page is reached with stale layout data.
  $effect(() => {
    if (page.route.id === '/') return;
    notifyAchievementUnlocks(data?.newlyUnlocked);
  });

  async function checkSession(force = false) {
    // Skip all checks on public pages (login, auth callback)
    if (isPublicPage()) return;
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

  // 3. Intercept navigations: cancel them, run a session check, and only
  // resume if the session is still valid. This prevents the server from
  // redirecting the background to '/' while the modal is open.
  beforeNavigate((navigation) => {
    if (isPublicPage()) return;
    if (showSessionExpired) {
      navigation.cancel();
      return;
    }

    const targetUrl = navigation.to?.url;
    if (!targetUrl) return;

    // Allow our own resumed goto() to proceed
    if (targetUrl.toString() === pendingNavigationUrl) {
      pendingNavigationUrl = null;
      return;
    }

    navigation.cancel();
    checkSession(true).then(() => {
      if (!showSessionExpired) {
        pendingNavigationUrl = targetUrl.toString();
        goto(targetUrl.toString());
      }
    });
  });

  onMount(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // 1. Immediate check on mount / refresh (skip on public pages)
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

    return () => {
      window.fetch = originalFetch;
    };
  });
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href={favicon} sizes="any" />
</svelte:head>

{@render children()}
<ErrorPopup toasts={$toast} />
<Toast />
<DisclaimerModal />

{#if showSessionExpired && !isPublicPage()}
  <SessionExpiredModal open={true} on:confirm={handleSessionExpired} />
{/if}
