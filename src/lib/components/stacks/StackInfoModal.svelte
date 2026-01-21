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
    let difficulty = "Beginner";

    // Frontend analysis
    if (sel.frontend === "react") {
      pros.push("Massive ecosystem with thousands of libraries");
      pros.push("Strong job market demand");
      bestFor.push("Large-scale applications with complex state");
    } else if (sel.frontend === "nextjs") {
      pros.push("Built-in SSR/SSG for optimal performance");
      pros.push("Full-stack capabilities with API routes");
      bestFor.push("SEO-critical applications and e-commerce");
      difficulty = "Intermediate";
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
      difficulty = "Intermediate";
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
      difficulty = "Intermediate";
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
      difficulty = difficulty === "Beginner" ? "Intermediate" : difficulty;
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

    return { pros, cons, bestFor, avoidFor, synergy, difficulty };
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div
  class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  on:click={onClose}
>
  <div
    class="bg-obsidian-surface border border-obsidian-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
    on:click|stopPropagation
  >
    <!-- Header -->
    <div
      class="relative p-6 border-b border-obsidian-border bg-gradient-to-r from-obsidian-surface via-obsidian-bg-light to-obsidian-surface"
    >
      <button
        on:click={onClose}
        class="absolute top-4 right-4 p-2 rounded-lg bg-obsidian-bg-light hover:bg-obsidian-border transition-colors"
      >
        <X class="w-5 h-5 text-obsidian-text-primary/60" />
      </button>

      <div class="flex items-center gap-2 mb-3">
        <Sparkles class="w-5 h-5 text-amber-400" />
        <h2 class="text-xl font-bold text-obsidian-text-muted">
          Stack Analysis
        </h2>
      </div>

      <!-- Selected Technologies -->
      <div class="flex items-center gap-2 flex-wrap">
        {#each selectedOptions as option}
          <div
            class="flex items-center gap-2 bg-obsidian-bg-light border border-obsidian-border rounded-lg px-3 py-1.5"
          >
            <span class="text-lg">{option.icon}</span>
            <span class="text-sm font-medium text-obsidian-text-muted"
              >{option.name}</span
            >
          </div>
        {/each}
      </div>

      <!-- Difficulty Badge -->
      <div class="mt-3">
        <span
          class="text-xs px-3 py-1 rounded-full font-medium {stackAnalysis.difficulty ===
          'Beginner'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : stackAnalysis.difficulty === 'Intermediate'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'}"
        >
          {stackAnalysis.difficulty} Level
        </span>
      </div>
    </div>

    <!-- Content -->
    <div
      class="p-6 overflow-y-auto max-h-[calc(85vh-180px)] space-y-6"
    >
      <!-- Synergy Message -->
      {#if stackAnalysis.synergy}
        <div
          class="p-4 rounded-xl bg-gradient-to-r from-obsidian-accent/10 to-emerald-500/10 border border-obsidian-accent/20"
        >
          <div class="flex items-start gap-3">
            <Lightbulb
              class="w-5 h-5 text-obsidian-accent flex-shrink-0 mt-0.5"
            />
            <p class="text-sm text-obsidian-text-primary leading-relaxed">
              {stackAnalysis.synergy}
            </p>
          </div>
        </div>
      {/if}

      <!-- Pros -->
      {#if stackAnalysis.pros.length > 0}
        <div>
          <div class="flex items-center gap-2 mb-3">
            <ThumbsUp class="w-4 h-4 text-emerald-400" />
            <h3
              class="text-sm font-semibold text-obsidian-text-primary uppercase tracking-wider"
            >
              Advantages
            </h3>
          </div>
          <ul class="space-y-2">
            {#each stackAnalysis.pros as pro}
              <li
                class="flex items-start gap-2 text-sm text-obsidian-text-primary/70"
              >
                <span class="text-emerald-400 mt-1">+</span>
                <span>{pro}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Cons -->
      {#if stackAnalysis.cons.length > 0}
        <div>
          <div class="flex items-center gap-2 mb-3">
            <ThumbsDown class="w-4 h-4 text-rose-400" />
            <h3
              class="text-sm font-semibold text-obsidian-text-primary uppercase tracking-wider"
            >
              Considerations
            </h3>
          </div>
          <ul class="space-y-2">
            {#each stackAnalysis.cons as con}
              <li
                class="flex items-start gap-2 text-sm text-obsidian-text-primary/70"
              >
                <span class="text-rose-400 mt-1">−</span>
                <span>{con}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Best For -->
      {#if stackAnalysis.bestFor.length > 0}
        <div>
          <div class="flex items-center gap-2 mb-3">
            <Target class="w-4 h-4 text-obsidian-accent" />
            <h3
              class="text-sm font-semibold text-obsidian-text-primary uppercase tracking-wider"
            >
              Best Use Cases
            </h3>
          </div>
          <ul class="space-y-2">
            {#each stackAnalysis.bestFor as useCase}
              <li
                class="flex items-start gap-2 text-sm text-obsidian-text-primary/70"
              >
                <span class="text-obsidian-accent mt-1">→</span>
                <span>{useCase}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Avoid For -->
      {#if stackAnalysis.avoidFor.length > 0}
        <div>
          <div class="flex items-center gap-2 mb-3">
            <AlertTriangle class="w-4 h-4 text-amber-400" />
            <h3
              class="text-sm font-semibold text-obsidian-text-primary uppercase tracking-wider"
            >
              Not Recommended For
            </h3>
          </div>
          <ul class="space-y-2">
            {#each stackAnalysis.avoidFor as avoid}
              <li
                class="flex items-start gap-2 text-sm text-obsidian-text-primary/70"
              >
                <span class="text-amber-400 mt-1">!</span>
                <span>{avoid}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>
</div>
