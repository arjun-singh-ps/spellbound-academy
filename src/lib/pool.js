import { WORD_BANK, BOARDS } from "../data/words.js";

export function buildPool(family) {
  const removed = new Set(family.removedWords || []);
  const board = family.board || "all";
  const boardFilter = BOARDS[board] ? BOARDS[board].filter : BOARDS.all.filter;
  return [...WORD_BANK.filter((e) => !removed.has(e.w) && boardFilter(e)), ...(family.customWords || [])];
}
