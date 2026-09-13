import React from "react";
import { useApp } from "../../state/AppState.jsx";
import { DIFFICULTIES } from "../../lib/mysteryChallenge.js";

const DIFF_HUE = { Easy: "var(--emerald)", Tricky: "var(--gold-400)", Fiendish: "var(--ruby)" };

export default function MysteryPicker({ onStart, onExit }) {
  const { family, currentChildId } = useApp();
  const child = family.children[currentChildId];
  const attempts = child.mysteryAttempts || [];

  return (
    <main className="container">
      <div className="row-between" style={{ marginBottom: 10 }}>
        <h2 className="font-display" style={{ fontSize: 24 }}>Mystery Challenge</h2>
        <button className="btn-icon" onClick={onExit}>✕</button>
      </div>
      <p className="muted">A secret 8-letter word is hidden behind 8 questions. Answer correctly to reveal each letter, then race the anagram to crack it before the bonus slips away.</p>

      <div className="grid-auto" style={{ marginTop: 14 }}>
        {DIFFICULTIES.map((d) => (
          <button key={d} className="panel" style={{ borderColor: DIFF_HUE[d] + "66", cursor: "pointer", textAlign: "center" }} onClick={() => onStart(d)}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: DIFF_HUE[d] }}>{d}</div>
            <div className="faint" style={{ marginTop: 4 }}>Start →</div>
          </button>
        ))}
      </div>

      {attempts.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Past mysteries</h3>
          <div className="stack">
            {attempts.slice().reverse().map((a, i) => (
              <div key={i} className="row-between" style={{ fontSize: 13.5 }}>
                <span className="muted">{a.date} · {a.difficulty} · "{a.word}"</span>
                <span className="font-mono" style={{ color: "var(--gold-300)" }}>{a.score} pts{a.bonus ? " ⚡" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
