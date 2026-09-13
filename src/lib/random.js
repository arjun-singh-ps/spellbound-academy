export function shuffle(arr) {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// Weighted pick that favours words/items the learner has answered wrong
// more, and hasn't yet "mastered" (tracked via stats[key].box, 0-5,
// a lightweight spaced-repetition signal).
export function pickWeighted(pool, stats, tierMax, keyOf) {
  return pickWeightedByFilter(pool, stats, (e) => e.t <= tierMax, keyOf);
}

// Same weighting logic, but for callers (Mystery Challenge) that need an
// exact tier rather than "at most this tier" — e.g. "exactly 3 Easy, 4
// Tricky, 1 Fiendish" instead of a single difficulty ceiling.
export function pickWeightedExactTier(pool, stats, tier, keyOf) {
  return pickWeightedByFilter(pool, stats, (e) => e.t === tier, keyOf);
}

function pickWeightedByFilter(pool, stats, filterFn, keyOf) {
  const eligible = pool.filter(filterFn);
  const src = eligible.length ? eligible : pool;
  const weighted = [];
  src.forEach((entry) => {
    const s = stats[keyOf(entry)] || { box: 0, right: 0, wrong: 0 };
    const weight = Math.max(1, 6 - s.box) * (1 + s.wrong * 0.5);
    for (let i = 0; i < weight; i++) weighted.push(entry);
  });
  return weighted[Math.floor(Math.random() * weighted.length)] || src[0];
}

const SWAPS = [
  [/ie/, "ei"], [/ei/, "ie"], [/cc/, "c"], [/mm/, "m"], [/ss/, "s"],
  [/pp/, "p"], [/rr/, "r"], [/ll/, "l"], [/tt/, "t"],
  [/ence$/, "ance"], [/ant$/, "ent"], [/able$/, "ible"], [/our/, "or"],
];
export function misspell(word) {
  const w = word.toLowerCase();
  for (const [re, rep] of shuffle(SWAPS)) if (re.test(w)) return w.replace(re, rep);
  const i = 1 + Math.floor(Math.random() * (w.length - 2));
  return w.slice(0, i) + w.slice(i + 1);
}

export function speak(word) {
  try {
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85;
    u.lang = "en-GB";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) { /* speech synthesis unavailable — silent no-op */ }
}
