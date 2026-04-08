/**
 * AI Scoring Service
 * 
 * Uses OpenRouter AI to evaluate user code and provide:
 * - Star rating (1-3 stars)
 * - Detailed feedback on improvements
 * - Code quality assessment
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/client';
import type { TestResult, TestValidationResult } from '$lib/tests/types';

// Source code file extensions to analyze
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.cs', '.rb', '.php', '.prisma'];

// Level info cache
const levelCache: Map<number, { title: string; tasks: string[] }> = new Map();

async function getLevelInfo(level: number) {
  if (levelCache.has(level)) {
    return levelCache.get(level);
  }
  
  const levelInfo = await prisma.level.findFirst({
    where: { order: level },
    include: {
      tasks: {
        orderBy: { order: 'asc' }
      }
    }
  });
  
  if (levelInfo) {
    levelCache.set(level, { 
      title: levelInfo.title, 
      tasks: levelInfo.tasks.map(t => t.taskName) 
    });
  }
  
  return levelInfo ? { 
    title: levelInfo.title, 
    tasks: levelInfo.tasks.map(t => t.taskName) 
  } : null;
}

// Fetch file contents from container
async function fetchFileContents(containerId: string, filePaths: string[]): Promise<Record<string, string>> {
  const contents: Record<string, string> = {};
  
  console.log('[AI Score] fetchFileContents — attempting to read', filePaths.length, 'files:', filePaths);
  
  for (const filePath of filePaths) {
    try {
      console.log('[AI Score] fetchFileContents — reading:', filePath);
      const res = await fetch(`/api/docker/container/${containerId}/files/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `/workspace/${filePath}` })
      });
      const data = await res.json();
      if (data.success) {
        contents[filePath] = data.content;
        console.log('[AI Score] fetchFileContents — ✓ read:', filePath, '(', data.content.length, 'chars)');
      } else {
        console.log('[AI Score] fetchFileContents — ✗ failed:', filePath, '—', data.message || 'unknown error');
      }
    } catch (e) {
      console.log('[AI Score] fetchFileContents — ✗ exception:', filePath, '—', e instanceof Error ? e.message : e);
    }
  }
  
  console.log('[AI Score] fetchFileContents — finished. Successfully read:', Object.keys(contents).length, '/', filePaths.length, 'files');
  
  return contents;
}

// Filter source files from file list - be restrictive to avoid token limits
// Excludes config files (package.json, etc.) to prevent AI from commenting on versions/dependencies
function filterSourceFiles(files: string[]): string[] {
  return files.filter(f => {
    // Skip binary / generated / dependency directories
    if (f.includes('node_modules/') || f.includes('/.git/') || f.includes('.next/') || f.includes('dist/')) return false;
    if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.gif') || f.endsWith('.ico')) return false;
    if (f.endsWith('.mp4') || f.endsWith('.zip') || f.endsWith('.tar') || f.endsWith('.gz')) return false;
    if (f.endsWith('.lock') || f.endsWith('.log')) return false;

    // Only include implementation source files - exclude config files that contain version info
    const implementationExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.cs', '.rb', '.php'];
    
    return implementationExtensions.some(ext => f.endsWith(ext));
  });
}

function inferExpectedLayerCountFromTasks(taskTexts: string[]): number {
  const corpus = taskTexts.join(' ').toLowerCase();
  const frontendSignals = /\b(ui|ux|frontend|component|page|layout|css|style|responsive|button|form)\b/.test(corpus);
  const backendSignals = /\b(api|endpoint|route|controller|service|backend|server|auth|middleware)\b/.test(corpus);
  const databaseSignals = /\b(database|db|sql|schema|migration|model|prisma|query|table)\b/.test(corpus);
  const infraSignals = /\b(test|testing|integration|e2e|ci|pipeline|docker|deploy|lint)\b/.test(corpus);

  const signalCount = [frontendSignals, backendSignals, databaseSignals, infraSignals].filter(Boolean).length;
  return signalCount >= 2 ? 2 : 1;
}

// Build the scoring prompt for OpenRouter
function buildScoringPrompt(
  levelTitle: string,
  level: number,
  tasks: string[],
  fileContents: Record<string, string>,
  completedTasks: string[],
  masteryReflection: string,
  impactedLayers: string[],
  testResults: {
    passed: boolean;
    results?: TestValidationResult;
    failedTasks?: Array<{ taskId: number; taskText: string; errors: string[] }>;
  }
): string {
  const fileNames = Object.keys(fileContents);
  console.log('[AI Score] buildScoringPrompt — files included in prompt:', fileNames.length);
  fileNames.forEach(f => console.log(`  → ${f}`));

  // Prioritize important files and reduce content length to avoid token limits
  // NOTE: Exclude config files (package.json, tsconfig.json, etc.) to avoid AI commenting on versions/dependencies
  const importantFiles = ['package.json', 'prisma/schema.prisma', 'tsconfig.json'];
  const maxCharsPerFile = 1000; // Reduced from 3000 to 1000
  const maxFiles = 10; // Limit to 10 files to prevent excessive token usage

  const sortedFileEntries = Object.entries(fileContents).sort(([a], [b]) => {
    // Put important files first
    if (importantFiles.includes(a) && !importantFiles.includes(b)) return -1;
    if (!importantFiles.includes(a) && importantFiles.includes(b)) return 1;
    return a.localeCompare(b);
  });

  // Filter out config files that contain version/dependency info - focus on actual implementation files
  const implementationExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs'];
  const filteredEntries = sortedFileEntries.filter(([file]) => 
    implementationExtensions.some(ext => file.endsWith(ext))
  );
  
  const limitedFileEntries = filteredEntries.slice(0, maxFiles);

  const fileSection = limitedFileEntries.length > 0
    ? limitedFileEntries.map(([file, content]) => {
        const truncated = content.length > maxCharsPerFile
          ? content.substring(0, maxCharsPerFile) + '\n... (truncated)'
          : content;
        return `--- File: ${file} ---\n${truncated}`;
      }).join('\n\n')
    : 'No file contents available.';

  // Log if files were omitted or truncated
  if (sortedFileEntries.length > maxFiles) {
    console.log(`[AI Score] Omitted ${sortedFileEntries.length - maxFiles} files due to token limit constraints`);
  }

  const taskList = tasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
  const completedList = completedTasks.length > 0
    ? completedTasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
    : '  (none)';
  const impactedLayerList =
    impactedLayers.length > 0
      ? impactedLayers.map((layer) => `  - ${layer}`).join('\n')
      : '  (none)';

  // Format test results for the prompt
  let testResultsSection = 'No test results available.';
  if (testResults) {
    const passed = testResults.passed === true;
    const summary = testResults.results?.summary || { total: 0, passed: 0, failed: 0 };
    const failedTasks = testResults.failedTasks || [];
    
    testResultsSection = `Tests: ${passed ? 'PASSED' : 'FAILED'}
Summary: ${summary.passed}/${summary.total} passed, ${summary.failed} failed
${failedTasks.length > 0 ? '\nFailed tasks:\n' + failedTasks.map((t: { taskId: number; taskText: string; errors?: string[] }) => `  - ${t.taskText}: ${t.errors?.join(', ') || 'validation failed'}`).join('\n') : ''}`;
  }

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

=== SUBMITTED FILES ===
${fileSection}
=== END OF FILES ===

Your job - BE SPECIFIC TO THIS LEVEL'S TASKS:
1. FIRST, read the REQUIRED TASKS FOR THIS LEVEL above carefully - these are the specific requirements for level ${level}.
2. Compare each required task to the submitted code - check if the code actually implements what's required.
3. Look at TEST RESULTS to see which tasks passed or failed.
4. For EACH task, check if it's done correctly according to the task requirements - not generic improvements.
5. Check for CLEAN CODE (only if it affects task functionality):
   - Critical naming issues that make code hard to understand
   - Obvious code duplication within the same file
6. Give feedback SPECIFICALLY about the tasks - don't give generic programming advice.
7. Evaluate mastery based on evidence:
   - Can the student explain why their change works?
   - Does their explanation connect multiple layers (frontend/backend/database/infra)?
   - Are they demonstrating debugging and reasoning, not cargo-cult changes?

IMPORTANT:
- Your feedback MUST be tied to the actual REQUIRED TASKS listed above
- If a task asks for feature X, mention if feature X is implemented or missing
- Don't suggest adding features that aren't part of this level's requirements
- Keep feedback focused on what was required vs what was submitted

STAR RATING GUIDE:
- 3 stars: ALL required tasks completed correctly according to the task requirements
- 2 stars: Most tasks completed but some missing or incorrect
- 1 star: Few tasks completed or tasks done incorrectly

IMPORTANT: Keep your response SHORT and concise. Focus on the actual required tasks for this level.

Respond ONLY using this exact format:

[STAR_RATING]
<number 1-3>
[/STAR_RATING]

[FEEDBACK]
<1-2 short sentences about which tasks were completed vs missing for THIS LEVEL>
[/FEEDBACK]

[IMPROVEMENTS]
<max 3 bullet points tied to the SPECIFIC REQUIRED TASKS - what they need to fix for THIS level's tasks>
[/IMPROVEMENTS]

[NEXT_TIME]
<max 2 bullet points of what to do for the specific tasks they missed in THIS level>
[/NEXT_TIME]

[MASTERY_VERDICT]
<PASS or REVISE>
[/MASTERY_VERDICT]

[MASTERY_GAPS]
<1-2 short sentences on what is missing in their understanding if verdict is REVISE. If PASS, write "none".>
[/MASTERY_GAPS]
`;
}

// Parse the AI response to extract star rating, score, and feedback sections
function parseScoringResponse(response: string): {
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

    // Score is proportional to stars: 1 star = ~33, 2 stars = ~67, 3 stars = 100
    if (stars === 3) score = Math.floor(Math.random() * 16) + 85; // 85-100
    else if (stars === 2) score = Math.floor(Math.random() * 18) + 50; // 50-67
    else score = Math.floor(Math.random() * 9) + 25; // 25-33

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

// Call OpenRouter API for scoring
async function callOpenRouterAPI(apiKey: string, prompt: string): Promise<string> {
  // Free coding-focused models available on OpenRouter
  const models = [
    'meta-llama/llama-3.1-8b-instruct',
    'google/gemma-2-9b-it',
    'mistralai/mistral-7b-instruct-v0.2',
    'google/gemini-2.5-flash-exp'
  ];
  let lastError = null;
  let isRateLimited = false;
  
  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://devsim.com',
          'X-Title': 'DevSim AI Scoring'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      } else {
        const errorData = await response.json();
        lastError = errorData;
        console.log(`Model ${model} failed:`, errorData);
        
        // Check for rate limiting in response body
        const errorMessage = errorData?.message || '';
        if (errorMessage.toLowerCase().includes('rate limit')) {
          isRateLimited = true;
          console.log(`Rate limited on model ${model}, trying next...`);
          continue;
        }
        
        if (response.status === 429 || response.status === 404) {
          isRateLimited = true;
          continue;
        }
        break;
      }
    } catch (e) {
      lastError = e;
      console.error(`Error calling OpenRouter ${model}:`, e);
      // Check if it's a rate limit error
      const errorStr = String(e);
      if (errorStr.toLowerCase().includes('rate limit')) {
        isRateLimited = true;
        continue;
      }
    }
  }
  
  // If rate limited on all models, return a special indicator
  if (isRateLimited) {
    throw new Error('AI_RATE_LIMITED');
  }
  throw new Error(lastError?.message || 'Failed to get response from AI');
}

export const POST: RequestHandler = async ({ request }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    return json({
      success: false,
      error: 'OPENROUTER_API_KEY is not configured'
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { containerId, level, completedTasks, fileContents, filePaths, testResults, masteryReflection, impactedLayers } = body;
    const normalizedReflection =
      typeof masteryReflection === 'string' ? masteryReflection.trim() : '';
    const normalizedImpactedLayers = Array.isArray(impactedLayers)
      ? impactedLayers.filter((layer: unknown): layer is string => typeof layer === 'string')
      : [];


    if (!containerId || !level) {
      return json({
        success: false,
        error: 'Missing required fields: containerId, level'
      }, { status: 400 });
    }
    
    // Log test results for debugging
    if (testResults) {
      console.log('[AI Score] Test results received:', JSON.stringify(testResults).slice(0, 500));
    }
    
    // Get level info
    const levelInfo = await getLevelInfo(level);
    if (!levelInfo) {
      return json({
        success: false,
        error: 'Level not found'
      }, { status: 404 });
    }
    
    // Use provided file contents or fetch from container
    let userFileContents: Record<string, string> = {};
    
    console.log('[AI Score] ── File ingestion ──────────────────────────');
    console.log('[AI Score] fileContents provided:', fileContents ? Object.keys(fileContents).length : 0, 'files');
    console.log('[AI Score] filePaths provided:', filePaths ? filePaths.length : 0, 'paths');
    
    if (fileContents && typeof fileContents === 'object' && Object.keys(fileContents).length > 0) {
      userFileContents = fileContents;
      console.log('[AI Score] Using provided fileContents. Files:');
      for (const [name, content] of Object.entries(userFileContents)) {
        console.log(`  ✓ ${name} (${content.length} chars)`);
      }
    } 
    
    // Always fetch ALL relevant files from container to ensure we have complete context
    if (containerId) {
      console.log('[AI Score] Fetching all source files from container for complete analysis');
      try {
        const listRes = await fetch(`/api/docker/container/${containerId}/files/list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const listData = await listRes.json();
        
        if (listData.success && listData.files) {
          const filesToAnalyze = filterSourceFiles(listData.files);
          console.log('[AI Score] Source files found:', listData.files.length, '— analyzing', filesToAnalyze.length, 'source files');
          console.log('[AI Score] Files to analyze:', filesToAnalyze);
          
          // Fetch files not already in userFileContents
          const filesToFetch = filesToAnalyze.filter(file => !userFileContents[file]);
          if (filesToFetch.length > 0) {
            const fetchedContents = await fetchFileContents(containerId, filesToFetch);
            console.log('[AI Score] Fetched', Object.keys(fetchedContents).length, '/', filesToFetch.length, 'additional files from container');
            for (const [name, content] of Object.entries(fetchedContents)) {
              userFileContents[name] = content;
              console.log(`  ✓ ${name} (${content.length} chars)`);
            }
          } else {
            console.log('[AI Score] All source files already provided in fileContents');
          }
        } else {
          console.warn('[AI Score] File list fetch failed or returned no files:', listData);
        }
      } catch (e) {
        console.warn('[AI Score] Could not fetch file list:', e);
      }
    }
    
    // Fallback to fetching specific paths if container fetch failed or no files provided
    if (Object.keys(userFileContents).length === 0 && filePaths && Array.isArray(filePaths) && filePaths.length > 0) {
      console.log('[AI Score] Fetching files from container by path list:', filePaths);
      userFileContents = await fetchFileContents(containerId, filePaths);
      console.log('[AI Score] Fetched', Object.keys(userFileContents).length, '/', filePaths.length, 'files from container');
      for (const [name, content] of Object.entries(userFileContents)) {
        console.log(`  ✓ ${name} (${content.length} chars)`);
      }
    }
    
    console.log('[AI Score] ── Total files passed to AI:', Object.keys(userFileContents).length, '──');
    if (Object.keys(userFileContents).length === 0) {
      console.warn('[AI Score] ⚠ No file contents available — AI will score without code context');
    }
    
    // Build the scoring prompt with test results
    const prompt = buildScoringPrompt(
      levelInfo.title,
      level,
      levelInfo.tasks,
      userFileContents,
      completedTasks || [],
      normalizedReflection,
      normalizedImpactedLayers,
      testResults
    );
    
    console.log('[AI Score] Prompt length:', prompt.length, 'chars');
    console.log('[AI Score] Calling OpenRouter API…');
    
    // Call AI for scoring
    const aiResponse = await callOpenRouterAPI(apiKey, prompt);
    
    console.log('[AI Score] Raw AI response:\n', aiResponse);
    
    // Parse the response
    const { stars, score, feedback, improvements, nextTime, masteryPassed, masteryGaps } = parseScoringResponse(aiResponse);
    const reflectionStrongEnough = normalizedReflection.length >= 80;
    const expectedLayerCount = inferExpectedLayerCountFromTasks(levelInfo.tasks);
    const layerEvidence = normalizedImpactedLayers.length >= expectedLayerCount;
    const qualityFloor = stars >= 2 || score >= 50;
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
    
    console.log('[AI Score] Parsed — stars:', stars, '| score:', score);
    console.log('[AI Score] feedback:', feedback);
    console.log('[AI Score] improvements:', improvements || '(none)');
    console.log('[AI Score] nextTime:', nextTime || '(none)');
    
    return json({
      success: true,
      stars,
      score,
      feedback,
      improvements,
      nextTime,
      masteryPassed: finalMasteryPassed,
      masteryGaps: finalMasteryPassed ? 'none' : fallbackMasteryGaps,
      level: level,
      levelTitle: levelInfo.title
    });
    
  } catch (error) {
    console.error('AI Scoring error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a rate limit error
    if (errorMessage === 'AI_RATE_LIMITED') {
      return json({
        success: false,
        stars: 2, // Default to 2 stars for rate limit - give benefit of doubt
        score: 67, // Default proportional mid-range score on rate limit
        feedback: 'Hey there! 👋 Looks like our AI buddy is taking a quick nap. Drop by again in a moment and we\'ll get your feedback!',
        masteryPassed: false,
        masteryGaps: 'Mastery check unavailable right now due to AI rate limits. Please retry shortly.',
        error: 'AI rate limit exceeded. Please try again later.',
        isRateLimited: true
      });
    }
    
    return json({
      success: false,
      stars: 1, // Default to 1 star on error - be conservative
      score: 33, // Default proportional low score on error
      feedback: 'No worries — every expert was once a beginner. Keep practicing and you\'ll get there! Focus on error handling, code organization, and best practices.',
      masteryPassed: false,
      masteryGaps: 'Mastery check failed due to an AI service error. Please retry submit.',
      error: errorMessage
    });
  }
};
