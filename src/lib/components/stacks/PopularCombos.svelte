<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    POPULAR_COMBOS,
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";
  import { Lock, CircleCheck, ChevronRight, Sparkles } from "lucide-svelte";

  export let onSelectCombo: (combo: StackSelection) => void;
  export let selection: StackSelection = { frontend: null, backend: null, database: null, services: null };

  let previewCombo: StackSelection = POPULAR_COMBOS.find(c => !c.comingSoon) ?? POPULAR_COMBOS[0];
  let briefKey = 0;

  const ICON_OVERRIDE: Record<string, string> = {
    express: "⬡",
    nestjs: "🐱",
    prisma: "◆",
    "shadcn-ui": "◻",
  };

  function getOption(options: TechOption[], id: string | null): TechOption | null {
    if (!id) return null;
    return options.find((o) => o.id === id) ?? null;
  }

  function isSelected(combo: StackSelection): boolean {
    return (
      combo.frontend === selection.frontend &&
      combo.backend  === selection.backend  &&
      combo.database === selection.database &&
      combo.services === selection.services
    );
  }

  interface Layer { id: string; icon: string; name: string; role: string }

  function buildLayers(combo: StackSelection): Layer[] {
    const layers: Layer[] = [];
    if (combo.frontend) {
      const t = getOption(FRONTEND_OPTIONS, combo.frontend);
      if (t) layers.push({ id: combo.frontend, icon: ICON_OVERRIDE[combo.frontend] ?? t.icon, name: t.name, role: "FRONTEND" });
    }
    if (combo.backend) {
      const t = getOption(BACKEND_OPTIONS, combo.backend);
      if (t) layers.push({ id: combo.backend, icon: ICON_OVERRIDE[combo.backend] ?? t.icon, name: t.name, role: "BACKEND" });
    }
    if (combo.database) {
      const t = getOption(DATABASE_OPTIONS, combo.database);
      if (t) layers.push({ id: combo.database, icon: ICON_OVERRIDE[combo.database] ?? t.icon, name: t.name, role: "DATABASE" });
    }
    if (combo.services) {
      const t = getOption(SERVICES_OPTIONS, combo.services);
      if (t) layers.push({ id: combo.services, icon: ICON_OVERRIDE[combo.services] ?? t.icon, name: t.name, role: "SERVICE" });
    }
    return layers;
  }

  function getPreviewDescription(combo: StackSelection): string {
    const parts: string[] = [];
    const fe = getOption(FRONTEND_OPTIONS, combo.frontend);
    const be = getOption(BACKEND_OPTIONS,  combo.backend);
    const db = getOption(DATABASE_OPTIONS, combo.database);
    const sv = getOption(SERVICES_OPTIONS, combo.services);
    if (fe?.finalProjectDescription) parts.push(fe.finalProjectDescription);
    if (be?.finalProjectDescription) parts.push(be.finalProjectDescription);
    if (db?.finalProjectDescription) parts.push(db.finalProjectDescription);
    if (sv?.finalProjectDescription) parts.push(sv.finalProjectDescription);
    return parts.join(" · ");
  }

  function handleSelect(combo: StackSelection) {
    if (combo.comingSoon) return;
    previewCombo = combo;
    briefKey++;
    onSelectCombo(combo);
  }

  const TYPE_LABEL: Record<string, string> = {
    fullstack: "FULL STACK",
    backend:   "BACKEND",
    frontend:  "FRONTEND",
  };
  const TYPE_ACCENT: Record<string, string> = {
    fullstack: "#07a5c9",
    backend:   "#a855f7",
    frontend:  "#f97316",
  };
  const TYPE_RGB: Record<string, string> = {
    fullstack: "7,165,201",
    backend:   "168,85,247",
    frontend:  "249,115,22",
  };
</script>

<div class="nexus">

  <!-- ══ RAIL ══ -->
  <aside class="rail">
    <div class="rail-hd">
      <span class="rail-title">TECH STACKS</span>
    </div>

    <div class="rail-list">
      {#each POPULAR_COMBOS as combo}
        {@const sel    = isSelected(combo)}
        {@const active = previewCombo?.id === combo.id}
        {@const tk     = combo.stackType ?? "fullstack"}
        {@const layers = buildLayers(combo)}
        <button
          class="loadout-row"
          class:is-sel={sel}
          class:is-active={active}
          class:is-locked={combo.comingSoon}
          disabled={combo.comingSoon}
          style="--accent:{TYPE_ACCENT[tk]};--rgb:{TYPE_RGB[tk]};"
          on:click={() => handleSelect(combo)}
        >
          <div class="row-bar"></div>
          <div class="row-body">
            <div class="row-meta">
              <span class="row-badge">{TYPE_LABEL[tk]}</span>
              {#if combo.comingSoon}
                <span class="row-soon">SOON</span>
              {/if}
            </div>
            <span class="row-name">{combo.name}</span>
            <div class="row-icons">
              {#each layers as layer}
                <span class="row-glyph" title={layer.name}>{layer.icon}</span>
              {/each}
            </div>
          </div>
          {#if sel}
            <div class="row-check"><CircleCheck size={14} /></div>
          {:else if !combo.comingSoon}
            <div class="row-arrow"><ChevronRight size={14} /></div>
          {/if}
        </button>
      {/each}
    </div>

    <div class="rail-foot">
      <span class="rail-foot-txt">{POPULAR_COMBOS.filter(c => !c.comingSoon).length} STACKS AVAILABLE</span>
    </div>
  </aside>

  <!-- ══ BRIEF ══ -->
  <section
    class="brief"
    style="--accent:{TYPE_ACCENT[previewCombo?.stackType ?? 'fullstack']};--rgb:{TYPE_RGB[previewCombo?.stackType ?? 'fullstack']};"
  >
    {#key briefKey}
      {@const tk          = previewCombo?.stackType ?? "fullstack"}
      {@const layers      = buildLayers(previewCombo)}
      {@const sel         = isSelected(previewCombo)}
      {@const previewDesc = getPreviewDescription(previewCombo)}

      <div class="br br-tl"></div>
      <div class="br br-tr"></div>
      <div class="br br-bl"></div>
      <div class="br br-br"></div>
      <div class="sweep"></div>

      <div class="brief-inner">

        <!-- ① Header -->
        <div class="brief-head">
          <span class="brief-type" style="color:var(--accent);border-color:rgba(var(--rgb),0.35);background:rgba(var(--rgb),0.09);">
            {TYPE_LABEL[tk]}
          </span>
          <h2 class="brief-title">{previewCombo?.name}</h2>
        </div>

        <!-- ② Divider -->
        <div class="brief-div">
          <span class="div-lbl">TECH STACK</span>
          <div class="div-line"></div>
          <span class="div-count">{layers.length} LAYER{layers.length !== 1 ? "S" : ""}</span>
        </div>

        <!-- ③ Layers -->
        <div class="brief-layers">
          {#each layers as layer, i}
            <div class="layer" style="--i:{i};">
              <div class="layer-bar"></div>
              <span class="layer-idx">{String(i + 1).padStart(2, "0")}</span>
              <div class="layer-icon">
                <span class="layer-glyph">{layer.icon}</span>
              </div>
              <div class="layer-info">
                <span class="layer-name">{layer.name}</span>
                <span class="layer-role">{layer.role}</span>
              </div>
            </div>
          {/each}
        </div>

        <!-- ④ What You'll Build -->
        {#if previewDesc}
          <div class="build-preview">
            <div class="preview-hd">
              <Sparkles size={11} style="color:#ffb400;flex-shrink:0;" />
              <span class="preview-lbl">What You'll Build</span>
            </div>
            <p class="preview-txt">{previewDesc}</p>
          </div>
        {/if}

        <!-- ⑤ Status -->
        <div class="brief-cta">
          {#if previewCombo?.comingSoon}
            <div class="cta-soon">
              <Lock size={13} />
              <span>COMING SOON — STAND BY</span>
            </div>
          {:else if sel}
            <div class="cta-armed">
              <div class="armed-pulse"></div>
              <CircleCheck size={15} style="color:var(--accent);flex-shrink:0;" />
              <span>LOADOUT ARMED — CONFIRM IN STATUS BAR</span>
            </div>
          {/if}
        </div>

      </div>
    {/key}
  </section>

</div>

<style>
  /* ══ LAYOUT ══ */
  .nexus {
    display: grid;
    grid-template-columns: clamp(175px, 22%, 255px) 1fr;
    gap: clamp(0.6rem, 1.5vw, 1.2rem);
    align-items: stretch;
  }

  /* ══ RAIL ══ */
  .rail {
    display: flex;
    flex-direction: column;
    background: rgba(9,14,24,0.85);
    border: 1px solid rgba(7,165,201,0.12);
    border-radius: 4px;
    overflow: hidden;
  }

  .rail-hd {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: clamp(0.4rem, 0.9vw, 0.65rem) clamp(0.55rem, 1.2vw, 0.85rem);
    border-bottom: 1px solid rgba(7,165,201,0.09);
    background: rgba(7,165,201,0.025);
    flex-shrink: 0;
  }
  .rail-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(0.62rem, calc(0.29rem + 0.59vw), 1.0rem);
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #d0d7dd;
  }

  .rail-list {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* ── row ── */
  .loadout-row {
    display: flex;
    align-items: center;
    gap: clamp(0.4rem, 0.9vw, 0.65rem);
    padding: clamp(0.55rem, 1.2vw, 0.8rem) clamp(0.45rem, 1vw, 0.7rem) clamp(0.55rem, 1.2vw, 0.8rem) 0;
    cursor: pointer;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(7,165,201,0.06);
    text-align: left;
    position: relative;
    transition: background 0.18s ease;
    overflow: hidden;
    width: 100%;
  }
  .loadout-row:last-child { border-bottom: none; }
  .loadout-row:hover:not(.is-locked) { background: rgba(var(--rgb),0.05); }
  .loadout-row.is-active  { background: rgba(var(--rgb),0.07); }
  .loadout-row.is-locked  { opacity: 0.42; cursor: not-allowed; }

  .row-bar {
    width: 3px;
    align-self: stretch;
    flex-shrink: 0;
    background: var(--accent);
    opacity: 0.28;
    transition: opacity 0.18s ease, box-shadow 0.18s ease;
  }
  .loadout-row:hover:not(.is-locked) .row-bar { opacity: 0.80; }
  .loadout-row.is-active .row-bar              { opacity: 0.85; }
  .loadout-row.is-sel .row-bar {
    opacity: 1;
    box-shadow: 2px 0 14px rgba(var(--rgb),0.55);
  }

  .row-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .row-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .row-badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.44rem, calc(0.22rem + 0.39vw), 0.69rem);
    letter-spacing: 0.10em;
    color: var(--accent);
    opacity: 0.72;
  }
  .row-soon {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.44rem, calc(0.22rem + 0.39vw), 0.69rem);
    color: rgba(208,215,221,0.32);
  }
  .row-name {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(0.56rem, calc(0.23rem + 0.59vw), 0.94rem);
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s ease;
  }
  .loadout-row.is-active .row-name,
  .loadout-row.is-sel .row-name { color: var(--accent); }

  .row-icons {
    display: flex;
    gap: 0.22rem;
  }
  .row-glyph {
    font-size: clamp(0.75rem, calc(0.42rem + 0.59vw), 1.13rem);
    line-height: 1;
    opacity: 0.60;
  }

  .row-check {
    display: flex;
    align-items: center;
    color: var(--accent);
    filter: drop-shadow(0 0 5px rgba(var(--rgb),0.65));
    flex-shrink: 0;
    margin-right: 0.2rem;
  }
  .row-arrow {
    display: flex;
    align-items: center;
    color: rgba(208,215,221,0.18);
    flex-shrink: 0;
    margin-right: 0.2rem;
    transition: color 0.15s ease;
  }
  .loadout-row.is-active .row-arrow { color: rgba(var(--rgb),0.45); }

  .rail-foot {
    padding: clamp(0.3rem, 0.7vw, 0.5rem) clamp(0.55rem, 1.2vw, 0.85rem);
    border-top: 1px solid rgba(7,165,201,0.09);
    background: rgba(7,165,201,0.02);
    flex-shrink: 0;
  }
  .rail-foot-txt {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.36rem, calc(0.17rem + 0.35vw), 0.58rem);
    letter-spacing: 0.12em;
    color: rgba(7,165,201,0.28);
  }

  /* ══ BRIEF ══ */
  .brief {
    position: relative;
    background: rgba(8,12,22,0.92);
    border: 1px solid rgba(var(--rgb),0.22);
    border-radius: 4px;
    overflow: hidden;
    transition: border-color 0.35s ease, box-shadow 0.35s ease;
    box-shadow: 0 0 60px rgba(var(--rgb),0.05), inset 0 0 80px rgba(0,0,0,0.25);
    background-image:
      repeating-linear-gradient(0deg,   rgba(var(--rgb),0.022) 0, rgba(var(--rgb),0.022) 1px, transparent 1px, transparent 28px),
      repeating-linear-gradient(90deg,  rgba(var(--rgb),0.022) 0, rgba(var(--rgb),0.022) 1px, transparent 1px, transparent 28px);
  }

  .br {
    position: absolute;
    width: 11px; height: 11px;
    pointer-events: none; z-index: 5;
    transition: border-color 0.35s ease;
  }
  .br-tl { top:4px;    left:4px;  border-top:  2px solid var(--accent); border-left:  2px solid var(--accent); }
  .br-tr { top:4px;    right:4px; border-top:  2px solid var(--accent); border-right: 2px solid var(--accent); }
  .br-bl { bottom:4px; left:4px;  border-bottom: 2px solid var(--accent); border-left:  2px solid var(--accent); }
  .br-br { bottom:4px; right:4px; border-bottom: 2px solid var(--accent); border-right: 2px solid var(--accent); }

  .sweep {
    position: absolute;
    left: 0; right: 0;
    height: 1px; top: 0;
    background: linear-gradient(90deg, transparent 0%, var(--accent) 40%, rgba(0,245,255,0.9) 50%, var(--accent) 60%, transparent 100%);
    pointer-events: none; z-index: 10;
    animation: sweepDown 0.55s ease-out forwards;
  }
  @keyframes sweepDown {
    0%   { top:0;    opacity:0.9; }
    100% { top:100%; opacity:0;   }
  }

  .brief-inner {
    position: relative; z-index: 2;
    padding: clamp(0.75rem, 1.8vw, 1.35rem);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: clamp(0.5rem, 1.1vw, 0.85rem);
    animation: briefIn 0.38s cubic-bezier(0.22,0.61,0.36,1) forwards;
  }
  @keyframes briefIn {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  /* ① Header */
  .brief-head {
    display: flex;
    flex-direction: column;
    gap: clamp(0.18rem, 0.45vw, 0.3rem);
  }
  .brief-type {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.38rem, calc(0.15rem + 0.39vw), 0.63rem);
    letter-spacing: 0.16em;
    border: 1px solid;
    border-radius: 2px;
    padding: 0.08rem 0.38rem;
    width: fit-content;
  }
  .brief-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(0.69rem, calc(0.19rem + 0.88vw), 1.25rem);
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.03em;
    line-height: 1.2;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ② Divider */
  .brief-div {
    display: flex;
    align-items: center;
    gap: clamp(0.38rem, 0.9vw, 0.6rem);
  }
  .div-lbl {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.44rem, calc(0.19rem + 0.44vw), 0.72rem);
    letter-spacing: 0.15em;
    color: rgba(var(--rgb),0.50);
    white-space: nowrap;
  }
  .div-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(var(--rgb),0.26), transparent);
  }
  .div-count {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.40rem, calc(0.18rem + 0.39vw), 0.65rem);
    letter-spacing: 0.10em;
    color: rgba(208,215,221,0.26);
    white-space: nowrap;
  }

  /* ③ Layers */
  .brief-layers {
    display: flex;
    flex-direction: column;
    gap: clamp(0.25rem, 0.6vw, 0.42rem);
    flex: 1;
  }

  .layer {
    display: flex;
    align-items: center;
    gap: clamp(0.42rem, 1vw, 0.65rem);
    padding: clamp(0.32rem, 0.8vw, 0.5rem) clamp(0.5rem, 1.1vw, 0.72rem) clamp(0.32rem, 0.8vw, 0.5rem) 0;
    background: rgba(var(--rgb),0.04);
    border: 1px solid rgba(var(--rgb),0.10);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
    animation: layerIn 0.45s cubic-bezier(0.22,0.61,0.36,1) calc(var(--i) * 0.07s + 0.04s) both;
    transition: background 0.18s ease, border-color 0.18s ease;
  }
  .layer:hover {
    background: rgba(var(--rgb),0.09);
    border-color: rgba(var(--rgb),0.22);
  }
  @keyframes layerIn {
    from { opacity:0; transform:translateX(-18px); }
    to   { opacity:1; transform:translateX(0);     }
  }

  .layer-bar {
    position: absolute;
    left:0; top:0; bottom:0;
    width: 2px;
    background: var(--accent);
    opacity: 0.52;
  }

  .layer-idx {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.38rem, calc(0.19rem + 0.34vw), 0.60rem);
    color: rgba(var(--rgb),0.36);
    letter-spacing: 0.05em;
    min-width: clamp(0.9rem, 1.8vw, 1.2rem);
    text-align: right;
    flex-shrink: 0;
  }

  .layer-icon {
    width: clamp(22px, calc(9.64px + 1.37vw), 36px);
    height: clamp(22px, calc(9.64px + 1.37vw), 36px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--rgb),0.09);
    border: 1px solid rgba(var(--rgb),0.20);
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: 0 0 10px rgba(var(--rgb),0.09), inset 0 0 5px rgba(var(--rgb),0.05);
  }
  .layer-glyph {
    font-size: clamp(0.75rem, calc(0.31rem + 0.78vw), 1.25rem);
    line-height: 1;
  }

  .layer-info {
    flex: 1; min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.06rem;
  }
  .layer-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(0.63rem, calc(0.29rem + 0.59vw), 1.0rem);
    font-weight: 600;
    color: #d0d7dd;
    letter-spacing: 0.03em;
  }
  .layer-role {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.34rem, calc(0.21rem + 0.25vw), 0.50rem);
    letter-spacing: 0.13em;
    color: rgba(var(--rgb),0.46);
  }

  /* ④ What You'll Build */
  .build-preview {
    background: linear-gradient(135deg, rgba(255,180,0,0.07) 0%, rgba(255,200,50,0.03) 100%);
    border: 1px solid rgba(255,180,0,0.17);
    border-radius: 4px;
    padding: clamp(0.32rem, 0.8vw, 0.5rem) clamp(0.55rem, 1.2vw, 0.8rem);
  }
  .preview-hd {
    display: flex;
    align-items: center;
    gap: 0.32rem;
    margin-bottom: clamp(0.14rem, 0.35vw, 0.22rem);
  }
  .preview-lbl {
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.47rem, calc(0.22rem + 0.44vw), 0.75rem);
    letter-spacing: 0.12em;
    color: #ffb400;
  }
  .preview-txt {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(0.63rem, calc(0.29rem + 0.59vw), 1.0rem);
    color: rgba(208,215,221,0.70);
    line-height: 1.35;
    margin: 0;
  }

  /* ⑤ Status */
  .brief-cta {
    padding-top: 0.08rem;
  }
  .cta-armed {
    display: flex;
    align-items: center;
    gap: 0.42rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.44rem, calc(0.21rem + 0.41vw), 0.70rem);
    letter-spacing: 0.12em;
    color: var(--accent);
    position: relative;
  }
  .armed-pulse {
    position: absolute;
    left: -0.4rem;
    width: calc(100% + 0.8rem);
    height: 100%;
    background: rgba(var(--rgb),0.04);
    border-radius: 2px;
    animation: armedPulse 2.2s ease infinite;
  }
  @keyframes armedPulse {
    0%, 100% { opacity:0; }
    50%       { opacity:1; }
  }
  .cta-soon {
    display: flex;
    align-items: center;
    gap: 0.38rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: clamp(0.42rem, calc(0.22rem + 0.36vw), 0.65rem);
    letter-spacing: 0.12em;
    color: rgba(208,215,221,0.26);
  }

  /* ══ RESPONSIVE ══ */
  @media (max-width: 680px) {
    .nexus {
      grid-template-columns: 1fr;
    }
    .brief { order: -1; }
    .brief-title  { white-space: normal; }
    .row-name     { white-space: normal; }
  }

</style>
