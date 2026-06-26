<script lang="ts">
  import { signOut } from "@auth/sveltekit/client";
  import { goto } from "$app/navigation";
  import { User, Settings, LogOut, ChevronDown, Award, LayoutDashboard, Users, GitBranch } from "lucide-svelte";
  import type { UserData } from "$types";

  export let userData: Partial<UserData>;

  let open = false;

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  async function handleLogout() {
    close();
    await signOut({ callbackUrl: "/login" });
  }

  function navigateTo(path: string) {
    close();
    goto(path);
  }
</script>

<!-- Click-away overlay -->
{#if open}
  <div
    class="fixed inset-0 z-40"
    role="button"
    tabindex="-1"
    on:click={close}
    on:keydown={(e) => e.key === "Escape" && close()}
    aria-label="Close dropdown"
  ></div>
{/if}

<div class="relative z-50">
  <!-- Avatar trigger button -->
  <button
    on:click={toggle}
    class="relative flex items-center gap-2 group"
    aria-haspopup="true"
    aria-expanded={open}
  >
    <div
      class="text-2xl w-11 h-11 bg-obsidian-surface border-2 transition-all duration-200
        {open
          ? 'border-obsidian-accent shadow-[0_0_24px_rgba(7,165,201,0.3)]'
          : 'border-obsidian-border group-hover:border-obsidian-accent/60'}
        rounded-full flex items-center justify-center overflow-hidden"
    >
      {#if userData.avatar && /^https?:\/\//i.test(userData.avatar)}
        <img src={userData.avatar} alt={userData.name ?? 'User'} class="w-full h-full object-cover rounded-full" referrerpolicy="no-referrer" />
      {:else if userData.avatar && userData.avatar.startsWith('/')}
        <img src={userData.avatar} alt={userData.name ?? 'User'} class="w-full h-full object-contain" />
      {:else if userData.avatar}
        {userData.avatar}
      {:else}
        <span class="text-obsidian-accent font-orbitron font-bold text-base">
          {(userData.name ?? '?')[0].toUpperCase()}
        </span>
      {/if}
    </div>
    <!-- Online indicator -->
    <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyber-success rounded-full border-2 border-obsidian-bg"></div>
  </button>

  <!-- Dropdown panel -->
  {#if open}
    <div
      class="absolute right-0 mt-3 w-56 bg-obsidian-bg-light border border-[var(--card-border)] rounded-card shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_20px_rgba(7,165,201,0.08)] overflow-hidden"
    >
      <!-- User info header -->
      <div class="px-4 py-3 border-b border-[var(--card-border)] bg-obsidian-surface/40">
        <p class="text-sm font-orbitron font-semibold text-obsidian-text-muted leading-tight">{userData.name}</p>
        <p class="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mt-0.5">Developer</p>
      </div>

      <!-- Menu items -->
      <div class="py-1.5">
        <button
          on:click={() => navigateTo("/profile")}
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-rajdhani text-obsidian-text-primary/80 hover:text-obsidian-accent hover:bg-obsidian-accent/5 transition-all"
        >
          <User class="w-4 h-4 text-obsidian-accent/70" />
          View Profile
        </button>

        <button
          on:click={() => navigateTo("/dashboard")}
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-rajdhani text-obsidian-text-primary/80 hover:text-obsidian-accent hover:bg-obsidian-accent/5 transition-all"
        >
          <LayoutDashboard class="w-4 h-4 text-obsidian-accent/70" />
          Dashboard
        </button>

        <button
          on:click={() => navigateTo("/stacks")}
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-rajdhani text-obsidian-text-primary/80 hover:text-obsidian-accent hover:bg-obsidian-accent/5 transition-all"
        >
          <Award class="w-4 h-4 text-obsidian-accent/70" />
          My Stacks
        </button>

        <button
          on:click={() => navigateTo("/sandbox")}
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-rajdhani text-obsidian-text-primary/80 hover:text-obsidian-accent hover:bg-obsidian-accent/5 transition-all"
        >
          <GitBranch class="w-4 h-4 text-obsidian-accent/70" />
          Sandbox
        </button>

        <button
          on:click={() => navigateTo("/rivals")}
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-rajdhani text-obsidian-text-primary/80 hover:text-obsidian-accent hover:bg-obsidian-accent/5 transition-all"
        >
          <Users class="w-4 h-4 text-obsidian-accent/70" />
          Developer Rivals
        </button>

        <button
          on:click={() => navigateTo("/profile")}
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-rajdhani text-obsidian-text-primary/80 hover:text-obsidian-accent hover:bg-obsidian-accent/5 transition-all"
        >
          <Settings class="w-4 h-4 text-obsidian-accent/70" />
          Settings
        </button>
      </div>

      <!-- Divider -->
      <div class="h-px bg-[var(--card-border)] mx-2"></div>

      <!-- Logout -->
      <div class="py-1.5">
        <button
          on:click={handleLogout}
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-rajdhani text-cyber-danger/80 hover:text-cyber-danger hover:bg-cyber-danger/10 transition-all"
        >
          <LogOut class="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  {/if}
</div>
