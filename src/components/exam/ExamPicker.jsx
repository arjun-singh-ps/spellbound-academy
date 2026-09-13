import React from "react";
import { useApp } from "../../state/AppState.jsx";

export default function ExamPicker({ exams, onStart, onExit }) {
  const { family, currentChildId } = useApp();
  const child = family.children[currentChildId];
  const attempts = child.examAttempts || [];

  return (
    <main className="container">
      <div className="row-between" style={{ marginBottom: 10 }}>
        <h2 className="font-display" style={{ fontSize: 24 }}>Mock Exam Hall</h2>
        <button className="btn-icon" onClick={onExit}>✕</button>
      </div>
      <p className="muted">Real exam-hall conditions: a countdown timer, question flagging, free navigation between questions — no sparks, no speed bonuses, just the actual format.</p>

      {exams.map((ex) => (
        <div key={ex.id} className="exam-picker-card">
          <div className="exam-picker-title">{ex.name}</div>
          <div className="exam-picker-meta">
            <span>📝 {ex.count} questions</span>
            <span>⏱ {ex.minutes} minutes</span>
          </div>
          <p className="muted">{ex.blurb}</p>
          <button className="btn btn-primary" onClick={() => onStart(ex)}>Start exam →</button>
        </div>
      ))}

      {attempts.length > 0 && (
        <div className="panel">
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Past attempts</h3>
          <div className="stack">
            {attempts.slice().reverse().map((a, i) => (
              <div key={i} className="row-between" style={{ fontSize: 13.5 }}>
                <span className="muted">{a.date}</span>
                <span className="font-mono" style={{ color: "var(--gold-300)" }}>{a.score}/{a.total} ({Math.round((a.score / a.total) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
