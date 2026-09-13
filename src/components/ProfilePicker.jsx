import React, { useState } from "react";
import { useApp } from "../state/AppState.jsx";
import { limitsFor } from "../lib/plan.js";

export default function ProfilePicker() {
  const { user, family, signOut, addChild, setCurrentChildId, setMode, setSub, setPinPrompt } = useApp();
  const [newName, setNewName] = useState("");
  const entries = Object.entries(family.children);
  const limits = limitsFor(family.plan);
  const atLimit = entries.length >= limits.maxChildren;

  function pick(id) { setCurrentChildId(id); setMode("student"); setSub("map"); }
  function add() {
    if (atLimit) { setPinPrompt(true); return; }
    const n = newName.trim();
    if (!n) return;
    addChild(n);
    setNewName("");
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card anim-rise">
        <div className="row-between">
          <span className="muted" style={{ wordBreak: "break-all" }}>{user.email}</span>
          <button className="btn-link" onClick={signOut}>Sign out</button>
        </div>
        <h2 className="auth-title">Who's casting today?</h2>
        <p className="auth-sub">Each Wordsmith keeps their own rank, sparks and Grimoire progress.</p>

        {entries.length > 0 && (
          <div className="profile-grid">
            {entries.map(([id, c]) => (
              <button key={id} className="profile-tile" onClick={() => pick(id)}>
                <span className="profile-avatar">{c.name[0].toUpperCase()}</span>
                <span className="profile-name">{c.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="row" style={{ marginTop: 14 }}>
          <input id="new-child" className="field" value={newName} onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a Wordsmith's name…" />
          <button className="btn btn-primary" onClick={add}>Add →</button>
        </div>
        {atLimit && <p className="faint" style={{ marginTop: 6 }}>Free plan holds {limits.maxChildren} profile. Upgrade in the Parent Dashboard to add more.</p>}

        <button className="parent-tile" onClick={() => setPinPrompt(true)} style={{ cursor: "pointer" }}>
          🔒 Parent Dashboard →
        </button>
      </div>
    </main>
  );
}
