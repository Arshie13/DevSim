<script lang="ts">
  import { goto } from "$app/navigation";
  
  // Pre-test self-assessment questions about web development stack integration knowledge
  const questions = [
    { id: 1, question: "How familiar are you with HTML and CSS for creating web page layouts?" },
    { id: 2, question: "What's your experience level with JavaScript for web interactivity?" },
    { id: 3, question: "How comfortable are you with backend development using Node.js/Express?" },
    { id: 4, question: "What's your familiarity with databases and data management?" },
    { id: 5, question: "How much do you know about integrating frontend and backend systems?" },
    { id: 6, question: "How familiar are you with building and consuming APIs?" },
    { id: 7, question: "How comfortable are you with terminal/command line operations?" },
    { id: 8, question: "What's your understanding of web security and best practices?" }
  ];

  const scaleOptions = [
    { value: 1, label: "No Experience" },
    { value: 2, label: "Beginner" },
    { value: 3, label: "Some Experience" },
    { value: 4, label: "Intermediate" },
    { value: 5, label: "Advanced" }
  ];
  
  let currentQuestion = $state(0);
  let selectedAnswer = $state<number | null>(null);
  let answers = $state<number[]>([]);
  let showResult = $state(false);
  let showLearningScreen = $state(false);
  let submitted = $state(false);
  
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
  
  function submitQuiz() {
    if (selectedAnswer !== null) {
      answers[currentQuestion] = selectedAnswer;
    }
    submitted = true;
    const avgScore = getAverageScore();
    if (avgScore >= 3) {
      showResult = true;
    } else {
      showLearningScreen = true;
    }
  }
  
  function getAverageScore(): number {
    if (answers.length === 0) return 0;
    const total = answers.reduce((sum, val) => sum + val, 0);
    return total / questions.length;
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
    if (avg >= 4.5) return "You have strong web development skills! You're ready for advanced full-stack challenges.";
    if (avg >= 3.5) return "You have a good foundation. Some areas may need brushing up.";
    if (avg >= 2.5) return "You have basic understanding. We recommend starting with foundational modules.";
    return "New to web development? No worries! We'll guide you from the basics.";
  }
  
  async function proceedToDashboard() {
    const avgScore = getAverageScore();
    const skillLevel = getSkillLevel();
    
    // Build scores object from answers
    const scores: Record<string, number> = {};
    const topicLabels = [
      "HTML/CSS Layout",
      "JavaScript Interactivity", 
      "Node.js/Express",
      "Database Management",
      "Frontend-Backend Integration",
      "API Development",
      "Command Line Operations",
      "Web Security"
    ];
    
    answers.forEach((score, index) => {
      if (topicLabels[index]) {
        scores[topicLabels[index]] = score;
      }
    });
    
    try {
      // Save pretest scores to database
      const response = await fetch('/api/user/pretest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores,
          skillLevel,
          averageScore: avgScore
        })
      });
      
      if (!response.ok) {
        console.error('Failed to save pretest scores');
      }
    } catch (error) {
      console.error('Error saving pretest scores:', error);
    }
    
    const result = {
      score: avgScore,
      skillLevel,
      completed: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pretest_result', JSON.stringify(result));
    console.log('Pretest result:', result);
    goto('/dashboard');
  }
  
  function retakeQuiz() {
    currentQuestion = 0;
    selectedAnswer = null;
    answers = [];
    showResult = false;
    showLearningScreen = false;
    submitted = false;
  }
</script>

<svelte:head>
  <title>Pre-Test — DevSim</title>
</svelte:head>

<div class="min-h-screen bg-obsidian-bg text-[var(--text-primary)] antialiased bg-grid-cyber scanlines ambient-glow overflow-x-hidden">
  <header class="fixed top-0 left-0 w-full z-50 border-b border-[var(--card-border)]" style="background: rgba(10,14,26,0.90); backdrop-filter: blur(18px);">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="/" class="font-heading text-xl font-bold tracking-widest" style="background: linear-gradient(90deg, #fff 0%, var(--accent) 50%, var(--cyan-bright) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        DEVSIM
      </a>
      <span class="font-label text-[0.65rem] tracking-widest text-[var(--text-muted)]">SKILL ASSESSMENT</span>
    </div>
  </header>

  <main class="pt-28 pb-12 px-6">
    <div class="max-w-3xl mx-auto">
      {#if !showResult && !showLearningScreen}
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
              {questions[currentQuestion].question}
            </h2>
            <p class="text-[var(--text-muted)] text-sm mb-6">Drag to rate your experience from 1 (no experience) to 5 (advanced)</p>
            
            <div class="relative">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                bind:value={selectedAnswer}
                oninput={() => { if (selectedAnswer !== null) selectAnswer(selectedAnswer); }}
                class="w-full h-3 bg-[var(--bg-light)] rounded-lg appearance-none cursor-pointer"
                style="accent-color: var(--accent);"
              />
              <div class="flex justify-between mt-3">
                {#each scaleOptions as option}
                  <div class="text-center">
                    <div class="w-14 h-14 rounded-full border-2 flex items-center justify-center font-mono text-lg font-bold transition-all duration-200
                      {selectedAnswer === option.value 
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]' 
                        : 'border-[var(--card-border)] text-[var(--text-muted)]'}"
                      onclick={() => selectAnswer(option.value)}
                      style="cursor: pointer;"
                    >
                      {option.value}
                    </div>
                    <div class="text-xs mt-2 text-[var(--text-muted)] font-medium leading-tight">{option.label}</div>
                  </div>
                {/each}
              </div>
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
            
            {#if currentQuestion === questions.length - 1}
              <button 
                onclick={submitQuiz}
                disabled={selectedAnswer === null}
                class="btn-cyber btn-cyber-solid !px-8 {selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                SUBMIT QUIZ
              </button>
            {:else}
              <button 
                onclick={nextQuestion}
                disabled={selectedAnswer === null}
                class="btn-cyber btn-cyber-solid !px-8 {selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                NEXT →
              </button>
            {/if}
          </div>
        </div>

      {:else if showLearningScreen}
        <div class="card-cyber p-8 text-center relative">
          <div class="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-[var(--accent)] opacity-40"></div>
          <div class="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-[var(--accent)] opacity-40"></div>
          <div class="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-[var(--accent)] opacity-40"></div>
          <div class="absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 border-[var(--accent)] opacity-40"></div>

          <div class="relative z-10">
            <span class="tag-cyber tag-cyan inline-block mb-6">// IMPROVE YOUR SKILLS</span>

            <div class="mb-8">
              <div class="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4" style="border-color: var(--accent); background: var(--bg-light);">
                <span class="font-heading text-4xl font-bold text-[var(--accent)]">
                  {getAverageScore().toFixed(1)}/5
                </span>
              </div>
            </div>

            <h2 class="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
              Brush Up Your Skills
            </h2>

            <p class="text-[var(--text-muted)] mb-10 max-w-lg mx-auto leading-relaxed font-body">
              Your score indicates you need to strengthen your web development fundamentals. Here are resources to help you improve:
            </p>

            <div class="text-left mb-10">
              <h3 class="font-label text-[0.7rem] tracking-widest text-[var(--text-muted)] mb-4">VIDEO TUTORIALS</h3>
              <div class="space-y-4">
                <a href="https://www.youtube.com/watch?v=zJSY8tbf_ys" target="_blank" rel="noopener noreferrer"
                   class="block p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-light)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all duration-200">
                  <div class="flex items-start gap-3">
                    <span class="text-[var(--accent)] text-xl">▶</span>
                    <div>
                      <h4 class="font-mono text-sm font-semibold text-[var(--text-primary)]">Full Stack Web Development</h4>
                      <p class="text-[var(--text-muted)] text-sm">Complete guide to modern web development stacks</p>
                    </div>
                  </div>
                </a>
                <a href="https://www.youtube.com/watch?v=7H_QH9nipNs" target="_blank" rel="noopener noreferrer"
                   class="block p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-light)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all duration-200">
                  <div class="flex items-start gap-3">
                    <span class="text-[var(--accent)] text-xl">▶</span>
                    <div>
                      <h4 class="font-mono text-sm font-semibold text-[var(--text-primary)]">MERN Stack Tutorial</h4>
                      <p class="text-[var(--text-muted)] text-sm">MongoDB, Express, React, Node.js integration</p>
                    </div>
                  </div>
                </a>
                <a href="https://www.youtube.com/watch?v=2jqok-WgelI" target="_blank" rel="noopener noreferrer"
                   class="block p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-light)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all duration-200">
                  <div class="flex items-start gap-3">
                    <span class="text-[var(--accent)] text-xl">▶</span>
                    <div>
                      <h4 class="font-mono text-sm font-semibold text-[var(--text-primary)]">PERN Stack Development</h4>
                      <p class="text-[var(--text-muted)] text-sm">PostgreSQL, Express, React, Node.js stack guide</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div class="text-left mb-10">
              <h3 class="font-label text-[0.7rem] tracking-widest text-[var(--text-muted)] mb-4">DOCUMENTATION & REFERENCE</h3>
              <div class="space-y-4">
                <a href="https://developer.mozilla.org/" target="_blank" rel="noopener noreferrer"
                   class="block p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-light)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all duration-200">
                  <div class="flex items-start gap-3">
                    <span class="text-[var(--accent)] text-xl">📖</span>
                    <div>
                      <h4 class="font-mono text-sm font-semibold text-[var(--text-primary)]">MDN Web Docs</h4>
                      <p class="text-[var(--text-muted)] text-sm">Comprehensive documentation for HTML, CSS, JavaScript</p>
                    </div>
                  </div>
                </a>
                <a href="https://nodejs.org/docs/" target="_blank" rel="noopener noreferrer"
                   class="block p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-light)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all duration-200">
                  <div class="flex items-start gap-3">
                    <span class="text-[var(--accent)] text-xl">📖</span>
                    <div>
                      <h4 class="font-mono text-sm font-semibold text-[var(--text-primary)]">Node.js Docs</h4>
                      <p class="text-[var(--text-muted)] text-sm">Official documentation for Node.js runtime</p>
                    </div>
                  </div>
                </a>
                <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer"
                   class="block p-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg-light)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all duration-200">
                  <div class="flex items-start gap-3">
                    <span class="text-[var(--accent)] text-xl">📖</span>
                    <div>
                      <h4 class="font-mono text-sm font-semibold text-[var(--text-primary)]">Express.js Docs</h4>
                      <p class="text-[var(--text-muted)] text-sm">Official guide for Express web framework</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div class="flex flex-col gap-4 mt-8">
              <button onclick={retakeQuiz} class="btn-cyber w-full py-3">
                RETRY QUIZ NOW
              </button>
              <button onclick={proceedToDashboard} class="bg-[var(--accent)] text-[var(--bg)] py-3 px-8 rounded-lg font-bold w-full hover:opacity-90">
                CONTINUE TO DASHBOARD
              </button>
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
              <div class="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4" style="border-color: var(--accent); background: var(--bg-light);">
                <span class="font-heading text-4xl font-bold text-[var(--accent)]">
                  {getAverageScore().toFixed(1)}/5
                </span>
              </div>
            </div>

            <h2 class="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
              {getSkillLevel()} Developer
            </h2>
            
            <p class="text-[var(--text-muted)] mb-10 max-w-lg mx-auto leading-relaxed font-body">
              {getSkillDescription()}
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button onclick={retakeQuiz} class="btn-cyber !px-8">
                RETAKE QUIZ
              </button>
              <button onclick={proceedToDashboard} class="btn-cyber btn-cyber-solid !px-10">
                ENTER DASHBOARD →
              </button>
            </div>
          </div>
        </div>
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