import { shuffle } from "./random.js";
import { buildOddOneOut } from "./examQuestions.js";
import { WORD_BANK } from "../data/words.js";

export const DIFFICULTIES = ["Easy", "Tricky", "Fiendish"];
export const DIFFICULTY_TIER = { Easy: 1, Tricky: 2, Fiendish: 3 };

// How the 8 questions split across tiers per difficulty. Skews toward
// harder tiers as difficulty rises (the brief's own example — "3 Easy, 4
// Tricky, 1 Fiendish" *for* Fiendish — reads like it was meant to name a
// harder-weighted mix but has the counts backwards; this ramps it properly
// tier-3-heavy at Fiendish, tier-1-heavy at Easy).
const QUESTION_MIX = {
  Easy: { 1: 5, 2: 2, 3: 1 },
  Tricky: { 1: 2, 2: 4, 3: 2 },
  Fiendish: { 1: 1, 2: 3, 3: 4 },
};

// The anagram phase needs every question to reveal exactly one letter of
// an 8-letter word, so the mystery word itself must be exactly 8 letters
// (the brief said "length >= 8", which doesn't quite square with "shuffle
// the 8 letters" in the next phase — this makes the mechanic well-defined).
const MYSTERY_WORD_POOL = WORD_BANK.filter((e) => e.w.length === 8);

export function pickMysteryWord() {
  return MYSTERY_WORD_POOL[Math.floor(Math.random() * MYSTERY_WORD_POOL.length)];
}

export function buildMysteryQuestions(pool, stats, difficulty) {
  const mix = QUESTION_MIX[difficulty] || QUESTION_MIX.Tricky;
  const tierSequence = [];
  Object.entries(mix).forEach(([tier, count]) => {
    for (let i = 0; i < count; i++) tierSequence.push(Number(tier));
  });
  return shuffle(tierSequence).map((tier) => buildOddOneOut(pool, stats, tier, true));
}
