<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  // Admin navigation items
  const navItems = [
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Containers', href: '/admin/containers' },
    { label: 'Learner Pass', href: '/admin/learners-pass' },
    { label: 'Achievements', href: '/admin/achievements' },
    { label: 'Scenarios', href: '/admin/scenarios' },
  ];

  let isClient = false;
  
  onMount(() => {
    isClient = true;
  });

  $: currentPath = $page.url.pathname;
</script>

{#if isClient}
  <div class="flex h-screen bg-[var(--bg-primary)]">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-[rgba(7,165,201,0.12)] bg-[rgba(10,14,26,0.95)]">
      <div class="p-4">
        <h1 class="[font-family:var(--font-heading)] text-lg font-medium text-[var(--accent)]">
          Admin Panel
        </h1>
      </div>
      
      <nav class="mt-2 px-2">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center px-3 py-2 mb-1 rounded transition-colors {currentPath === item.href ? 'bg-[rgba(7,165,201,0.15)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(7,165,201,0.08)]'}"
          >
            <span class="[font-family:var(--font-mono)] text-[0.75rem] uppercase tracking-[0.05em]">
              {item.label}
            </span>
          </a>
        {/each}
      </nav>
    </aside>

    <!-- Main content area -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
{/if}
