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
  const eligible = pool.filter((e) => e.t <= tierMax);
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
