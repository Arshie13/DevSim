import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import { StackDataAccess } from '$lib/layers/data-access/StackDataAccess';
import {
  FRONTEND_OPTIONS,
  BACKEND_OPTIONS,
  DATABASE_OPTIONS,
  SERVICES_OPTIONS
} from '$mocks';

interface StackSelection {
  frontend: string | null;
  backend: string | null;
  database: string | null;
  services: string | null;
}

const stackData = new StackDataAccess();

function getSelectedTechnologies(selection: StackSelection): string[] {
  return [
    stackData.getTechName(FRONTEND_OPTIONS, selection.frontend),
    stackData.getTechName(BACKEND_OPTIONS, selection.backend),
    stackData.getTechName(DATABASE_OPTIONS, selection.database),
    stackData.getTechName(SERVICES_OPTIONS, selection.services)
  ].filter((technology): technology is string => Boolean(technology));
}

function getScenarioStack(selection: StackSelection): string | null {
  const technologies = new Set(
    [selection.frontend, selection.backend, selection.database, selection.services].filter(Boolean)
  );

  if (technologies.has('react') && technologies.has('express') && technologies.has('mongodb')) {
    return 'react-express-mongodb';
  }
  if (
    technologies.has('react') &&
    technologies.has('express') &&
    technologies.has('postgresql') &&
    technologies.has('prisma')
  ) {
    return 'react-express-postgres-prisma';
  }
  if (technologies.has('nestjs') && technologies.has('postgresql') && technologies.has('prisma')) {
    return 'nestjs-postgres-prisma';
  }
  if (technologies.has('nextjs') && technologies.has('postgresql') && technologies.has('prisma')) {
    return 'nextjs-postgres-prisma';
  }
  if (technologies.has('nextjs') && technologies.has('shadcn-ui')) {
    return 'nextjs-shadcn-ui';
  }

  return null;
}

function findSeedFiles(stack: string): string[] {
  const seedDirectory = path.join(process.cwd(), 'prisma', 'seed', stack);
  if (!fs.existsSync(seedDirectory)) return [];

  return fs
    .readdirSync(seedDirectory)
    .filter((entry) => /^scenario-\d+$/.test(entry))
    .sort()
    .map((entry) => path.join(seedDirectory, entry, 'seed.ts'))
    .filter((seedFile) => fs.existsSync(seedFile));
}

function extractMatches(seedContent: string, pattern: RegExp, label: string): string[] {
  return [...seedContent.matchAll(pattern)].map((match) => `${label}: ${match[1]}`);
}

function extractScenarioContext(seedFiles: string[]): string {
  const entries = seedFiles.flatMap((seedFile) => {
    const seedContent = fs.readFileSync(seedFile, 'utf-8');
    return [
      ...extractMatches(seedContent, /description:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 'Scenario'),
      ...extractMatches(seedContent, /level_description:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 'Level brief'),
      ...extractMatches(seedContent, /key_takeaways:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 'Key takeaway'),
      ...extractMatches(seedContent, /task_name:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 'Task'),
      ...extractMatches(seedContent, /user_story:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 'User story'),
      ...extractMatches(seedContent, /title:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 'Learning section'),
      ...extractMatches(seedContent, /content:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 'Learning content')
    ];
  });

  const uniqueEntries = [...new Set(entries)]
    .map((entry) => entry.replace(/\\n|\s+/g, ' ').trim())
    .filter(Boolean);

  let length = 0;
  return uniqueEntries
    .map((entry) => entry.slice(0, 500))
    .filter((entry) => {
      if (length + entry.length > 14000) return false;
      length += entry.length;
      return true;
    })
    .join('\n');
}

function buildPrompt(technologies: string[], scenarioContext: string): string {
  return `You are a technical learning mentor. A learner selected this stack: ${technologies.join(', ')}.

Their upcoming scenarios contain the following trusted project context:
---
${scenarioContext}
---

Based on the scenario context, return only a valid JSON array containing 5 to 8 concise prerequisite topics the learner should study before starting. Focus on skills that the scenario actually expects, including stack fundamentals when relevant. Do not return task names, lesson titles, project-specific instructions, explanations, or any content not supported by the scenario context. Example: ["JavaScript async/await", "PostgreSQL query fundamentals"].`;
}

function parsePrerequisites(content: string): string[] | null {
  const jsonContent = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');

  try {
    const parsed = JSON.parse(jsonContent);
    if (!Array.isArray(parsed)) return null;

    const prerequisites = parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);

    return prerequisites.length > 0 ? prerequisites : null;
  } catch {
    return null;
  }
}

function buildScenarioFallback(scenarioContext: string): string[] {
  const context = scenarioContext.toLowerCase();
  const recommendations: Array<[RegExp, string]> = [
    [/react|component|jsx/, 'React components, props, and state'],
    [/next\.js|nextjs|server.side rendering|app router/, 'Next.js routing and rendering fundamentals'],
    [/express|rest api|api rout|http method/, 'HTTP, REST APIs, and Express routing'],
    [/nestjs|decorator|dependency injection/, 'TypeScript, NestJS modules, and dependency injection'],
    [/postgres|sql|database/, 'SQL, relational data modeling, and PostgreSQL basics'],
    [/mongodb|mongoose|document database/, 'MongoDB document modeling and query basics'],
    [/prisma|migration|schema/, 'Prisma schemas, migrations, and database clients'],
    [/environment variable|\.env|process\.env/, 'Environment variables and configuration management'],
    [/pnpm|npm|package\.json|package management/, 'Node.js, package managers, and project scripts'],
    [/auth|login|password|session|token/, 'Authentication and secure credential handling'],
    [/test|debug|error handling/, 'Debugging, testing, and error-handling basics']
  ];

  const matched = recommendations
    .filter(([pattern]) => pattern.test(context))
    .map(([, recommendation]) => recommendation);

  return [...new Set(matched)].slice(0, 8).length > 0
    ? [...new Set(matched)].slice(0, 8)
    : ['Core programming fundamentals', 'How to read and navigate an existing codebase'];
}
async function generateWithGemini(prompt: string): Promise<string[] | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 300,
          temperature: 0.3
        }
      })
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  return parsePrerequisites(data.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
}

async function generateWithOpenRouter(prompt: string): Promise<string[] | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://devsim.app',
      'X-Title': 'DevSim'
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-30b-a3b:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3
    })
  });

  if (!response.ok) return null;
  const data = await response.json();
  return parsePrerequisites(data.choices?.[0]?.message?.content ?? '');
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { selection }: { selection?: StackSelection } = await request.json();

    if (!selection) {
      return json({ success: false, error: 'No selection provided' }, { status: 400 });
    }

    const technologies = getSelectedTechnologies(selection);
    const scenarioStack = getScenarioStack(selection);
    if (!scenarioStack || technologies.length === 0) {
      return json({ success: false, error: 'No scenarios are available for this stack selection' }, { status: 400 });
    }

    const scenarioContext = extractScenarioContext(findSeedFiles(scenarioStack));
    if (!scenarioContext) {
      return json({ success: false, error: 'Scenario learning content is unavailable for this stack' }, { status: 503 });
    }

    const prompt = buildPrompt(technologies, scenarioContext);
    const prerequisites =
      (await generateWithGemini(prompt)) ??
      (await generateWithOpenRouter(prompt)) ??
      buildScenarioFallback(scenarioContext);

    return json({
      success: true,
      prerequisites: [
        {
          category: 'AI GUIDE',
          techName: 'What to learn first',
          techIcon: '🧭',
          prerequisites
        }
      ]
    });
  } catch (error) {
    console.error('Prerequisites generation error:', error);
    return json(
      { success: false, error: 'An unexpected error occurred while generating prerequisites' },
      { status: 500 }
    );
  }
};