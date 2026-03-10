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
    select: { title: true, task: true }
  });
  
  if (levelInfo) {
    levelCache.set(level, { title: levelInfo.title, tasks: levelInfo.task || [] });
  }
  
  return levelInfo ? { title: levelInfo.title, tasks: levelInfo.task || [] } : null;
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
function filterSourceFiles(files: string[]): string[] {
  return files.filter(f => {
    // Skip binary / generated / dependency directories
    if (f.includes('node_modules/') || f.includes('/.git/') || f.includes('.next/') || f.includes('dist/')) return false;
    if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.gif') || f.endsWith('.ico')) return false;
    if (f.endsWith('.mp4') || f.endsWith('.zip') || f.endsWith('.tar') || f.endsWith('.gz')) return false;
    if (f.endsWith('.lock') || f.endsWith('.log')) return false;

    // Only include the most relevant files for scoring
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '.vue'];
    const relevantConfigFiles = ['package.json', 'prisma/schema.prisma', 'tsconfig.json', 'vite.config.ts'];

    return (
      relevantExtensions.some(ext => f.endsWith(ext)) ||
      relevantConfigFiles.some(configFile => f.endsWith(configFile))
    );
  });
}

// Build the scoring prompt for OpenRouter
function buildScoringPrompt(
  levelTitle: string,
  level: number,
  tasks: string[],
  fileContents: Record<string, string>,
  completedTasks: string[],
  testResults: any
): string {
  const fileNames = Object.keys(fileContents);
  console.log('[AI Score] buildScoringPrompt — files included in prompt:', fileNames.length);
  fileNames.forEach(f => console.log(`  → ${f}`));

  // Prioritize important files and reduce content length to avoid token limits
  const importantFiles = ['package.json', 'prisma/schema.prisma', 'tsconfig.json'];
  const maxCharsPerFile = 1000; // Reduced from 3000 to 1000
  const maxFiles = 10; // Limit to 10 files to prevent excessive token usage

  const sortedFileEntries = Object.entries(fileContents).sort(([a], [b]) => {
    // Put important files first
    if (importantFiles.includes(a) && !importantFiles.includes(b)) return -1;
    if (!importantFiles.includes(a) && importantFiles.includes(b)) return 1;
    return a.localeCompare(b);
  });

  const limitedFileEntries = sortedFileEntries.slice(0, maxFiles);

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

  // Format test results for the prompt
  let testResultsSection = 'No test results available.';
  if (testResults) {
    const passed = testResults.passed === true;
    const summary = testResults.results?.summary || { total: 0, passed: 0, failed: 0 };
    const failedTasks = testResults.failedTasks || [];
    
    testResultsSection = `Tests: ${passed ? 'PASSED' : 'FAILED'}
Summary: ${summary.passed}/${summary.total} passed, ${summary.failed} failed
${failedTasks.length > 0 ? '\nFailed tasks:\n' + failedTasks.map((t: any) => `  - ${t.taskText}: ${t.errors?.join(', ') || 'validation failed'}`).join('\n') : ''}`;
  }

  return `You are an experienced code reviewer evaluating a student's submission for a coding exercise.

LEVEL ${level}: ${levelTitle}

REQUIRED TASKS FOR THIS LEVEL:
${taskList}

TASKS THE STUDENT COMPLETED:
${completedList}

=== TEST RESULTS ===
${testResultsSection}
=== END OF TEST RESULTS ===

=== SUBMITTED FILES ===
${fileSection}
=== END OF FILES ===

Your job:
1. Read every submitted file carefully.
2. Compare the test results with the code — which tasks passed/failed and WHY based on the code.
3. For EACH required task, check whether the student's code actually fulfills it correctly and with good quality.
4. Focus specifically on the tasks the student completed and those they failed.
5. For completed tasks, mention what was done well and if there are any quality improvements needed.
6. For failed tasks, identify specific flaws in the code that relate to the failure and suggest concrete fixes.
7. Give next-time tips based on what the test results revealed about the code.

STAR RATING GUIDE (base this on how well the TASKS were implemented):
- 3 stars: All tasks implemented correctly with clean code and best practices
- 2 stars: Tasks implemented but with quality issues or missing best practices
- 1 star: Tasks barely implemented or with significant flaws

IMPORTANT: Keep your response SHORT and concise. Focus directly on the tasks the user completed and failed. Your feedback should be specific to their work.

Respond ONLY using this exact format (no extra text outside the tags):

[STAR_RATING]
<number 1-3>
[/STAR_RATING]

[FEEDBACK]
<1-2 short sentences — overall assessment based on completed tasks and test results>
[/FEEDBACK]

[IMPROVEMENTS]
<max 3 bullet points of what to improve next time, tied directly to specific tasks>
[/IMPROVEMENTS]

[NEXT_TIME]
<max 2 bullet points of specific actions to take for uncompleted tasks>
[/NEXT_TIME]
`;
}

// Parse the AI response to extract star rating, score, and feedback sections
function parseScoringResponse(response: string): {
  stars: number;
  score: number;
  feedback: string;
  improvements: string;
  nextTime: string;
} {
  let stars = 1;
  let score = 50;
  let feedback = 'Your code passes the tests but there is room for improvement.';
  let improvements = '';
  let nextTime = '';

  try {
    const starMatch = response.match(/\[STAR_RATING\]\s*(\d+)\s*\[\/STAR_RATING\]/i);
    if (starMatch) {
      const parsedStars = parseInt(starMatch[1]);
      if (parsedStars >= 1 && parsedStars <= 3) stars = parsedStars;
    }

    if (stars === 3) score = Math.floor(Math.random() * 26) + 75;
    else if (stars === 2) score = Math.floor(Math.random() * 25) + 50;
    else score = Math.floor(Math.random() * 20) + 30;

    const extract = (tag: string) => {
      const m = response.match(new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i'));
      return m ? m[1].trim() : '';
    };

    feedback = extract('FEEDBACK') || feedback;
    improvements = extract('IMPROVEMENTS');
    nextTime = extract('NEXT_TIME');
  } catch (e) {
    console.error('Error parsing scoring response:', e);
  }

  return { stars, score, feedback, improvements, nextTime };
}

// Call OpenRouter API for scoring
async function callOpenRouterAPI(apiKey: string, prompt: string): Promise<string> {
  const models = ['openai/gpt-4o', 'anthropic/claude-3-sonnet-20250219', 'google/gemini-2.5-pro'];
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
    const { containerId, level, completedTasks, fileContents, filePaths, testResults } = body;
    
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
      testResults
    );
    
    console.log('[AI Score] Prompt length:', prompt.length, 'chars');
    console.log('[AI Score] Calling OpenRouter API…');
    
    // Call AI for scoring
    const aiResponse = await callOpenRouterAPI(apiKey, prompt);
    
    console.log('[AI Score] Raw AI response:\n', aiResponse);
    
    // Parse the response
    const { stars, score, feedback, improvements, nextTime } = parseScoringResponse(aiResponse);
    
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
        score: 60, // Default mid-range score on rate limit
        feedback: 'Your code looks good! AI scoring is temporarily unavailable due to rate limits. Please try again in a few moments.',
        error: 'AI rate limit exceeded. Please try again later.',
        isRateLimited: true
      });
    }
    
    return json({
      success: false,
      stars: 1, // Default to 1 star on error - be conservative
      score: 35, // Default low score on error
      feedback: 'Your code works but there is room for improvement. Focus on error handling, code organization, and best practices.',
      error: errorMessage
    });
  }
};
