import { pickWeighted, pickWeightedExactTier, shuffle, misspell } from "./random.js";
import { FIND_MISTAKE_TEMPLATES } from "../data/examTemplates.js";

// "Which of these is spelt incorrectly?" — the classic 5-option format.
// `exact: true` picks a word at exactly `tier` (used by Mystery Challenge's
// fixed per-difficulty tier mix) instead of "at most this tier" (the Mock
// Exam's usual ramping ceiling).
export function buildOddOneOut(pool, stats, tier, exact = false) {
  const word = exact ? pickWeightedExactTier(pool, stats, tier, (e) => e.w) : pickWeighted(pool, stats, tier, (e) => e.w);
  const distractors = shuffle(pool.filter((e) => e.w !== word.w && e.t <= tier)).slice(0, 4);
  const options = shuffle([
    { label: misspell(word.w), isAnswer: true },
    ...distractors.map((d) => ({ label: d.w, isAnswer: false })),
  ]);
  return {
    type: "oddOneOut",
    tier: word.t,
    prompt: "Which of the following words is spelt incorrectly?",
    options,
    statsKey: "sp:" + word.w,
    targetWord: word.w,
    hook: word.hook,
  };
}

// "Find the Spelling Mistake" — a sentence in 4 bracketed sections, one
// of which may hide a misspelling (or none: answer N).
function buildFindMistake(pool, stats, tierMax) {
  const word = pickWeighted(pool, stats, tierMax, (e) => e.w);
  const template = FIND_MISTAKE_TEMPLATES[Math.floor(Math.random() * FIND_MISTAKE_TEMPLATES.length)];
  const slotIndex = template.findIndex((p) => p === null);
  const hasMistake = Math.random() < 0.7; // ~30% of questions are genuinely "No mistake"
  const shown = hasMistake ? misspell(word.w) : word.w;
  const segments = template.map((p, i) => (i === slotIndex ? shown : p));
  return {
    type: "findMistake",
    tier: word.t,
    prompt: "Read the sentence below. Which section contains a spelling mistake?",
    segments,
    correctIndex: hasMistake ? slotIndex : -1, // -1 = "N, no mistake"
    statsKey: "sp:" + word.w,
    targetWord: word.w,
    hook: word.hook,
  };
}

export function buildExam(pool, stats, { count = 25, tierMax = 3 } = {}) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const builder = i % 2 === 0 ? buildOddOneOut : buildFindMistake;
    questions.push(builder(pool, stats, tierMax));
  }
  return questions;
}
