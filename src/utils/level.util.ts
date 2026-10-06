const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export function calculateLevel(totalXp: number): number {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (totalXp >= XP_THRESHOLDS[i]!) level = i + 1;
  }
  return level;
}