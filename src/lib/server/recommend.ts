import type { StackSelection, TechCategory } from '$types';
import type { scanStacks } from '$lib/server/stacks/stack-scanner';
import {
  FOLDER_TO_TECH,
  MULTI_WORD_TECHS,
  TECH_REGISTRY,
  TECH_TO_FOLDER
} from '$lib/server/stacks/tech-registry';
import { STACK_ACRONYMS, parseStackName } from '$lib/utils/stacks';
import { resolveStackName } from '$lib/utils/scenario-mapping';

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_AFTER_DAYS = 7;
const PROGRESSION_REPEAT_PENALTY = 6;
const STARTER_STACK_ID = 'react-express-postgres-prisma';

export type StackRecommendation = {
  kind: 'starter' | 'progression' | 'continue';
  stackId: string;
  stackLabel: string;
  stackName: string;
  techs: string[];
  emoji: string;
  reason: string;
  ctaHref: string;
};

export type RecommendationCatalog = Pick<
  Awaited<ReturnType<typeof scanStacks>>,
  'popularCombos' | 'techCategories'
>;

export type RecommendationContainer = {
  id: string;
  level: number;
  stackName?: string | null;
  scenario?: { id: string } | null;
  updated_at?: Date | null;
  updatedAt?: Date | null;
};

type CatalogCombo = StackSelection & { id: string };

type NarrowedCatalog = {
  popularCombos: CatalogCombo[];
  techCategories: TechCategory[];
};

export function stackTechIds(stackName: string): string[] {
  let normalized = stackName;
  for (const [multi, replacement] of Object.entries(MULTI_WORD_TECHS)) {
    normalized = normalized.replace(multi, replacement);
  }
  const ids: string[] = [];
  for (const part of normalized.split('-')) {
    const resolved = FOLDER_TO_TECH[part.trim().toLowerCase()];
    if (resolved && !ids.includes(resolved)) ids.push(resolved);
  }
  return ids;
}

function folderSlug(stackName: string): string {
  return stackName
    .trim()
    .toLowerCase()
    .split('-')
    .map(part => TECH_TO_FOLDER[part] ?? part)
    .join('-');
}

function containerStackName(container: RecommendationContainer): string | null {
  if (container.stackName && container.stackName.trim().length > 0) return container.stackName;
  return resolveStackName(container.scenario?.id ?? '') ?? null;
}

function containerTimestamp(container: RecommendationContainer): Date | null {
  const ts = container.updated_at ?? container.updatedAt ?? null;
  return ts instanceof Date ? ts : null;
}

function techDisplayNames(ids: string[]): string[] {
  return ids.map(id => TECH_REGISTRY[id]?.name ?? id);
}

function stackLabels(stackName: string): { label: string; name: string } {
  const name = parseStackName(stackName);
  const idSet = new Set(stackTechIds(stackName));
  for (const acronym of STACK_ACRONYMS) {
    if (acronym.test(idSet)) return { label: acronym.label, name };
  }
  return { label: name, name };
}

function stackEmoji(techIds: string[], techCategories: TechCategory[]): string {
  for (const id of techIds) {
    for (const category of techCategories) {
      const option = category.options.find(o => o.id === id);
      if (option) return option.icon;
    }
  }
  return '';
}

function comboTechIds(combo: CatalogCombo): string[] {
  const ids: string[] = [];
  for (const id of [combo.frontend, combo.backend, combo.database, combo.services]) {
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

function comboCtaHref(combo: CatalogCombo): string {
  const selection: StackSelection = {
    frontend: combo.frontend,
    backend: combo.backend,
    database: combo.database,
    services: combo.services,
    name: combo.name,
    stackType: combo.stackType
  };
  return `/scenario?stack=${combo.id}&selection=${encodeURIComponent(JSON.stringify(selection))}`;
}

function collectActiveStackFolders(activeContainers: RecommendationContainer[]): Set<string> {
  const folders = new Set<string>();
  for (const container of activeContainers) {
    const stack = containerStackName(container);
    if (stack) folders.add(folderSlug(stack));
  }
  return folders;
}

function collectTouchedTechIds(
  activeContainers: RecommendationContainer[],
  archivedContainers: RecommendationContainer[]
): Set<string> {
  const touched = new Set<string>();
  for (const container of [...activeContainers, ...archivedContainers]) {
    const stack = containerStackName(container);
    if (!stack) continue;
    for (const id of stackTechIds(stack)) touched.add(id);
  }
  return touched;
}

function continueRecommendation(
  activeContainers: RecommendationContainer[],
  techCategories: TechCategory[]
): StackRecommendation | null {
  let freshest: RecommendationContainer | null = null;
  let freshestMs = Number.NEGATIVE_INFINITY;
  for (const container of activeContainers) {
    const ts = containerTimestamp(container);
    if (!ts) continue;
    const ms = ts.getTime();
    if (ms > freshestMs) {
      freshest = container;
      freshestMs = ms;
    }
  }
  if (!freshest) return null;
  const staleMs = Date.now() - freshestMs;
  if (staleMs <= STALE_AFTER_DAYS * DAY_MS) return null;
  const days = Math.floor(staleMs / DAY_MS);
  const stack = containerStackName(freshest);
  const techIds = stack ? stackTechIds(stack) : [];
  const labels = stack ? stackLabels(stack) : null;
  return {
    kind: 'continue',
    stackId: stack ?? '',
    stackLabel: labels?.label ?? 'your workspace',
    stackName: labels?.name ?? 'your workspace',
    techs: techDisplayNames(techIds),
    emoji: stackEmoji(techIds, techCategories),
    reason: `It's been ${days} days since you touched ${labels?.label ?? 'your workspace'}. Pick it back up — your Level ${freshest.level} workspace is waiting.`,
    ctaHref: `/workspace/${freshest.id}`
  };
}

function progressionRecommendation(
  archivedContainers: RecommendationContainer[],
  activeContainers: RecommendationContainer[],
  activeStackFolders: Set<string>,
  touchedIds: Set<string>,
  catalog: NarrowedCatalog
): StackRecommendation | null {
  const anchoredOnArchived = archivedContainers.length > 0;
  const anchorPool = anchoredOnArchived ? archivedContainers : activeContainers;
  let lastCompleted: RecommendationContainer | null = null;
  let lastMs = Number.NEGATIVE_INFINITY;
  for (const container of anchorPool) {
    const ts = containerTimestamp(container);
    const ms = ts ? ts.getTime() : 0;
    if (!lastCompleted || ms > lastMs) {
      lastCompleted = container;
      lastMs = ms;
    }
  }
  if (!lastCompleted) return null;
  const lastStack = containerStackName(lastCompleted);
  const lastFolder = lastStack ? folderSlug(lastStack) : null;
  const anchorFallbackLabel = anchoredOnArchived ? 'your last stack' : 'your active stack';
  const lastLabel = lastStack ? stackLabels(lastStack).label : anchorFallbackLabel;

  let best: { combo: CatalogCombo; ids: string[]; overlap: string[]; fresh: string[]; score: number } | null = null;
  for (const combo of catalog.popularCombos) {
    if (activeStackFolders.has(folderSlug(combo.id))) continue;
    const ids = comboTechIds(combo);
    const overlap = ids.filter(id => touchedIds.has(id));
    const fresh = ids.filter(id => !touchedIds.has(id));
    const penalty = lastFolder && folderSlug(combo.id) === lastFolder ? PROGRESSION_REPEAT_PENALTY : 0;
    const score = 2 * overlap.length + fresh.length - penalty;
    if (!best || score > best.score || (score === best.score && combo.id < best.combo.id)) {
      best = { combo, ids, overlap, fresh, score };
    }
  }
  if (!best) return null;

  const techs = techDisplayNames(best.ids);
  const labels = stackLabels(best.combo.id);
  const overlapTechs = techDisplayNames(best.overlap).join(', ');
  const freshTechs = techDisplayNames(best.fresh).join(', ');
  let reason: string;
  if (anchoredOnArchived) {
    if (best.overlap.length > 0 && best.fresh.length > 0) {
      reason = `You crushed ${lastLabel}. ${labels.label} builds on your ${overlapTechs} skills and adds ${freshTechs}.`;
    } else if (best.overlap.length > 0) {
      reason = `You crushed ${lastLabel}. ${labels.label} builds on your ${overlapTechs} skills.`;
    } else {
      reason = `You crushed ${lastLabel}. ${labels.label} opens a new track with ${techs.join(', ')}.`;
    }
  } else if (best.overlap.length > 0 && best.fresh.length > 0) {
    reason = `${lastLabel} is underway — ${labels.label} is a solid next step, building on your ${overlapTechs} skills and adding ${freshTechs}.`;
  } else if (best.overlap.length > 0) {
    reason = `${lastLabel} is underway — ${labels.label} is a solid next step, building on your ${overlapTechs} skills.`;
  } else {
    reason = `${lastLabel} is underway — ${labels.label} opens a new track with ${techs.join(', ')}.`;
  }
  return {
    kind: 'progression',
    stackId: best.combo.id,
    stackLabel: labels.label,
    stackName: labels.name,
    techs,
    emoji: stackEmoji(best.ids, catalog.techCategories),
    reason,
    ctaHref: comboCtaHref(best.combo)
  };
}

function starterRecommendation(catalog: NarrowedCatalog): StackRecommendation {
  const combo = catalog.popularCombos.find(c => c.id === STARTER_STACK_ID) ?? catalog.popularCombos[0];
  const ids = comboTechIds(combo);
  const techs = techDisplayNames(ids);
  const labels = stackLabels(combo.id);
  return {
    kind: 'starter',
    stackId: combo.id,
    stackLabel: labels.label,
    stackName: labels.name,
    techs,
    emoji: stackEmoji(ids, catalog.techCategories),
    reason: `New to DevSim? ${labels.label} is the classic first full-stack — ${techs.join(', ')}. Start here.`,
    ctaHref: comboCtaHref(combo)
  };
}

export function getStackRecommendation(input: {
  activeContainers: RecommendationContainer[];
  archivedContainers: RecommendationContainer[];
  catalog: RecommendationCatalog;
}): StackRecommendation | null {
  const { activeContainers, archivedContainers, catalog } = input;
  const combos: CatalogCombo[] = catalog.popularCombos.filter(
    (combo): combo is CatalogCombo => typeof combo.id === 'string' && combo.id.length > 0
  );
  if (combos.length === 0) return null;

  const narrowedCatalog: NarrowedCatalog = { popularCombos: combos, techCategories: catalog.techCategories };

  const continueRec = continueRecommendation(activeContainers, narrowedCatalog.techCategories);
  if (continueRec) return continueRec;

  const activeStackFolders = collectActiveStackFolders(activeContainers);
  const touchedIds = collectTouchedTechIds(activeContainers, archivedContainers);

  if (archivedContainers.length > 0 || activeContainers.length > 0) {
    const progression = progressionRecommendation(
      archivedContainers,
      activeContainers,
      activeStackFolders,
      touchedIds,
      narrowedCatalog
    );
    if (progression) return progression;
  }

  if (activeContainers.length === 0) {
    return starterRecommendation(narrowedCatalog);
  }

  return null;
}
