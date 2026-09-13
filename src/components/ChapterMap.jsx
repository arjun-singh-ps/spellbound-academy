import React from "react";
import { useApp } from "../state/AppState.jsx";
import { CHAPTERS, GAME_LABEL } from "../data/chapters.js";

function daysUntil(s) {
  return Math.max(0, Math.ceil((new Date(s + "T00:00:00") - new Date()) / 86400000));
}

export default function ChapterMap() {
  const { family, currentChildId, setActiveChapter, setSub } = useApp();
  const child = family.children[currentChildId];

  return (
    <main className="container">
      <div className="shelf-header">
        <h1 className="shelf-title">{child.name}'s Grimoire</h1>
        <p className="shelf-sub">Five chapters on the shelf. Clear a trial to unlock the next — fall short and you'll restudy this one before moving on.</p>
        <div className="countdowns">
          <div className="countdown-card"><div className="countdown-num font-mono">{daysUntil(family.mockDate || "2027-05-27")}</div><div className="countdown-lbl">days to mocks</div></div>
          <div className="countdown-card" style={{ borderColor: "#c25a5155" }}><div className="countdown-num font-mono" style={{ color: "var(--ruby-soft)" }}>{daysUntil(family.examDate || "2027-09-30")}</div><div className="countdown-lbl">days to exam</div></div>
        </div>
      </div>

      <button className="exam-entry-card" onClick={() => setSub("exam")}>
        <div className="exam-entry-icon">📝</div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div className="exam-entry-title">Mock Exam Hall</div>
          <div className="exam-entry-sub">Sit a full timed practice exam — real exam-hall conditions, no sparks or speed bonuses.</div>
        </div>
        <div className="exam-entry-arrow">→</div>
      </button>

      <button className="exam-entry-card" style={{ borderColor: "var(--gold-400)", background: "linear-gradient(135deg, #d4af6122, var(--wood-800))" }} onClick={() => setSub("mystery")}>
        <div className="exam-entry-icon">🔮</div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div className="exam-entry-title" style={{ color: "var(--gold-300)" }}>Mystery Challenge</div>
          <div className="exam-entry-sub">Answer 8 questions to reveal a secret word letter by letter, then crack the anagram for a bonus.</div>
        </div>
        <div className="exam-entry-arrow" style={{ color: "var(--gold-300)" }}>→</div>
      </button>

      <button className="exam-entry-card" style={{ borderColor: "var(--ruby)", background: "linear-gradient(135deg, #c25a5122, var(--wood-800))" }} onClick={() => setSub("context")}>
        <div className="exam-entry-icon">📖</div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div className="exam-entry-title" style={{ color: "var(--ruby-soft)" }}>Context Clues <span className="plan-badge pro" style={{ marginLeft: 4, fontSize: 9 }}>Premium</span></div>
          <div className="exam-entry-sub">Spot the misspelt word inside a real passage — the closest thing to how spelling shows up on exam day.</div>
        </div>
        <div className="exam-entry-arrow" style={{ color: "var(--ruby-soft)" }}>→</div>
      </button>

      <div className="bookshelf">
        {CHAPTERS.map((ch) => {
          const locked = ch.id > child.unlockedTo;
          const best = child.stars[ch.id] || 0;
          const cleared = best >= ch.pass;
          return (
            <button key={ch.id} disabled={locked} className={"tome anim-rise" + (locked ? " tome-locked" : "")}
              style={{ borderColor: locked ? undefined : ch.hue, background: locked ? undefined : `linear-gradient(165deg, ${ch.hue}22, var(--wood-800))` }}
              onClick={() => { setActiveChapter(ch); setSub("chapter"); }}>
              {cleared && <span className="tome-cleared">cleared</span>}
              <div className="tome-sigil">{locked ? "🔒" : ch.sigil}</div>
              <div className="tome-rank">Ch. {ch.id} · {ch.rank}</div>
              <div className="tome-name" style={{ color: locked ? "var(--text-faint)" : "var(--text)" }}>{ch.name}</div>
              {!locked && <div className="tome-game">{GAME_LABEL[ch.game]}</div>}
              {best > 0 && (
                <div className="tome-stars">
                  {[60, 75, 90].map((th, k) => <span key={k} style={{ opacity: best >= th ? 1 : 0.25 }}>⭐</span>)}
                  <span className="font-mono faint" style={{ marginLeft: 4 }}>{best}%</span>
                </div>
              )}
              {!locked && best === 0 && <div className="tome-cta" style={{ color: ch.hue }}>Open the book →</div>}
            </button>
          );
        })}
      </div>

      <div className="roadmap-card">
        <div className="roadmap-title">🧭 More chapters being bound…</div>
        <div className="roadmap-list">
          <span>📗 Vocabulary Vault — word-in-context puzzles</span>
          <span>🗺️ Comprehension Quarter — reasoning from a passage</span>
          <span>🎭 Homophone Hall — their / there / they're style traps</span>
        </div>
      </div>
    </main>
  );
}
