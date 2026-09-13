// Shared by the photo (OCR) and PDF importers: turns raw recognized/
// extracted text into a clean, reviewable list of candidate spelling
// words — used by src/components/PhotoWordUpload.jsx and PdfWordUpload.jsx.
const STOPWORDS = new Set([
  "the", "and", "a", "an", "of", "to", "in", "is", "it", "you", "that", "he",
  "was", "for", "on", "are", "as", "with", "his", "they", "at", "be", "this",
  "have", "from", "or", "had", "by", "but", "not", "what", "all", "were",
  "we", "when", "your", "can", "said", "there", "use", "each", "which",
  "she", "do", "how", "their", "if", "will", "up", "other", "about", "out",
  "many", "then", "them", "these", "so", "some", "her", "would", "make",
  "like", "him", "into", "time", "has", "look", "two", "more", "write",
  "go", "see", "number", "no", "way", "could", "people", "my", "than",
  "first", "been", "call", "who", "its", "now", "find", "long", "down",
  "day", "did", "get", "come", "made", "may", "part", "page", "name",
  "date", "week", "list", "spelling", "words",
]);

// Some PDF exporters bake a stray literal space into the extracted text
// of a ligature glyph (fi/fl/ffi/ffl) — e.g. the string is genuinely
// "confi scated", not two separately-positioned items — so no amount of
// layout/spacing math on the PDF side can fix it; it has to be undone in
// the text itself. Re-glue a short ligature-ending fragment onto the
// word that follows it. This occasionally over-glues a genuine word pair
// where the first word happens to end in one of these (e.g. "plaintiff
// aphorism"), but that's rare and the review checklist below is exactly
// the safety net for whatever this heuristic gets wrong either way.
function deligature(text) {
  return text.replace(/((?:[a-z][a-z'-]*)?(?:ffi|ffl|fi|fl|ff))\s+(?=[a-z])/gi, "$1");
}

export function wordsFromText(text, { max = 200 } = {}) {
  const seen = new Set();
  const out = [];
  for (const raw of deligature(text || "").split(/[^A-Za-z'-]+/)) {
    const w = raw.trim().toLowerCase();
    if (!/^[a-z][a-z'-]{1,}$/.test(w)) continue;
    if (w.length < 2 || w.length > 20) continue;
    if (STOPWORDS.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= max) break;
  }
  return out;
}
