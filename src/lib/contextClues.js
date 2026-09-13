import { shuffle, misspell } from "./random.js";
import { CONTEXT_PASSAGES } from "../data/contextPassages.js";

export const FREE_DAILY_ATTEMPTS = 3;
export const TOKENS_PER_BONUS = 3;
export const POINTS_PER_CORRECT = 15;

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Free-plan attempts reset at midnight (a new local date), tracked as
// { date, count } on the child. Premium ignores this entirely.
export function attemptsRemaining(contextDaily) {
  const rec = contextDaily || { date: "", count: 0 };
  const used = rec.date === todayKey() ? rec.count : 0;
  return Math.max(0, FREE_DAILY_ATTEMPTS - used);
}

export function pickContextPassage(excludeIndex) {
  const pool = CONTEXT_PASSAGES.map((p, i) => i).filter((i) => i !== excludeIndex);
  const idx = pool[Math.floor(Math.random() * pool.length)] ?? 0;
  return { index: idx, passage: CONTEXT_PASSAGES[idx] };
}

export function buildContextQuestion(passage) {
  const distractors = new Set();
  while (distractors.size < 2) {
    const d = misspell(passage.target);
    if (d !== passage.target && d !== passage.shown) distractors.add(d);
  }
  const options = shuffle([
    { label: passage.target, isAnswer: true },
    { label: passage.shown, isAnswer: false },
    ...Array.from(distractors).map((label) => ({ label, isAnswer: false })),
  ]);
  return { prompt: "Which spelling of the highlighted word is correct?", options };
}
