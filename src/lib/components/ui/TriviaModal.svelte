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
      <button class="trivia-close" on:click={handleClose} aria-label="Close">
        <X class="w-5 h-5" />
      </button>

      <div class="trivia-header">
        <div class="trivia-icon" style="--cat-color: {getCategoryColor(question.category)}">
          <Lightbulb class="w-6 h-6" />
        </div>
        <h2 id="trivia-title" class="trivia-title">Quick Check!</h2>
        <p class="trivia-subtitle">Test your knowledge</p>
      </div>

      <div class="trivia-content">
        <div class="trivia-category" style="--cat-color: {getCategoryColor(question.category)}">
          {question.category}
        </div>

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
                <CheckCircle class="option-icon correct-icon" />
              {:else if hasAnswered && selectedAnswer === idx && idx !== question.correctAnswer}
                <XCircle class="option-icon incorrect-icon" />
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

      <div class="trivia-actions">
        {#if !hasAnswered}
          <button
            class="trivia-submit"
            on:click={handleSubmitAnswer}
            disabled={selectedAnswer === null}
          >
            Submit Answer
            <ChevronRight class="w-4 h-4" />
          </button>
        {:else}
          <button class="trivia-skip" on:click={handleClose}>
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
  }

  .trivia-card {
    position: relative;
    width: min(520px, 100%);
    max-height: min(92vh, 700px);
    overflow-y: auto;
    background: var(--bg-light, #12192a);
    border: 1px solid var(--card-border, rgba(7, 165, 201, 0.15));
    border-radius: 6px;
    padding: 1.75rem 2rem;
    box-shadow:
      0 0 0 1px rgba(7, 165, 201, 0.07),
      0 0 40px rgba(7, 165, 201, 0.12),
      0 24px 60px rgba(0, 0, 0, 0.55);
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
  }

  .ds-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(136, 146, 160, 0.3);
    border-radius: 4px;
  }

  .trivia-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: rgba(208, 215, 221, 0.5);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .trivia-close:hover {
    color: #d0d7dd;
  }

  .trivia-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .trivia-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--cat-color) 15%, transparent);
    color: var(--cat-color);
    margin-bottom: 0.75rem;
    animation: icon-pulse 2s ease-in-out infinite alternate;
  }

  @keyframes icon-pulse {
    from { box-shadow: 0 0 0 0 color-mix(in srgb, var(--cat-color) 40%, transparent); }
    to { box-shadow: 0 0 0 8px color-mix(in srgb, var(--cat-color) 0%, transparent); }
  }

  .trivia-title {
    margin: 0;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--text-primary, #d0d7dd);
  }

  .trivia-subtitle {
    margin: 0.25rem 0 0;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.78rem;
    color: rgba(7, 165, 201, 0.7);
  }

  .trivia-content {
    margin-bottom: 1.25rem;
  }

  .trivia-category {
    display: inline-block;
    font-family: var(--font-mono, 'Space Mono', monospace);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.25rem 0.6rem;
    border-radius: 3px;
    background: color-mix(in srgb, var(--cat-color) 12%, transparent);
    color: var(--cat-color);
    margin-bottom: 1rem;
  }

  .trivia-question {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 1.05rem;
    line-height: 1.5;
    color: var(--text-primary, #d0d7dd);
    margin: 0 0 1.25rem;
  }

  .trivia-options {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .trivia-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(7, 165, 201, 0.15);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .trivia-option:hover:not(.disabled) {
    border-color: rgba(7, 165, 201, 0.4);
    background: rgba(7, 165, 201, 0.08);
  }

  .trivia-option.selected {
    border-color: #07a5c9;
    background: rgba(7, 165, 201, 0.12);
  }

  .trivia-option.correct {
    border-color: #00e5a0;
    background: rgba(0, 229, 160, 0.1);
  }

  .trivia-option.incorrect {
    border-color: #ff3860;
    background: rgba(255, 56, 96, 0.1);
  }

  .trivia-option.disabled {
    cursor: default;
  }

  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: rgba(7, 165, 201, 0.15);
    color: #07a5c9;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .trivia-option.correct .option-letter {
    background: rgba(0, 229, 160, 0.2);
    color: #00e5a0;
  }

  .trivia-option.incorrect .option-letter {
    background: rgba(255, 56, 96, 0.2);
    color: #ff3860;
  }

  .option-text {
    flex: 1;
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.9rem;
    color: rgba(208, 215, 221, 0.9);
    line-height: 1.4;
  }

  .trivia-explanation {
    margin-top: 1.25rem;
    padding: 1rem;
    border-radius: 4px;
    background: rgba(255, 56, 96, 0.08);
    border: 1px solid rgba(255, 56, 96, 0.2);
  }

  .trivia-explanation.correct {
    background: rgba(0, 229, 160, 0.08);
    border-color: rgba(0, 229, 160, 0.2);
  }

  .explanation-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #ff3860;
    margin-bottom: 0.5rem;
  }

  .trivia-explanation.correct .explanation-header {
    color: #00e5a0;
  }

  .explanation-text {
    font-family: var(--font-body, 'Exo 2', sans-serif);
    font-size: 0.85rem;
    line-height: 1.5;
    color: rgba(208, 215, 221, 0.8);
    margin: 0;
  }

  .trivia-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .trivia-submit {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 1.25rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #07a5c9;
    background: rgba(7, 165, 201, 0.1);
    border: 1px solid rgba(7, 165, 201, 0.5);
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    cursor: pointer;
    transition: all 0.2s;
  }

  .trivia-submit:hover:not(:disabled) {
    border-color: rgba(7, 165, 201, 0.8);
    background: rgba(7, 165, 201, 0.18);
    box-shadow: 0 0 16px rgba(7, 165, 201, 0.25);
  }

  .trivia-submit:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .trivia-skip {
    padding: 0.65rem 1.25rem;
    font-family: var(--font-head, 'Chakra Petch', sans-serif);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(208, 215, 221, 0.6);
    background: transparent;
    border: 1px solid rgba(40, 55, 80, 0.9);
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    cursor: pointer;
    transition: all 0.2s;
  }

  .trivia-skip:hover {
    color: #d0d7dd;
    border-color: rgba(7, 165, 201, 0.25);
  }

  @media (max-height: 600px) {
    .trivia-card {
      padding: 1rem 1.25rem;
    }

    .trivia-options {
      gap: 0.4rem;
    }

    .trivia-option {
      padding: 0.5rem 0.75rem;
    }
  }
</style>