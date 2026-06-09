<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";
  import Scrollbar from "$lib/components/ui/Scrollbar.svelte";
  import {
    X,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
    Lightbulb,
    Target,
    AlertTriangle,
    Zap,
    Loader,
    Layers,
  } from "lucide-svelte";

  export let selection: StackSelection;
  export let onClose: () => void;

  let activeTab: "layers" | "analysis" | "ai" = "layers";
  let aiLoading = false;
  let aiDescription = "";
  let aiError = false;

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

  interface Layer { id: string; icon: string; name: string; role: string; desc?: string }

  $: layers = buildLayers(selection);

  function buildLayers(combo: StackSelection): Layer[] {
    const out: Layer[] = [];
    if (combo.frontend) {
      const t = getOption(FRONTEND_OPTIONS, combo.frontend);
      if (t) out.push({ id: combo.frontend, icon: ICON_OVERRIDE[combo.frontend] ?? t.icon, name: t.name, role: "FRONTEND", desc: t.description });
    }
    if (combo.backend) {
      const t = getOption(BACKEND_OPTIONS, combo.backend);
      if (t) out.push({ id: combo.backend, icon: ICON_OVERRIDE[combo.backend] ?? t.icon, name: t.name, role: "BACKEND", desc: t.description });
    }
    if (combo.database) {
      const t = getOption(DATABASE_OPTIONS, combo.database);
      if (t) out.push({ id: combo.database, icon: ICON_OVERRIDE[combo.database] ?? t.icon, name: t.name, role: "DATABASE", desc: t.description });
    }
    if (combo.services) {
      const t = getOption(SERVICES_OPTIONS, combo.services);
      if (t) out.push({ id: combo.services, icon: ICON_OVERRIDE[combo.services] ?? t.icon, name: t.name, role: "SERVICE", desc: t.description });
    }
    return out;
  }

  $: previewDesc = getPreviewDescription(selection);

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

  // ── Stack Analysis (static logic) ──
  $: analysis = generateStackAnalysis(selection);

  function generateStackAnalysis(sel: StackSelection) {
    const pros: string[] = [];
    const cons: string[] = [];
    const bestFor: string[] = [];
    const avoidFor: string[] = [];
    let synergy = "";

    const selectedOptions = [
      getOption(FRONTEND_OPTIONS, sel.frontend),
      getOption(BACKEND_OPTIONS, sel.backend),
      getOption(DATABASE_OPTIONS, sel.database),
      getOption(SERVICES_OPTIONS, sel.services),
    ].filter(Boolean) as TechOption[];

    if (sel.frontend === "react") {
      pros.push("Massive ecosystem with thousands of libraries");
      pros.push("Strong job market demand");
      bestFor.push("Large-scale applications with complex state");
    } else if (sel.frontend === "nextjs") {
      pros.push("Built-in SSR/SSG for optimal performance");
      pros.push("Full-stack capabilities with API routes");
      bestFor.push("SEO-critical applications and e-commerce");
    } else if (sel.frontend === "vue") {
      pros.push("Gentle learning curve with excellent docs");
      pros.push("Flexible and incrementally adoptable");
      bestFor.push("Progressive enhancement of existing apps");
    } else if (sel.frontend === "svelte") {
      pros.push("No virtual DOM means faster runtime");
      pros.push("Less boilerplate, more readable code");
      bestFor.push("Performance-critical applications");
    } else if (sel.frontend === "angular") {
      pros.push("Enterprise-ready with strong typing");
      pros.push("Complete framework with built-in tools");
      bestFor.push("Large enterprise applications");
    }

    if (sel.backend === "express") {
      pros.push("Minimal and flexible Node.js framework");
      cons.push("Requires manual setup for many features");
      bestFor.push("RESTful APIs and microservices");
    } else if (sel.backend === "fastify") {
      pros.push("Extremely fast with low overhead");
      pros.push("Built-in validation and serialization");
      bestFor.push("High-performance APIs");
    } else if (sel.backend === "nestjs") {
      pros.push("Angular-inspired architecture with DI");
      pros.push("Excellent TypeScript support");
      bestFor.push("Enterprise-grade backend systems");
    } else if (sel.backend === "django") {
      pros.push("Batteries-included Python framework");
      pros.push("Built-in admin panel and ORM");
      bestFor.push("Rapid prototyping and content sites");
      cons.push("Different language from JS frontend");
    } else if (sel.backend === "flask") {
      pros.push("Lightweight and flexible Python");
      cons.push("Requires more manual configuration");
      bestFor.push("Small APIs and ML model serving");
    }

    if (sel.database === "postgresql") {
      pros.push("Advanced features like JSONB and full-text search");
      pros.push("Strong data integrity with ACID compliance");
      bestFor.push("Complex queries and relational data");
    } else if (sel.database === "mongodb") {
      pros.push("Flexible schema for evolving data models");
      pros.push("Great for document-based storage");
      cons.push("Less suitable for complex relations");
      bestFor.push("Rapid prototyping and unstructured data");
    } else if (sel.database === "mysql") {
      pros.push("Well-established and widely supported");
      pros.push("Simple to set up and manage");
      bestFor.push("Traditional web applications");
    } else if (sel.database === "sqlite") {
      pros.push("Zero configuration, file-based storage");
      pros.push("Perfect for development and small apps");
      cons.push("Not suitable for high concurrency");
      avoidFor.push("Production apps with many concurrent users");
    } else if (sel.database === "redis") {
      pros.push("Lightning-fast in-memory operations");
      pros.push("Great for caching and sessions");
      cons.push("Data persistence requires configuration");
      bestFor.push("Caching layer and real-time features");
    }

    if (sel.services === "prisma") {
      pros.push("Type-safe database client with auto-completion");
      pros.push("Excellent migration system");
      bestFor.push("TypeScript projects with SQL databases");
    } else if (sel.services === "firebase") {
      pros.push("Real-time database and auth out of the box");
      pros.push("Serverless functions included");
      cons.push("Vendor lock-in concerns");
      bestFor.push("MVPs and real-time applications");
    } else if (sel.services === "supabase") {
      pros.push("Open-source Firebase alternative");
      pros.push("PostgreSQL-based with real-time subscriptions");
      bestFor.push("Full-stack apps needing auth and storage");
    } else if (sel.services === "docker") {
      pros.push("Consistent environments across dev and prod");
      pros.push("Easy deployment and scaling");
      bestFor.push("Microservices and complex deployments");
    } else if (sel.services === "graphql") {
      pros.push("Flexible queries, get exactly what you need");
      pros.push("Strong typing with schema");
      cons.push("Steeper learning curve than REST");
      bestFor.push("Apps with complex data requirements");
    }

    if (sel.frontend === "nextjs" && sel.services === "prisma") {
      synergy = "Excellent combination! Next.js Server Actions pair perfectly with Prisma for type-safe full-stack development.";
    } else if (sel.frontend === "react" && sel.backend === "express" && sel.database === "mongodb") {
      synergy = "Classic MERN stack! Well-documented with huge community support.";
    } else if (sel.frontend === "react" && sel.backend === "express" && sel.database === "postgresql") {
      synergy = "PERN stack - React frontend with Express and PostgreSQL backend. Great for building robust full-stack applications.";
    } else if (sel.backend === "django" && sel.database === "postgresql") {
      synergy = "Django + PostgreSQL is a battle-tested combination used by Instagram and Pinterest.";
    } else if (sel.frontend === "vue" && sel.backend === "express") {
      synergy = "MEVN stack - great balance of simplicity and power for full-stack JS development.";
    } else if (sel.services === "supabase" && sel.database === "postgresql") {
      synergy = "Perfect match! Supabase is built on PostgreSQL, giving you real-time features on top of a robust SQL database.";
    } else if (sel.backend === "express" && sel.database === "postgresql" && !sel.frontend) {
      synergy = "Solid backend stack! Express + PostgreSQL is perfect for building RESTful APIs and backend services.";
    } else if (sel.backend === "express" && sel.database === "mongodb" && !sel.frontend) {
      synergy = "Classic Node.js backend! Express + MongoDB is ideal for building flexible APIs with JSON-like data storage.";
    } else if (sel.backend === "fastify" && sel.database && !sel.frontend) {
      synergy = "High-performance API setup! Fastify's speed combined with your database choice makes for efficient backend services.";
    } else if (sel.backend === "nestjs" && sel.database && !sel.frontend) {
      synergy = "Enterprise-grade backend! NestJS provides excellent structure for building scalable API services.";
    } else if ((sel.backend === "django" || sel.backend === "flask") && sel.database && !sel.frontend) {
      synergy = "Python backend stack! Great choice for APIs, especially if you plan to integrate ML/AI features later.";
    } else if (sel.backend && sel.database && !sel.frontend) {
      synergy = "Backend-focused stack! Perfect for learning API development and database interactions without frontend complexity.";
    } else if (sel.frontend && !sel.backend && sel.services) {
      synergy = "Frontend + Services stack! Great for learning modern JAMstack patterns with serverless architecture.";
    } else if (sel.frontend && sel.backend && !sel.database) {
      synergy = "Frontend + Backend combination! Consider adding a database to complete your full-stack learning.";
    } else if (selectedOptions.length >= 2) {
      synergy = "A solid technology combination for focused learning on specific parts of the development stack.";
    }

    if (sel.frontend && sel.backend && sel.backend !== "nextjs" && sel.frontend !== sel.backend) {
      cons.push("Separate frontend/backend requires API communication setup");
    }
    if ((sel.backend === "django" || sel.backend === "flask") && sel.frontend) {
      cons.push("Python backend with JS frontend requires context-switching");
    }

    return { pros, cons, bestFor, avoidFor, synergy };
  }

  // ── AI Analysis ──
  async function loadAiAnalysis() {
    if (aiDescription || aiLoading) return;
    aiLoading = true;
    aiError = false;
    try {
      const res = await fetch('/api/ai/stack-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selection }),
      });
      const data = await res.json();
      if (data.success) {
        aiDescription = data.description;
      } else {
        aiError = true;
      }
    } catch {
      aiError = true;
    } finally {
      aiLoading = false;
    }
  }

  $: if (activeTab === "ai") loadAiAnalysis();

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

  $: tk = selection?.stackType ?? "fullstack";
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="modal-overlay" on:click={onClose}>
  <div class="modal-box" on:click|stopPropagation>

    <!-- Scanline overlay -->
    <div class="modal-scanlines" aria-hidden="true"></div>

    <!-- Top shimmer -->
    <div class="modal-shimmer"></div>

    <!-- Header -->
    <div class="modal-header">
      <button class="close-btn" on:click={onClose}>
        <X class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-2 mb-2">
        <Layers class="w-4 h-4" style="color: #07a5c9;" />
        <h2 class="modal-title">Stack Analysis</h2>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="type-badge" style="color:{TYPE_ACCENT[tk]};background:rgba({TYPE_RGB[tk]},0.09);border-color:rgba({TYPE_RGB[tk]},0.25);">
          {TYPE_LABEL[tk]}
        </span>
        <span class="layer-badge">{layers.length} LAYER{layers.length !== 1 ? 'S' : ''}</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <button class="tab" class:is-active={activeTab === "layers"} on:click={() => (activeTab = "layers")}>
        <Zap size={12} />
        <span>Tech Stack</span>
      </button>
      <button class="tab" class:is-active={activeTab === "analysis"} on:click={() => (activeTab = "analysis")}>
        <Target size={12} />
        <span>Stack Info</span>
      </button>
      <button class="tab" class:is-active={activeTab === "ai"} on:click={() => (activeTab = "ai")}>
        <Sparkles size={12} />
        <span>AI Analysis</span>
      </button>
    </div>

    <!-- Content with Scrollbar -->
    <Scrollbar className="modal-scroll flex-1 min-h-0">
      <div class="modal-content">

        {#if activeTab === "layers"}
          <!-- Stack Name -->
          <h3 class="stack-name">{selection?.name || 'Custom Stack'}</h3>

          <!-- Divider -->
          <div class="div-line">
            <span class="div-lbl">TECH LAYERS</span>
            <div class="div-bar"></div>
            <span class="div-count">{layers.length} LAYER{layers.length !== 1 ? 'S' : ''}</span>
          </div>

          <!-- Layers -->
          <div class="layers">
            {#each layers as layer, i}
              <div class="layer" style="--i:{i}; --accent:{TYPE_ACCENT[tk]}; --rgb:{TYPE_RGB[tk]};">
                <div class="layer-bar"></div>
                <span class="layer-idx">{String(i + 1).padStart(2, '0')}</span>
                <div class="layer-icon">
                  <span class="layer-glyph">{layer.icon}</span>
                </div>
                <div class="layer-info">
                  <span class="layer-name">{layer.name}</span>
                  <span class="layer-role">{layer.role}</span>
                  {#if layer.desc}
                    <p class="layer-desc">{layer.desc}</p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>

          <!-- What You'll Build -->
          {#if previewDesc}
            <div class="build-preview">
              <div class="preview-hd">
                <Sparkles size={11} style="color:#ffb400;flex-shrink:0;" />
                <span class="preview-lbl">What You'll Build</span>
              </div>
              <p class="preview-txt">{previewDesc}</p>
            </div>
          {/if}
        {/if}

        {#if activeTab === "analysis"}
          <div class="analysis-body">
            {#if analysis.synergy}
              <div class="synergy-box">
                <Lightbulb size={16} style="color:#07a5c9;flex-shrink:0;margin-top:2px;" />
                <p class="synergy-text">{analysis.synergy}</p>
              </div>
            {/if}

            {#if analysis.pros.length > 0}
              <div class="analysis-section">
                <div class="section-head">
                  <ThumbsUp size={14} style="color:#00e5a0;flex-shrink:0;" />
                  <h3 class="section-title" style="color:#00e5a0;">Advantages</h3>
                </div>
                <ul class="item-list">
                  {#each analysis.pros as pro}
                    <li class="item-row">
                      <span class="item-bullet" style="color:#00e5a0;">+</span>
                      <span class="item-text">{pro}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if analysis.cons.length > 0}
              <div class="analysis-section">
                <div class="section-head">
                  <ThumbsDown size={14} style="color:#ff3860;flex-shrink:0;" />
                  <h3 class="section-title" style="color:#ff3860;">Considerations</h3>
                </div>
                <ul class="item-list">
                  {#each analysis.cons as con}
                    <li class="item-row">
                      <span class="item-bullet" style="color:#ff3860;">−</span>
                      <span class="item-text">{con}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if analysis.bestFor.length > 0}
              <div class="analysis-section">
                <div class="section-head">
                  <Target size={14} style="color:#07a5c9;flex-shrink:0;" />
                  <h3 class="section-title" style="color:#07a5c9;">Best Use Cases</h3>
                </div>
                <ul class="item-list">
                  {#each analysis.bestFor as useCase}
                    <li class="item-row">
                      <span class="item-bullet" style="color:#07a5c9;">→</span>
                      <span class="item-text">{useCase}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if analysis.avoidFor.length > 0}
              <div class="analysis-section">
                <div class="section-head">
                  <AlertTriangle size={14} style="color:#ffb400;flex-shrink:0;" />
                  <h3 class="section-title" style="color:#ffb400;">Not Recommended For</h3>
                </div>
                <ul class="item-list">
                  {#each analysis.avoidFor as avoid}
                    <li class="item-row">
                      <span class="item-bullet" style="color:#ffb400;">!</span>
                      <span class="item-text">{avoid}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </div>
        {/if}

        {#if activeTab === "ai"}
          <div class="ai-body">
            {#if aiLoading}
              <div class="ai-loading">
                <Loader size={24} class="animate-spin" style="color:#07a5c9;" />
                <span>Analyzing your stack combination...</span>
              </div>
            {:else if aiError}
              <div class="ai-error">
                <p>Unable to generate AI analysis at this time.</p>
                <button class="retry-btn" on:click={loadAiAnalysis}>Retry</button>
              </div>
            {:else if aiDescription}
              <div class="ai-result">
                <div class="ai-header">
                  <Sparkles size={14} style="color:#ffb400;" />
                  <span>AI-Powered Insights</span>
                </div>
                <div class="ai-text" style="white-space: pre-line">{aiDescription}</div>
              </div>
            {:else}
              <div class="ai-empty">
                <Sparkles size={32} style="color:rgba(7,165,201,0.25);" />
                <p>Click the tab above to generate an AI-powered analysis of this stack combination.</p>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </Scrollbar>

    <!-- Footer: Stack Pills Only -->
    <div class="modal-footer">
      <div class="footer-pills">
        {#if selection.frontend}
          {@const opt = getOption(FRONTEND_OPTIONS, selection.frontend)}
          {#if opt}
            <div class="stack-pill">
              <span class="pill-icon">{opt.icon}</span>
              <span class="pill-name">{opt.name}</span>
            </div>
          {/if}
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Frontend</span></div>
        {/if}

        {#if selection.backend}
          {@const opt = getOption(BACKEND_OPTIONS, selection.backend)}
          {#if opt}
            <div class="stack-pill">
              <span class="pill-icon">{opt.icon}</span>
              <span class="pill-name">{opt.name}</span>
            </div>
          {/if}
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Backend</span></div>
        {/if}

        {#if selection.database}
          {@const opt = getOption(DATABASE_OPTIONS, selection.database)}
          {#if opt}
            <div class="stack-pill">
              <span class="pill-icon">{opt.icon}</span>
              <span class="pill-name">{opt.name}</span>
            </div>
          {/if}
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Database</span></div>
        {/if}

        {#if selection.services}
          {@const opt = getOption(SERVICES_OPTIONS, selection.services)}
          {#if opt}
            <div class="stack-pill">
              <span class="pill-icon">{opt.icon}</span>
              <span class="pill-name">{opt.name}</span>
            </div>
          {/if}
        {:else}
          <div class="stack-pill stack-pill--empty"><span class="pill-empty-label">Services</span></div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  /* Overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Modal box */
  .modal-box {
    position: relative;
    overflow: hidden;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.30);
    border-radius: 6px;
    max-width: 720px;
    width: 100%;
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 60px rgba(7, 165, 201, 0.12), 0 0 120px rgba(0, 0, 0, 0.60);
    animation: boxIn 0.35s cubic-bezier(0.22,0.61,0.36,1);
  }
  @keyframes boxIn {
    from { opacity:0; transform: scale(0.96) translateY(10px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }

  /* Scanlines */
  .modal-scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(0, 0, 0, 0.015) 4px
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Top shimmer accent */
  .modal-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #07a5c9, transparent);
    z-index: 1;
  }

  /* Header */
  .modal-header {
    position: relative;
    z-index: 2;
    padding: 1.25rem 1.5rem 0.75rem;
    border-bottom: 1px solid rgba(7, 165, 201, 0.12);
    background: rgba(10, 14, 26, 0.40);
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(208, 215, 221, 0.45);
    background: transparent;
    border: 1px solid rgba(7, 165, 201, 0.25);
    border-radius: 4px;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  }
  .close-btn:hover {
    color: #ff3860;
    border-color: rgba(255, 56, 96, 0.40);
    background: rgba(255, 56, 96, 0.08);
  }

  .modal-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.05em;
  }

  .type-badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    padding: 0.15rem 0.5rem;
    border: 1px solid;
    border-radius: 2px;
  }
  .layer-badge {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.10em;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    color: rgba(208,215,221,0.40);
    border: 1px solid rgba(208,215,221,0.12);
    background: transparent;
  }

  /* Tabs */
  .tab-bar {
    display: flex;
    gap: 0;
    border-bottom: 1px solid rgba(7, 165, 201, 0.12);
    background: rgba(10, 14, 26, 0.30);
    z-index: 2;
  }
  .tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.7rem 0.5rem;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: rgba(208,215,221,0.35);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .tab:hover {
    color: rgba(208,215,221,0.60);
    background: rgba(7,165,201,0.04);
  }
  .tab.is-active {
    color: #07a5c9;
    border-bottom-color: #07a5c9;
    background: rgba(7,165,201,0.06);
  }

  /* Scrollable content */
  :global(.modal-scroll) {
    position: relative;
    z-index: 2;
    padding: 0;
    flex: 1;
  }
  .modal-content {
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .stack-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.03em;
    margin: 0;
  }

  /* Divider */
  .div-line {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .div-lbl {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.14em;
    color: rgba(7,165,201,0.45);
    white-space: nowrap;
  }
  .div-bar {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(7,165,201,0.25), transparent);
  }
  .div-count {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.10em;
    color: rgba(208,215,221,0.30);
    white-space: nowrap;
  }

  /* Layers */
  .layers {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .layer {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.55rem 0.75rem 0.55rem 0;
    background: rgba(var(--rgb),0.04);
    border: 1px solid rgba(var(--rgb),0.10);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
    animation: layerIn 0.45s cubic-bezier(0.22,0.61,0.36,1) calc(var(--i) * 0.07s + 0.04s) both;
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
    font-size: 0.6rem;
    color: rgba(var(--rgb),0.36);
    letter-spacing: 0.05em;
    min-width: 1.2rem;
    text-align: right;
    flex-shrink: 0;
    padding-top: 0.15rem;
  }

  .layer-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--rgb),0.09);
    border: 1px solid rgba(var(--rgb),0.20);
    border-radius: 4px;
    flex-shrink: 0;
    box-shadow: 0 0 10px rgba(var(--rgb),0.09), inset 0 0 5px rgba(var(--rgb),0.05);
    margin-top: 0.05rem;
  }
  .layer-glyph {
    font-size: 1.1rem;
    line-height: 1;
  }

  .layer-info {
    flex: 1; min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }
  .layer-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    color: #d0d7dd;
    letter-spacing: 0.03em;
  }
  .layer-role {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.13em;
    color: rgba(var(--rgb),0.46);
  }
  .layer-desc {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.78rem;
    color: rgba(208,215,221,0.50);
    line-height: 1.3;
    margin: 0.15rem 0 0 0;
  }

  /* What You'll Build */
  .build-preview {
    background: linear-gradient(135deg, rgba(255,180,0,0.07) 0%, rgba(255,200,50,0.03) 100%);
    border: 1px solid rgba(255,180,0,0.17);
    border-radius: 4px;
    padding: 0.75rem 1rem;
  }
  .preview-hd {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.25rem;
  }
  .preview-lbl {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
    color: #ffb400;
  }
  .preview-txt {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.85rem;
    color: rgba(208,215,221,0.70);
    line-height: 1.35;
    margin: 0;
  }

  /* Analysis Tab */
  .analysis-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .synergy-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: rgba(7, 165, 201, 0.06);
    border-left: 2px solid #07a5c9;
    border-radius: 0 4px 4px 0;
  }
  .synergy-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.88rem;
    color: #d0d7dd;
    line-height: 1.5;
    margin: 0;
  }

  .analysis-section {
    border-left: 1px solid rgba(7, 165, 201, 0.08);
    padding-left: 0.875rem;
  }
  .section-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.6rem;
  }
  .section-title {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.10em;
  }

  .item-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .item-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .item-bullet {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    line-height: 1.4;
    flex-shrink: 0;
  }
  .item-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.88rem;
    color: rgba(208, 215, 221, 0.70);
    line-height: 1.4;
  }

  /* AI Tab */
  .ai-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    text-align: center;
  }
  .ai-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.92rem;
    color: rgba(208,215,221,0.60);
  }
  .ai-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.92rem;
    color: rgba(208,215,221,0.60);
  }
  .retry-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.68rem;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    padding: 0.5rem 1rem;
    color: #07a5c9;
    background: rgba(7,165,201,0.08);
    border: 1px solid rgba(7,165,201,0.25);
    border-radius: 3px;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }
  .retry-btn:hover {
    background: #07a5c9;
    color: #0a0e1a;
  }
  .ai-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.88rem;
    color: rgba(208,215,221,0.45);
    max-width: 280px;
  }
  .ai-result {
    text-align: left;
    width: 100%;
  }
  .ai-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255,180,0,0.15);
  }
  .ai-header span {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    color: #ffb400;
  }
  .ai-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.9rem;
    color: rgba(208,215,221,0.75);
    line-height: 1.55;
  }

  /* ══ FOOTER: Stack Pills ══ */
  .modal-footer {
    position: relative;
    z-index: 2;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid rgba(7, 165, 201, 0.12);
    background: rgba(10, 14, 26, 0.50);
  }

  .footer-pills {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .stack-pill {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.55rem;
    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.30);
    border-radius: 3px;
  }
  .stack-pill--empty {
    background: transparent;
    border-style: dashed;
    border-color: rgba(208, 215, 221, 0.10);
    opacity: 0.5;
  }
  .pill-icon {
    font-size: 0.85rem;
    line-height: 1;
  }
  .pill-name {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    color: #d0d7dd;
    letter-spacing: 0.03em;
  }
  .pill-empty-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: rgba(208, 215, 221, 0.35);
  }
</style>
