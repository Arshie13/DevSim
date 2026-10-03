import { LevelDataAccess } from '../data-access/LevelDataAccess';
import { ContainerService } from './ContainerService';
import { extractChatContent } from './parseChatCompletion';
import type { TestValidationResult } from '$lib/tests/types';

// Source code file extensions to analyze
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.cs', '.rb', '.php', '.prisma'];

interface TestResults {
  passed: boolean;
  results?: TestValidationResult;
  failedTasks?: Array<{ taskId: number; taskText: string; errors: string[] }>;
  /** Shape sent by SubmitSprintModal (raw /tests/run response). */
  summary?: { total: number; passed: number; failed: number };
  taskResults?: Array<{ taskId?: string; taskName?: string; passed: boolean; errors?: string[] }>;
}

interface ScoringRequest {
  containerId: string;
  level: number;
  completedTasks: string[];
  fileContents?: Record<string, string>;
  filePaths?: string[];
  /** Paths the user created or modified (from file_changes). Given priority when reading + prompting. */
  changedFiles?: string[];
  testResults?: TestResults;
  masteryReflection: string;
  impactedLayers: string[];
}

interface ScoringResult {
  success: boolean;
  stars?: number;
  score?: number;
  feedback?: string;
  improvements?: string;
  nextTime?: string;
  masteryPassed?: boolean;
  masteryGaps?: string;
  level?: number;
  levelTitle?: string;
  error?: string;
}

export class ScoringService {
  constructor(
    private readonly levelData = new LevelDataAccess(),
    private readonly containerService = new ContainerService()
  ) {}

  async processScore(request: ScoringRequest): Promise<ScoringResult> {
    const apiKey = process.env.OMNIROUTE_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: 'OMNIROUTE_KEY is not configured. Please add it to your .env file.'
      };
    }

    const {
      containerId,
      level,
      completedTasks = [],
      fileContents,
      filePaths,
      changedFiles = [],
      testResults,
      masteryReflection,
      impactedLayers = []
    } = request;

    if (!containerId || !level) {
      return { 
        success: false, 
        error: 'Missing required fields: containerId, level' 
      };
    }

    try {
      // Get level info
      const levelInfo = await this.levelData.getLevelInfo(level);
      if (!levelInfo) {
        return { success: false, error: 'Level not found' };
      }

      // Normalize inputs
      const normalizedReflection = typeof masteryReflection === 'string' ? masteryReflection.trim() : '';
      const normalizedImpactedLayers = Array.isArray(impactedLayers)
        ? impactedLayers.filter((layer): layer is string => typeof layer === 'string')
        : [];

      // Normalize the set of files the user actually created/modified so we can
      // guarantee they are read and surfaced to the model.
      const normalizedChangedFiles = Array.isArray(changedFiles)
        ? Array.from(
            new Set(
              changedFiles
                .filter((f): f is string => typeof f === 'string')
                .map((f) => this.toWorkspaceRelative(f))
                .filter(Boolean)
            )
          )
        : [];

      // Fetch and collect file contents (changed files first)
      const userFileContents = await this.collectFileContents(
        containerId,
        fileContents,
        filePaths,
        normalizedChangedFiles
      );

      // Build scoring prompt
      const prompt = this.buildScoringPrompt(
        levelInfo.title,
        level,
        levelInfo.tasks,
        userFileContents,
        completedTasks,
        normalizedReflection,
        normalizedImpactedLayers,
        testResults,
        normalizedChangedFiles
      );

      // Call AI for scoring
      const aiResponse = await this.callOmniRouteAPI(apiKey, prompt);

      // Parse the response
      const { stars, score, feedback, improvements, nextTime, masteryPassed, masteryGaps } = 
        this.parseScoringResponse(aiResponse);

      // Calculate final mastery verdict
      const reflectionStrongEnough = normalizedReflection.length >= 40;
      const expectedLayerCount = this.inferExpectedLayerCountFromTasks(levelInfo.tasks);
      const layerEvidence = normalizedImpactedLayers.length >= expectedLayerCount;
      const qualityFloor = stars >= 1 || (score ?? 0) >= 33;
      const aiMasterySignal = masteryPassed || qualityFloor;
      const finalMasteryPassed = aiMasterySignal && reflectionStrongEnough && layerEvidence;
      const fallbackMasteryGaps = !reflectionStrongEnough
        ? 'Your reflection is too short. Explain the fix, why it works, and what you validated.'
        : !layerEvidence
          ? expectedLayerCount >= 2
            ? 'This level appears multi-layer. Connect at least two impacted layers in your explanation.'
            : 'Select at least one impacted layer and explain what changed in it.'
          : !aiMasterySignal
            ? 'Your reasoning is still unclear. Tighten your explanation and retry.'
            : masteryGaps;

      return {
        success: true,
        stars,
        score,
        feedback,
        improvements,
        nextTime,
        masteryPassed: finalMasteryPassed,
        masteryGaps: finalMasteryPassed ? 'none' : fallbackMasteryGaps,
        level,
        levelTitle: levelInfo.title
      };
    } catch (error) {
      console.error('AI Scoring error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        stars: 1,
        score: 33,
        feedback: 'No worries — every expert was once a beginner. Keep practicing and you\'ll get there! Focus on error handling, code organization, and best practices.',
        masteryPassed: false,
        masteryGaps: 'Mastery check failed due to an AI service error. Please retry submit.',
        error: errorMessage
      };
    }
  }

  /** Strip a leading `/workspace/` so paths from the DB and container keys align. */
  private toWorkspaceRelative(inputPath: string): string {
    return inputPath
      .replace(/\\/g, '/')
      .replace(/^\/workspace\/?/, '')
      .replace(/^\.\//, '')
      .trim();
  }

  /** Build an absolute in-container path that works regardless of the exec cwd. */
  private toContainerAbsolute(inputPath: string): string {
    const relative = this.toWorkspaceRelative(inputPath);
    return `/workspace/${relative}`;
  }

  private async collectFileContents(
    containerId: string,
    fileContents?: Record<string, string>,
    filePaths?: string[],
    changedFiles: string[] = []
  ): Promise<Record<string, string>> {
    const userFileContents: Record<string, string> = {};

    // Use provided file contents if available
    if (fileContents && typeof fileContents === 'object' && Object.keys(fileContents).length > 0) {
      for (const [key, value] of Object.entries(fileContents)) {
        userFileContents[this.toWorkspaceRelative(key)] = value;
      }
    }

    const changedSet = new Set(changedFiles);

    // Always fetch from the container so we have complete, current context.
    if (containerId) {
      try {
          const { files } = await this.containerService.listFiles(containerId);

          if (files) {
            const normalizedFiles = files.map((file) => this.toWorkspaceRelative(file));

            // 1. The files the user actually edited/created — read these first and
            //    regardless of extension so real work is never missed.
            const changedToFetch = changedFiles.filter((file) => !userFileContents[file]);

            // 2. Remaining implementation sources for surrounding context.
            const otherToFetch = this.filterSourceFiles(normalizedFiles).filter(
              (file) => !userFileContents[file] && !changedSet.has(file)
            );

            const filesToFetch = Array.from(new Set([...changedToFetch, ...otherToFetch]));

            if (filesToFetch.length > 0) {
              const fetchedContents = await this.fetchFileContents(containerId, filesToFetch);
              Object.assign(userFileContents, fetchedContents);
            }
          }
        } catch (e) {
          console.warn('[ScoringService] Could not fetch file list:', e);
        }
    }

    // Fallback to fetching specific paths if container fetch failed or no files provided
    if (Object.keys(userFileContents).length === 0 && filePaths && Array.isArray(filePaths) && filePaths.length > 0) {
      const fetchedContents = await this.fetchFileContents(containerId, filePaths);
      Object.assign(userFileContents, fetchedContents);
    }

    return userFileContents;
  }

  private async fetchFileContents(containerId: string, filePaths: string[]): Promise<Record<string, string>> {
    const results = await Promise.all(
      filePaths.map(async (filePath) => {
        const relative = this.toWorkspaceRelative(filePath);
        try {
          // Always read via an absolute path — listFiles returns workspace-relative
          // paths, and `cat <relative>` depends on the exec working directory.
          const result = await this.containerService.readFile(
            containerId,
            this.toContainerAbsolute(filePath)
          );
          if (result?.content) {
            return { path: relative, content: result.content };
          }
        } catch (e) {
          console.log('[ScoringService] Error reading file:', relative, e);
        }
        return null;
      })
    );

    const contents: Record<string, string> = {};
    for (const r of results) {
      if (r) contents[r.path] = r.content;
    }
    return contents;
  }

  private filterSourceFiles(files: string[]): string[] {
    return files.filter(f => {
      // Skip binary / generated / dependency directories
      if (f.includes('node_modules/') || f.includes('/.git/') || f.includes('.next/') || f.includes('dist/')) return false;
      if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.gif') || f.endsWith('.ico')) return false;
      if (f.endsWith('.mp4') || f.endsWith('.zip') || f.endsWith('.tar') || f.endsWith('.gz')) return false;
      if (f.endsWith('.lock') || f.endsWith('.log')) return false;

      // Only include implementation source files
      const implementationExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.cs', '.rb', '.php'];
      return implementationExtensions.some(ext => f.endsWith(ext));
    });
  }

  private inferExpectedLayerCountFromTasks(taskTexts: string[]): number {
    const corpus = taskTexts.join(' ').toLowerCase();
    const frontendSignals = /\b(ui|ux|frontend|component|page|layout|css|style|responsive|button|form)\b/.test(corpus);
    const backendSignals = /\b(api|endpoint|route|controller|service|backend|server|auth|middleware)\b/.test(corpus);
    const databaseSignals = /\b(database|db|sql|schema|migration|model|prisma|query|table)\b/.test(corpus);
    const infraSignals = /\b(test|testing|integration|e2e|ci|pipeline|docker|deploy|lint)\b/.test(corpus);

    const signalCount = [frontendSignals, backendSignals, databaseSignals, infraSignals].filter(Boolean).length;
    return signalCount >= 3 ? 2 : 1;
  }

  private buildScoringPrompt(
    levelTitle: string,
    level: number,
    tasks: string[],
    fileContents: Record<string, string>,
    completedTasks: string[],
    masteryReflection: string,
    impactedLayers: string[],
    testResults?: TestResults,
    changedFiles: string[] = []
  ): string {
    // Files the user actually created/modified get a large budget so the model
    // can see their full implementation. Other files are context and are capped.
    const MAX_CHARS_CHANGED = 12000;
    const MAX_CHARS_OTHER = 1500;
    const MAX_OTHER_FILES = 12;
    const importantFiles = ['package.json', 'prisma/schema.prisma', 'tsconfig.json'];

    const changedSet = new Set(changedFiles.map((file) => this.toWorkspaceRelative(file)));
    const allEntries = Object.entries(fileContents).map(
      ([file, content]) => [this.toWorkspaceRelative(file), content] as const
    );

    const renderFile = (file: string, content: string, limit: number) => {
      const truncated = content.length > limit
        ? content.substring(0, limit) + '\n... (truncated)'
        : content;
      return `--- File: ${file} ---\n${truncated}`;
    };

    // 1. Files the user created or modified — always shown in full (up to the larger cap).
    const changedEntries = allEntries.filter(([file]) => changedSet.has(file));
    const changedFileSection = changedEntries.length > 0
      ? changedEntries.map(([file, content]) => renderFile(file, content, MAX_CHARS_CHANGED)).join('\n\n')
      : 'No created or modified files were recorded.';

    // 2. Everything else is supporting context, prioritised then capped.
    const implementationExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs'];
    const otherEntries = allEntries
      .filter(([file]) => !changedSet.has(file))
      .filter(([file]) => implementationExtensions.some((ext) => file.endsWith(ext)))
      .sort(([a], [b]) => {
        if (importantFiles.includes(a) && !importantFiles.includes(b)) return -1;
        if (!importantFiles.includes(a) && importantFiles.includes(b)) return 1;
        return a.localeCompare(b);
      })
      .slice(0, MAX_OTHER_FILES);

    const otherFileSection = otherEntries.length > 0
      ? otherEntries.map(([file, content]) => renderFile(file, content, MAX_CHARS_OTHER)).join('\n\n')
      : 'No other file contents available.';

    const taskList = tasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
    const completedList = completedTasks.length > 0
      ? completedTasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
      : '  (none)';
    const impactedLayerList = impactedLayers.length > 0
      ? impactedLayers.map((layer) => `  - ${layer}`).join('\n')
      : '  (none)';

    let testResultsSection = 'No test results available.';
    let testsPassed = false;
    if (testResults) {
      const passed = testResults.passed === true;
      testsPassed = passed;

      // The modal sends the raw /tests/run payload (summary + taskResults), while
      // other callers send a normalised `results`/`failedTasks` shape. Support both.
      const summary =
        testResults.results?.summary ??
        testResults.summary ??
        { total: 0, passed: 0, failed: 0 };

      const failedTasks =
        testResults.failedTasks ??
        (testResults.taskResults ?? [])
          .filter((task) => task.passed === false)
          .map((task) => ({
            taskId: 0,
            taskText: task.taskName || 'Unnamed task',
            errors: task.errors ?? ['validation failed'],
          }));

      const verifiedNote = passed
        ? `\nVERIFIED: the automated tests for this level ran and PASSED, which means every required task listed above has been completed.`
        : '';

      testResultsSection = `Tests: ${passed ? 'PASSED' : 'FAILED'}
Summary: ${summary.passed}/${summary.total} passed, ${summary.failed} failed${verifiedNote}
${failedTasks.length > 0 ? '\nFailed tasks:\n' + failedTasks.map((t) => `  - ${t.taskText}: ${t.errors?.join(', ') || 'validation failed'}`).join('\n') : ''}`;
    }

    // Ground the grader in what the tests actually proved. When the level's own
    // tests pass, the tasks they cover ARE complete — the model must not claim
    // they are missing just because it cannot spot them in the submitted files.
    const completionGuidance = !testResults
      ? `No automated test results were provided. Judge task completion from the submitted files above and be fair: if the required behaviour is clearly present, treat the task as complete.`
      : testsPassed
        ? `The automated tests for this level PASSED. Tests are a GATE, not a quality signal: every submission that reaches you has already passed them, so test results must NOT influence the star rating.
- Treat all required tasks as DONE. Never describe a required task as missing, unimplemented, incomplete, "not found", or "not visible in the files".
- Because every graded submission passes the tests, "tests passed" carries no signal — you cannot use it to justify 3 stars.
- Differentiate submissions by the QUALITY of the submitted code and the strength of the student's explanation: naming, duplication, dead code, structure, robustness, and whether they understand why their change works.`
        : `Some tests FAILED. Use the failed task list above to identify exactly which required tasks are incomplete or incorrect, and focus your feedback on those.`;

    return `You are a friendly and encouraging senior developer mentor who loves helping beginners learn. You're like a supportive tech lead who gives constructive feedback with humor and warmth. You've seen lots of code and know that everyone starts somewhere — your goal is to help students improve while celebrating their wins.

LEVEL ${level}: ${levelTitle}

REQUIRED TASKS FOR THIS LEVEL:
${taskList}

TASKS THE STUDENT COMPLETED:
${completedList}

STUDENT EXPLANATION OF THEIR OWN WORK:
${masteryReflection || '(none provided)'}

LAYERS THE STUDENT SAYS THEY TOUCHED:
${impactedLayerList}

=== TEST RESULTS ===
${testResultsSection}
=== END OF TEST RESULTS ===

=== FILES THE STUDENT CREATED OR MODIFIED (PRIMARY EVIDENCE - READ FIRST) ===
${changedFileSection}
=== END OF CHANGED FILES ===

=== OTHER PROJECT FILES (CONTEXT ONLY) ===
${otherFileSection}
=== END OF OTHER FILES ===

Your job - BE SPECIFIC TO THIS LEVEL'S TASKS:
1. FIRST, read the REQUIRED TASKS FOR THIS LEVEL above carefully - these are the specific requirements for level ${level}.
2. READ THE TEST RESULTS FIRST. The tests for this level were written to check exactly these required tasks. ${completionGuidance}
3. The student's actual work is in the "FILES THE STUDENT CREATED OR MODIFIED" section above. Judge the tasks against THOSE files first - a task is only missing if it is absent from the changed files AND the tests did not pass it.
4. Compare each required task to the submitted code - check if the code actually implements what's required.
5. For EACH task, check if it's done correctly according to the task requirements - not generic improvements.
6. Check for CLEAN CODE (only if it affects task functionality):
   - Critical naming issues that make code hard to understand
   - Obvious code duplication within the same file
7. Give feedback SPECIFICALLY about the tasks - don't give generic programming advice.
8. Evaluate mastery based on evidence:
   - Can the student explain why their change works?
   - Does their explanation connect multiple layers (frontend/backend/database/infra)?
   - Are they demonstrating debugging and reasoning, not cargo-cult changes?

IMPORTANT:
- Your feedback MUST be tied to the actual REQUIRED TASKS listed above
- If a task asks for feature X, mention if feature X is implemented or missing
- Don't suggest adding features that aren't part of this level's requirements
- Keep feedback focused on what was required vs what was submitted
- When the tests PASSED, the required tasks are complete — do NOT report them as missing or not implemented
- Never blame the student for something the passing tests already verified

STAR RATING GUIDE:
The tests are a pass/fail gate, not a grading signal — every submission you grade has already passed them, so test results must NOT raise or lower the stars. Grade the quality of what was submitted:
- 3 stars: Required tasks complete AND the code is clean and idiomatic (clear naming, no notable duplication, no dead code) AND the explanation shows genuine understanding of why the change works.
- 2 stars: Tasks complete and the code works, but there are real quality issues (duplicated logic, confusing naming, dead code) OR the explanation is shallow.
- 1 star: The code passes, but it is poor quality (hacky, heavily duplicated, hard to maintain) OR the student cannot explain how or why it works.
Never lower a star rating because a required task "seems" missing — the tests already verified completion.

IMPORTANT: Keep your response SHORT and concise. Focus on the actual required tasks for this level.

Respond ONLY using this exact format:

[STAR_RATING]
<number 1-3>
[/STAR_RATING]

[FEEDBACK]
<1-2 short sentences confirming the required tasks are complete (the tests passed) and assessing the quality of the code and the student's explanation.>
[/FEEDBACK]

[IMPROVEMENTS]
<max 3 bullet points on genuine code-quality improvements tied to THIS level's tasks (duplication, naming, structure, robustness). Do NOT list tasks as missing when the tests passed.>
[/IMPROVEMENTS]

[NEXT_TIME]
<max 2 bullet points of concrete quality improvements for THIS level.>
[/NEXT_TIME]

[MASTERY_VERDICT]
<PASS or REVISE>
[/MASTERY_VERDICT]

[MASTERY_GAPS]
<1-2 short sentences on what is missing in their understanding if verdict is REVISE. If PASS, write "none".>
[/MASTERY_GAPS]`;
  }

  private parseScoringResponse(response: string): {
    stars: number;
    score: number;
    feedback: string;
    improvements: string;
    nextTime: string;
    masteryPassed: boolean;
    masteryGaps: string;
  } {
    let stars = 1;
    let score = 33;
    let feedback = "You've started your coding journey! Keep practicing and you'll get the hang of it.";
    let improvements = '';
    let nextTime = '';
    let masteryPassed = false;
    let masteryGaps = 'Add clearer reasoning about how your changes work across the stack.';

    try {
      const starMatch = response.match(/\[STAR_RATING\]\s*(\d+)\s*\[\/STAR_RATING\]/i);
      if (starMatch) {
        const parsedStars = parseInt(starMatch[1]);
        if (parsedStars >= 1 && parsedStars <= 3) stars = parsedStars;
      }

      // Score is deterministic and derived from the star rating so identical
      // submissions always score the same: 1 star = 33, 2 stars = 67, 3 stars = 100.
      score = Math.round((stars / 3) * 100);

      const extract = (tag: string) => {
        const m = response.match(new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i'));
        return m ? m[1].trim() : '';
      };

      feedback = extract('FEEDBACK') || feedback;
      improvements = extract('IMPROVEMENTS');
      nextTime = extract('NEXT_TIME');
      const masteryVerdict = extract('MASTERY_VERDICT').toUpperCase();
      masteryPassed = masteryVerdict.includes('PASS');
      const extractedGaps = extract('MASTERY_GAPS');
      if (extractedGaps) masteryGaps = extractedGaps;
    } catch (e) {
      console.error('Error parsing scoring response:', e);
    }

    return { stars, score, feedback, improvements, nextTime, masteryPassed, masteryGaps };
  }

  private async callOmniRouteAPI(apiKey: string, prompt: string, model?: string): Promise<string> {
    const models = model ? [model] : [
      'oc/muse-spark-1.3-contributor-free',
      'oc/muse-spark-1.2-contributor-free',
      'ollama/gpt-oss:120b',
    ];

    let lastError = null;

    for (const modelName of models) {
      try {
        const response = await fetch('http://localhost:20128/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const content = extractChatContent(await response.text());

          if (!content) {
            lastError = new Error('No content in response');
            continue;
          }
          return content;
        } else {
          const errorData = await response.json().catch(() => ({}));
          lastError = errorData;
          console.log(`Model ${modelName} failed:`, errorData);

          const status = response.status;
          if (status === 429 || status === 404 || status === 422 || status === 502 || status === 503) {
            continue;
          }
          break;
        }
      } catch (e) {
        lastError = e;
        console.error(`Error calling omni route ${modelName}:`, e);
      }
    }

    throw new Error(lastError?.message || 'Failed to get response from AI');
  }
}
