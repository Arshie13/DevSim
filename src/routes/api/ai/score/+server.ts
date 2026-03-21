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

// Build the scoring prompt for OpenRouter
function buildScoringPrompt(
  levelTitle: string,
  level: number,
  allTasks: string[],
  fileContents: Record<string, string>,
  completedTasks: string[],
  fileChanges: string,
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
    // Put test files first
    if (a.startsWith('TEST_FILE:') && !b.startsWith('TEST_FILE:')) return -1;
    if (!a.startsWith('TEST_FILE:') && b.startsWith('TEST_FILE:')) return 1;
    // Then important files
    if (importantFiles.includes(a) && !importantFiles.includes(b)) return -1;
    if (!importantFiles.includes(a) && importantFiles.includes(b)) return 1;
    return a.localeCompare(b);
  });

  // Filter out config files that contain version/dependency info - focus on actual implementation files
  const implementationExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue', '.py', '.java', '.go', '.rs'];
  const filteredEntries = sortedFileEntries.filter(([file]) => 
    implementationExtensions.some(ext => file.endsWith(ext)) || file.startsWith('TEST_FILE:')
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

  const taskList = allTasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n');
  const completedList = completedTasks.length > 0
    ? completedTasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n')
    : '  (none)';

  // Format test results for the prompt - provide detailed test data for scoring
  let testResultsSection = 'No test results available.';
  if (testResults) {
    const passed = testResults.passed === true;
    const summary = testResults.results?.summary || { total: 0, passed: 0, failed: 0 };
    const failedTasks = testResults.failedTasks || [];
    
    testResultsSection = `Tests: ${passed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}
Summary: ${summary.passed}/${summary.total} passed, ${summary.failed} failed
${failedTasks.length > 0 ? '\nFailed tasks (need improvement):\n' + failedTasks.map((t: { taskId: number; taskText: string; errors?: string[] }) => `  - ${t.taskText}: ${t.errors?.join(', ') || 'validation failed'}`).join('\n') : '\nAll validation tests passed!'} `
    
    // Include individual test results for more granular feedback
    const testDetails = testResults.results?.results || [];
    if (testDetails.length > 0) {
      testResultsSection += '\n\nDetailed test results:\n' + testDetails.slice(0, 20).map((t: { testName: string; passed: boolean; message?: string }) => 
        `  ${t.passed ? '✓' : '✗'} ${t.testName}${t.message ? ': ' + t.message.substring(0, 100) : ''}`
      ).join('\n');
    }
  }

  // Build completed vs incomplete tasks list
  const completedSet = new Set(completedTasks.map(t => t.toLowerCase()));
  const incompleteTasks = allTasks.filter(t => !completedSet.has(t.toLowerCase()));
  const completedListFormatted = completedTasks.length > 0 
    ? completedTasks.map(t => `  ✓ ${t}`).join('\n')
    : '  (none)';
  const incompleteListFormatted = incompleteTasks.length > 0
    ? incompleteTasks.map(t => `  ✗ ${t}`).join('\n')
    : '  (all complete!)';

  // Check if all tests passed
  const allTestsPassed = testResults?.passed === true;
  const allTasksComplete = incompleteTasks.length === 0;

  // If ALL tests passed and ALL tasks complete, still provide code improvement suggestions
  if (allTestsPassed && allTasksComplete) {
    // Include file contents in prompt
    const fileContentSummary = Object.keys(fileContents).length > 0 
      ? `\n=== SOURCE FILES (read these for code suggestions) ===\n${fileSection}\n=== END OF SOURCE FILES ===`
      : '\n(No source files available for code suggestions)';
    
    return `You are a senior developer mentor reviewing student code. Your job is to review the ACTUAL source files and provide specific suggestions for improving their code quality.

LEVEL ${level}: ${levelTitle}

ALL TASKS COMPLETED AND ALL TESTS PASSED! 🎉

=== TEST RESULTS ===
${testResultsSection}
=== END OF TEST RESULTS ===

=== USER'S FILE CHANGES ===
${fileChanges || 'No file changes recorded'}
=== END OF FILE CHANGES ===
${fileContentSummary}

IMPORTANT: Provide code suggestions based ONLY on the actual source files above. Do NOT make up file names or code that aren't in the files provided.

Respond ONLY:

[STAR_RATING]
3
[/STAR_RATING]

[FEEDBACK]
<1-2 sentences congratulating on completing all tasks>
[/FEEDBACK]

[IMPROVEMENTS]
<2-3 specific code improvement suggestions based ONLY on the actual source files above>
[/IMPROVEMENTS]

[CODE_SUGGESTIONS]
<2-3 specific code suggestions with actual file names from the source files>
[/CODE_SUGGESTIONS]
`;
  }

  // Include source files in prompt
  const sourceFilesSection = Object.keys(fileContents).length > 0 
    ? `\n=== SOURCE FILES (actual user code) ===\n${fileSection}\n=== END OF SOURCE FILES ===`
    : '';

  return `You are a senior developer mentor reviewing student code. Your job is to give specific, actionable feedback based on WHAT THE TESTS CHECK and the actual source files.

LEVEL ${level}: ${levelTitle}

=== ALL TASKS FOR THIS LEVEL ===
${taskList}

=== COMPLETED TASKS ===
${completedListFormatted}

=== INCOMPLETE TASKS ===
${incompleteListFormatted}

${fileChanges ? `=== USER'S FILE CHANGES ===
${fileChanges}
=== END OF FILE CHANGES ===
` : ''}
=== TEST FILES (What the tests check - read these first!) ===
${fileSection.includes('TEST_FILE:') ? fileSection : 'No test files available'}
=== END OF TEST FILES ===
${sourceFilesSection}

=== TEST RESULTS ===
${testResultsSection}
=== END OF TEST RESULTS ===

IMPORTANT: Only provide improvements for INCOMPLETE tasks or FAILED tests.
If all tests pass but some tasks are not marked complete, focus on what specific tasks need to be completed.

Focus on THIS LEVEL's tasks only - do not give hints for future levels.

Respond ONLY:

[STAR_RATING]
<1-3 based on completion status>
[/STAR_RATING]

[FEEDBACK]
<1-2 short sentences about which tasks were completed vs missing for THIS LEVEL>
[/FEEDBACK]

[IMPROVEMENTS]
<only if tasks incomplete: specific things to fix - be specific: "change X in file Y">
[/IMPROVEMENTS]

[CODE_SUGGESTIONS]
<only if tasks incomplete: code changes needed for THIS LEVEL>
[/CODE_SUGGESTIONS]
`;
}

// Parse the AI response to extract star rating, score, and feedback sections
function parseScoringResponse(response: string, testResults?: { passed: boolean; results?: { summary?: { total: number; passed: number; failed: number } } }): {
  stars: number;
  score: number;
  feedback: string;
  improvements: string;
  nextTime: string;  // Kept for backward compatibility, but now contains code suggestions
} {
  let stars = 1;
  let score = 33;
  let feedback = "You've started your coding journey! Keep practicing and you'll get the hang of it.";
  let improvements = '';
  let nextTime = '';

  try {
    const starMatch = response.match(/\[STAR_RATING\]\s*(\d+)\s*\[\/STAR_RATING\]/i);
    if (starMatch) {
      const parsedStars = parseInt(starMatch[1]);
      if (parsedStars >= 1 && parsedStars <= 3) stars = parsedStars;
    }

    // Score is based on test results when available, otherwise use stars
    if (testResults && testResults.results?.summary) {
      const { total, passed, failed } = testResults.results.summary;
      if (total > 0) {
        // Calculate score based on actual test pass rate
        const passRate = passed / total;
        if (passRate === 1) {
          // All tests passed - give 90-100
          score = Math.floor(Math.random() * 11) + 90;
          stars = 3;
        } else if (passRate >= 0.5) {
          // Some tests passed - give 60-89
          score = Math.floor(Math.random() * 30) + 60;
          stars = 2;
        } else {
          // Most tests failed - give 25-59
          score = Math.floor(Math.random() * 35) + 25;
          stars = 1;
        }
        console.log('[AI Score] Score calculated from test results:', { total, passed, failed, score, stars });
      } else {
        // No tests - use star-based scoring
        if (stars === 3) score = Math.floor(Math.random() * 16) + 85;
        else if (stars === 2) score = Math.floor(Math.random() * 18) + 50;
        else score = Math.floor(Math.random() * 9) + 25;
      }
    } else {
      // No test results - use star-based scoring
      if (stars === 3) score = Math.floor(Math.random() * 16) + 85;
      else if (stars === 2) score = Math.floor(Math.random() * 18) + 50;
      else score = Math.floor(Math.random() * 9) + 25;
    }

    const extract = (tag: string) => {
      const m = response.match(new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i'));
      return m ? m[1].trim() : '';
    };

    feedback = extract('FEEDBACK') || feedback;
    improvements = extract('IMPROVEMENTS') || 'Great job completing all tasks!';
    // Also try CODE_SUGGESTIONS as fallback for NEXT_TIME
    nextTime = extract('CODE_SUGGESTIONS') || extract('NEXT_TIME') || 'All tasks completed - keep up the great work!';
  } catch (e) {
    console.error('Error parsing scoring response:', e);
  }

  return { stars, score, feedback, improvements, nextTime };
}

// Call OpenRouter API for scoring
async function callOpenRouterAPI(apiKey: string, prompt: string): Promise<string> {
  // Free coding-focused models available on OpenRouter
  const models = [
    'meta-llama/llama-3.1-8b-instruct',
    'google/gemma-2-9b-it',
    'mistralai/mistral-7b-instruct-v0.2'
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
          max_tokens: 500,
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
    const { containerId, level, tasks, completedTasks, fileContents, filePaths, fileChanges, testResults } = body;
    
    console.log("file contents: ", fileContents);

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
    
    // Use tasks from request body (all tasks), fallback to levelInfo.tasks
    const allTasks = tasks && tasks.length > 0 ? tasks : (levelInfo.tasks || []);
    console.log('[AI Score] All tasks for scoring:', allTasks);
    
    // Build the scoring prompt with test results and file changes
    const prompt = buildScoringPrompt(
      levelInfo.title,
      level,
      allTasks,
      userFileContents,
      completedTasks || [],
      fileChanges || '',
      testResults
    );
    
    console.log('[AI Score] Prompt length:', prompt.length, 'chars');
    console.log('[AI Score] Calling OpenRouter API…');
    
    // Call AI for scoring
    const aiResponse = await callOpenRouterAPI(apiKey, prompt);
    
    console.log('[AI Score] Raw AI response:\n', aiResponse);
    
    // Parse the response - pass test results for score calculation
    const { stars, score, feedback, improvements, nextTime } = parseScoringResponse(aiResponse, testResults);
    
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
        error: 'AI rate limit exceeded. Please try again later.',
        isRateLimited: true
      });
    }
    
    return json({
      success: false,
      stars: 1, // Default to 1 star on error - be conservative
      score: 33, // Default proportional low score on error
      feedback: 'No worries — every expert was once a beginner. Keep practicing and you\'ll get there! Focus on error handling, code organization, and best practices.',
      error: errorMessage
    });
  }
};
