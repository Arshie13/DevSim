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

  const pinRight = (): PlacementResult => {
    const calloutLeft = Math.max(EDGE_MARGIN, window.innerWidth - CALLOUT_W - EDGE_MARGIN);
    const calloutTop = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
    return { arrowDir: "left", arrowOffset: `${clamp(spotCY - calloutTop, 20, CALLOUT_H - 20)}px`, calloutTop, calloutLeft, spotlight };
  };

  if (
    step.id === "read-readme" ||
    step.id === "search-works-confirm" ||
    step.id === codeEditStepId ||
    step.id === "shadcn-intro" ||
    step.id === "shadcn-init-wait" ||
    step.id === "shadcn-add" ||
    step.id === "shadcn-add-wait" ||
    step.requireCommand ||
    (step.spotlightTarget != null && MODAL_SPOTLIGHT_TARGETS.has(step.spotlightTarget))
  ) {
    return pinRight();
  }

  const preferSide = step.preferSide ?? "auto";

  if (preferSide === "right" && spaceRight >= CALLOUT_W + GAP) {
    const calloutLeft = window.innerWidth - CALLOUT_W - EDGE_MARGIN;
    const calloutTop = clamp(spotCY - CALLOUT_H / 2, EDGE_MARGIN, window.innerHeight - CALLOUT_H - EDGE_MARGIN);
    return { arrowDir: "left", arrowOffset: `${clamp(spotCY - calloutTop, 20, CALLOUT_H - 20)}px`, calloutTop, calloutLeft, spotlight };
  }

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

  if (preferSide === "top" && spaceBelow >= CALLOUT_H + GAP) return makeBelow();
  if (preferSide === "bottom" && spaceAbove >= CALLOUT_H + GAP) return makeAbove();
  if (preferSide === "left" && spaceRight >= CALLOUT_W + GAP) return makeRight();
  if (preferSide === "right" && spaceLeft >= CALLOUT_W + GAP) return makeLeft();

  const scores: Array<[number, () => PlacementResult]> = [
    [spaceBelow, makeBelow],
    [spaceAbove, makeAbove],
    [spaceRight, makeRight],
    [spaceLeft, makeLeft],
  ];
  scores.sort((a, b) => b[0] - a[0]);
  return scores[0][1]();
}
