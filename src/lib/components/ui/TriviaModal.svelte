<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, ChevronRight, CheckCircle, XCircle, Lightbulb } from 'lucide-svelte';
  import { getRandomTrivia, type TriviaQuestion } from '$lib/mocks/trivia';

  export let open: boolean = false;
  export let category: TriviaQuestion['category'] | 'random' = 'random';

  const dispatch = createEventDispatcher<{
    close: void;
    answered: { correct: boolean; question: TriviaQuestion };
  }>();

  let question: TriviaQuestion | null = null;
  let selectedAnswer: number | null = null;
  let hasAnswered: boolean = false;
  let isCorrect: boolean = false;

  $: if (open && !question) {
    loadNewQuestion();
  }

  $: if (!open) {
    resetState();
  }

  function loadNewQuestion() {
    const cat = category === 'random' ? undefined : category;
    question = getRandomTrivia(cat);
  }

  function resetState() {
    question = null;
    selectedAnswer = null;
    hasAnswered = false;
    isCorrect = false;
  }

  function handleSelectAnswer(index: number) {
    if (hasAnswered) return;
    selectedAnswer = index;
  }

  function handleSubmitAnswer() {
    if (selectedAnswer === null || !question) return;
    hasAnswered = true;
    isCorrect = selectedAnswer === question.correctAnswer;
    dispatch('answered', { correct: isCorrect, question });
  }

  function handleNextQuestion() {
    selectedAnswer = null;
    hasAnswered = false;
    isCorrect = false;
    loadNewQuestion();
  }

  function handleClose() {
    dispatch('close');
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') handleClose();
  }

  function getCategoryColor(cat: string): string {
    const colors: Record<string, string> = {
      javascript: '#f7df1e',
      react: '#61dafb',
      node: '#339933',
      database: '#00758f',
      docker: '#2496ed',
      general: '#07a5c9',
    };
    return colors[cat] || '#07a5c9';
  }
</script>

{#if open && question}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="trivia-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="trivia-title"
    tabindex="-1"
    on:keydown={handleKeydown}
  >
    <div class="trivia-card ds-scrollbar">
      <div class="trivia-card-glow" aria-hidden="true"></div>
      <div class="pointer-events-none absolute inset-0 bg-grid-cyber opacity-30" aria-hidden="true"></div>
      <div class="trivia-accent-line" aria-hidden="true"></div>

      <!-- Header -->
      <div class="trivia-header-row">
        <div class="flex items-center gap-3.5">
          <div class="trivia-icon-badge" style="--cat-color: {getCategoryColor(question.category)}">
            <Lightbulb class="w-5 h-5" />
          </div>
          <div>
            <h2 id="trivia-title" class="trivia-title">Random Awareness Check</h2>
            <p class="trivia-subtitle">Test your knowledge · {question.category}</p>
          </div>
        </div>
        <button class="trivia-close" on:click={handleClose} aria-label="Close">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="trivia-content">
        <p class="trivia-question">{question.question}</p>

        <div class="trivia-options">
          {#each question.options as option, idx}
            <button
              class="trivia-option"
              class:selected={selectedAnswer === idx}
              class:correct={hasAnswered && idx === question.correctAnswer}
              class:incorrect={hasAnswered && selectedAnswer === idx && idx !== question.correctAnswer}
              class:disabled={hasAnswered}
              on:click={() => handleSelectAnswer(idx)}
              disabled={hasAnswered}
            >
              <span class="option-letter">{String.fromCharCode(65 + idx)}</span>
              <span class="option-text">{option}</span>
              {#if hasAnswered && idx === question.correctAnswer}
                <CheckCircle class="w-4 h-4 flex-shrink-0" style="color: var(--success);" />
              {:else if hasAnswered && selectedAnswer === idx && idx !== question.correctAnswer}
                <XCircle class="w-4 h-4 flex-shrink-0" style="color: var(--danger);" />
              {/if}
            </button>
          {/each}
        </div>

        {#if hasAnswered}
          <div class="trivia-explanation" class:correct={isCorrect}>
            <div class="explanation-header">
              {#if isCorrect}
                <CheckCircle class="w-4 h-4" />
                <span>Correct!</span>
              {:else}
                <XCircle class="w-4 h-4" />
                <span>Not quite!</span>
              {/if}
            </div>
            <p class="explanation-text">{question.explanation}</p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="trivia-actions">
        {#if !hasAnswered}
          <button
            class="btn-cyber btn-cyber-solid trivia-submit"
            on:click={handleSubmitAnswer}
            disabled={selectedAnswer === null}
          >
            Submit Answer
            <ChevronRight class="w-4 h-4" />
          </button>
        {:else}
          <button class="btn-cyber trivia-skip" on:click={handleClose}>
            Close
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .trivia-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: trivia-fade-in 0.2s ease-out both;
  }

  .trivia-backdrop::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(0deg, var(--grid-line) 0, var(--grid-line) 1px, transparent 1px, transparent 40px),
      repeating-linear-gradient(90deg, var(--grid-line) 0, var(--grid-line) 1px, transparent 1px, transparent 40px);
    background-attachment: fixed;
    opacity: 0.35;
    pointer-events: none;
  }

  .trivia-card {
    position: relative;
    width: min(560px, 100%);
    max-height: min(92vh, 700px);
    overflow-y: auto;
    background: var(--bg-light, #12192a);
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.15));
    border-radius: 4px;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 50px var(--accent-glow, rgba(7, 165, 201, 0.25)),
      0 24px 60px rgba(0, 0, 0, 0.6);
    animation: trivia-slide-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .trivia-card-glow {
    position: absolute;
    inset: -1px;
    border-radius: 5px;
    background: linear-gradient(135deg, rgba(7, 165, 201, 0.30), transparent 55%, rgba(99, 102, 241, 0.18));
    z-index: -1;
    pointer-events: none;
    animation: trivia-glow-pulse 3s ease-in-out infinite alternate;
  }

  @keyframes trivia-glow-pulse {
    from { opacity: 0.35; }
    to   { opacity: 1; }
  }

  .trivia-accent-line {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    z-index: 10;
    pointer-events: none;
  }

  .ds-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(136, 146, 160, 0.3) rgba(10, 14, 26, 0.6);
  }

  .ds-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .ds-scrollbar::-webkit-scrollbar-track {
    background: rgba(10, 14, 26, 0.6);
    border-radius: 4px;
    margin: 4px 0;
  }

  .ds-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.3);
    border-radius: 4px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .ds-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(7, 165, 201, 0.6);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 10px rgba(7, 165, 201, 0.4);
  }

  .ds-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.45);
  }

  /* Header row */
  .trivia-header-row {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(7, 165, 201, 0.1);
    padding: 1.25rem 1.5rem;
    z-index: 5;
  }

  .trivia-icon-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid rgba(7, 165, 201, 0.25);
    background: rgba(7, 165, 201, 0.1);
    color: var(--cat-color, var(--accent));
    animation: icon-pulse 2.2s ease-in-out infinite;
  }

  @keyframes icon-pulse {
    0%, 100% { box-shadow: 0 0 0 rgba(7, 165, 201, 0); }
    50% { box-shadow: 0 0 16px var(--accent-glow); }
  }

  .trivia-title {
    margin: 0;
    font-family: var(--font-heading, 'Chakra Petch', sans-serif);
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-primary, #d0d7dd);
  }

  .trivia-subtitle {
    margin: 0.25rem 0 0;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.65rem;
    color: var(--text-muted, #8892a0);
  }

  .trivia-close {
    position: relative;
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: var(--text-muted, #8892a0);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  .trivia-close:hover {
    border-color: rgba(255, 56, 96, 0.25);
    background: rgba(255, 56, 96, 0.08);
    color: var(--danger, #ff3860);
  }

  /* Content */
  .trivia-content {
    position: relative;
    padding: 1.25rem 1.5rem;
    z-index: 5;
  }

  .trivia-question {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--text-primary, #d0d7dd);
    margin: 0 0 1.25rem;
  }

  .trivia-options {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .trivia-option {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(10, 14, 26, 0.72);
    border: 1px solid rgba(136, 146, 160, 0.12);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .trivia-option:hover:not(.disabled) {
    border-color: rgba(7, 165, 201, 0.24);
    background: rgba(7, 165, 201, 0.05);
    box-shadow: 0 0 18px rgba(7, 165, 201, 0.14);
  }

  .trivia-option.selected {
    border-color: rgba(7, 165, 201, 0.35);
    background: rgba(7, 165, 201, 0.08);
  }

  .trivia-option.correct {
    border-color: rgba(0, 229, 160, 0.25);
    background: rgba(0, 229, 160, 0.08);
  }

  .trivia-option.incorrect {
    border-color: rgba(255, 56, 96, 0.25);
    background: rgba(255, 56, 96, 0.08);
  }

  .trivia-option.disabled {
    cursor: default;
  }

  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid rgba(7, 165, 201, 0.35);
    background: rgba(7, 165, 201, 0.12);
    color: var(--accent, #07a5c9);
    font-family: var(--font-heading, 'Chakra Petch', sans-serif);
    font-size: 0.62rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .trivia-option.correct .option-letter {
    border-color: rgba(0, 229, 160, 0.35);
    background: rgba(0, 229, 160, 0.16);
    color: var(--success, #00e5a0);
  }

  .trivia-option.incorrect .option-letter {
    border-color: rgba(255, 56, 96, 0.35);
    background: rgba(255, 56, 96, 0.16);
    color: var(--danger, #ff3860);
  }

  .option-text {
    flex: 1;
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--text-primary, #d0d7dd);
    line-height: 1.4;
  }

  /* Explanation */
  .trivia-explanation {
    margin-top: 1.25rem;
    padding: 0.875rem 1rem;
    border-radius: 4px;
    background: rgba(255, 56, 96, 0.07);
    border: 1px solid rgba(255, 56, 96, 0.2);
  }

  .trivia-explanation.correct {
    background: rgba(0, 229, 160, 0.07);
    border-color: rgba(0, 229, 160, 0.2);
  }

  .explanation-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-heading, 'Chakra Petch', sans-serif);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--danger, #ff3860);
    margin-bottom: 0.5rem;
  }

  .trivia-explanation.correct .explanation-header {
    color: var(--success, #00e5a0);
  }

  .explanation-text {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.85rem;
    line-height: 1.6;
    color: rgba(208, 215, 221, 0.8);
    margin: 0;
  }

  /* Footer actions */
  .trivia-actions {
    position: relative;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    border-top: 1px solid rgba(7, 165, 201, 0.1);
    background: rgba(7, 165, 201, 0.02);
    padding: 1rem 1.5rem;
    z-index: 5;
  }

  .trivia-submit {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .trivia-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .trivia-skip {
    border: 1px solid rgba(136, 146, 160, 0.3);
    background: transparent;
    color: var(--text-muted, #8892a0);
  }

  .trivia-skip:hover {
    border-color: rgba(136, 146, 160, 0.5);
    background: rgba(136, 146, 160, 0.08);
    color: var(--text-primary, #d0d7dd);
  }

  /* Animations */
  @keyframes trivia-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes trivia-slide-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-height: 600px) {
    .trivia-header-row {
      padding: 1rem 1.25rem;
    }

    .trivia-content {
      padding: 1rem 1.25rem;
    }

    .trivia-options {
      gap: 0.4rem;
    }

    .trivia-option {
      padding: 0.5rem 0.75rem;
    }

    .trivia-actions {
      padding: 0.75rem 1.25rem;
    }
  }
</style>