/**
 * Server-side utility to read key takeaway files
 * Parses keytakeaway.md into separate sections
 * Falls back to generating takeaways from level config when files don't exist
 */

import fs from 'fs';
import path from 'path';
import { getLevelConfig } from '$lib/tests/levels';
import prisma from '$lib/server/client';

console.log('[KEYTAKEAWAYS] Module loading...');

// Support multiple tech stacks - ordered by priority
const STACK_CONFIGS = [
  {
    stackKey: 'react-express-postgres-prisma',
    paths: [
      path.join(process.cwd(), 'submodules', 'projects', 'tech-stacks', 'react-express-postgres-prisma', 'scenario-1', 'LIBRARY_MANAGEMENT', 'levels'),
      path.join(process.cwd(), '..', 'submodules', 'projects', 'tech-stacks', 'react-express-postgres-prisma', 'scenario-1', 'LIBRARY_MANAGEMENT', 'levels'),
    ]
  },
  {
    stackKey: 'nestjs-postgres-prisma',
    paths: [
      path.join(process.cwd(), 'submodules', 'projects', 'tech-stacks', 'nestjs-postgres-prisma', 'scenario-1'),
      path.join(process.cwd(), '..', 'submodules', 'projects', 'tech-stacks', 'nestjs-postgres-prisma', 'scenario-1'),
    ]
  }
];

interface StackConfig {
  basePath: string | null;
  stackKey: string;
}

function findStackPaths(): StackConfig[] {
  const results: StackConfig[] = [];
  
  for (const config of STACK_CONFIGS) {
    let basePath: string | null = null;
    for (const p of config.paths) {
      if (fs.existsSync(p)) {
        basePath = p;
        break;
      }
    }
    results.push({ basePath, stackKey: config.stackKey });
  }
  
  return results;
}

const STACK_PATHS = findStackPaths();
const ACTIVE_STACK = STACK_PATHS.find(s => s.basePath !== null);
console.log('[KEYTAKEAWAYS] Active stack:', ACTIVE_STACK?.stackKey, 'Base path:', ACTIVE_STACK?.basePath);

/**
 * Gets the task text for a task in a level
 */
function getTaskText(level: number, taskId: string): string {
  const levelConfig = getLevelConfig(level);
  const taskConfig = levelConfig?.tasks.find(t => t.taskId === taskId);
  return taskConfig?.taskText ?? `Task ${taskId}`;
}

/**
 * Gets all takeaways for a level from the database.
 * Returns the level's key takeaways as a single entry.
 */
export async function getAllLevelTakeaways(level: number): Promise<Array<{ taskId: string; taskName: string; takeaway: string }>> {
  try {
    const levelData = await prisma.level.findFirst({
      where: { order: level },
      select: { key_takeaways: true, title: true }
    });

    if (levelData?.key_takeaways) {
      // Return the level's key takeaways as a single entry
      return [{
        taskId: 'level',
        taskName: levelData.title,
        takeaway: levelData.key_takeaways
      }];
    }
  } catch (e) {
    console.error(`Error fetching key takeaways for level ${level} from database:`, e);
  }

  // Fallback: Return empty array
  return [];
}

/**
 * Parse takeaway content into sections - groups paragraphs into reasonable sections
 */
function parseTakeawayContent(content: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];
  
  // First split by double newlines (paragraphs)
  const paragraphs = content.split(/\n\n/);
  
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;
    
    // Check if paragraph starts with **Something:** (section heading)
    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*[:\s]*/);
    if (headingMatch) {
      // Has a heading - use it as section title
      const title = headingMatch[1].trim();
      const rest = trimmed.replace(/^\*\*.+?\*\*[:\s]*/, '').trim();
      
      if (rest) {
        sections.push({ title, content: rest });
      }
    } else {
      // No heading - check if it's a long paragraph (more than ~500 chars)
      // and split into 2-3 parts
      if (trimmed.length > 500) {
        // Split by sentences but limit to ~3 sections per paragraph
        const sentences = trimmed.split(/(?<=[.!?])\s+/);
        const midpoint = Math.ceil(sentences.length / 2);
        
        // First half
        const firstHalf = sentences.slice(0, midpoint).join(' ').trim();
        if (firstHalf) {
          const words = firstHalf.split(' ');
          const shortTitle = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
          sections.push({ title: shortTitle, content: firstHalf });
        }
        
        // Second half
        const secondHalf = sentences.slice(midpoint).join(' ').trim();
        if (secondHalf) {
          const words = secondHalf.split(' ');
          const shortTitle = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
          sections.push({ title: shortTitle, content: secondHalf });
        }
      } else {
        // Short paragraph - keep as one section
        const words = trimmed.split(' ');
        const shortTitle = words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
        sections.push({ title: shortTitle, content: trimmed });
      }
    }
  }

  // If no sections were created, fallback to whole content
  if (sections.length === 0 && content) {
    sections.push({
      title: 'Key Takeaway',
      content: content.trim(),
    });
  }

  return sections;
}

/**
 * Generate a takeaway from task configuration
 */
function generateTakeawayFromTask(level: number, taskId: string, taskText: string): string {
  // Generate meaningful takeaway based on task text and level
  const levelConfig = getLevelConfig(level);
  const stackName = ACTIVE_STACK?.stackKey || 'unknown';
  
  const genericTakeaways: Record<string, string> = {
    'Prepare Development Environment': 'Setting up your development environment correctly is crucial for productivity. Always verify your dependencies and configurations work before starting development.',
    'Update Brand Subtitle': 'UI elements like branding require attention to detail. Small changes can have a big impact on user experience.',
    'Add Pagination to Transactions': 'Pagination is essential for handling large datasets efficiently. It improves both server performance and frontend rendering speed.',
    'Implement Atomic Balance Updates': 'Atomic transactions ensure data consistency. When updating related records, use database transactions to maintain integrity.',
    'Fix Soft-Deleted Categories Bug': 'Always filter out soft-deleted records in list queries unless specifically needed. This prevents data leaks and maintains data integrity.',
    'Add Date Range & Account Filtering': 'Query parameters for filtering make APIs more flexible and user-friendly. Support multiple filter combinations for better UX.',
    'Implement Insufficient Balance Validation': 'Business rule validations should happen at the service layer, not just at the database level. This provides better error messages and control.',
    'Implement Budget-vs-Actual Tracking': 'Comparing actual results against budgets helps users understand their financial status. Always provide clear metrics and visualizations.',
    'Implement Monthly Summary Report': 'Aggregation queries require careful consideration of performance. Index appropriate columns and consider caching for complex reports.',
    'Implement Category Breakdown Report': 'Breakdown reports help users understand where money goes. Sort by importance and provide percentages for context.',
    'Implement Trend Report': 'Trend analysis helps users see patterns over time. Include both absolute values and relative changes.',
  };

  // Check if we have a specific takeaway for this task
  for (const [key, takeaway] of Object.entries(genericTakeaways)) {
    if (taskText.toLowerCase().includes(key.toLowerCase())) {
      return takeaway;
    }
  }

  // Generic fallback
  return `You completed "${taskText}". This task helped you understand important concepts in ${stackName.replace(/-/g, ' ')} development. Review the implementation to reinforce your learning.`;
}

/**
 * Parses keytakeaway.md content into sections
 * Splits on lines starting with **Header:**
 */
function parseKeyTakeawaySections(content: string): Array<{ taskName: string; takeaway: string }> {
  const sections: Array<{ taskName: string; takeaway: string }> = [];
  
  // Remove # Key Takeaway header
  const cleaned = content.replace(/^# Key Takeaway\s*/i, '').trim();
  
  // Split by lines
  const lines = cleaned.split('\n');
  
  let currentTitle = 'Key Takeaway';
  let currentLines: string[] = [];
  let foundFirstSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Empty line might be section separator
      continue;
    }

    // Check if this line starts with **Something:**
    const titleMatch = trimmed.match(/^\*\*(.+?)\*\*[:\s](.*)$/);
    if (titleMatch) {
      // Save previous section if it has content
      if (currentLines.length > 0 && foundFirstSection) {
        sections.push({
          taskName: currentTitle,
          takeaway: currentLines.join(' ').trim(),
        });
      }
      // Start new section
      currentTitle = titleMatch[1].trim();
      currentLines = [titleMatch[2].trim()];
      foundFirstSection = true;
    } else {
      currentLines.push(trimmed);
    }
  }

  // Add last section
  if (currentLines.length > 0) {
    sections.push({
      taskName: currentTitle,
      takeaway: currentLines.join(' ').trim(),
    });
  }

  // If no sections were created, create one from the whole content
  if (sections.length === 0 && cleaned) {
    sections.push({
      taskName: 'Key Takeaway',
      takeaway: cleaned,
    });
  }

  console.log('[KEYTAKEAWAYS] Parsed', sections.length, 'sections');
  return sections;
}

/**
 * Gets the key takeaway for a specific level and task
 */
export function getKeyTakeaway(level: number, taskId: string, basePath?: string | null): string | undefined {
  const effectiveBasePath = basePath || ACTIVE_STACK?.basePath;
  if (!effectiveBasePath) {
    return undefined;
  }

  try {
    // For nestjs stack, levels.md is at root level
    const stackKey = STACK_PATHS.find(s => s.basePath === effectiveBasePath)?.stackKey;
    const isNestjsStack = stackKey === 'nestjs-postgres-prisma';
    
    let filePath: string;
    if (isNestjsStack) {
      // NestJS stack doesn't have keytakeaway files, use level config
      const levelConfig = getLevelConfig(level);
      const task = levelConfig?.tasks.find(t => t.taskId === taskId);
      return task ? generateTakeawayFromTask(level, taskId, task.taskText) : undefined;
    } else {
      filePath = path.join(effectiveBasePath, 'levels', `level-${level}`, `task-${taskId}`, 'keytakeaway.md');
    }
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Return just the first section's content
      const sections = parseKeyTakeawaySections(content);
      return sections.length > 0 ? sections[0].takeaway : content.replace(/^# Key Takeaway\s*/i, '').trim();
    }
  } catch (e) {
    console.error('Error reading keytakeaway:', e);
  }
  return undefined;
}

/**
 * Gets all key takeaway sections for a level and task
 */
export function getKeyTakeawaySections(level: number, taskId: string, basePath?: string | null): Array<{ taskName: string; takeaway: string }> {
  const effectiveBasePath = basePath || ACTIVE_STACK?.basePath;
  if (!effectiveBasePath) {
    return [];
  }

  try {
    // For nestjs stack, use level config to generate takeaways
    const stackKey = STACK_PATHS.find(s => s.basePath === effectiveBasePath)?.stackKey;
    const isNestjsStack = stackKey === 'nestjs-postgres-prisma';
    
    if (isNestjsStack) {
      const levelConfig = getLevelConfig(level);
      const task = levelConfig?.tasks.find(t => t.taskId === taskId);
      if (task) {
        return [{
          taskName: task.taskText,
          takeaway: generateTakeawayFromTask(level, taskId, task.taskText)
        }];
      }
      return [];
    }
    
    const filePath = path.join(effectiveBasePath, 'levels', `level-${level}`, `task-${taskId}`, 'keytakeaway.md');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return parseKeyTakeawaySections(content);
    }
  } catch (e) {
    console.error('Error reading keytakeaway sections:', e);
  }
  return [];
}

/**
 * Gets all key takeaways for a level
 */
export function getLevelKeyTakeaways(level: number): Record<string, string> {
  const result: Record<string, string> = {};

  if (!ACTIVE_STACK?.basePath) {
    return result;
  }

  try {
    const stackKey = ACTIVE_STACK.stackKey;
    const isNestjsStack = stackKey === 'nestjs-postgres-prisma';
    
    if (isNestjsStack) {
      // Generate takeaways from level config
      const levelConfig = getLevelConfig(level);
      if (levelConfig?.tasks) {
        for (const task of levelConfig.tasks) {
          result[task.taskId] = generateTakeawayFromTask(level, task.taskId, task.taskText);
        }
      }
      return result;
    }
    
    const levelPath = path.join(ACTIVE_STACK.basePath, 'levels', `level-${level}`);
    if (!fs.existsSync(levelPath)) {
      return result;
    }

    const tasks = fs.readdirSync(levelPath);
    for (const task of tasks) {
      const taskPath = path.join(levelPath, task);
      const stat = fs.statSync(taskPath);
      if (stat.isDirectory() && task.startsWith('task-')) {
        const taskId = task.replace('task-', '');
        const takeaway = getKeyTakeaway(level, taskId);
        if (takeaway) {
          result[taskId] = takeaway;
        }
      }
    }
  } catch (e) {
    console.error(`Error reading keytakeaways for level ${level}:`, e);
  }

  return result;
}