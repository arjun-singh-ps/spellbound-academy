// "Find the Spelling Mistake" sentence templates for Mock Exams.
// Each template has exactly 4 segments (A, B, C, D); one is `null`,
// meaning "the target word goes here" (correctly or misspelt).
// Segments can hold more than one word — real 11+ papers commonly
// bundle the sentence's tail into the last segment, as in:
// "The [A] weather [B] forecast [C] predics [D] heavy rain tomorrow."
export const FIND_MISTAKE_TEMPLATES = [
  ["The", "weather forecast", null, "heavy rain tomorrow"],
  ["She", "made an", null, "decision about the trip"],
  ["Everybody", "was", null, "by the surprising news"],
  ["He", "spoke with", "great", null],
  ["It", "was a", null, "afternoon in early spring"],
  ["The", "old castle", "stood alone on", null],
  [null, "is not something", "we can", "ignore any longer"],
  ["Her", "handwriting was", "almost", null],
  ["The", "sudden", null, "surprised every visitor"],
  ["Nobody", "expected such", "a", null],
  ["They", "found the whole", "situation rather", null],
  ["It", "seemed like a", null, "plan from the start"],
  ["We", "need to", null, "the plan before Friday"],
  ["The", "teacher gave a", null, "explanation of the topic"],
  ["The", null, "forecast was completely", "wrong this time"],
  [null, "arrived just as", "the meeting was", "about to begin"],
];
