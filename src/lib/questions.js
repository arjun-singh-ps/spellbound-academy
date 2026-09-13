import { pickWeighted, shuffle, misspell } from "./random.js";
import { SENTENCE_FRAMES } from "../data/words.js";
import { ANALOGIES, SYN_ANT } from "../data/reasoning.js";

const TRIAL_CYCLE = ["rune", "curse", "riddle", "rapid"];
export function resolveGame(chapterGame, qIndex) {
  return chapterGame === "trial" ? TRIAL_CYCLE[qIndex % TRIAL_CYCLE.length] : chapterGame;
}

export function buildQuestion(game, { pool, stats, tierMax, qIndex }) {
  if (game === "rune") {
    const word = pickWeighted(pool, stats, tierMax, (e) => e.w);
    return { type: "rune", tier: word.t, statsKey: "sp:" + word.w, reveal: word.w, hook: word.hook, word };
  }
  if (game === "curse") {
    const word = pickWeighted(pool, stats, tierMax, (e) => e.w);
    const frame = SENTENCE_FRAMES[Math.floor(Math.random() * SENTENCE_FRAMES.length)];
    const wrongToken = misspell(word.w);
    const sentence = frame(wrongToken);
    const tokens = sentence.replace(/\.$/, "").split(" ");
    return { type: "curse", tier: word.t, statsKey: "sp:" + word.w, reveal: word.w, hook: word.hook, tokens, wrongToken, word };
  }
  if (game === "riddle") {
    const useAnalogy = qIndex % 2 === 0;
    if (useAnalogy) {
      const a = pickWeighted(ANALOGIES, stats, tierMax, (e) => "an:" + e.a + "|" + e.c + "|" + e.answer);
      const distractors = shuffle(ANALOGIES.filter((x) => x.answer !== a.answer)).slice(0, 3).map((x) => x.answer);
      const options = shuffle([{ label: a.answer, isAnswer: true }, ...distractors.map((d) => ({ label: d, isAnswer: false }))]);
      return { type: "riddle", sub: "analogy", tier: a.t, statsKey: "an:" + a.a + "|" + a.c + "|" + a.answer, reveal: a.answer, hook: a.hook, analogy: a, options };
    }
    const pair = pickWeighted(SYN_ANT, stats, tierMax, (e) => "sa:" + e.a + "|" + e.b);
    const reveal = pair.rel === "syn" ? `${pair.a} = ${pair.b}` : `${pair.a} ≠ ${pair.b}`;
    return { type: "riddle", sub: "synant", tier: pair.t, statsKey: "sa:" + pair.a + "|" + pair.b, reveal, hook: pair.hook, pair };
  }
  if (game === "rapid") {
    const word = pickWeighted(pool, stats, tierMax, (e) => e.w);
    const showWrong = Math.random() < 0.55;
    return { type: "rapid", tier: word.t, statsKey: "sp:" + word.w, reveal: word.w, hook: word.hook, shown: showWrong ? misspell(word.w) : word.w, shownIsWrong: showWrong, word };
  }
  throw new Error("Unknown game type: " + game);
}
