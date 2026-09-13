import React from "react";

export default function RapidCasting({ q, onAnswer }) {
  return (
    <div className="rapid-card">
      <div className="q-prompt">Right or wrong?</div>
      <div className="rapid-word font-mono">{q.shown}</div>
      <div className="rapid-actions">
        <button className="rapid-zone" style={{ background: "var(--emerald)", color: "#0e2419" }} onClick={() => onAnswer(!q.shownIsWrong)}>✓ Correct</button>
        <button className="rapid-zone" style={{ background: "var(--ruby)", color: "#2a0d0a" }} onClick={() => onAnswer(q.shownIsWrong)}>✗ Wrong</button>
      </div>
    </div>
  );
}
