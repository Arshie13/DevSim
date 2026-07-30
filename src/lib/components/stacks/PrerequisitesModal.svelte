<script lang="ts">
  import type { StackSelection } from "$types";
  import { X, AlertTriangle, ChevronRight } from "lucide-svelte";

  let {
    selection = null,
    onConfirm = () => {},
    onCancel = () => {},
  } = $props();

  let prereqItems = $state<Array<{ category: string; techName: string; techIcon: string; prerequisites: string[] }>>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    if (selection) {
      loadPrerequisites();
    }
  });

  async function loadPrerequisites() {
    if (!selection) return;
    
    isLoading = true;
    error = null;
    
    try {
      const response = await fetch('/api/prerequisites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selection }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        prereqItems = data.prerequisites || [];
      } else {
        error = data.error || 'Failed to load prerequisites';
      }
    } catch (e) {
      error = 'Failed to load prerequisites';
      console.error('Prerequisites load error:', e);
    } finally {
      isLoading = false;
    }
  }

  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    onCancel();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) handleCancel();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") handleCancel();
  }
</script>

<div
  class="prereq-backdrop"
  role="dialog"
  aria-modal="true"
  aria-labelledby="prereq-title"
  tabindex="-1"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
>
  <div class="prereq-card ds-scrollbar">
    <!-- Animated gradient border glow -->
    <div class="prereq-card-glow" aria-hidden="true"></div>

    <!-- Header -->
    <div class="prereq-header">
      <button type="button" class="prereq-close-btn" onclick={handleCancel} aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="prereq-icon-wrap">
        <span class="prereq-icon" aria-hidden="true">⚠</span>
      </div>

      <h2 id="prereq-title" class="prereq-title">Prerequisites Check</h2>
      <p class="prereq-subtitle">
        Here are the foundational topics AI recommends learning before you begin:
      </p>
    </div>

    <!-- Disclaimer -->
    <div class="prereq-disclaimer">
      <p class="prereq-disclaimer-text">
        ⚠️ Before you start, here is what you need to know about this environment:
      </p>
      <ul class="prereq-disclaimer-list">
        <li><strong>Temporary & ephemeral</strong> — Your code and changes exist only inside this Docker container. If you close the tab or the session ends without archiving, your work is gone.</li>
        <li><strong>Sandboxed</strong> — Network access is restricted, you cannot install arbitrary packages, and some tools or system behaviors may differ from a real local machine.</li>
        <li><strong>Resource limits</strong> — CPU, memory, and disk are constrained. Heavy operations may be slower or fail.</li>
        <li><strong>Pre-seeded data</strong> — The database comes with sample data already loaded. This is a guided simulation, not a blank slate.</li>
        <li><strong>Learning only</strong> — This is not a production setup. Do not expect real-world deployment behavior.</li>
      </ul>
    </div>

    <!-- Prerequisites List -->
    <div class="prereq-content">
      {#if isLoading}
        <div class="prereq-loading">
          <div class="prereq-spinner"></div>
          <p>Loading prerequisites...</p>
        </div>
      {:else if error}
        <div class="prereq-error">
          <p>{error}</p>
        </div>
      {:else if prereqItems.length === 0}
        <div class="prereq-empty">
          <p>No learning recommendations are available for this selection.</p>
        </div>
      {:else}
        {#each prereqItems as item}
          <section class="prereq-group">
            <div class="learning-path-header">
              <span class="prereq-group-icon">{item.techIcon}</span>
              <div>
                <span class="prereq-group-name">{item.techName}</span>
                <span class="learning-path-caption">Your preparation path</span>
              </div>
              <span class="prereq-group-category">{item.category}</span>
            </div>
            <div class="learning-path" role="list" aria-label={item.techName}>
              {#each item.prerequisites as prereq, index}
                <article class="learning-step" role="listitem">
                  <span class="step-number">{String(index + 1).padStart(2, '0')}</span>
                  <div class="step-content">
                    <span class="step-label">FOUNDATION</span>
                    <span class="step-topic">{prereq}</span>
                  </div>
                </article>
              {/each}
            </div>
          </section>
        {/each}
      {/if}
    </div>

    {#if prereqItems.length > 0}
      <p class="prereq-note">
        These are AI-generated suggestions to help you prepare. You can proceed to the scenarios whenever you feel ready.
      </p>
    {/if}

    <!-- Action Row -->
    <div class="prereq-action-row">
      <button
        type="button"
        class="prereq-btn-cancel"
        onclick={handleCancel}
      >
        Go Back
      </button>

      <button
        type="button"
        class="prereq-btn-confirm"
        onclick={handleConfirm}
      >
        <span>I'm Ready</span>
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
</div>

<style>
  /* ── Backdrop ─────────────────────────────────────────────────────────── */
  .prereq-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  /* ── Card ─────────────────────────────────────────────────────────────── */
  .prereq-card {
    position: relative;
    width: min(520px, 100%);
    max-height: 90vh;
    overflow-y: auto;
    background: var(--bg-light, #12192a);
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.15));
    border-radius: 6px;
    padding: 1.5rem 1.75rem;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 40px rgba(7, 165, 201, 0.12),
      0 24px 60px rgba(0, 0, 0, 0.55);
  }

  .ds-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(136, 146, 160, 0.3) rgba(10, 14, 26, 0.6);
  }
  .ds-scrollbar::-webkit-scrollbar { width: 6px; }
  .ds-scrollbar::-webkit-scrollbar-track { background: rgba(10, 14, 26, 0.6); border-radius: 4px; margin: 4px 0; }
  .ds-scrollbar::-webkit-scrollbar-thumb { background: rgba(136, 146, 160, 0.3); border-radius: 4px; }
  .ds-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(7, 165, 201, 0.6); }

  /* Animated gradient border overlay */
  .prereq-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 7px;
    background: linear-gradient(135deg, rgba(7, 165, 201, 0.30), transparent 55%, rgba(99, 102, 241, 0.18));
    z-index: -1;
    pointer-events: none;
    animation: prereq-glow-pulse 3s ease-in-out infinite alternate;
  }
  @keyframes prereq-glow-pulse {
    from { opacity: 0.35; }
    to   { opacity: 1; }
  }

  /* ── Header ───────────────────────────────────────────────────────────── */
  .prereq-header {
    text-align: center;
    margin-bottom: 1.25rem;
    position: relative;
  }

  .prereq-close-btn {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: transparent;
    border: none;
    color: var(--text-muted, #8892a0);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: color 0.2s, background 0.2s;
  }
  .prereq-close-btn:hover {
    color: var(--text-primary, #d0d7dd);
    background: rgba(255, 255, 255, 0.05);
  }

  .prereq-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 180, 0, 0.10);
    border: 1px solid rgba(255, 180, 0, 0.25);
    margin-bottom: 0.75rem;
  }
  .prereq-icon {
    font-size: 1.5rem;
    color: #ffb400;
    filter: drop-shadow(0 0 8px rgba(255, 180, 0, 0.5));
    animation: prereq-icon-pulse 2.5s ease-in-out infinite alternate;
  }
  @keyframes prereq-icon-pulse {
    from { filter: drop-shadow(0 0 4px rgba(255, 180, 0, 0.5)); }
    to   { filter: drop-shadow(0 0 14px rgba(255, 180, 0, 0.8)); }
  }

  .prereq-title {
    margin: 0 0 0.4rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 1.3rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--text-primary, #d0d7dd);
  }

  .prereq-subtitle {
    margin: 0;
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.85rem;
    color: rgba(208, 215, 221, 0.60);
    line-height: 1.45;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  /* ── Disclaimer ───────────────────────────────────────────────────────── */
  .prereq-disclaimer {
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    background: rgba(255, 180, 0, 0.06);
    border: 1px solid rgba(255, 180, 0, 0.18);
    border-radius: 6px;
  }

  .prereq-disclaimer-text {
    margin: 0 0 0.5rem;
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.78rem;
    font-weight: 600;
    color: rgba(208, 215, 221, 0.85);
    line-height: 1.35;
    text-align: center;
  }

  .prereq-disclaimer-list {
    margin: 0;
    padding-left: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .prereq-disclaimer-list li {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.73rem;
    color: rgba(208, 215, 221, 0.70);
    line-height: 1.45;
  }

  .prereq-disclaimer-list li strong {
    color: rgba(208, 215, 221, 0.90);
  }

  .prereq-note {
    margin: 0.6rem 0 0;
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.75rem;
    color: rgba(208, 215, 221, 0.55);
    line-height: 1.45;
    text-align: center;
  }

  /* ── Content ──────────────────────────────────────────────────────────── */
  .prereq-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .prereq-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem 0;
    color: rgba(208, 215, 221, 0.60);
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.9rem;
  }

  .prereq-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(7, 165, 201, 0.20);
    border-top-color: #07a5c9;
    border-radius: 50%;
    animation: prereq-spin 0.8s linear infinite;
  }
  @keyframes prereq-spin {
    to { transform: rotate(360deg); }
  }

  .prereq-error {
    text-align: center;
    padding: 1.5rem 0;
    color: #fca5a5;
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.9rem;
  }

  .prereq-empty {
    text-align: center;
    padding: 1.5rem 0;
    color: rgba(208, 215, 221, 0.50);
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.9rem;
  }

  .prereq-group {
    position: relative;
    overflow: hidden;
    background:
      linear-gradient(130deg, rgba(7, 165, 201, 0.10), transparent 43%),
      rgba(10, 14, 26, 0.64);
    border: 1px solid rgba(7, 165, 201, 0.16);
    border-radius: 8px;
    padding: 0.75rem;
  }

  .prereq-group::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: linear-gradient(#00e5a0, #07a5c9 70%, transparent);
  }

  .learning-path-header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.6rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(7, 165, 201, 0.12);
  }

  .prereq-group-icon {
    display: inline-grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
    line-height: 1;
    border: 1px solid rgba(0, 229, 160, 0.28);
    border-radius: 50%;
    background: rgba(0, 229, 160, 0.08);
  }

  .prereq-group-name {
    display: block;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.86rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.04em;
  }

  .learning-path-caption {
    display: block;
    margin-top: 0.15rem;
    color: rgba(208, 215, 221, 0.48);
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.7rem;
  }

  .prereq-group-category {
    margin-left: auto;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    color: rgba(7, 165, 201, 0.76);
  }

  .learning-path {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .learning-step {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    min-height: 3.2rem;
    padding: 0.45rem 0.55rem;
    background: rgba(5, 11, 22, 0.48);
    border: 1px solid rgba(7, 165, 201, 0.13);
    border-radius: 5px;
    transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }

  .learning-step:hover {
    transform: translateY(-2px);
    background: rgba(7, 165, 201, 0.10);
    border-color: rgba(0, 229, 160, 0.38);
  }

  .step-number {
    color: #00e5a0;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.68rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .step-label {
    color: rgba(7, 165, 201, 0.64);
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.56rem;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  .step-topic {
    color: rgba(208, 215, 221, 0.9);
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.78rem;
    font-weight: 600;
    line-height: 1.35;
  }

  @media (max-width: 440px) {
    .learning-path {
      grid-template-columns: 1fr;
    }
  }
  .prereq-action-row {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.25rem;
    padding-top: 0.85rem;
    border-top: 1px solid rgba(7, 165, 201, 0.08);
  }

  .prereq-btn-cancel {
    padding: 0.6rem 1.25rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted, #8892a0);
    background: transparent;
    border: 1px solid rgba(40, 55, 80, 0.9);
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s, background 0.2s;
  }
  .prereq-btn-cancel:hover {
    color: var(--text-primary, #d0d7dd);
    border-color: rgba(7, 165, 201, 0.25);
    background: rgba(7, 165, 201, 0.06);
  }

  .prereq-btn-confirm {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.5rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #0a0e1a;
    background: #00e5a0;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.2s ease;
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
  }
  .prereq-btn-confirm:hover {
    background: #00ffb3;
    box-shadow: 0 0 20px rgba(0, 229, 160, 0.35);
  }
  .prereq-btn-confirm:active {
    transform: scale(0.97);
  }

  @media (max-height: 760px) {
    .prereq-backdrop {
      align-items: center;
      padding: 0.75rem;
    }
    .prereq-card {
      max-height: 96vh;
      padding: 1.15rem 1rem;
    }
  }
</style>
