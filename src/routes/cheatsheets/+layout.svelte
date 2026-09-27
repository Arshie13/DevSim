<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import type { UserData } from "$types";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  $: headerUserData = {
    ...data.user,
    coins: data.userCoins,
    isAdmin: data.isAdmin,
  } as UserData;
</script>

<div class="min-h-screen bg-obsidian-bg text-obsidian-text-primary text-sm scanlines ambient-glow bg-grid-cyber [overflow-x:clip]">
  <Header userData={headerUserData} />

  <main class="page-container py-8">
    <slot />
  </main>

  <!-- Ambient background -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div class="absolute top-1/4 -left-32 w-96 h-96 bg-obsidian-accent/10 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-32 w-80 h-80 bg-[rgb(var(--purple-rgb)/0.08)] rounded-full blur-[100px]"></div>
  </div>
</div>
