// Shared scoring engine — every game in the Academy runs answers through
// this so "cast faster, earn more" behaves identically everywhere.
//
// Total = base (by difficulty tier) + speed bonus (the closer to instant,
// the bigger — up to +75% of base) + combo bonus (rewards a streak of
// *quick* correct answers, not just correct ones).
const TIER_BASE = { 1: 10, 2: 16, 3: 24 };
const QUICK_THRESHOLD_RATIO = 0.4; // answering inside the first 40% of the time limit counts as "quick"

export function scoreAnswer({ tier, correct, timeTakenMs, timeLimitMs, quickStreak }) {
  const base = TIER_BASE[tier] || 10;
  if (!correct) return { base: 0, speedBonus: 0, comboBonus: 0, total: 0, isQuick: false };

  const limit = timeLimitMs || 8000;
  const clampedTime = Math.max(0, Math.min(limit, timeTakenMs));
  const speedRatio = Math.max(0, (limit - clampedTime) / limit);
  const speedBonus = Math.round(base * speedRatio * 0.75);
  const isQuick = clampedTime <= limit * QUICK_THRESHOLD_RATIO;
  const comboBonus = isQuick ? Math.min(30, (quickStreak + 1) * 4) : 0;
  const total = base + speedBonus + comboBonus;
  return { base, speedBonus, comboBonus, total, isQuick };
}

export function tierBase(tier) { return TIER_BASE[tier] || 10; }
