<script lang="ts">
  import { Container as ContainerIcon, Calendar } from "lucide-svelte";
  import { parseStackName, TECH_NAME_MAP } from "$lib/utils/stacks";
  import type { IContainer } from "$types";

  type ContainerWithDates = IContainer & {
    updatedAt?: string | Date;
    stoppedAt?: string | Date | null;
    createdAt?: string | Date;
  };

  export let container: ContainerWithDates;
  export let variant: "current" | "finished" = "current";

  $: stackLabel = parseStackName(container.containerStacks);
  $: chipNames = container.containerStacks.map(
    (s) => TECH_NAME_MAP[s.stackName] ?? s.stackName,
  );

  const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  function formatRelative(input?: string | Date | null): string {
    if (!input) return "Recently";
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "Recently";
    const diffMs = d.getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    const abs = Math.abs(diffSec);
    if (abs < 60)         return RELATIVE_FORMATTER.format(diffSec, "second");
    if (abs < 3600)       return RELATIVE_FORMATTER.format(Math.round(diffSec / 60), "minute");
    if (abs < 86_400)     return RELATIVE_FORMATTER.format(Math.round(diffSec / 3600), "hour");
    if (abs < 86_400 * 7) return RELATIVE_FORMATTER.format(Math.round(diffSec / 86_400), "day");
    return RELATIVE_FORMATTER.format(Math.round(diffSec / 86_400 / 7), "week");
  }

  $: timestamp = variant === "finished"
    ? formatRelative(container.stoppedAt ?? container.updatedAt)
    : formatRelative(container.updatedAt ?? container.createdAt);

  $: timestampLabel = variant === "finished" ? "Completed" : "Last active";

  $: statusInfo = (() => {
    if (variant === "finished") {
      return { label: "Completed", className: "status--success", pulse: false };
    }
    const s = (container.status ?? "").toLowerCase();
    if (s === "running")   return { label: "Running",   className: "status--accent",  pulse: true };
    if (s === "completed") return { label: "Completed", className: "status--success", pulse: false };
    if (s === "stopped")   return { label: "Stopped",   className: "status--muted",   pulse: false };
    if (s === "created")   return { label: "Ready",     className: "status--warn",    pulse: false };
    return { label: container.status || "Unknown", className: "status--muted", pulse: false };
  })();
</script>

<div class="project-card group" class:finished={variant === "finished"}>
  <!-- Top shimmer -->
  <div class="card-shimmer" aria-hidden="true"></div>

  <!-- Header -->
  <div class="card-head">
    <div class="head-left">
      <div class="icon-wrap" class:gold={variant === "finished"}>
        {#if variant === "finished"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        {:else}
          <ContainerIcon class="w-5 h-5" />
        {/if}
      </div>
      <div class="head-text">
        <h3 class="card-title">{container.scenario?.name ?? stackLabel}</h3>
        {#if container.scenario?.name}
          <p class="card-subtitle">{stackLabel}</p>
        {/if}
      </div>
    </div>

    <div class="status-pill {statusInfo.className}">
      {#if statusInfo.pulse}
        <span class="pulse-dot" aria-hidden="true"></span>
      {/if}
      {statusInfo.label}
    </div>
  </div>

  <!-- Meta row: chips + level -->
  <div class="meta-row">
    <div class="chips" aria-label="Stack technologies">
      {#each chipNames as name}
        <span class="chip">{name}</span>
      {/each}
    </div>
    <span class="level-badge" title="Level">LVL {container.level}</span>
  </div>

  <!-- Timestamp -->
  <div class="timestamp">
    <Calendar class="w-3 h-3" />
    <span>{timestampLabel} · {timestamp}</span>
  </div>

  <!-- Action slot -->
  <div class="action-bar">
    <slot name="actions" />
  </div>
</div>

<style>
  .project-card {
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(18, 25, 42, 0.95), rgba(10, 14, 26, 0.95));
    border: 1px solid var(--card-border);
    border-radius: 4px;
    padding: 1.1rem 1.15rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  }

  .project-card:hover {
    transform: translateY(-2px);
    border-color: var(--card-hover);
    box-shadow: 0 0 24px rgba(7, 165, 201, 0.18);
  }

  .project-card.finished:hover {
    border-color: rgba(255, 180, 0, 0.45);
    box-shadow: 0 0 24px rgba(255, 180, 0, 0.16);
  }

  .card-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .project-card:hover .card-shimmer { opacity: 1; }
  .project-card.finished:hover .card-shimmer {
    background: linear-gradient(90deg, transparent, var(--warn), transparent);
  }

  /* Header */
  .card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .head-left {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 0;
  }

  .icon-wrap {
    flex-shrink: 0;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(7, 165, 201, 0.1);
    border: 1px solid rgba(7, 165, 201, 0.3);
    color: var(--accent);
  }

  .icon-wrap.gold {
    background: rgba(255, 180, 0, 0.1);
    border-color: rgba(255, 180, 0, 0.3);
    color: var(--warn);
  }

  .head-text { min-width: 0; }

  .card-title {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 240px;
  }

  .card-subtitle {
    margin: 0.15rem 0 0;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    color: var(--text-muted);
    letter-spacing: 0.04em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 280px;
  }

  /* Status pill */
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    flex-shrink: 0;
    border: 1px solid;
  }

  .status--accent  { color: var(--accent);  border-color: rgba(7, 165, 201, 0.45);  background: rgba(7, 165, 201, 0.1); }
  .status--success { color: var(--success); border-color: rgba(0, 229, 160, 0.45);  background: rgba(0, 229, 160, 0.08); }
  .status--warn    { color: var(--warn);    border-color: rgba(255, 180, 0, 0.45);  background: rgba(255, 180, 0, 0.08); }
  .status--muted   { color: var(--text-muted); border-color: rgba(136, 146, 160, 0.4); background: rgba(136, 146, 160, 0.08); }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 6px currentColor;
    animation: status-pulse 1.6s ease-in-out infinite;
  }

  @keyframes status-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.4; transform: scale(0.8); }
  }

  /* Meta row */
  .meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    min-width: 0;
  }

  .chip {
    font-family: var(--font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.05em;
    padding: 0.2rem 0.55rem;
    border-radius: 2px;
    border: 1px solid rgba(7, 165, 201, 0.22);
    background: rgba(7, 165, 201, 0.04);
    color: rgba(208, 215, 221, 0.78);
    white-space: nowrap;
  }

  .level-badge {
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 0.25rem 0.55rem;
    border-radius: 2px;
    color: var(--accent);
    background: rgba(7, 165, 201, 0.1);
    border: 1px solid rgba(7, 165, 201, 0.3);
    flex-shrink: 0;
  }

  /* Timestamp */
  .timestamp {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-family: var(--font-mono);
    font-size: 0.66rem;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }

  /* Action bar */
  .action-bar {
    margin-top: 0.35rem;
    padding-top: 0.85rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    justify-content: flex-end;
  }
</style>
