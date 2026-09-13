import React, { useState } from "react";
import { useApp } from "../state/AppState.jsx";

export default function PinGate() {
  const { family, currentChildId, setMode, setParentSub, setViewChildId, viewChildId, setPinPrompt } = useApp();
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  function submit() {
    if (val === family.parentPin) {
      if (!viewChildId) setViewChildId(currentChildId || Object.keys(family.children)[0] || null);
      setMode("parent");
      setParentSub("reports");
      setPinPrompt(false);
    } else { setErr(true); setVal(""); }
  }

  return (
    <main className="container">
      <div className="pin-wrap">
        <div style={{ fontSize: 38 }}>🔒</div>
        <h2 className="font-display" style={{ fontSize: 24 }}>Parent's Study</h2>
        <p className="muted">The parent dashboard is sealed with a 4-digit rune so word lists and progress stay safe from a curious apprentice.</p>
        <input id="pin-input" className="pin-input font-mono" type="password" inputMode="numeric" maxLength={6}
          value={val} onChange={(e) => { setVal(e.target.value); setErr(false); }}
          onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••" autoFocus />
        {err && <div className="err-text">Wrong PIN — try again.</div>}
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={() => setPinPrompt(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Unlock →</button>
        </div>
        <div className="faint" style={{ marginTop: 14 }}>Prototype default PIN: 1234</div>
      </div>
    </main>
  );
}
