import React from "react";
import { CHAPTERS } from "../data/chapters.js";

export default function Result({ chapter, outcome, runScore, runBestQuickStreak, breakdownTotals, onMap, onRetry, onRetreat }) {
  const { pct, out } = outcome;
  const passed = out === "pass";
  const prevChapter = CHAPTERS[chapter.id - 2];
  return (
    <main className="container">
      <div className="result-card anim-rise" style={{ borderColor: passed ? "#4fa07a55" : "#c25a5155" }}>
        <div className="result-icon">{passed ? "📖" : out === "retreat" ? "🌀" : "🔁"}</div>
        <h2 className="result-title font-display">{passed ? "Chapter mastered!" : out === "retreat" ? "The ink has smudged" : "Not quite ready"}</h2>
        <div className="result-pct font-mono" style={{ color: passed ? "var(--emerald)" : "var(--ruby)" }}>{pct}%</div>
        <div className="result-pct-lbl">you needed {chapter.pass}% to pass</div>
        <div className="result-stats">
          <div><div className="result-stat-n font-mono">{runScore}</div><div className="result-stat-l">sparks earned</div></div>
          <div><div className="result-stat-n font-mono">⚡ {runBestQuickStreak}</div><div className="result-stat-l">best velocity streak</div></div>
        </div>
        <div className="score-breakdown">
          <div className="score-breakdown-row"><span>Base sparks</span><span className="font-mono">{breakdownTotals.base}</span></div>
          <div className="score-breakdown-row" style={{ color: "var(--gold-300)" }}><span>⚡ Speed bonus</span><span className="font-mono">+{breakdownTotals.speedBonus}</span></div>
          <div className="score-breakdown-row" style={{ color: "var(--gold-300)" }}><span>🔥 Velocity combo</span><span className="font-mono">+{breakdownTotals.comboBonus}</span></div>
        </div>
        <p className="result-msg">
          {passed && chapter.id < CHAPTERS.length && `Chapter ${chapter.id + 1} is now unlocked. Onward!`}
          {passed && chapter.id === CHAPTERS.length && "You've mastered the whole Grimoire. Real exam form."}
          {out === "retreat" && prevChapter && `Restudy ${prevChapter.name} to firm up the fundamentals — you'll return stronger.`}
          {out === "retry" && "Give Foundations another go — you're close."}
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          {passed && <button className="btn btn-primary btn-block" onClick={onMap}>Back to shelf →</button>}
          {out === "retry" && <button className="btn btn-primary btn-block" onClick={onRetry}>Try again →</button>}
          {out === "retreat" && <button className="btn btn-primary btn-block" onClick={onRetreat}>Restudy →</button>}
          {!passed && <button className="btn btn-ghost" onClick={onMap}>Shelf</button>}
        </div>
      </div>
    </main>
  );
}
