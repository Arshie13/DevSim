<script lang="ts">
  import { onMount } from "svelte";
  import { assessmentTopics, assessmentScaleOptions, toTopicKey } from "$lib/data/assessmentTopics";

  // The confidence quiz is a single standardized set that mirrors the
  // pre-assessment 1:1 — every user answers the same questions regardless of
  // stack, and each maps to the same topic key the pretest uses, so pre/post
  // scores compare directly.
  const questions = assessmentTopics.map((t, i) => ({
    id: i + 1,
    topicKey: toTopicKey(t.label),
    text: t.postQuestion,
  }));

  const scaleOptions = assessmentScaleOptions;

  let currentQuestion = $state(0);
  let selectedAnswer = $state<number | null>(null);
  let answers = $state<number[]>([]);
  let showResult = $state(false);
  let processingResults = $state(false);

  let submitted = $state(false);
  let preScores = $state<Record<string, { pre: number | null; post: number | null; improvement: number | null }>>({});
  let loading = $state(true);

  onMount(async () => {
    try {
      const response = await fetch('/api/user/postassessment');
      preScores = await response.json();
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

  // Submitting the multiple-choice quiz goes straight to the results screen —
  // there is no reflection step. Each question maps 1:1 to a shared topic key
  // (identical to the pre-assessment), so post scores land on the same keys and
  // improvement is computed per topic.
  async function submitQuiz() {
    if (selectedAnswer !== null) {
      answers[currentQuestion] = selectedAnswer;
    }
    submitted = true;
    showResult = true;
    processingResults = true;

    const topicScores: Record<string, number> = {};
    for (let i = 0; i < questions.length; i++) {
      const ans = answers[i];
      if (ans == null) continue;
      topicScores[questions[i].topicKey] = ans;
    }

    try {
      const cacheBuster = '_t=' + Date.now();
      await fetch('/api/user/postassessment?' + cacheBuster, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          scores: topicScores,
          preScores: preScores
        })
      });
    } catch (e) {
      console.error('Failed to save post-assessment', e);
    } finally {
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
      {:else if !showResult}
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
            <p class="text-[var(--text-muted)] text-sm mb-6">Select your experience level</p>

            <div class="flex justify-between mt-3">
              {#each scaleOptions as option}
                <div class="text-center">
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
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

      {:else if showResult}
        {#if processingResults}
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
                Calculating your results...
              </h2>

              <p class="text-[var(--text-muted)] mb-6 max-w-lg mx-auto leading-relaxed font-body">
                Please wait while we tally your assessment.
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
                {@const delta = getAverageScore() - getPreAverage()}
                <div class="mb-6 p-5 rounded-lg bg-[var(--bg-light)] border border-[var(--card-border)]">
                  <h3 class="font-label text-[0.7rem] tracking-widest text-[var(--text-muted)] mb-4">
                    YOUR IMPROVEMENT
                  </h3>
                  <div class="flex items-center justify-center gap-6">
                    <div class="text-center">
                      <div class="text-2xl font-bold text-zinc-400">{getPreAverage().toFixed(1)}</div>
                      <div class="text-[0.65rem] tracking-widest text-[var(--text-muted)] mt-1">PRE</div>
                    </div>
                    <span class="text-2xl text-[var(--accent)]">→</span>
                    <div class="text-center">
                      <div class="text-2xl font-bold text-[var(--accent)]">{getAverageScore().toFixed(1)}</div>
                      <div class="text-[0.65rem] tracking-widest text-[var(--text-muted)] mt-1">POST</div>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold {delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-zinc-400'}">
                        {getImprovement()}
                      </div>
                      <div class="text-[0.65rem] tracking-widest text-[var(--text-muted)] mt-1">CHANGE</div>
                    </div>
                  </div>
                  <p class="text-[var(--text-muted)] text-sm text-center mt-4">
                    {#if delta > 0}
                      You improved by {delta.toFixed(1)} points since your pre-assessment.
                    {:else if delta < 0}
                      Your confidence dipped by {Math.abs(delta).toFixed(1)} points — keep practicing.
                    {:else}
                      Your score held steady since your pre-assessment.
                    {/if}
                  </p>
                </div>
              {:else}
                <div class="mb-6 p-4 rounded-lg bg-[var(--bg-light)] border border-[var(--card-border)]">
                  <p class="text-[var(--text-muted)] text-sm text-center">
                    No previous assessment score on record to compare against.
                  </p>
                </div>
              {/if}

              <h2 class="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
                {getSkillLevel()} Developer
              </h2>

              <p class="text-[var(--text-muted)] mb-10 max-w-lg mx-auto leading-relaxed font-body">
                {getSkillDescription()}
              </p>

              <div class="flex justify-center">
                <button onclick={goToLevelComplete} class="btn-cyber btn-cyber-solid !px-10">
                  BACK TO DASHBOARD →
                </button>
              </div>
            </div>
          </div>
        {/if}

      {/if}
    </div>
  </main>
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
