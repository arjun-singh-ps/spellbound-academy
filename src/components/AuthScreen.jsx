import React, { useState } from "react";
import { useApp } from "../state/AppState.jsx";

export default function AuthScreen() {
  const { signIn, signUp, authError, isFirebaseConfigured } = useApp();
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const validEmail = /\S+@\S+\.\S+/.test(email);
  const validPassword = password.length >= 6;

  async function submit() {
    if (!validEmail || !validPassword || busy) return;
    setBusy(true);
    try { tab === "signin" ? await signIn(email, password) : await signUp(email, password); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card anim-rise">
        <div className="auth-mark">🪶</div>
        <h1 className="auth-title">Spellbound <em>Academy</em></h1>
        <p className="auth-sub">A parent account for the whole family — track every Wordsmith's progress, set the exam calendar, and manage the word bank.</p>

        <div className="auth-toggle">
          <button className={tab === "signin" ? "active" : ""} onClick={() => setTab("signin")}>Sign in</button>
          <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>Create account</button>
        </div>

        <div className="stack">
          <input id="auth-email" className="field" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          <input id="auth-password" className="field" type="password" placeholder="Password (6+ characters)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
          <button className="btn btn-primary btn-block" disabled={!validEmail || !validPassword || busy} onClick={submit}>
            {busy ? "One moment…" : tab === "signin" ? "Sign in →" : "Create account →"}
          </button>
        </div>

        {authError && <div className="auth-error">{authError}</div>}

        {!isFirebaseConfigured && (
          <div className="auth-info">
            ⚠ Running in <b>demo mode</b> — no Firebase project is connected yet, so this "sign in" just creates a local profile on this device/browser (any password works). Connect Firebase (see README) for real verified accounts and progress synced across devices.
          </div>
        )}
        <div className="fine-print">Parent-managed — a child never signs in alone; they pick their explorer after you're in.</div>
      </div>
    </main>
  );
}
