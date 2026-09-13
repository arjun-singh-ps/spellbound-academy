import React from "react";
import { useApp } from "../../state/AppState.jsx";
import { isPro } from "../../lib/plan.js";
import { attemptsRemaining, FREE_DAILY_ATTEMPTS } from "../../lib/contextClues.js";

export default function ContextPicker({ onStart, onExit, onUpgrade }) {
  const { family, currentChildId } = useApp();
  const child = family.children[currentChildId];
  const pro = isPro(family.plan);
  const remaining = attemptsRemaining(child.contextDaily);
  const locked = !pro && remaining <= 0;

  return (
    <main className="container">
      <div className="row-between" style={{ marginBottom: 10 }}>
        <h2 className="font-display" style={{ fontSize: 24 }}>Context Clues <span className="plan-badge pro" style={{ marginLeft: 6, verticalAlign: "middle" }}>Premium</span></h2>
        <button className="btn-icon" onClick={onExit}>✕</button>
      </div>
      <p className="muted">Read a short passage with one word misspelt and highlighted. Pick the correct spelling using the meaning around it — the closest thing to how spelling actually shows up in the real exam. Every 3 correct answers unlocks a bonus anagram round.</p>

      <div className="panel" style={{ marginTop: 14, textAlign: "center" }}>
        {pro ? (
          <>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--gold-300)" }}>Unlimited attempts</div>
            <p className="faint" style={{ margin: "4px 0 14px" }}>Pro membership</p>
          </>
        ) : locked ? (
          <>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--ruby-soft)" }}>Today's free attempts used up</div>
            <p className="faint" style={{ margin: "4px 0 14px" }}>Free plan gets {FREE_DAILY_ATTEMPTS} a day — more unlock tomorrow, or go Pro for unlimited.</p>
            <button className="btn btn-primary" onClick={onUpgrade}>See Pro membership →</button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "var(--gold-300)" }}>{remaining} of {FREE_DAILY_ATTEMPTS} free attempts left today</div>
            <p className="faint" style={{ margin: "4px 0 14px" }}>Resets at midnight. Pro removes this limit entirely.</p>
          </>
        )}
        {!locked && <button className="btn btn-primary btn-block" onClick={onStart}>Start reading →</button>}
      </div>
    </main>
  );
}
