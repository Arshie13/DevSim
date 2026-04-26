<script lang="ts">
  import { onMount } from 'svelte';
  import { Loader2 } from 'lucide-svelte';

  type SettingKey = 'mastery_checkpoint_enabled';
  
  interface Settings {
    mastery_checkpoint_enabled: boolean;
  }

  export let data: {
    user: { name: string; email: string } | null;
    settings: Settings;
  };

  let settings = data.settings;
  let isLoading = false;
  let message: { type: 'success' | 'error'; text: string } | null = null;

  async function toggleSetting(key: SettingKey) {
    isLoading = true;
    message = null;

    try {
      const newValue = !settings[key];
      
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: newValue })
      });

      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      settings = { ...settings, [key]: newValue };
      message = { type: 'success', text: 'Setting updated successfully' };
    } catch (error) {
      console.error('Error updating setting:', error);
      message = { type: 'error', text: 'Failed to update setting' };
    } finally {
      isLoading = false;
      setTimeout(() => message = null, 3000);
    }
  }
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="[font-family:var(--font-heading)] text-2xl font-medium text-[var(--text-primary)]">
      Application Settings
    </h1>
    <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
      Manage global application configuration
    </p>
  </div>

  {#if message}
    <div class="mb-4 p-3 rounded border {message.type === 'success' ? 'border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.1)] text-[var(--success)]' : 'border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] text-[var(--danger)]'}">
      <p class="[font-family:var(--font-mono)] text-sm">{message.text}</p>
    </div>
  {/if}

  <div class="space-y-4">
    <!-- Mastery Checkpoint Toggle -->
    <div class="rounded border border-[rgba(7,165,201,0.2)] bg-[rgba(10,14,26,0.72)] p-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="[font-family:var(--font-heading)] text-lg text-[var(--text-primary)]">
            Mastery Checkpoint
          </h2>
          <p class="mt-1 [font-family:var(--font-mono)] text-sm text-[var(--text-muted)]">
            When enabled, users must complete the mastery checkpoint to progress to the next level.
          </p>
        </div>
        
        <button
          type="button"
          on:click={() => toggleSetting('mastery_checkpoint_enabled')}
          disabled={isLoading}
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(7,165,201,0.5)] focus:ring-offset-2 disabled:opacity-50 {settings.mastery_checkpoint_enabled ? 'bg-[rgba(0,229,160,0.3)]' : 'bg-[rgba(136,146,160,0.3)]'}"
          role="switch"
          aria-checked={settings.mastery_checkpoint_enabled}
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {settings.mastery_checkpoint_enabled ? 'translate-x-6' : 'translate-x-1'}"
          ></span>
          {#if isLoading}
            <div class="absolute inset-0 flex items-center justify-center">
              <Loader2 class="h-4 w-4 animate-spin text-[var(--accent)]" />
            </div>
          {/if}
        </button>
      </div>
      
      <div class="mt-3 flex items-center gap-2">
        <span class="[font-family:var(--font-mono)] text-xs uppercase tracking-[0.1em] {settings.mastery_checkpoint_enabled ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}">
          {settings.mastery_checkpoint_enabled ? 'ENABLED' : 'DISABLED'}
        </span>
      </div>
    </div>

    <!-- Additional settings can be added here -->
  </div>
</div>
