// The Grimoire's chapters. Each is one game format at a rising difficulty.
// Sequential unlock, same "score well to advance, fall short and repeat"
// shape as before, but every mechanic underneath is new.
export const CHAPTERS = [
  {
    id: 1,
    name: "Foundations",
    rank: "Apprentice",
    game: "rune",
    tierMax: 1,
    q: 8,
    pass: 60,
    timeLimitMs: 12000,
    blurb: "Hear the word, then tap its letters into place before the casting ring closes.",
    sigil: "🪶",
    hue: "#d4af61",
  },
  {
    id: 2,
    name: "The Long Scroll",
    rank: "Adept",
    game: "curse",
    tierMax: 2,
    q: 8,
    pass: 60,
    timeLimitMs: 9000,
    blurb: "A cursed sentence unrolls across the desk. Catch the misspelt word before it scrolls away.",
    sigil: "📜",
    hue: "#b0473f",
  },
  {
    id: 3,
    name: "The Familiar's Study",
    rank: "Scholar",
    game: "riddle",
    tierMax: 2,
    q: 8,
    pass: 65,
    timeLimitMs: 10000,
    blurb: "Your familiar poses riddles of meaning — analogies, synonyms, antonyms. Swipe or tap to answer.",
    sigil: "🦉",
    hue: "#5b8fc7",
  },
  {
    id: 4,
    name: "Rapid Casting Hall",
    rank: "Scholar",
    game: "rapid",
    tierMax: 3,
    q: 16,
    pass: 65,
    timeLimitMs: 4000,
    blurb: "Pure speed. Judge each casting right or wrong before the glass runs out.",
    sigil: "⚡",
    hue: "#e8cd8f",
  },
  {
    id: 5,
    name: "Magister's Trial",
    rank: "Magister",
    game: "trial",
    tierMax: 3,
    q: 12,
    pass: 70,
    timeLimitMs: 8000,
    blurb: "Every discipline in rotation, fiendish words only. Prove your mastery.",
    sigil: "🔮",
    hue: "#3f8f6a",
  },
];

export const GAME_LABEL = {
  rune: "Rune Assembly",
  curse: "Curse Breaker",
  riddle: "Familiar's Riddle",
  rapid: "Rapid Casting",
  trial: "Magister's Trial",
};

export const TIER_LABEL = { 1: "Foundling", 2: "Adept", 3: "Fiendish" };
export const TIER_COLOR = { 1: "#3f8f6a", 2: "#d4af61", 3: "#b0473f" };
