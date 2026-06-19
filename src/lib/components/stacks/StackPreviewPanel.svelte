<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";
  import {
    Rocket,
    X,
    Zap,
    Loader,
    Layers,
    ChevronRight,
    Terminal,
  } from "lucide-svelte";

  export let selection: StackSelection;
  export let onClear: (category: keyof StackSelection) => void;
  export let onStart: () => Promise<void>;
  export let onViewAnalysis: () => void;

  let isLoading = false;

  function getOption(options: TechOption[], id: string | null): TechOption | null {
    if (!id) return null;
    return options.find((o) => o.id === id) || null;
  }

  const ICON_OVERRIDE: Record<string, string> = {
    express: "⬡",
    nestjs: "🐱",
    prisma: "◆",
    "shadcn-ui": "◻",
  };

  interface Layer { id: string; icon: string; name: string; role: string; category: keyof StackSelection; }

  $: layers = buildLayers(selection);

  function buildLayers(combo: StackSelection): Layer[] {
    const out: Layer[] = [];
    if (combo.frontend) {
      const t = getOption(FRONTEND_OPTIONS, combo.frontend);
      if (t) out.push({ id: combo.frontend, icon: ICON_OVERRIDE[combo.frontend] ?? t.icon, name: t.name, role: "FRONTEND", category: "frontend" });
    }
    if (combo.backend) {
      const t = getOption(BACKEND_OPTIONS, combo.backend);
      if (t) out.push({ id: combo.backend, icon: ICON_OVERRIDE[combo.backend] ?? t.icon, name: t.name, role: "BACKEND", category: "backend" });
    }
    if (combo.database) {
      const t = getOption(DATABASE_OPTIONS, combo.database);
      if (t) out.push({ id: combo.database, icon: ICON_OVERRIDE[combo.database] ?? t.icon, name: t.name, role: "DATABASE", category: "database" });
    }
    if (combo.services) {
      const t = getOption(SERVICES_OPTIONS, combo.services);
      if (t) out.push({ id: combo.services, icon: ICON_OVERRIDE[combo.services] ?? t.icon, name: t.name, role: "SERVICE", category: "services" });
    }
    return out;
  }

  async function handleStart() {
    if (isLoading || !hasValidStack) return;
    isLoading = true;
    try {
      await onStart();
    } finally {
      isLoading = false;
    }
  }

  $: selectedCount = [
    selection.frontend, selection.backend, selection.database, selection.services,
  ].filter(Boolean).length;

  $: hasValidStack = selectedCount >= 2;

  $: xpMultiplier =
    selectedCount === 4 ? 2.0 :
    selectedCount === 3 ? 1.5 :
    selectedCount === 2 ? 1.25 : 1.0;

  $: isEmpty = selectedCount === 0;

  const ROLE_COLORS: Record<string, string> = {
    FRONTEND: "#07a5c9",
    BACKEND: "#ffb400",
    DATABASE: "#00e5a0",
    SERVICE: "#a855f7",
  };

  const ROLE_RGB: Record<string, string> = {
    FRONTEND: "7,165,201",
    BACKEND: "255,180,0",
    DATABASE: "0,229,160",
    SERVICE: "168,85,247",
  };
</script>

<div class="preview-panel" class:is-empty={isEmpty}>
  <!-- Terminal Header -->
  <div class="terminal-header">
    <Terminal size={14} style="color: #07a5c9;" />
    <span>LOADOUT TERMINAL</span>
    <div class="terminal-header-line"></div>
  </div>

  {#if isEmpty}
    <div class="empty-state">
      <div class="empty-ring">
        <Layers class="w-8 h-8" style="color: rgba(7,165,201,0.30);" />
      </div>
      <h3 class="empty-title">NO LOADOUT SELECTED</h3>
      <p class="empty-text">Choose a preset stack to preview your deployment configuration.</p>
    </div>
  {:else}
    <!-- Stack Identity -->
    <div class="identity">
      <div class="identity-top">
        <div class="shield-badge">
          <Layers class="w-4 h-4" style="color: #07a5c9;" />
          <span>{selectedCount}/4</span>
        </div>
        <div class="identity-text">
          <h3 class="identity-name">{selection.name || 'Custom Stack'}</h3>
          <div class="identity-meta">
            <span class="layer-count">{selectedCount} LAYER{selectedCount !== 1 ? 'S' : ''}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tech Stack Tower -->
    <div class="tower-section">
      <div class="section-label">
        <Layers size={12} style="color: rgba(7,165,201,0.60);" />
        <span>TECH LAYERS</span>
      </div>
      <div class="tower">
        {#each layers as layer, i}
          <div class="tower-layer" style="--accent: {ROLE_COLORS[layer.role]}; --rgb: {ROLE_RGB[layer.role]}; --delay: {i * 0.06}s;">
            <div class="tower-bar"></div>
            <span class="tower-icon">{layer.icon}</span>
            <div class="tower-info">
              <span class="tower-name">{layer.name}</span>
              <span class="tower-role">{layer.role}</span>
            </div>
            <button class="tower-clear" on:click={() => onClear(layer.category)} aria-label="Remove {layer.name}">
              <X class="w-3 h-3" />
            </button>
          </div>
        {/each}
      </div>
    </div>

    <!-- Deploy CTA -->
    <div class="deploy-section">
      <button
        on:click={handleStart}
        disabled={!hasValidStack || isLoading}
        class="deploy-btn {hasValidStack && !isLoading ? '' : 'deploy-btn--disabled'}"
      >
        {#if isLoading}
          <Loader size={18} class="animate-spin" />
          <span>Initializing...</span>
        {:else}
          <Rocket size={18} />
          <span>{hasValidStack ? 'VIEW SCENARIOS' : `SELECT ${2 - selectedCount} MORE`}</span>
        {/if}
      </button>
    </div>

    <!-- View Full Analysis link -->
    <button class="view-analysis-btn" on:click={onViewAnalysis}>
      <span>View Full Analysis</span>
      <ChevronRight size={14} />
    </button>

    <!-- Footer (matches left panel) -->
    <div class="terminal-foot">
      <span>LOADOUT CONFIGURED</span>
    </div>
  {/if}
</div>

<style>
  .preview-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.20);
    border-radius: 6px;
    padding: 0.9rem 1.1rem;
    height: 100%;
    overflow: hidden;
    animation: panelIn 0.4s cubic-bezier(0.22,0.61,0.36,1);
  }

  @keyframes panelIn {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .preview-panel.is-empty {
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  /* Terminal Header */
  .terminal-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(7,165,201,0.09);
    flex-shrink: 0;
  }
  .terminal-header span {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(208,215,221,0.50);
  }
  .terminal-header-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(7,165,201,0.15), transparent);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 1rem;
  }
  .empty-ring {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1px solid rgba(7, 165, 201, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ringPulse 3s ease-in-out infinite;
  }
  @keyframes ringPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(7,165,201,0.10); }
    50%      { box-shadow: 0 0 0 8px rgba(7,165,201,0.0); }
  }
  .empty-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(208,215,221,0.45);
    letter-spacing: 0.10em;
  }
  .empty-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.82rem;
    color: rgba(208,215,221,0.35);
    max-width: 240px;
    line-height: 1.4;
  }

  /* Identity */
  .identity {
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(7, 165, 201, 0.10);
  }
  .identity-top {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .identity-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .identity-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.03em;
    line-height: 1.2;
    margin: 0;
  }
  .identity-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .layer-count {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    color: rgba(208,215,221,0.40);
    letter-spacing: 0.06em;
  }
  .shield-badge {
    width: 36px;
    height: 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.25);
    border-radius: 4px;
    flex-shrink: 0;
    gap: 1px;
  }
  .shield-badge span {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    color: #07a5c9;
  }

  /* Section labels */
  .section-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.13em;
    color: rgba(208,215,221,0.35);
    margin-bottom: 0.4rem;
  }

  /* Tower */
  .tower-section {
    margin-top: 0.15rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .tower {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(136, 146, 160, 0.2) rgba(10, 14, 26, 0.4);
    padding-right: 2px;
  }
  .tower::-webkit-scrollbar { width: 4px; }
  .tower::-webkit-scrollbar-track { background: rgba(10,14,26,0.4); border-radius: 2px; }
  .tower::-webkit-scrollbar-thumb { background: rgba(136,146,160,0.2); border-radius: 2px; }
  .tower::-webkit-scrollbar-thumb:hover { background: rgba(7,165,201,0.4); }

  .tower-layer {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.45rem 0.6rem 0.45rem 1.1rem;
    background: rgba(var(--rgb), 0.05);
    border: 1px solid rgba(var(--rgb), 0.12);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    animation: layerIn 0.35s cubic-bezier(0.22,0.61,0.36,1) both;
    animation-delay: var(--delay, 0s);
    flex-shrink: 0;
  }
  @keyframes layerIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .tower-bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: var(--accent);
    opacity: 0.45;
  }
  .tower-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--rgb), 0.08);
    border: 1px solid rgba(var(--rgb), 0.18);
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1;
    flex-shrink: 0;
  }
  .tower-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
  }
  .tower-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    color: #d0d7dd;
    line-height: 1.2;
  }
  .tower-role {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.10em;
    color: rgba(var(--rgb), 0.50);
  }
  .tower-clear {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(208,215,221,0.30);
    background: transparent;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
    flex-shrink: 0;
  }
  .tower-clear:hover {
    color: #ff3860;
    background: rgba(255,56,96,0.08);
  }

  /* Deploy */
  .deploy-section {
    padding-top: 0.25rem;
  }
  .deploy-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.7rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: #0a0e1a;
    background: #07a5c9;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }
  .deploy-btn:hover:not(:disabled) {
    background: #00f5ff;
    box-shadow: 0 0 20px rgba(7, 165, 201, 0.35);
  }
  .deploy-btn--disabled {
    background: rgba(208, 215, 221, 0.06);
    color: rgba(208, 215, 221, 0.30);
    border: 1px solid rgba(208, 215, 221, 0.10);
    cursor: not-allowed;
    clip-path: none;
  }
  /* View Full Analysis */
  .view-analysis-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.5rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    color: rgba(7,165,201,0.60);
    background: rgba(7,165,201,0.05);
    border: 1px solid rgba(7,165,201,0.12);
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .view-analysis-btn:hover {
    color: #07a5c9;
    background: rgba(7,165,201,0.10);
    border-color: rgba(7,165,201,0.25);
  }

  /* Terminal Footer (matches preset-foot) */
  .terminal-foot {
    padding-top: 0.3rem;
    border-top: 1px solid rgba(7,165,201,0.05);
    flex-shrink: 0;
  }
  .terminal-foot span {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    color: rgba(7,165,201,0.25);
  }
</style>
