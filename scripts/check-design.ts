#!/usr/bin/env tsx

/**
 * Design-consistency gate for DevSim.
 *
 * Enforces docs/ui_ux.md §10. Two classes of rule:
 *
 *   1. Hard rules  - must be zero. Fail on any occurrence.
 *   2. Ratchet     - pre-existing debt, counted against scripts/design-baseline.json.
 *                    Fails only if a count INCREASES. Lower the baseline as you
 *                    clean files up; never raise it.
 *
 * Usage:
 *   pnpm check:design            Verify against the baseline.
 *   pnpm check:design --update   Rewrite the baseline from current counts.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import type { Dirent } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const BASELINE_PATH = join(ROOT, 'scripts', 'design-baseline.json');

const SKIP_DIRS = new Set(['node_modules', '.svelte-kit', 'build', 'dist', '.git', 'coverage']);

interface Rule {
  id: string;
  exts: string[];
  pattern: RegExp;
  hint: string;
}

/** Zero-tolerance rules. These are fully clean today. */
const HARD_RULES: Rule[] = [
  {
    id: 'retired-font-families',
    exts: ['.svelte', '.ts', '.css'],
    pattern: /\b(Orbitron|Share Tech Mono|Rajdhani|Chakra Petch|Exo 2)\b/g,
    hint: 'use var(--font-heading) / var(--font-body) / var(--font-mono)',
  },
  {
    id: 'quoted-font-family',
    exts: ['.svelte'],
    pattern: /font-family:\s*['"]/g,
    hint: 'use var(--font-*) or the .font-heading / .font-label / .font-body classes',
  },
  {
    id: 'misspelled-font-token',
    exts: ['.svelte', '.ts', '.css'],
    pattern: /var\(--font-head[,\s)]/g,
    hint: 'did you mean var(--font-heading)?',
  },
  {
    id: 'undefined-bg-token',
    exts: ['.svelte', '.ts', '.css'],
    pattern: /var\(--bg-primary\b/g,
    hint: 'use var(--bg) - --bg-primary is not defined in app.css',
  },
];

/** Ratcheted rules. Counted per file set, compared against the baseline. */
const RATCHET_RULES: Rule[] = [
  {
    id: 'rawHex',
    exts: ['.svelte', '.ts'],
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
    hint: 'use var(--token) or rgb(var(--token-rgb) / alpha)',
  },
  {
    id: 'rgbaLiterals',
    exts: ['.svelte', '.ts'],
    pattern: /rgba?\(/g,
    hint: 'use rgb(var(--token-rgb) / alpha)',
  },
  {
    id: 'fontFamilyDecls',
    exts: ['.svelte'],
    pattern: /font-family/g,
    hint: 'prefer the .font-heading / .font-label / .font-body utility classes',
  },
];

type Baseline = Record<string, number>;

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  let entries: Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, exts, out);
    } else if (exts.includes(extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function countRule(rule: Rule): { total: number; files: string[] } {
  const files = walk(SRC, rule.exts);
  const hits: string[] = [];
  let total = 0;

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const matches = source.match(new RegExp(rule.pattern.source, 'g'));
    if (matches && matches.length > 0) {
      total += matches.length;
      hits.push(relative(ROOT, file).replace(/\\/g, '/'));
    }
  }

  return { total, files: hits };
}

function readBaseline(): Baseline {
  if (!existsSync(BASELINE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) as Baseline;
  } catch {
    return {};
  }
}

function main(): void {
  const update = process.argv.slice(2).includes('--update');
  let failed = false;

  const hardCounts = new Map<string, { total: number; files: string[] }>();
  const ratchetCounts = new Map<string, { total: number; files: string[] }>();

  for (const rule of HARD_RULES) hardCounts.set(rule.id, countRule(rule));
  for (const rule of RATCHET_RULES) ratchetCounts.set(rule.id, countRule(rule));

  if (update) {
    const next: Baseline = {};
    for (const [id, result] of ratchetCounts) next[id] = result.total;
    writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    console.log(`Updated ${relative(ROOT, BASELINE_PATH).replace(/\\/g, '/')}`);
    for (const [id, result] of ratchetCounts) {
      console.log(`  ${id}: ${result.total}`);
    }
    return;
  }

  console.log('Design consistency check  (docs/ui_ux.md)');

  console.log('\nHard rules - must be zero');
  for (const rule of HARD_RULES) {
    const result = hardCounts.get(rule.id)!;
    if (result.total === 0) {
      console.log(`  PASS  ${rule.id}`);
    } else {
      failed = true;
      console.log(`  FAIL  ${rule.id}  ${result.total} occurrence(s)`);
      console.log(`        ${rule.hint}`);
      for (const file of result.files.slice(0, 10)) console.log(`        ${file}`);
      if (result.files.length > 10) {
        console.log(`        ...and ${result.files.length - 10} more file(s)`);
      }
    }
  }

  const baseline = readBaseline();

  if (Object.keys(baseline).length === 0) {
    failed = true;
    console.log('\nRatchet - no baseline found');
    console.log(`  FAIL  run "pnpm check:design --update" to seed ${relative(ROOT, BASELINE_PATH)}`);
  } else {
    console.log('\nRatchet - must not increase');
    for (const rule of RATCHET_RULES) {
      const result = ratchetCounts.get(rule.id)!;
      const limit = baseline[rule.id];

      if (limit === undefined) {
        failed = true;
        console.log(`  FAIL  ${rule.id}  ${result.total} (not in baseline)`);
        continue;
      }

      if (result.total > limit) {
        failed = true;
        console.log(`  FAIL  ${rule.id}  ${result.total} > ${limit}  (+${result.total - limit})`);
        console.log(`        ${rule.hint}`);
        for (const file of result.files.slice(0, 10)) console.log(`        ${file}`);
      } else if (result.total < limit) {
        console.log(
          `  NOTE  ${rule.id}  ${result.total} < ${limit}  (${limit - result.total} removed - lower the baseline)`
        );
      } else {
        console.log(`  PASS  ${rule.id}  ${result.total}`);
      }
    }
  }

  console.log(failed ? '\nDesign check FAILED' : '\nDesign check passed');
  process.exitCode = failed ? 1 : 0;
}

main();
