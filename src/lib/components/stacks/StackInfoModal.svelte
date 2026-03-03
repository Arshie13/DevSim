<script lang="ts">
  import type { StackSelection, TechOption } from "$types";
  import {
    FRONTEND_OPTIONS,
    BACKEND_OPTIONS,
    DATABASE_OPTIONS,
    SERVICES_OPTIONS,
  } from "$mocks";
  import {
    X,
    ThumbsUp,
    ThumbsDown,
    Lightbulb,
    Target,
    AlertTriangle,
    Sparkles,
  } from "lucide-svelte";

  export let selection: StackSelection;
  export let onClose: () => void;

  function getOption(
    options: TechOption[],
    id: string | null,
  ): TechOption | null {
    if (!id) return null;
    return options.find((o) => o.id === id) || null;
  }

  $: frontendOption = getOption(FRONTEND_OPTIONS, selection.frontend);
  $: backendOption = getOption(BACKEND_OPTIONS, selection.backend);
  $: databaseOption = getOption(DATABASE_OPTIONS, selection.database);
  $: servicesOption = getOption(SERVICES_OPTIONS, selection.services);

  $: selectedOptions = [
    frontendOption,
    backendOption,
    databaseOption,
    servicesOption,
  ].filter(Boolean) as TechOption[];

  // Generate stack analysis based on selections
  $: stackAnalysis = generateStackAnalysis(selection);

  function generateStackAnalysis(sel: StackSelection) {
    const pros: string[] = [];
    const cons: string[] = [];
    const bestFor: string[] = [];
    const avoidFor: string[] = [];
    let synergy = "";
  

    // Frontend analysis
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

    // Backend analysis
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

    // Database analysis
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

    // Services analysis
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

    // Synergy analysis
    if (sel.frontend === "nextjs" && sel.services === "prisma") {
      synergy =
        "Excellent combination! Next.js Server Actions pair perfectly with Prisma for type-safe full-stack development.";
    } else if (
      sel.frontend === "react" &&
      sel.backend === "express" &&
      sel.database === "mongodb"
    ) {
      synergy =
        "Classic MERN stack! Well-documented with huge community support.";
    } else if (
      sel.frontend === "react" &&
      sel.backend === "express" &&
      sel.database === "postgresql"
    ) {
      synergy =
        "PERN stack - React frontend with Express and PostgreSQL backend. Great for building robust full-stack applications.";
    } else if (sel.backend === "django" && sel.database === "postgresql") {
      synergy =
        "Django + PostgreSQL is a battle-tested combination used by Instagram and Pinterest.";
    } else if (sel.frontend === "vue" && sel.backend === "express") {
      synergy =
        "MEVN stack - great balance of simplicity and power for full-stack JS development.";
    } else if (sel.services === "supabase" && sel.database === "postgresql") {
      synergy =
        "Perfect match! Supabase is built on PostgreSQL, giving you real-time features on top of a robust SQL database.";
    } else if (
      sel.backend === "express" &&
      sel.database === "postgresql" &&
      !sel.frontend
    ) {
      synergy =
        "Solid backend stack! Express + PostgreSQL is perfect for building RESTful APIs and backend services.";
    } else if (
      sel.backend === "express" &&
      sel.database === "mongodb" &&
      !sel.frontend
    ) {
      synergy =
        "Classic Node.js backend! Express + MongoDB is ideal for building flexible APIs with JSON-like data storage.";
    } else if (sel.backend === "fastify" && sel.database && !sel.frontend) {
      synergy =
        "High-performance API setup! Fastify's speed combined with your database choice makes for efficient backend services.";
    } else if (sel.backend === "nestjs" && sel.database && !sel.frontend) {
      synergy =
        "Enterprise-grade backend! NestJS provides excellent structure for building scalable API services.";
    } else if (
      (sel.backend === "django" || sel.backend === "flask") &&
      sel.database &&
      !sel.frontend
    ) {
      synergy =
        "Python backend stack! Great choice for APIs, especially if you plan to integrate ML/AI features later.";
    } else if (sel.backend && sel.database && !sel.frontend) {
      synergy =
        "Backend-focused stack! Perfect for learning API development and database interactions without frontend complexity.";
    } else if (sel.frontend && !sel.backend && sel.services) {
      synergy =
        "Frontend + Services stack! Great for learning modern JAMstack patterns with serverless architecture.";
    } else if (sel.frontend && sel.backend && !sel.database) {
      synergy =
        "Frontend + Backend combination! Consider adding a database to complete your full-stack learning.";
    } else if (selectedOptions.length >= 2) {
      synergy =
        "A solid technology combination for focused learning on specific parts of the development stack.";
    }

    // Add general cons
    if (
      sel.frontend &&
      sel.backend &&
      sel.backend !== "nextjs" &&
      sel.frontend !== sel.backend
    ) {
      cons.push("Separate frontend/backend requires API communication setup");
    }
    if ((sel.backend === "django" || sel.backend === "flask") && sel.frontend) {
      cons.push("Python backend with JS frontend requires context-switching");
    }

    return { pros, cons, bestFor, avoidFor, synergy };
  }
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
      <button class="close-btn btn-cyber btn-cyber-outline" on:click={onClose}>
        <X class="w-4 h-4" />
      </button>

      <div class="flex items-center gap-2 mb-3">
        <Sparkles class="w-4 h-4" style="color: #ffb400;" />
        <h2 class="modal-title">Stack Analysis</h2>
      </div>

      <!-- Selected tech pills -->
      <div class="flex items-center gap-2 flex-wrap">
        {#each selectedOptions as option}
          <div class="tech-pill">
            <span class="text-base">{option.icon}</span>
            <span class="tech-pill-name">{option.name}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Content -->
    <div class="modal-content">

      <!-- Synergy message — AI mentor bubble style -->
      {#if stackAnalysis.synergy}
        <div class="synergy-box">
          <Lightbulb class="w-4 h-4 flex-shrink-0 mt-0.5" style="color: #07a5c9;" />
          <p class="synergy-text">{stackAnalysis.synergy}</p>
        </div>
      {/if}

      <!-- Pros -->
      {#if stackAnalysis.pros.length > 0}
        <div class="analysis-section">
          <div class="section-head">
            <ThumbsUp class="w-3.5 h-3.5 flex-shrink-0" style="color: #00e5a0;" />
            <h3 class="section-title" style="color: #00e5a0;">Advantages</h3>
          </div>
          <ul class="item-list">
            {#each stackAnalysis.pros as pro}
              <li class="item-row">
                <span class="item-bullet" style="color: #00e5a0;">+</span>
                <span class="item-text">{pro}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Cons -->
      {#if stackAnalysis.cons.length > 0}
        <div class="analysis-section">
          <div class="section-head">
            <ThumbsDown class="w-3.5 h-3.5 flex-shrink-0" style="color: #ff3860;" />
            <h3 class="section-title" style="color: #ff3860;">Considerations</h3>
          </div>
          <ul class="item-list">
            {#each stackAnalysis.cons as con}
              <li class="item-row">
                <span class="item-bullet" style="color: #ff3860;">−</span>
                <span class="item-text">{con}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Best For -->
      {#if stackAnalysis.bestFor.length > 0}
        <div class="analysis-section">
          <div class="section-head">
            <Target class="w-3.5 h-3.5 flex-shrink-0" style="color: #07a5c9;" />
            <h3 class="section-title" style="color: #07a5c9;">Best Use Cases</h3>
          </div>
          <ul class="item-list">
            {#each stackAnalysis.bestFor as useCase}
              <li class="item-row">
                <span class="item-bullet" style="color: #07a5c9;">→</span>
                <span class="item-text">{useCase}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Avoid For -->
      {#if stackAnalysis.avoidFor.length > 0}
        <div class="analysis-section">
          <div class="section-head">
            <AlertTriangle class="w-3.5 h-3.5 flex-shrink-0" style="color: #ffb400;" />
            <h3 class="section-title" style="color: #ffb400;">Not Recommended For</h3>
          </div>
          <ul class="item-list">
            {#each stackAnalysis.avoidFor as avoid}
              <li class="item-row">
                <span class="item-bullet" style="color: #ffb400;">!</span>
                <span class="item-text">{avoid}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
  }

  /* Modal box */
  .modal-box {
    position: relative;
    overflow: hidden;
    background: #12192a;
    border: 1px solid rgba(7, 165, 201, 0.30);
    border-radius: 4px;
    max-width: 640px;
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 60px rgba(7, 165, 201, 0.12), 0 0 120px rgba(0, 0, 0, 0.60);
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
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(7, 165, 201, 0.12);
    background: rgba(10, 14, 26, 0.40);
  }

  .modal-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: #d0d7dd;
    letter-spacing: 0.05em;
  }

  /* Tech pills in header */
  .tech-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.6rem;
    background: rgba(7, 165, 201, 0.08);
    border: 1px solid rgba(7, 165, 201, 0.30);
    border-radius: 4px;
  }
  .tech-pill-name {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: #07a5c9;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* Close button */
  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  /* Scrollable content */
  .modal-content {
    position: relative;
    z-index: 2;
    padding: 1.25rem 1.5rem;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  /* Synergy — AI mentor bubble style */
  .synergy-box {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: rgba(7, 165, 201, 0.06);
    border-left: 2px solid #07a5c9;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.02);
  }
  .synergy-text {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.88rem;
    color: #d0d7dd;
    line-height: 1.5;
  }

  /* Analysis sections */
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

  /* Inline cyber button for close */
  .btn-cyber {
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    font-family: 'Orbitron', sans-serif;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }
  .btn-cyber-outline {
    border: 1px solid rgba(7, 165, 201, 0.40);
    color: rgba(7, 165, 201, 0.70);
    background: transparent;
  }
  .btn-cyber-outline:hover {
    background: rgba(7, 165, 201, 0.12);
    color: #07a5c9;
    border-color: #07a5c9;
  }
</style>
