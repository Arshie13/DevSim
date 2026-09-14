import { clamp } from "$components/tutorial/tutorialUtils";
import type { TutorialStep } from "$components/tutorial/tutorialTypes";

export interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PlacementResult {
  arrowDir: "top" | "bottom" | "left" | "right";
  arrowOffset: string;
  calloutTop: number;
  calloutLeft: number;
  spotlight: SpotlightRect;
}

const CALLOUT_W = 440;
const CALLOUT_H = 360;
const SPOT_PAD = 8;
const GAP = 14;
const EDGE_MARGIN = 12;
const NO_OVERLAP_GAP = 12;

export const MODAL_SPOTLIGHT_TARGETS = new Set([
  "submit-sprint-modal",
  "test-selection-modal",
  "test-result-modal",
]);

export function getFallbackPlacement(): Omit<PlacementResult, "spotlight"> {
  return {
    arrowDir: "left",
    arrowOffset: "24px",
    calloutTop: EDGE_MARGIN,
    calloutLeft: Math.max(EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN),
  };
}

/**
 * Pure function: computes callout position and spotlight rect from a DOM rect + step.
 * Returns a PlacementResult — caller applies values to component state.
 */
function rectsOverlap(a: { left: number; top: number; right: number; bottom: number }, b: { left: number; top: number; right: number; bottom: number }, gap = 0) {
  return a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;
}

function isPanelOverSpotlight(calloutLeft: number, calloutTop: number, spotlight: SpotlightRect): boolean {
  const calloutRect = {
    left: calloutLeft,
    top: calloutTop,
    right: calloutLeft + CALLOUT_W,
    bottom: calloutTop + CALLOUT_H,
  };
  const spotRect = {
    left: spotlight.left,
    top: spotlight.top,
    right: spotlight.left + spotlight.width,
    bottom: spotlight.top + spotlight.height,
  };

  return rectsOverlap(calloutRect, spotRect, NO_OVERLAP_GAP);
}

function choosePlacement(candidates: Array<PlacementResult>) {
  const good = candidates.filter((candidate) => !isPanelOverSpotlight(candidate.calloutLeft, candidate.calloutTop, candidate.spotlight));
  if (good.length) {
    good.sort((a, b) => {
      const aDist = Math.abs(a.calloutLeft - a.spotlight.left) + Math.abs(a.calloutTop - a.spotlight.top);
      const bDist = Math.abs(b.calloutLeft - b.spotlight.left) + Math.abs(b.calloutTop - b.spotlight.top);
      return aDist - bDist;
    });
    return good[0];
  }

  return candidates[0];
}

export function resolvePlacement(
  r: DOMRect,
  step: TutorialStep,
  codeEditStepId: string,
): PlacementResult {
  const spaceBelow = window.innerHeight - r.bottom - SPOT_PAD;
  const spaceAbove = r.top - SPOT_PAD;
  const spaceRight = window.innerWidth - r.right - SPOT_PAD;
  const spaceLeft = r.left - SPOT_PAD;

  const spotL = r.left - SPOT_PAD;
  const spotT = r.top - SPOT_PAD;
  const spotW = r.width + SPOT_PAD * 2;
  const spotH = r.height + SPOT_PAD * 2;
  const spotCX = spotL + spotW / 2;
  const spotCY = spotT + spotH / 2;
  const spotlight: SpotlightRect = { top: spotT, left: spotL, width: spotW, height: spotH };

  const makeBelow = (): PlacementResult => {
    const ct = clamp(spotT + spotH + GAP, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
    const cl = clamp(spotCX - CALLOUT_W / 2, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
    return { arrowDir: "top", arrowOffset: `${clamp(spotCX - cl, 20, CALLOUT_W - 20)}px`, calloutTop: ct, calloutLeft: cl, spotlight };
  };
  const makeAbove = (): PlacementResult => {
    const ct = clamp(spotT - CALLOUT_H - GAP, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
    const cl = clamp(spotCX - CALLOUT_W / 2, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
    return { arrowDir: "bottom", arrowOffset: `${clamp(spotCX - cl, 20, CALLOUT_W - 20)}px`, calloutTop: ct, calloutLeft: cl, spotlight };
  };
  const makeRight = (): PlacementResult => {
    const cl = clamp(spotL + spotW + GAP, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
    const ct = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
    return { arrowDir: "left", arrowOffset: `${clamp(spotCY - ct, 20, CALLOUT_H - 20)}px`, calloutTop: ct, calloutLeft: cl, spotlight };
  };
  const makeLeft = (): PlacementResult => {
    const cl = clamp(spotL - CALLOUT_W - GAP, EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
    const ct = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
    return { arrowDir: "right", arrowOffset: `${clamp(spotCY - ct, 20, CALLOUT_H - 20)}px`, calloutTop: ct, calloutLeft: cl, spotlight };
  };

  const candidates: Array<PlacementResult> = [
    makeRight(),
    makeLeft(),
    makeBelow(),
    makeAbove(),
  ];

  const isEditorTargetStep = step.target === "editor-workspace" || step.id === codeEditStepId;

  const mustPreferRight = (
    step.id === "read-readme" ||
    step.id === "search-works-confirm" ||
    isEditorTargetStep ||
    step.id === "task-two-schema-edit" ||
    step.id === "terminal-stop-server" ||
    step.id === "shadcn-intro" ||
    step.id === "shadcn-init-wait" ||
    step.id === "shadcn-add" ||
    step.id === "shadcn-add-wait" ||
    step.requireCommand ||
    (step.spotlightTarget != null && MODAL_SPOTLIGHT_TARGETS.has(step.spotlightTarget))
  );

  if (mustPreferRight) {
    const preferred = [makeRight(), makeBelow(), makeAbove(), makeLeft()];
    return choosePlacement(preferred);
  }

  const preferSide = step.preferSide ?? "auto";
  if (preferSide === "right") return choosePlacement([makeRight(), makeBelow(), makeAbove(), makeLeft()]);
  if (preferSide === "left") return choosePlacement([makeLeft(), makeRight(), makeBelow(), makeAbove()]);
  if (preferSide === "top") return choosePlacement([makeBelow(), makeAbove(), makeRight(), makeLeft()]);
  if (preferSide === "bottom") return choosePlacement([makeAbove(), makeBelow(), makeRight(), makeLeft()]);

  const scored = [
    [spaceBelow, makeBelow],
    [spaceAbove, makeAbove],
    [spaceRight, makeRight],
    [spaceLeft, makeLeft],
  ]
    .sort((a, b) => b[0] - a[0])
    .map(([, getCandidate]) => getCandidate());

  return choosePlacement(scored);
}
