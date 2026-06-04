export function xpRequiredForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function computeLevel(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
} {
  let level = 1;
  let accumulated = 0;
  while (level < 200) {
    const needed = xpRequiredForLevel(level);
    if (accumulated + needed > totalXp) {
      return {
        level,
        xpIntoLevel: totalXp - accumulated,
        xpForLevel: needed,
      };
    }
    accumulated += needed;
    level++;
  }
  const xpForLevel = xpRequiredForLevel(level);
  return { level, xpIntoLevel: totalXp - accumulated, xpForLevel };
}
