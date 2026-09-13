import React from "react";
import "../../styles/exam.css";

const OOO_LETTERS = "ABCDE";
const FM_LETTERS = "ABCD";

function describeCorrect(q) {
  if (q.type === "oddOneOut") {
    const idx = q.options.findIndex((o) => o.isAnswer);
    return `The misspelling was ${OOO_LETTERS[idx]} — "${q.options[idx].label}" (correct: "${q.targetWord}").`;
  }
  if (q.correctIndex === -1) return "There was no mistake in this sentence.";
  return `Section ${FM_LETTERS[q.correctIndex]} — "${q.segments[q.correctIndex]}" — was misspelled (correct: "${q.targetWord}").`;
}
function describeSelected(q, selected) {
  if (selected === null) return "No answer given.";
  if (q.type === "oddOneOut") return `You chose ${OOO_LETTERS[selected]} — "${q.options[selected].label}".`;
  if (selected === "N") return "You chose N — No mistake.";
  return `You chose ${FM_LETTERS[selected]} — "${q.segments[selected]}".`;
}

export default function ExamReview({ exam, results, onDone, onRetake }) {
  const { perQuestion, correct, total } = results;
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="xh-root">
      <div className="xh-statusbar">
        <span>{exam.name}</span>
        <span className="xh-spacer" />
        <span>Status: FINISHED</span>
      </div>
      <div className="xh-body" style={{ flexDirection: "column", maxWidth: 760 }}>
        <div className="xh-card" style={{ width: "100%" }}>
          <div className="xh-review-summary">
            <div className="xh-review-pct">{correct}/{total}</div>
            <div style={{ color: "var(--xh-text-dim)", marginTop: 2 }}>{pct}% correct</div>
          </div>
          <hr className="xh-divider" />
          <div className="xh-answer-label" style={{ marginBottom: 12 }}>Question review</div>
          <div>
            {perQuestion.map((r, i) => (
              <div key={i} className={"xh-review-row " + (r.correct ? "correct" : "incorrect")}>
                <div className="xh-review-mark" style={{ color: r.correct ? "var(--xh-good)" : "var(--xh-bad)" }}>{r.correct ? "✓" : "✗"}</div>
                <div className="xh-review-body">
                  <b>Q{i + 1}.</b> {describeSelected(r.q, r.answer.selected)} {!r.correct && describeCorrect(r.q)}
                  <div style={{ color: "var(--xh-text-dim)", marginTop: 3, fontStyle: "italic" }}>{r.q.hook}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="xh-modal-actions" style={{ marginTop: 18 }}>
            <button className="xh-btn xh-btn-ghost" onClick={onDone}>Back to Mock Exams</button>
            <button className="xh-btn xh-btn-primary" onClick={onRetake}>Take another →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
