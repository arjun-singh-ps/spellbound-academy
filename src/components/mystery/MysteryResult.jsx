import React from "react";

export default function MysteryResult({ result, onDone, onRetry }) {
  return (
    <main className="container">
      <div className="result-card anim-rise" style={{ borderColor: "var(--sapphire)55" }}>
        <div className="result-icon">🔮</div>
        <h2 className="result-title font-display">Mystery solved!</h2>
        <div className="feedback-word font-display" style={{ color: "var(--text)" }}>{result.word.toUpperCase()}</div>
        <div className="result-stats">
          <div><div className="result-stat-n font-mono">{result.score}</div><div className="result-stat-l">points</div></div>
          <div><div className="result-stat-n font-mono">{result.bonus ? "⚡ +50" : "—"}</div><div className="result-stat-l">first-try bonus</div></div>
        </div>
        <p className="result-msg">{result.difficulty} difficulty, solved{result.bonus ? " on the first try — well cast!" : " after a hint."}</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onDone}>Back to map</button>
          <button className="btn btn-primary" onClick={onRetry}>Another mystery →</button>
        </div>
      </div>
    </main>
  );
}
