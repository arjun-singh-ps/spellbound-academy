import React from "react";

const LETTERS = "ABCDE";

// The MCQ presentation reused for every Mystery Challenge question — same
// "spot the misspelling" format as the Mock Exam's oddOneOut, styled for
// the Grimoire's parchment world instead of the exam hall.
export default function MysteryQuestion({ q, eliminated, onAnswer }) {
  return (
    <>
      <div className="q-prompt">{q.prompt}</div>
      <div className="choice-list">
        {q.options.map((o, i) => (
          <button key={o.label + i} className={"choice-row" + (eliminated.includes(i) ? " eliminated" : "")}
            onClick={() => onAnswer(i)} disabled={eliminated.includes(i)}>
            <span className="choice-letter" style={{ background: "var(--sapphire)" }}>{LETTERS[i]}</span>
            <span className="choice-label">{o.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
