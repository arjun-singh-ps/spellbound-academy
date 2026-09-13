import React from "react";
import { useApp } from "../state/AppState.jsx";
import { isPro } from "../lib/plan.js";

export default function Topbar() {
  const { mode, family, currentChildId, setMode, setPinPrompt, parentSub, setParentSub } = useApp();
  const child = currentChildId ? family.children[currentChildId] : null;

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">🪶</span>
        <span className="brand-name">Spellbound <em>Academy</em></span>
        {mode === "student" && child && (
          <button className="pill pill-btn" onClick={() => setMode("profiles")} title="Switch Wordsmith">{child.name} ⌄</button>
        )}
        {mode === "parent" && <span className="pill">👪 Parent Dashboard {isPro(family.plan) && <b style={{ color: "var(--gold-300)" }}> · Pro</b>}</span>}
      </div>

      {mode === "parent" && (
        <nav className="nav-tabs">
          {[["reports", "📊 Reports"], ["settings", "⚙ Settings"], ["billing", "✨ Membership"]].map(([id, label]) => (
            <button key={id} className={"nav-tab" + (parentSub === id ? " active" : "")} onClick={() => setParentSub(id)}>{label}</button>
          ))}
        </nav>
      )}

      <div className="header-actions" style={{ marginLeft: mode === "student" ? "auto" : 0 }}>
        {mode === "student" && child && <span className="font-mono" style={{ fontWeight: 700, fontSize: 14 }}>✨ {child.totalScore}</span>}
        {mode === "student" && <button className="btn-icon" title="Parent area" onClick={() => setPinPrompt(true)}>🔒</button>}
        {mode === "parent" && <button className="btn-icon" title="Back to student" onClick={() => setMode(currentChildId ? "student" : "profiles")}>🎓</button>}
      </div>
    </header>
  );
}
