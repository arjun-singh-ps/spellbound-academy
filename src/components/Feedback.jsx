import React from "react";

export default function Feedback({ q, correct, breakdown, onNext, last }) {
  return (
    <div className="feedback-wrap">
      <div className="feedback-mark anim-bounce" style={{ color: correct ? "var(--emerald)" : "var(--ruby)" }}>{correct ? "✓" : "✗"}</div>
      <div className="feedback-verdict" style={{ color: correct ? "var(--emerald)" : "var(--ruby)" }}>{correct ? "Well cast!" : "Not quite"}</div>
      <div className="feedback-word font-display">{q.reveal}</div>
      <div className="feedback-hook">{q.hook}</div>
      {correct && breakdown.total > 0 && (
        <div className="feedback-score">
          +<b>{breakdown.total}</b> sparks
          {breakdown.speedBonus > 0 && <> · <b>+{breakdown.speedBonus}</b> speed</>}
          {breakdown.comboBonus > 0 && <> · <b>+{breakdown.comboBonus}</b> velocity</>}
        </div>
      )}
      <button className="btn btn-primary btn-block" onClick={onNext}>{last ? "See results →" : "Next →"}</button>
    </div>
  );
}
