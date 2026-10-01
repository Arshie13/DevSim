<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Settings, Boxes, CreditCard, Trophy, Layers, ArrowLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-svelte';
  import Scrollbar from '$lib/components/ui/Scrollbar.svelte';

  // Admin navigation items
  const navItems = [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Containers', href: '/admin/containers', icon: Boxes },
    { label: 'Learner Pass', href: '/admin/learners-pass', icon: CreditCard },
    { label: 'Achievements', href: '/admin/achievements', icon: Trophy },
    { label: 'Scenarios', href: '/admin/scenarios', icon: Layers }
  ];

  let isClient = false;
  let collapsed = false;

  onMount(() => {
    isClient = true;
  });

  $: currentPath = $page.url.pathname;
</script>

{#if isClient}
  <div class="admin-shell flex h-screen min-w-0 bg-obsidian-bg bg-grid-cyber scanlines ambient-glow">
    <!-- Sidebar -->
    <aside
      class="admin-sidebar relative z-10 flex w-64 shrink-0 flex-col border-r border-obsidian-accent/10 bg-[rgb(var(--bg-rgb)/0.95)] transition-[width] duration-200"
      class:admin-collapsed={collapsed}
    >
      <div class="flex items-center justify-between p-4 mt-4 {collapsed ? 'flex-col gap-2' : ''}">
        <h1 class="font-heading text-2xl font-semibold text-obsidian-accent">
          Admin Panel
        </h1>
        <button
          type="button"
          on:click={() => (collapsed = !collapsed)}
          aria-label={collapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'}
          aria-expanded={!collapsed}
          class="cursor-pointer rounded p-1 text-obsidian-text-muted transition-colors hover:bg-obsidian-accent/10 hover:text-obsidian-accent"
        >
          {#if collapsed}
            <PanelLeftOpen class="h-5 w-5" />
          {:else}
            <PanelLeftClose class="h-5 w-5" />
          {/if}
        </button>
      </div>

      <nav class="mt-2 px-4">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center gap-2 px-2 py-3 mb-1 rounded-card transition-colors {collapsed ? 'justify-center px-0' : ''} {currentPath === item.href ? 'bg-obsidian-accent/15 text-obsidian-accent' : 'text-obsidian-text-muted hover:text-obsidian-text-primary hover:bg-obsidian-accent/10'}"
          >
            <item.icon class="h-5 w-5 shrink-0" />
            <span class="font-body text-base font-medium">
              {item.label}
            </span>
          </a>
        {/each}
      </nav>

      <!-- Back to app -->
      <a
        href="/dashboard"
        class="admin-backlink mx-4 mb-4 mt-auto flex items-center gap-2 font-body text-base text-obsidian-text-muted transition-colors hover:text-obsidian-accent {collapsed ? 'justify-center px-0' : ''}"
      >
        <ArrowLeft class="h-5 w-5 shrink-0" />
        <span>Back to app</span>
      </a>
    </aside>

    <!-- Main content area -->
    <main class="relative z-10 flex min-w-0 flex-1 flex-col">
      <Scrollbar className="min-h-0 flex-1">
        <slot />
      </Scrollbar>
    </main>
  </div>
{/if}

<style>
  /* Manual collapse (the toggle overrides the responsive widths everywhere). */
  .admin-sidebar.admin-collapsed {
    width: 3.5rem;
  }

  .admin-sidebar.admin-collapsed h1 {
    overflow: hidden;
    white-space: nowrap;
    font-size: 0;
  }

  .admin-sidebar.admin-collapsed h1::first-letter {
    font-size: 1.3rem;
  }

  .admin-sidebar.admin-collapsed nav span,
  .admin-sidebar.admin-collapsed .admin-backlink span {
    display: none;
  }

  @media (max-width: 900px) {
    .admin-sidebar {
      width: 12rem;
    }
  }

  @media (max-width: 680px) {
    .admin-sidebar {
      width: 3.5rem;
    }

    .admin-sidebar h1 {
      overflow: hidden;
      white-space: nowrap;
      font-size: 0;
    }

    .admin-sidebar h1::first-letter {
      font-size: 1.3rem;
    }

    .admin-sidebar nav span,
    .admin-backlink span {
      display: none;
    }
  }
</style>
