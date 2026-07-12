import fs from 'node:fs/promises';
import path from 'node:path';
import type { StackSelection, TechCategory, TechOption } from '$types';
import { TECH_REGISTRY, FOLDER_TO_TECH, MULTI_WORD_TECHS, getTechMeta, type TechMeta } from './tech-registry';

const STACKS_DIR = path.resolve('submodules/projects/tech-stacks');

const CATEGORY_ORDER: Array<TechMeta['category']> = ['frontend', 'backend', 'database', 'service'];

const CATEGORY_META: Record<string, { name: string; description: string; icon: string }> = {
  frontend: { name: 'Frontend', description: 'Choose your UI framework', icon: '🎨' },
  backend: { name: 'Backend', description: 'Choose your server framework', icon: '⚙️' },
  database: { name: 'Database', description: 'Choose your data storage', icon: '🗄️' },
  service: { name: 'Services', description: 'Choose additional tools', icon: '🔧' },
};

function parseStackDir(dirName: string): { techIds: Record<string, string | null>; id: string; name: string } | null {
  let normalized = dirName;
  for (const [multi, replacement] of Object.entries(MULTI_WORD_TECHS)) {
    normalized = normalized.replace(multi, replacement);
  }

  const parts = normalized.split('-');
  const techIds: Record<string, string | null> = { frontend: null, backend: null, database: null, service: null };
  const assigned = new Set<string>();

  for (const part of parts) {
    const resolvedId = FOLDER_TO_TECH[part] ?? null;
    if (!resolvedId) continue;
    const meta = getTechMeta(resolvedId);
    if (!meta) continue;
    const cat = meta.category;
    if (assigned.has(cat)) continue;
    techIds[cat] = resolvedId;
    assigned.add(cat);
  }

  const hasAny = Object.values(techIds).some(Boolean);
  if (!hasAny) return null;

  const stackId = dirName;
  const nameParts = Object.values(techIds).filter(Boolean).map(id => getTechMeta(id!)?.name ?? id!);
  const name = nameParts.join(' + ') || stackId;

  return { techIds, id: stackId, name };
}

function techMetaToOption(meta: TechMeta): TechOption {
  return {
    id: meta.id,
    name: meta.name,
    icon: meta.icon,
    description: meta.description,
    color: meta.color,
    finalProjectDescription: meta.finalProjectDescription,
  };
}

function classifyStack(techIds: Record<string, string | null>): 'fullstack' | 'backend' | 'frontend' {
  if (techIds.frontend && techIds.backend) return 'fullstack';
  if (techIds.backend) return 'backend';
  return 'frontend';
}

export async function scanStacks(): Promise<{
  techCategories: TechCategory[];
  popularCombos: StackSelection[];
}> {
  let entries: string[];
  try {
    entries = await fs.readdir(STACKS_DIR);
  } catch {
    return { techCategories: [], popularCombos: [] };
  }

  const techIdsFromDirs = new Set<string>();
  const combos: StackSelection[] = [];

  for (const entry of entries) {
    const fullPath = path.join(STACKS_DIR, entry);
    let stat;
    try { stat = await fs.stat(fullPath); } catch { continue; }
    if (!stat.isDirectory()) continue;

    const parsed = parseStackDir(entry);
    if (!parsed) continue;

    for (const id of Object.values(parsed.techIds)) {
      if (id) techIdsFromDirs.add(id);
    }

    combos.push({
      id: parsed.id,
      name: parsed.name,
      stackType: classifyStack(parsed.techIds),
      frontend: parsed.techIds.frontend,
      backend: parsed.techIds.backend,
      database: parsed.techIds.database,
      services: parsed.techIds.service,
    });
  }

  const techCategories: TechCategory[] = CATEGORY_ORDER.map(catKey => {
    const catMeta = CATEGORY_META[catKey];
    const options = Object.values(TECH_REGISTRY)
      .filter(m => m.category === catKey && techIdsFromDirs.has(m.id))
      .map(techMetaToOption);

    return {
      id: catKey,
      name: catMeta.name,
      description: catMeta.description,
      icon: catMeta.icon,
      options,
    };
  }).filter(c => c.options.length > 0);

  return { techCategories, popularCombos: combos };
}
