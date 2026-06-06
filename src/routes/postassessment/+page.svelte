<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import SubmitSprintSuccessContent from "$lib/components/workspace/SubmitSprintSuccessContent.svelte";
  import { getPostAssessmentConfig } from "$lib/data/postassessmentConfigs";
  import type { PageData } from "./$types";

  // SvelteKit passes the load() return value as a single `data` prop.
  let { data }: { data: PageData } = $props();

  const stackName: string = data?.stackName ?? 'react-express-postgres-prisma';
  const scenarioLevels: { id: string; name: string; concepts: string[] }[] =
    data?.scenarioLevels ?? [];

  // Pick config for this stack, falling back to default. Slug normalization
  // (trailing scenario number + "postgresql"→"postgres") lives in getPostAssessmentConfig.
  const config = getPostAssessmentConfig(stackName);
  const questions = config.questions || [];

  const scaleOptions = [
    { value: 1, label: "Not Confident" },
    { value: 2, label: "Slightly Confident" },
    { value: 3, label: "Somewhat Confident" },
    { value: 4, label: "Confident" },
    { value: 5, label: "Very Confident" }
  ];

  // Topics come from the user's actual scenario (level title + task names as chips).
  // Falls back to the stack config, then to a generic hardcoded set.
  const topics = (scenarioLevels && scenarioLevels.length > 0)
    ? scenarioLevels
    : (config.topics || [
        { id: "level1", name: "Level 1: Environment Setup", concepts: ["Package managers (pnpm/npm)", "Environment variables & .env", "Prisma migrations", "Running multiple services locally", "Monorepo architecture"] },
        { id: "level2", name: "Level 2: Utility Functions", concepts: ["Creating reusable utility functions", "Pure functions with predictable outputs", "Centralizing business logic", "Reducing code duplication", "Importing utilities in frontend/backend"] },
        { id: "level3", name: "Level 3: Backend Debugging", concepts: ["Tracing Express controller logic", "Debugging Prisma queries", "Documenting bugs with test cases", "Identifying root causes vs symptoms", "Reading backend logs"] },
        { id: "level4", name: "Level 4: Reservation Queue", concepts: ["Queue-based reservation systems", "Handling concurrent requests", "Database transactions (Prisma $transaction)", "Fair resource allocation", "Queue position tracking"] },
        { id: "level5", name: "Level 5: Production Debugging", concepts: ["Debugging production issues", "Understanding table relationships", "Datetime & timezone issues", "Validating report accuracy", "Tracing data flow end-to-end"] }
      ]);

  let currentQuestion = $state(0);
  let selectedAnswer = $state<number | null>(null);
  let answers = $state<number[]>([]);
  let showResult = $state(false);
  let showReflection = $state(false);
  let showSuccess = $state(false);
  let aiGradingResult = $state<{ grades: Record<string, { score: number; feedback: string }>; overallScore: number; improvement: string } | null>(null);
  let contentWarning = $state(false);
  let warningMessage = $state("");
  let showWarningModal = $state(false);
  let processingResults = $state(false);
  let submittingReflection = $state(false);
  let reflectionByTopic = $state<Record<string, Set<string>>>({});
  let reflectionText = $state<Record<string, string>>({});

  $effect(() => {
    if (Object.keys(reflectionByTopic).length === 0) {
      const initial: Record<string, Set<string>> = {};
      for (const topic of topics) {
        initial[topic.id] = new Set();
      }
      reflectionByTopic = initial;
    }
  });
  
  let allTopicsAnswered = $derived(() => {
    return topics.every(topic => {
      const hasConcepts = (reflectionByTopic[topic.id]?.size || 0) > 0;
      const hasExplanation = reflectionText[topic.id] && reflectionText[topic.id].trim().length > 0;
      return hasConcepts && hasExplanation;
    });
  });
  
  function validateReflectionText(text: string): { valid: boolean; message: string } {
    const trimmed = text.trim().toLowerCase();
    if (trimmed.length < 10) {
      return { valid: false, message: "Response is too short. Please provide more detail." };
    }
    const invalidWords = ['sample', 'test', 'none', 'good', 'okay', 'ok', 'nice', 'great', 'bad', 'n/a', 'na', 'pending', 'tbd'];
    if (invalidWords.includes(trimmed)) {
      return { valid: false, message: "Please provide a specific reflection about what you learned, not a placeholder." };
    }
    const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 3) {
      return { valid: false, message: "Please provide more detail about your learning (at least 3 words)." };
    }
    return { valid: true, message: "" };
  }
  
  function hasInvalidReflections(): { valid: boolean; topic?: string; message?: string } {
    for (const topic of topics) {
      const text = reflectionText[topic.id] || '';
      const result = validateReflectionText(text);
      if (!result.valid) {
        return { valid: false, topic: topic.name, message: result.message };
      }
    }
    return { valid: true };
  }
  
  function toggleTopicConcept(topicId: string, concept: string) {
    const newReflection = { ...reflectionByTopic };
    if (!newReflection[topicId]) {
      newReflection[topicId] = new Set();
    }
    const topicSet = new Set(newReflection[topicId]);
    if (topicSet.has(concept)) {
      topicSet.delete(concept);
    } else {
      topicSet.add(concept);
    }
    newReflection[topicId] = topicSet;
    reflectionByTopic = newReflection;
  }
  
  function getTotalSelections(): number {
    let total = 0;
    for (const topic of topics) {
      total += reflectionByTopic[topic.id]?.size || 0;
    }
    return total;
  }

  let submitted = $state(false);
  let preScores = $state<Record<string, { pre: number | null; post: number | null; improvement: number | null }>>({});
  let loading = $state(true);

  onMount(async () => {
    try {
      const response = await fetch('/api/user/postassessment');
      const data = await response.json();
      preScores = data;
    } catch (e) {
      console.error('Failed to fetch pre-scores', e);
    }
    loading = false;
  });
  
  function selectAnswer(index: number) {
    if (!submitted) {
      selectedAnswer = index;
    }
  }
  
  function nextQuestion() {
    if (selectedAnswer !== null) {
      answers[currentQuestion] = selectedAnswer;
    }
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      selectedAnswer = answers[currentQuestion] !== undefined ? answers[currentQuestion] : null;
    }
  }
  
  function prevQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--;
      selectedAnswer = answers[currentQuestion] !== undefined ? answers[currentQuestion] : null;
    }
  }
  
  async function submitQuiz() {
    if (selectedAnswer !== null) {
      answers[currentQuestion] = selectedAnswer;
    }
    submitted = true;
    showReflection = true;
  }
  
  async function proceedToResults() {
    const validationResult = hasInvalidReflections();
    if (!validationResult.valid && validationResult.topic && validationResult.message) {
      showWarningModal = true;
      warningMessage = `${validationResult.topic}: ${validationResult.message}`;
      return;
    }
    
    const allAnswered = topics.every(topic => {
      const hasConcepts = (reflectionByTopic[topic.id]?.size || 0) > 0;
      const hasExplanation = reflectionText[topic.id] && reflectionText[topic.id].trim().length > 0;
      return hasConcepts && hasExplanation;
    });
    
    if (!allAnswered) {
      alert('Please provide an explanation for what you learned in each topic before continuing.');
      return;
    }
    
    showReflection = false;
    showResult = true;
    processingResults = true;
    
    // Average each question's confidence answer into its shared skill bucket
    // so pre/post improvement lines up on the same keys.
    const bucketTotals: Record<string, { sum: number; count: number }> = {};
    for (let i = 0; i < questions.length; i++) {
      const ans = answers[i];
      if (!ans) continue;
      const bucket = questions[i].bucket ?? `question_${questions[i].id}`;
      const acc = bucketTotals[bucket] ?? (bucketTotals[bucket] = { sum: 0, count: 0 });
      acc.sum += ans;
      acc.count += 1;
    }
    const topicScores: Record<string, number> = {};
    for (const [bucket, { sum, count }] of Object.entries(bucketTotals)) {
      topicScores[bucket] = Math.round(sum / count);
    }
    
    const allReflections: { topic: string; concepts: string[]; explanation: string }[] = [];
    for (const topic of topics) {
      const concepts = reflectionByTopic[topic.id];
      const explanation = reflectionText[topic.id] || '';
      if (concepts && concepts.size > 0) {
        allReflections.push({
          topic: topic.name,
          concepts: Array.from(concepts),
          explanation: explanation
        });
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      submittingReflection = true;
      const cacheBuster = '_t=' + Date.now();
      const response = await fetch('/api/user/postassessment?' + cacheBuster, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ 
          scores: topicScores, 
          reflections: allReflections,
          preScores: preScores
        })
      });
      const data = await response.json();
      if (data.aiGrading) {
        aiGradingResult = data.aiGrading;
      }
      if (data.contentWarning) {
        showWarningModal = true;
        warningMessage = "Your reflection responses do not appear to be related to the level concepts you learned.";
        return;
      }
    } catch (e) {
      console.error('Failed to save post-assessment', e);
    } finally {
      submittingReflection = false;
      processingResults = false;
    }
  }

  function goToLevelComplete() {
    window.location.href = '/dashboard';
  }
  
  function getAverageScore(): number {
    if (answers.length === 0) return 0;
    const total = answers.reduce((sum, val) => sum + val, 0);
    return total / questions.length;
  }

  function getImprovement(): string {
    const preScoresArray = Object.values(preScores).filter(v => v !== null && v.pre !== null) as { pre: number }[];
    if (preScoresArray.length === 0) return "N/A";
    const preAvg = preScoresArray.reduce((a, b) => a + b.pre, 0) / preScoresArray.length;
    const current = getAverageScore();
    const diff = current - preAvg;
    if (diff > 0) return `+${diff.toFixed(1)}`;
    if (diff < 0) return diff.toFixed(1);
    return "No change";
  }

  function getPreAverage(): number {
    const preScoresArray = Object.values(preScores).filter(v => v !== null && v.pre !== null) as { pre: number }[];
    if (preScoresArray.length === 0) return 0;
    return preScoresArray.reduce((a, b) => a + b.pre, 0) / preScoresArray.length;
  }

  function getSkillLevel(): string {
    const avg = getAverageScore();
    if (avg >= 4.5) return "Advanced";
    if (avg >= 3.5) return "Intermediate";
    if (avg >= 2.5) return "Beginner";
    return "Novice";
  }

  function getSkillDescription(): string {
    const avg = getAverageScore();
    if (avg >= 4.5) return "Excellent! You've mastered advanced full-stack development concepts.";
    if (avg >= 3.5) return "Great progress! You have strong intermediate skills.";
    if (avg >= 2.5) return "Good foundation! Keep practicing to strengthen your skills.";
    return "You've started your journey. Continue learning and practicing!";
  }
  
  function proceedToDashboard() {
    window.location.href = '/dashboard';
  }
</script>

<svelte:head>
  <title>Post-Assessment — DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg text-[var(--text-primary)] antialiased bg-grid-cyber scanlines ambient-glow overflow-x-hidden">
  <header class="fixed top-0 left-0 w-full z-50 border-b border-[var(--card-border)]" style="background: rgba(10,14,26,0.90); backdrop-filter: blur(18px);">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="font-heading text-xl font-bold tracking-widest" style="background: linear-gradient(90deg, #fff 0%, var(--accent) 50%, var(--cyan-bright) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        DEVSIM
      </a>
      <span class="font-label text-[0.65rem] tracking-widest text-[var(--text-muted)]">POST-ASSESSMENT</span>
    </div>
  </header>

  <main class="pt-28 pb-12 px-6">
    <div class="max-w-3xl mx-auto">
      {#if loading}
        <div class="card-cyber p-8 text-center">
          <p class="text-[var(--text-muted)]">Loading...</p>
        </div>
      {:else if showReflection}
        <div class="card-cyber p-8 relative">
          <div class="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-[var(--accent)] opacity-40"></div>
          <div class="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-[var(--accent)] opacity-40"></div>
          <div class="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-[var(--accent)] opacity-40"></div>
          <div class="absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 border-[var(--accent)] opacity-40"></div>

          <div class="relative z-10 text-center">
            <span class="tag-cyber tag-cyan inline-block mb-4">// REFLECTION</span>
            
            <h2 class="font-heading text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">
              Before seeing your results, let's reflect on what you learned
            </h2>
            
            <p class="text-[var(--text-muted)] mb-6 max-w-lg mx-auto leading-relaxed font-body">
              Answer this question for each topic area. Select <strong>at least 1 concept</strong> from each topic to continue.
            </p>

            <div class="mb-8 space-y-8">
              {#each topics as topic}
                <div class="p-4 rounded-lg bg-[var(--bg-light)] border border-[var(--card-border)]">
                  <h3 class="font-label text-[0.8rem] tracking-widest text-[var(--accent)] mb-4">
                    {topic.name}
                  </h3>
                  <p class="text-[var(--text-muted)] text-sm mb-3">
                    What did you learn about {topic.name.toLowerCase()}? (Select all that apply)
                  </p>
                  <div class="flex flex-wrap gap-2 mb-4">
                    {#each topic.concepts as concept}
                      <button
                        onclick={() => toggleTopicConcept(topic.id, concept)}
                        class="px-3 py-1.5 rounded-full border-2 transition-all duration-200 text-sm font-medium
                          {reflectionByTopic[topic.id]?.has(concept) 
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' 
                            : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'}"
                      >
                        {concept}
                      </button>
                    {/each}
                  </div>
                  <p class="text-xs mt-2 {reflectionByTopic[topic.id]?.size ? 'text-green-400' : 'text-red-400'}">
                    {reflectionByTopic[topic.id]?.size || 0} selected
                  </p>
                  
                  <div class="mt-4">
                    <label for="reflection-{topic.id}" class="text-sm text-[var(--text-muted)] block mb-2">
                      Explain what you learned in this topic (required):
                    </label>
                    <textarea
                      id="reflection-{topic.id}"
                      bind:value={reflectionText[topic.id]}
                      placeholder="Describe what you learned..."
                      class="w-full p-3 rounded-lg bg-[var(--bg)] border border-[var(--card-border)] text-[var(--text-primary)] text-sm resize-none"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              {/each}
            </div>

            <div class="mb-6 p-4 rounded-lg bg-[var(--bg-light)] border border-[var(--card-border)]">
              <p class="text-[var(--text-muted)] text-sm text-center">
                Total selections: <span class="text-[var(--accent)] font-bold">{getTotalSelections()}</span>
              </p>
            </div>

            <div class="flex justify-center">
              <button 
                onclick={proceedToResults}
                disabled={!allTopicsAnswered() || submittingReflection}
                class="btn-cyber btn-cyber-solid !px-10 {allTopicsAnswered() && !submittingReflection ? '' : 'opacity-50 cursor-not-allowed'}"
              >
                {submittingReflection ? 'GRADING...' : 'SEE MY RESULTS →'}
              </button>
            </div>
            
            {#if !allTopicsAnswered()}
              <p class="text-center text-red-400 text-sm mt-3">
                Please select at least one concept AND write an explanation for each topic to continue
              </p>
            {/if}
          </div>
        </div>

      {:else if !showResult && !showSuccess}
        <div class="card-cyber p-8 relative">
          <div class="mb-8">
            <div class="flex justify-between items-center mb-3">
              <span class="font-label text-[0.7rem] tracking-widest text-[var(--text-muted)]">
                QUESTION {currentQuestion + 1} OF {questions.length}
              </span>
              <span class="font-mono text-[var(--accent)] text-sm">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div class="h-1 bg-[var(--bg-light)] rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300"
                style="width: {((currentQuestion + 1) / questions.length) * 100}%; background: var(--accent);"
              ></div>
            </div>
          </div>

          <div class="mb-8">
            <h2 class="font-heading text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">
              {questions[currentQuestion]?.text ?? ''}
            </h2>
            <p class="text-[var(--text-muted)] text-sm mb-6">Rate your confidence from 1 (not confident) to 5 (very confident)</p>
            
            <div class="flex justify-between mt-3">
              {#each scaleOptions as option}
                <div class="text-center">
                  <div 
                    class="w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-200 cursor-pointer
                      {selectedAnswer === option.value 
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' 
                        : 'border-[var(--card-border)] text-[var(--text-muted)] hover:border-[var(--accent)]'}"
                    onclick={() => selectAnswer(option.value)}
                  >
                    {option.value}
                  </div>
                  <div class="text-xs mt-2 text-[var(--text-muted)] font-medium leading-tight">{option.label}</div>
                </div>
              {/each}
            </div>
          </div>

          <div class="flex justify-between items-center">
            <button 
              onclick={prevQuestion}
              disabled={currentQuestion === 0}
              class="btn-cyber !px-6 {currentQuestion === 0 ? 'opacity-40 cursor-not-allowed' : ''}"
            >
              ← PREV
            </button>
            
            {#if currentQuestion < questions.length - 1}
              <button 
                onclick={nextQuestion}
                disabled={selectedAnswer === null}
                class="btn-cyber btn-cyber-solid !px-8 {selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                NEXT →
              </button>
            {:else}
              <button 
                onclick={submitQuiz}
                disabled={selectedAnswer === null}
                class="btn-cyber btn-cyber-solid !px-8 {selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                SUBMIT QUIZ
              </button>
            {/if}
          </div>
        </div>

      {:else if showResult && !showSuccess}
        {#if processingResults || submittingReflection}
          <div class="card-cyber p-8 text-center relative">
            <div class="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-[var(--accent)] opacity-40"></div>
            <div class="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-[var(--accent)] opacity-40"></div>
            <div class="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-[var(--accent)] opacity-40"></div>
            <div class="absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 border-[var(--accent)] opacity-40"></div>
            
            <div class="relative z-10">
              <span class="tag-cyber tag-cyan inline-block mb-6">// PROCESSING</span>
              
              <div class="mb-8">
                <div class="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4 animate-pulse" style="border-color: var(--accent); background: var(--bg-light);">
                  <span class="font-heading text-4xl font-bold text-[var(--accent)]">...</span>
                </div>
              </div>
              
              <h2 class="font-heading text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4">
                Analyzing your reflections...
              </h2>
              
              <p class="text-[var(--text-muted)] mb-6 max-w-lg mx-auto leading-relaxed font-body">
                Please wait while we evaluate your learning progress.
              </p>
              
              <div class="flex justify-center">
                <div class="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        {:else}
          <div class="card-cyber p-8 text-center relative">
            <div class="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-[var(--accent)] opacity-40"></div>
            <div class="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-[var(--accent)] opacity-40"></div>
            <div class="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-[var(--accent)] opacity-40"></div>
            <div class="absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 border-[var(--accent)] opacity-40"></div>

            <div class="relative z-10">
              <span class="tag-cyber tag-cyan inline-block mb-6">// ASSESSMENT COMPLETE</span>
              
              <div class="mb-8">
                <div class="flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4 mx-auto" style="border-color: var(--accent); background: var(--bg-light);">
                  <span class="font-heading text-4xl font-bold text-[var(--accent)]">
                    {getAverageScore().toFixed(1)}/5
                  </span>
                </div>
              </div>

              {#if getPreAverage() > 0}
                <div class="mb-6 p-4 rounded-lg bg-[var(--bg-light)] border border-[var(--card-border)]">
                  <div class="flex items-center justify-center gap-4">
                    <span class="text-zinc-400">Pre: {getPreAverage().toFixed(1)}</span>
                    <span class="text-[var(--accent)]">→</span>
                    <span class="text-[var(--accent)] font-bold">Post: {getAverageScore().toFixed(1)}</span>
                    <span class="text-green-400 font-bold">({getImprovement()})</span>
                  </div>
                </div>
              {/if}
              {#if aiGradingResult && aiGradingResult.improvement}
                <div class="mb-6 p-4 rounded-lg bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/30">
                  <div class="flex items-center justify-center gap-2">
                    <span class="font-label text-[0.7rem] tracking-widest text-[var(--accent)] uppercase">AI Assessment</span>
                    <span class="text-[var(--text-primary)]">—</span>
                    {#if aiGradingResult.improvement === 'significant'}
                      <span class="text-green-400 font-bold">Significant Improvement</span>
                    {:else if aiGradingResult.improvement === 'moderate'}
                      <span class="text-yellow-400 font-bold">Moderate Improvement</span>
                    {:else}
                      <span class="text-zinc-400 font-bold">Minimal Improvement</span>
                    {/if}
                    {#if aiGradingResult.overallScore !== undefined}
                      <span class="text-[var(--text-muted)] text-sm">(Reflection Score: {Math.round(aiGradingResult.overallScore)}%)</span>
                    {/if}
                  </div>
                </div>
              {/if}

              <h2 class="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                {getSkillLevel()} Developer
              </h2>
              
              <p class="text-[var(--text-muted)] mb-10 max-w-lg mx-auto leading-relaxed font-body">
                {getSkillDescription()}
              </p>

              {#if getTotalSelections() > 0}
                <div class="mb-8 p-4 rounded-lg bg-[var(--bg-light)] border border-[var(--card-border)] text-left">
                  <h3 class="font-label text-[0.7rem] tracking-widest text-[var(--text-muted)] mb-3">
                    CONCEPTS YOU'VE MASTERED
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    {#each topics as topic}
                      {#each Array.from(reflectionByTopic[topic.id] || []) as concept}
                        <span class="px-3 py-1 rounded-full bg-green-900/30 border border-green-500/50 text-green-400 text-sm">
                          ✓ {concept}
                        </span>
                      {/each}
                    {/each}
                  </div>
                </div>
              {/if}

              {#if contentWarning && showResult}
                <div class="mb-8 p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-left">
                  <h3 class="font-label text-[0.7rem] tracking-widest text-red-500 mb-4">
                    ⚠️ CONTENT WARNING
                  </h3>
                  <p class="text-[var(--text-primary)] text-lg mb-4">
                    Your reflection responses do not appear to be related to the level concepts you learned.
                  </p>
                  <p class="text-[var(--text-muted)] text-sm mb-4">
                    Please provide specific details about what you learned in each level.
                  </p>
                  <div class="flex gap-3">
                    <button 
                      onclick={() => { contentWarning = false; showResult = false; showReflection = true; processingResults = false; submittingReflection = false; }} 
                      class="btn-cyber btn-cyber-solid !px-6"
                    >
                      GO BACK AND REVISE
                    </button>
                  </div>
                </div>
              {:else if aiGradingResult}
                <div class="mb-8 p-6 rounded-lg bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/30 text-left">
                  <h3 class="font-label text-[0.7rem] tracking-widest text-[var(--accent)] mb-4">
                    AI REFLECTION GRADING
                  </h3>
                  <div class="mb-4">
                    <p class="text-[var(--text-primary)] text-lg font-bold">
                      Overall Score: {aiGradingResult.overallScore}%
                    </p>
                    <p class="text-[var(--text-muted)] text-sm">
                      Improvement: {aiGradingResult.improvement}
                    </p>
                  </div>
                  {#if Object.keys(aiGradingResult.grades).length > 0}
                    <div class="space-y-3">
                      {#each Object.entries(aiGradingResult.grades) as [topic, grade]}
                        <div class="p-3 rounded bg-[var(--bg)] border border-[var(--card-border)]">
                          <div class="flex justify-between items-center mb-1">
                            <span class="text-[var(--text-primary)] text-sm font-medium">{topic}</span>
                            <span class="text-[var(--accent)] text-sm font-bold">{grade.score}%</span>
                          </div>
                          <p class="text-[var(--text-muted)] text-xs">{grade.feedback}</p>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}

              <div class="flex justify-center">
                <button onclick={() => { showSuccess = true; return false; }} class="btn-cyber btn-cyber-solid !px-10">
                  CONTINUE TO SUCCESS →
                </button>
              </div>
            </div>
          </div>
        {/if}

      {:else if showSuccess}
        <div class="card-cyber p-8 relative">
          <SubmitSprintSuccessContent
            advancingToNextLevel={false}
            aiScoring={{ stars: 1, score: 50, feedback: '', improvements: '', nextTime: '', loading: false, done: false }}
            submitRewards={{ xp: 200, coins: 50 }}
            keyTakeaways={[]}
            level={5}
            on:done={goToLevelComplete}
          />
        </div>
      {/if}
    </div>
  </main>
  
  {#if showWarningModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div class="card-cyber p-8 max-w-md w-full mx-4 text-center relative">
        <div class="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-red-500 opacity-40"></div>
        <div class="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-red-500 opacity-40"></div>
        <div class="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-red-500 opacity-40"></div>
        <div class="absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 border-red-500 opacity-40"></div>
        
        <div class="relative z-10">
          <div class="text-5xl mb-4">⚠️</div>
          <h3 class="font-heading text-xl text-red-500 mb-4">CONTENT WARNING</h3>
          <p class="text-[var(--text-primary)] text-lg mb-2">
            Your reflection responses do not appear to be related to the level concepts you learned.
          </p>
          <p class="text-[var(--text-muted)] text-sm mb-6">
            Please provide specific details about what you learned in each level.
          </p>
          <button 
            onclick={() => { showWarningModal = false; showResult = false; showReflection = true; processingResults = false; submittingReflection = false; }} 
            class="btn-cyber btn-cyber-solid !px-8"
          >
            GO BACK AND REVISE
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .bg-grid-cyber {
    background-image: 
      linear-gradient(rgba(7, 165, 201, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(7, 165, 201, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
  }

  .scanlines {
    position: relative;
  }

  .scanlines::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.1) 2px,
      rgba(0, 0, 0, 0.1) 4px
    );
    pointer-events: none;
  }

  .ambient-glow {
    position: relative;
  }

  .ambient-glow::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse 60% 50% at 50% 0%,
      rgba(7, 165, 201, 0.08) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
</style>
