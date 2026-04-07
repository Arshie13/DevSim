<script lang="ts">
  import { onDestroy } from 'svelte';
  import BubbleCloud from '$lib/components/ui/BubbleCloud.svelte';
  import { parseStackName } from '$lib/utils/stacks';
  import type { IContainerStack } from '$lib/types/IContainer';

  export let open: boolean = false;
  export let accentColor: string = '#07a5c9';
  export let stackName: string = 'your project';
  export let onClose: () => void = () => {};

  let step: 0 | 1 = 0;

  $: if (open) {
    step = 0;
  }

  let typedMessage = '';
  let typingIndex = 0;
  let typingInterval: ReturnType<typeof setInterval> | null = null;
  const typedContentCache = new Set<string>();

  function normalizeStackLabel(raw: string): string {
    if (!raw?.trim()) return 'Unknown Stack';

    const stackTokens = raw
      .split(/\+|,|\//g)
      .map((token) => token.trim().toLowerCase().replace(/\s+/g, ''))
      .filter(Boolean);

    const stackEntries = stackTokens.map((token) => ({ stackName: token }) as IContainerStack);
    return parseStackName(stackEntries);
  }

  function clearTyping() {
    if (!typingInterval) return;
    clearInterval(typingInterval);
    typingInterval = null;
  }

  function startTyping(text: string, cacheKey: string) {
    clearTyping();
    typedMessage = '';
    typingIndex = 0;

    typingInterval = setInterval(() => {
      if (typingIndex >= text.length) {
        typedContentCache.add(cacheKey);
        clearTyping();
        return;
      }
      typedMessage = text.slice(0, typingIndex + 1);
      typingIndex += 1;
    }, 18);
  }

  $: parsedStackName = normalizeStackLabel(stackName);
  $: coachTitle = step === 0 ? `Welcome to ${parsedStackName}` : 'Read README Files First';
  $: coachEyebrow = step === 0 ? 'Greetings, Developer!' : 'GETTING STARTED TIP';
  $: coachMessage =
    step === 0
      ? 'Hey dev, I am Saz. I am here if you need help while you build this workspace. Stay focused on mission flow and we will ship this level cleanly.'
      : 'Before coding, review README files and docs so you understand setup, project constraints, and folder responsibilities.';
  $: tipTypedBlock = `${coachMessage}\n• Read README docs to avoid missing setup steps.\n• Familiarize yourself with project structure first.`;
  $: coachImage = step === 0 ? '/images/saz-wave.png' : '/images/saz-full.png';
  $: coachImageAlt = step === 0 ? 'Saz waving hello' : 'Saz sharing onboarding advice';

  $: {
    if (!open) {
      clearTyping();
      typedMessage = '';
      typedContentCache.clear();
    } else {
      const targetText = step === 1 ? tipTypedBlock : coachMessage;
      const cacheKey = `${step}:${targetText}`;

      if (typedContentCache.has(cacheKey)) {
        clearTyping();
        typedMessage = targetText;
      } else {
        startTyping(targetText, cacheKey);
      }
    }
  }

  onDestroy(() => {
    clearTyping();
  });

  function closeCoach() {
    onClose();
  }

  function nextStep() {
    if (step === 0) {
      step = 1;
      return;
    }
    closeCoach();
  }

  function backStep() {
    if (step === 1) {
      step = 0;
    }
  }
</script>

{#if open}
  <section class="saz-coach" aria-label="Saz onboarding coach">
    <div class="coach-shell">
      <BubbleCloud
        className="coach-bubble"
        accentColor={accentColor}
        accentRgb="7,165,201"
        width={540}
        viewBox="0 0 520 370"
        contentX={92}
        contentY={70}
        contentWidth={312}
        contentHeight={214}
      >
        <p class="coach-eyebrow">{coachEyebrow}</p>
        <h2 class="coach-title">{coachTitle}</h2>
        <p class="coach-copy" class:coach-copy-tip={step === 1}>
          {typedMessage}
          {#if typingInterval}
            <span class="typing-cursor">|</span>
          {/if}
        </p>

        <div class="coach-actions">
          <button type="button" on:click={backStep} disabled={step === 0}>← Back</button>
          <button type="button" class="cta" on:click={nextStep}>
            {step === 0 ? 'Next Tip →' : 'Start Building →'}
          </button>
        </div>
      </BubbleCloud>

      <div class="saz-avatar-wrap">
        <img src={coachImage} alt={coachImageAlt} class="saz-avatar" />
      </div>
    </div>
  </section>
{/if}

<style>
  .saz-coach {
    position: fixed;
    inset: 0;
    z-index: 10045;
    pointer-events: auto;
    display: grid;
    place-items: center;
    background: rgba(3, 8, 18, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .coach-shell {
    position: relative;
    pointer-events: auto;
    width: 540px;
    max-width: 96vw;
    min-height: 430px;
    transform: translateY(-8px);
  }

  :global(.coach-bubble) {
    position: relative;
    z-index: 1;
    transform: translate(-120px, -100px);
    filter: drop-shadow(0 0 26px rgba(7, 165, 201, 0.2));
  }

  .coach-eyebrow {
    margin: 0 0 0.3rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.9rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #07a5c9;
    text-align: center;
  }

  .coach-title {
    margin: 0 0 0.45rem;
    color: #e4f8ff;
    font-size: 0.88rem;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    text-align: center;
  }

  .coach-copy {
    margin: 0.5rem 0 0 0;
    color: #d0d7dd;
    font-size: 0.75rem;
    line-height: 1.46;
    text-align: center;
  }

  .coach-copy.coach-copy-tip {
    white-space: pre-line;
    text-align: left;
  }

  .typing-cursor {
    animation: cursor-blink 0.8s step-end infinite;
    color: #8ae6ff;
    font-weight: 700;
    margin-left: 1px;
  }

  @keyframes cursor-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  .coach-actions {
    margin-top: auto;
    padding-top: 0.45rem;
    border-top: 1px solid rgba(7, 165, 201, 0.24);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
    align-items: center;
  }

  .coach-actions button {
    border: 1px solid rgba(136, 146, 160, 0.34);
    border-radius: 2px;
    padding: 0.36rem 0.52rem;
    background: rgba(255, 255, 255, 0.02);
    color: #9fb0bf;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.16s ease;
    white-space: nowrap;
  }

  .coach-actions button:hover:not(:disabled) {
    border-color: rgba(7, 165, 201, 0.45);
    color: #d2f4ff;
    background: rgba(7, 165, 201, 0.1);
  }

  .coach-actions button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .coach-actions .cta {
    border-color: rgba(7, 165, 201, 0.6);
    color: #8ae6ff;
    background: rgba(7, 165, 201, 0.12);
  }

  .saz-avatar-wrap {
    position: absolute;
    right: -50px;
    top: 250px;
    z-index: 2;
    background: transparent;
    border: 0;
    box-shadow: none;
    display: block;
  }

  .saz-avatar {
    width: 250px;
    height: auto;
    object-fit: contain;
    display: block;
  }

</style>
