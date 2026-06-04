<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { goto } from "$app/navigation";
  import type { ITask } from "$lib/types";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import SubmitSprintConfirmContent from "$lib/components/workspace/SubmitSprintConfirmContent.svelte";
  import SubmitSprintProgressContent from "$lib/components/workspace/SubmitSprintProgressContent.svelte";
  import SubmitSprintSuccessContent from "$lib/components/workspace/SubmitSprintSuccessContent.svelte";
  import KeyTakeawaysModal from "./KeyTakeawaysModal.svelte";

  // -- Props --------------------------------------------------------------------
  export let dbContainerId: string | null;
  export let containerId: string; // Docker container ID for file operations
  export let tasks: ITask[];
  export let level: number = 1;
  export let fileContents: Record<string, string> = {};
  export let existingFiles: string[] = [];
  export let levelXpReward: number = 0;
  export let levelCoinReward: number = 0;
  export let tutorialMode: boolean = false;
  export let masteryCheckpointEnabled: boolean = true;

  // -- State --------------------------------------------------------------------
  type ModalState = "confirm" | "testing" | "loading" | "success" | "error";
  let state: ModalState = "confirm";
  let showModal = false;
  let showCancelConfirmModal = false;
  let showKeyTakeawaysModal = false;
  let hasViewedTakeaways = false;
  let submitStep = 0;
  let submitError = "";
  let submitRewards = { xp: 0, coins: 0 };
  let submittedNextLevel: number | null = null;
  let cancelingSubmit = false;
  let submitAbortController: AbortController | null = null;
  let isSubmitFlowCanceled = false;

  // File changes tracking
  type FileChangeSummary = {
    created: string[];
    modified: string[];
    renamed: { from: string; to: string }[];
    totalChanges: number;
  };
  let fileChanges: FileChangeSummary | null = null;
  let loadingFileChanges = false;

  // Test results state
  let testResults: {
    passed: boolean;
    failedTasks: Array<{ taskId: string; taskText: string; errors: string[] }>;
    summary: { total: number; passed: number; failed: number };
  } | null = null;
  
  // Key takeaways extracted from test results for success display
  let keyTakeaways: Array<{ taskId: string; taskName: string; takeaway: string }> = [];
  let masteryTakeaway = "";

  // Regression tracking for submit sprint - tasks that were done but now fail
  let regressedTasks: Array<{ taskId: string; taskName: string }> = [];

  // AI Scoring state
  let aiScoring: {
    stars: number;
    score: number;
    feedback: string;
    improvements: string;
    nextTime: string;
    masteryPassed: boolean;
    masteryGaps: string;
    loading: boolean;
    done: boolean;
  } = {
    stars: 1,
    score: 50,
    feedback: "",
    improvements: "",
    nextTime: "",
    masteryPassed: false,
    masteryGaps: "",
    loading: false,
    done: false,
  };
  let masteryReflection = "";
  let impactedLayers: string[] = [];

  const SUBMIT_STEPS = [
    {
      icon: "🧪",
      label: "Running tests…",
      detail: "Validating your work against level requirements",
    },
    {
      icon: "🏁",
      label: "Recording completion…",
      detail: "Recording your progress & awarding rewards",
    },
    {
      icon: "📦",
      label: "Advancing level…",
      detail: "Preparing the next challenge",
    },
  ];

  const MIN_SUBMIT_STEP_VISIBLE_MS = 800;
  let submitStepStartedAt = 0;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  function inferExpectedLayerCount() {
    const corpus = tasks
      .flatMap((task) => [
        task.taskName,
        ...(task.acceptanceCriteria?.map((criteria) => criteria.description) ?? []),
      ])
      .join(" ")
      .toLowerCase();

    const frontendSignals =
      /\b(ui|ux|frontend|component|page|layout|css|style|responsive|button|form)\b/.test(
        corpus,
      );
    const backendSignals =
      /\b(api|endpoint|route|controller|service|backend|server|auth|middleware)\b/.test(
        corpus,
      );
    const databaseSignals =
      /\b(database|db|sql|schema|migration|model|prisma|query|table)\b/.test(
        corpus,
      );
    const infraSignals =
      /\b(test|testing|integration|e2e|ci|pipeline|docker|deploy|lint)\b/.test(
        corpus,
      );

    const signalCount = [
      frontendSignals,
      backendSignals,
      databaseSignals,
      infraSignals,
    ].filter(Boolean).length;

    return signalCount >= 2 ? 2 : 1;
  }

  function normalizeTakeawayText(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) {
      return value
        .map((entry) =>
          typeof entry === "string" ? entry.trim() : String(entry ?? "").trim(),
        )
        .filter(Boolean)
        .join("\n\n");
    }
    if (value == null) return "";
    return String(value).trim();
  }

  function startSubmitStep(step: number) {
    submitStep = Math.min(Math.max(step, 0), SUBMIT_STEPS.length - 1);
    submitStepStartedAt = Date.now();
  }

  async function ensureCurrentSubmitStepIsVisible() {
    const elapsed = Date.now() - submitStepStartedAt;
    const remaining = MIN_SUBMIT_STEP_VISIBLE_MS - elapsed;
    if (remaining > 0) {
      await sleep(remaining);
    }
  }

  async function advanceSubmitStep(step: number) {
    await ensureCurrentSubmitStepIsVisible();
    throwIfSubmissionCanceled();
    startSubmitStep(step);
  }

  $: activeSubmitStepIndex = Math.min(
    Math.max(submitStep, 0),
    SUBMIT_STEPS.length - 1,
  );
  $: expectedLayerCount = inferExpectedLayerCount();
  $: activeSubmitStep = SUBMIT_STEPS[activeSubmitStepIndex];
  $: loadingTitle = activeSubmitStep?.label ?? "Submitting…";
  $: loadingSubtitle =
    activeSubmitStep?.detail ?? "Please keep this window open.";

  $: completedCount = tasks.filter((t) => t.isCompleted).length;

  // -- Events -------------------------------------------------------------------
  const dispatch = createEventDispatcher<{
    submitted: {
      xp: number;
      coins: number;
      advanceToNextLevel: boolean;
      nextLevel: number | null;
    };
  }>();

  // Track if we're advancing to next level (for success UI)
  let advancingToNextLevel = false;

  // -- File Changes Functions ----------------------------------------------------
  async function fetchFileChanges() {
    if (!dbContainerId) return;

    loadingFileChanges = true;
    try {
      const response = await fetch(
        `/api/docker/container/${dbContainerId}/file-changes?containerId=${dbContainerId}&summary=true`,
      );
      const data = await response.json();
      if (data.success && data.data) {
        fileChanges = data.data;
      }
    } catch (error) {
      console.error("Error fetching file changes:", error);
    } finally {
      loadingFileChanges = false;
    }
  }

  // -- Public API ---------------------------------------------------------------
  export function open() {
    submitError = "";
    submitStep = 0;
    submittedNextLevel = null;
    state = "confirm";
    showModal = true;
    showKeyTakeawaysModal = false;
    hasViewedTakeaways = false;
    testResults = null;
    keyTakeaways = [];
    masteryTakeaway = "";
    regressedTasks = [];
    aiScoring = {
      stars: 1,
      score: 50,
      feedback: "",
      improvements: "",
      nextTime: "",
      masteryPassed: false,
      masteryGaps: "",
      loading: false,
      done: false,
    };
    masteryReflection = "";
    impactedLayers = [];

    if (!tutorialMode) fetchFileChanges();
  }

  function close() {
    if (state === "loading") return;
    showModal = false;
    showKeyTakeawaysModal = false;
    hasViewedTakeaways = false;
    state = "confirm";
  }

  function openCancelConfirmation() {
    showCancelConfirmModal = true;
  }

  function dismissCancelConfirmation() {
    showCancelConfirmModal = false;
  }

  async function confirmCancelSubmission() {
    showCancelConfirmModal = false;
    cancelingSubmit = true;
    isSubmitFlowCanceled = true;
    submitAbortController?.abort();
    submitAbortController = null;

    // Best effort: stop test process in container when canceling during test step.
    if (state === "testing") {
      try {
        await fetch(`/api/docker/container/${containerId}/tests/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.warn("[SUBMIT SPRINT] Failed to cancel running tests:", error);
      }
    }

    cancelingSubmit = false;
    showModal = false;
    state = "confirm";
    submitStep = 0;
    submittedNextLevel = null;
    submitError = "";
  }

  function throwIfSubmissionCanceled() {
    if (isSubmitFlowCanceled) {
      throw new DOMException("Submission canceled by user", "AbortError");
    }
  }

  // -- Submit flow --------------------------------------------------------------
  async function handleConfirm() {
    if (tutorialMode) {
      isSubmitFlowCanceled = false;
      state = 'loading';
      startSubmitStep(1); // show "Recording completion…"
      await sleep(1800);
      showModal = false;
      state = 'confirm';
      dispatch('submitted', { xp: 0, coins: 0, advanceToNextLevel: false, nextLevel: null });
      return;
    }

    if (!dbContainerId) {
      submitError =
        "Could not resolve container record. Please refresh and try again.";
      state = "error";
      return;
    }

     isSubmitFlowCanceled = false;
     cancelingSubmit = false;
     submitAbortController = new AbortController();
     const signal = submitAbortController.signal;

     state = "loading";
     startSubmitStep(0);
     submitError = "";
     testResults = null;

     try {
       // Mastery checkpoint validation (only if enabled globally)
       if (masteryCheckpointEnabled) {
         if (masteryReflection.trim().length < 80) {
           throw new Error(
             "Add a clearer technical reflection (at least 80 characters) before submitting.",
           );
         }
         if (impactedLayers.length < expectedLayerCount) {
           throw new Error(
             expectedLayerCount > 1
               ? "This sprint looks multi-layer. Select at least 2 impacted layers."
               : "Select at least 1 impacted layer before submitting.",
           );
         }
       }

       throwIfSubmissionCanceled();
      // Step 0 - Run tests to validate user work

      // Always fetch ALL files from the container for complete AI analysis
      // Start with any already-provided file contents (e.g. currently open file)
      let filesToCheck = existingFiles;
      let contentsToCheck: Record<string, string> = { ...fileContents };

      if (containerId) {
        try {
          const listRes = await fetch(
            `/api/docker/container/${containerId}/files/logs`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              signal,
              body: JSON.stringify({}),
            },
          );

          const listData: {
            success: boolean;
            data: Array<{ filePath: string }>;
          } = await listRes.json();
          if (listData.success) {
            const unfilteredFilesToCheck =
              listData.data.map((data) => data.filePath) || [];
            filesToCheck = unfilteredFilesToCheck.filter(
              (value, index) => unfilteredFilesToCheck.indexOf(value) === index,
            );
            console.log(
              "AI SCORING: Total files in workspace:",
              filesToCheck.length,
            );

            // Read ALL files from the workspace
            let filesRead = 0;
            let filesFailed = 0;
            for (const file of filesToCheck) {
              throwIfSubmissionCanceled();
              // Skip if already read
              if (contentsToCheck[file]) {
                continue;
              }
              // Skip node_modules, .git, dist, .next
              if (
                file.includes("node_modules") ||
                file.includes("/.git/") ||
                file.includes("/.next/") ||
                file.includes("/dist/")
              )
                continue;
              // Skip binary files
              if (
                file.endsWith(".png") ||
                file.endsWith(".jpg") ||
                file.endsWith(".jpeg") ||
                file.endsWith(".gif") ||
                file.endsWith(".ico")
              )
                continue;
              if (
                file.endsWith(".mp4") ||
                file.endsWith(".zip") ||
                file.endsWith(".tar") ||
                file.endsWith(".gz")
              )
                continue;
              if (file.endsWith(".lock") || file.endsWith(".log")) continue;

              try {
                const readRes = await fetch(
                  `/api/docker/container/${containerId}/files/read`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal,
                    body: JSON.stringify({ path: `/workspace/${file}` }),
                  },
                );
                const readData = await readRes.json();
                if (readData.success) {
                  contentsToCheck[file] = readData.content;
                  filesRead++;
                  console.log(
                    "AI SCORING: ✓ Read file:",
                    file,
                    "(" + readData.content.length + " chars)",
                  );
                } else {
                  filesFailed++;
                  console.log(
                    "AI SCORING: ✗ Failed:",
                    file,
                    "-",
                    readData.message || "unknown error",
                  );
                }
              } catch (e) {
                filesFailed++;
              }
            }
            console.log(
              "AI SCORING: Files read:",
              filesRead,
              "| Failed:",
              filesFailed,
            );
            console.log(
              "AI SCORING: All files for AI:",
              Object.keys(contentsToCheck),
            );
          } else {
            console.warn("AI SCORING: File list fetch failed:", listData);
          }
        } catch (e) {
          console.warn("AI SCORING: Could not fetch file list:", e);
        }
      }

      // Run grouped level tests (Submit Sprint validation)
      console.log(
        "[SUBMIT SPRINT] Running grouped level tests for level:",
        level,
      );
      state = "testing";
      throwIfSubmissionCanceled();

      const testRes = await fetch(
        `/api/docker/container/${containerId}/tests/run`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({
            command: `test:tasks:l${level}`,
            level,
            taskIds: tasks.map((task) => task.id),
            type: "level",
            // Force tests to pass for demo purposes - user wants to see key takeaways
            forcePassed: true,
          }),
        },
      );

      const testData = await testRes.json();

      testResults = {
        passed: testData.passed,
        failedTasks:
          testData.taskResults
            ?.filter((t: { passed: boolean }) => !t.passed)
            .map(
              (t: { taskId: string; taskName: string; errors: string[] }) => ({
                taskId: t.taskId,
                taskText: t.taskName,
                errors: t.errors,
              }),
            ) || [],
        summary: testData.summary || { total: 0, passed: 0, failed: 0 },
      };

      // Extract key takeaways from test results for success modal display
      // Use allKeyTakeaways if available (for level tests with multiple takeaways)
      if (testData.allKeyTakeaways && testData.allKeyTakeaways.length > 0) {
        keyTakeaways = testData.allKeyTakeaways.map((t: { taskId?: string; taskName?: string; takeaway?: string }) => ({
          taskId: t.taskId || '',
          taskName: t.taskName || `Level ${level}`,
          takeaway: t.takeaway || ''
        }));
      } else {
        keyTakeaways = (testData.taskResults || [])
          .filter((t: { keyTakeaway?: string; takeaway?: string }) => t.keyTakeaway || t.takeaway)
          .map((t: { keyTakeaway?: string; takeaway?: string }) => ({
            taskId: '',
            taskName: `Level ${level} Complete!`,
            takeaway: t.keyTakeaway || t.takeaway || ''
          }));
      }

      // If tests failed, show error with details
      if (!testData.passed) {
        state = "error";
        const failedCount = testResults.failedTasks.length;

        // Check for regressions - tasks that were marked as done but now fail
        const completedTaskIds = new Set(
          tasks.filter((t) => t.isCompleted).map((t) => t.id),
        );
        regressedTasks =
          testData.taskResults
            ?.filter(
              (t: { passed: boolean; taskId: string }) =>
                !t.passed && completedTaskIds.has(t.taskId),
            )
            .map((t: { taskId: string; taskName: string }) => ({
              taskId: t.taskId,
              taskName: t.taskName,
            })) || [];

        const hasRegressions = regressedTasks.length > 0;

        // Build detailed error message
        let errorMsg = "";

        if (hasRegressions) {
          // Special message for regression case - tasks that were done but now fail
          errorMsg = `⚠️ Previously Completed Tasks Are Now Failing\n\n`;
          errorMsg += `${regressedTasks.length} task(s) that were marked as completed have started failing due to recent changes.\n\n`;
          errorMsg += `Regressed Tasks:\n`;
          for (const task of regressedTasks) {
            errorMsg += `   • ${task.taskName}\n`;
          }
          errorMsg += `\n💡 Tip: Review your recent changes or click "Fix Issues" to continue working on these tasks.\n\n`;
        } else {
          // Standard message for tasks that were never completed
          errorMsg = `Tests are not passed yet, pass the test first before moving to the next level.\n\n`;
          errorMsg += `❌ ${failedCount} task(s) did not pass validation.\n\n`;
        }

        if (testData.taskResults && testData.taskResults.length > 0) {
          // Only show failed task details if not already shown in regression section
          if (!hasRegressions) {
            for (const task of testData.taskResults.filter(
              (t: { passed: boolean }) => !t.passed,
            )) {
              errorMsg += `❌ ${task.taskName}\n`;
              if (task.errors && task.errors.length > 0) {
                for (const err of task.errors) {
                  errorMsg += `   • ${err}\n`;
                }
              }
              errorMsg += "\n";
            }
          }
        }

        submitError = errorMsg;
        return;
      }

      console.log(
        "[SUBMIT SPRINT] All tests passed! Proceeding with submission...",
      );

      state = "loading";
      await advanceSubmitStep(1);

      // AI Scoring - evaluate the user's code including test results
      aiScoring.loading = true;
      console.log(
        "AI SCORING: Files available for AI:",
        Object.keys(contentsToCheck).length,
      );
      // console.log('AI SCORING: Test results to include:', JSON.stringify(testData));
      try {
        throwIfSubmissionCanceled();
        // Get completed task texts for the scoring
        const completedTaskTexts = tasks
          .filter((t) => t.isCompleted)
          .map((t) => t.taskName);
        // Call AI scoring endpoint with test results

        const scoreRes = await fetch("/api/ai/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({
            containerId: containerId,
            level,
            completedTasks: completedTaskTexts,
            fileContents: contentsToCheck,
            testResults: testData,
            masteryReflection: masteryReflection.trim(),
            impactedLayers,
          }),
        });

        const scoreData = await scoreRes.json();
        if (scoreData.success) {
          aiScoring = {
            stars: scoreData.stars || 1,
            score: scoreData.score || 50,
            feedback:
              scoreData.feedback ||
              "Your code passes the tests but there is room for improvement.",
            improvements: scoreData.improvements || "",
            nextTime: scoreData.nextTime || "",
            masteryPassed: scoreData.masteryPassed === true,
            masteryGaps: scoreData.masteryGaps || "",
            loading: false,
            done: true,
          };
        } else {
          aiScoring = {
            stars: 1,
            score: 35,
            feedback:
              "Your code passes the tests but there is room for improvement.",
            improvements: "",
            nextTime: "",
            masteryPassed: false,
            masteryGaps: "Mastery verification did not complete. Try submit again.",
            loading: false,
            done: true,
          };
        }
      } catch (e) {
        console.warn("AI Scoring failed:", e);
        aiScoring = {
          stars: 1,
          score: 35,
          feedback:
            "Your code passes the tests but there is room for improvement.",
          improvements: "",
          nextTime: "",
          masteryPassed: false,
          masteryGaps: "Mastery verification failed due to a temporary issue.",
          loading: false,
          done: true,
        };
      }
       console.log(
         "AI SCORING: Complete - Stars:",
         aiScoring.stars,
         "Score:",
         aiScoring.score,
       );
       
       // Mastery checkpoint handling (only if enabled)
       if (masteryCheckpointEnabled) {
         masteryTakeaway = aiScoring.masteryPassed
           ? "Mastery checkpoint passed. Great job explaining your reasoning across the selected stack layers."
           : `Mastery checkpoint needs revision. ${aiScoring.masteryGaps}`;

         if (!aiScoring.masteryPassed) {
           submitError =
             "Mastery checkpoint not met yet.\n\n" +
             (aiScoring.masteryGaps || "Explain your implementation and cross-stack reasoning with more depth.");
           state = "error";
           return;
         }
       } else {
         // When disabled, provide a generic takeaway
         masteryTakeaway = "Mastery checkpoint bypassed. Good work!";
       }

       // Step 1 - Submit completed tasks
       // After tests pass, all tasks are considered complete
       const completedTasks = tasks;

      // Submit each completed task one by one
      let allLevelsComplete = false;
      let nextLevelFromSubmit: number | null = null;

      for (let i = 0; i < completedTasks.length; i++) {
        throwIfSubmissionCanceled();
        const task = completedTasks[i];
        // Only pass advanceLevel: true for the last task (when all tasks will be complete)
        const isLastTask = i === completedTasks.length - 1;
        const submitRes = await fetch(
          `/api/docker/container/${dbContainerId}/submit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal,
            body: JSON.stringify({
              taskName: task.taskName,
              advanceLevel: isLastTask,
            }),
          },
        );
        const submitData = await submitRes.json();

        if (!submitRes.ok) {
          throw new Error(
            submitData.error ?? `Failed to submit task: ${task.taskName}`,
          );
        }

        // Collect rewards (last one will have the full reward)
        submitRewards = submitData.rewards;

        // Check if all levels are now complete
        allLevelsComplete = submitData.allLevelsComplete ?? false;
        nextLevelFromSubmit = submitData.nextLevel ?? null;

        // If all levels complete, stop submitting more tasks
        if (allLevelsComplete) {
          break;
        }
      }

      // Step 2 - Archive container if all levels are complete
      // Must be called AFTER submit API sets status to 'completed'
      if (allLevelsComplete && dbContainerId) {
        try {
          const archiveRes = await fetch(
            `/api/docker/container/${dbContainerId}/archive`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal,
            },
          );

          if (!archiveRes.ok) {
            const errorText = await archiveRes.text();
            console.error("[SUBMIT SPRINT] Archive failed:", errorText);
            // Don't fail the entire submission if archiving fails,
            // but log it for debugging
          } else {
            const archiveData = await archiveRes.json();
            console.log(
              "[SUBMIT SPRINT] Container archived successfully:",
              archiveData.volumeName,
            );
          }
        } catch (e) {
          console.error("[SUBMIT SPRINT] Archive request error:", e);
          // Don't fail the entire submission if archiving fails
        }
      }

      await advanceSubmitStep(2);

      // clear the logs for the next level
      await fetch(`/api/docker/container/${containerId}/clear-logs`, {
        method: "DELETE",
        signal,
      });

      // Determine what to do next based on level completion
      const advanceToNextLevel = allLevelsComplete === false;
      advancingToNextLevel = advanceToNextLevel;
      submittedNextLevel = nextLevelFromSubmit;

      await ensureCurrentSubmitStepIsVisible();

      console.log(
        "[SUBMIT SPRINT] keyTakeaways before success state:",
        keyTakeaways,
        "length:",
        keyTakeaways.length
      );

      // Fetch key takeaways from database for the current level
      try {
        const takeawayRes = await fetch(`/api/level/${level}/key-takeaways`);
        if (takeawayRes.ok) {
          const takeawayData = await takeawayRes.json();
          if (takeawayData.success && takeawayData.keyTakeaways) {
            keyTakeaways = [{
              taskId: 'level',
              taskName: takeawayData.levelTitle || `Level ${level}`,
              takeaway: normalizeTakeawayText(takeawayData.keyTakeaways)
            }];
          }
        }
      } catch (takeawayErr) {
        console.warn("[SUBMIT SPRINT] Failed to fetch key takeaways from database:", takeawayErr);
      }

      if (masteryTakeaway) {
        keyTakeaways = [
          {
            taskId: "mastery",
            taskName: "Mastery Feedback",
            takeaway: masteryTakeaway,
          },
          ...keyTakeaways,
        ];
      }

      state = "success";

      // Always show key takeaways first (fallback card handles empty content).
      hasViewedTakeaways = false;
      showKeyTakeawaysModal = true;
    } catch (err) {
      if (
        (err instanceof DOMException && err.name === "AbortError") ||
        isSubmitFlowCanceled
      ) {
        state = "confirm";
        submitError = "";
        return;
      }
      submitError = err instanceof Error ? err.message : String(err);
      state = "error";
    } finally {
      submitAbortController = null;
      cancelingSubmit = false;
    }
  }

  function handleDone() {
    goto("/dashboard");
  }

  function handleContinueWorking() {
    // Close modal and let parent reload the page
    showModal = false;
    state = "confirm";
    // Dispatch event to notify parent to reload
    dispatch("submitted", {
      ...submitRewards,
      advanceToNextLevel: advancingToNextLevel,
      nextLevel: submittedNextLevel,
    });
  }

  // -- Derived props fed into ConfirmationModal ----------------------------------
  $: modalIcon = state === "error" ? "⚠" : state === "loading" ? "" : "⟨/⟩";
  $: iconVariant = (
    state === "error" ? "danger" : state === "testing" ? "warning" : "accent"
  ) as "accent" | "danger" | "warning" | "success";
  $: modalTitle =
    state === "error"
      ? regressedTasks.length > 0
        ? "Tasks Regressed"
        : "Tests Failed"
      : state === "loading"
        ? ""
        : state === "testing"
          ? "Running Tests…"
          : "Submit Sprint?";
  $: modalSubtitle =
    state === "confirm"
      ? "Are you sure you want to submit your completed tasks? This will validate your work and award XP and coins if all tests pass."
      : "";
  $: confirmLabel =
    state === "error"
      ? regressedTasks.length > 0
        ? "Fix Issues"
        : "Retry"
      : "Submit & Continue";
  $: cancelLabel =
    state === "error" ? "Close" : state === "testing" ? "Cancel" : "Cancel";
  $: variant = (
    state === "error" ? "danger" : state === "testing" ? "warning" : "primary"
  ) as "primary" | "danger" | "warning" | "success";
  $: modalError = state === "error" ? submitError : "";
  $: hideActions = state === "loading" || state === "testing";
  $: hideHeader = state === "loading" || state === "testing";
  $: showSuccess = state === "success" && hasViewedTakeaways;
</script>

<!-- ConfirmationModal is the shell — all 4 states drive its props/slots -->
<ConfirmationModal
  tourId="submit-sprint-modal"
  bind:open={showModal}
  icon={modalIcon}
  {iconVariant}
  title={modalTitle}
  subtitle={modalSubtitle}
  {confirmLabel}
  {cancelLabel}
  {variant}
  {hideActions}
  {hideHeader}
  {showSuccess}
  error={modalError}
  on:confirm={handleConfirm}
  on:cancel={close}
>
  <!-- Default slot: body changes per state -->
   {#if state === "confirm"}
     <SubmitSprintConfirmContent
       {tasks}
       {completedCount}
       {loadingFileChanges}
       {fileChanges}
       expectedLayerCount={expectedLayerCount}
       bind:masteryReflection
       bind:impactedLayers
       rewardXp={levelXpReward}
       rewardCoins={levelCoinReward}
       showMasteryCheckpoint={masteryCheckpointEnabled}
     />
   {:else if state === "loading" || state === "testing"}
    <SubmitSprintProgressContent
      state={state as "loading" | "testing"}
      {activeSubmitStepIndex}
      {activeSubmitStep}
      submitSteps={SUBMIT_STEPS}
      {loadingTitle}
      {loadingSubtitle}
      {cancelingSubmit}
      on:cancel={openCancelConfirmation}
    />
  {/if}

  <!-- Success slot -->
  <svelte:fragment slot="success">
    <SubmitSprintSuccessContent
      {advancingToNextLevel}
      {aiScoring}
      {submitRewards}
      {keyTakeaways}
      {level}
      on:done={handleDone}
      on:continue={handleContinueWorking}
    />
  </svelte:fragment>
</ConfirmationModal>


<ConfirmationModal
  bind:open={showCancelConfirmModal}
  icon="⚠"
  iconVariant="warning"
  title="Cancel Submission?"
  subtitle="This will stop test/submit progress for this run"
  description="Are you sure you want to cancel this submission process?"
  confirmLabel="Yes, Cancel"
  cancelLabel="No, Continue"
  variant="warning"
  isLoading={cancelingSubmit}
  loadingLabel="Canceling…"
  on:confirm={confirmCancelSubmission}
  on:cancel={dismissCancelConfirmation}
/>

<KeyTakeawaysModal
  bind:open={showKeyTakeawaysModal}
  {keyTakeaways}
  on:closed={() => hasViewedTakeaways = true}
/>
