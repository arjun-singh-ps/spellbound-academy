import React from "react";
import { CHAPTERS } from "../data/chapters.js";
import { buildPool } from "../lib/pool.js";
import { CONTEXT_CATEGORY_LABEL } from "../data/contextPassages.js";

function weekKey(d = new Date()) {
  const dt = new Date(d); const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day); return dt.toISOString().slice(0, 10);
}
function daysUntil(s) { return Math.max(0, Math.ceil((new Date(s + "T00:00:00") - new Date()) / 86400000)); }

export default function Reports({ family, child, childName }) {
  const pool = buildPool(family);
  const { history, stats, stars, unlockedTo } = child;
  const week = weekKey();
  const weekItems = history.filter((h) => weekKey(new Date(h.date)) === week);
  const byWord = {};
  history.forEach((h) => { byWord[h.word] = byWord[h.word] || { right: 0, wrong: 0 }; h.correct ? byWord[h.word].right++ : byWord[h.word].wrong++; });
  const strong = Object.entries(byWord).filter(([, v]) => v.right >= 2 && v.wrong === 0).map(([w]) => w);
  const weak = Object.entries(byWord).filter(([, v]) => v.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong).map(([w, v]) => `${w} (${v.wrong}×)`);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10);
    const items = history.filter((h) => h.date === k);
    days.push({ label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()], total: items.length, correct: items.filter((x) => x.correct).length });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.total));
  const accuracy = weekItems.length ? Math.round((weekItems.filter((h) => h.correct).length / weekItems.length) * 100) : 0;
  const mastered = Object.values(stats).filter((s) => s.box >= 4).length;
  const dExam = daysUntil(family.examDate || "2027-09-30");
  const remaining = Math.max(0, pool.length - mastered);
  const perDay = dExam > 0 ? (remaining / dExam).toFixed(1) : remaining;

  const ctx = child.contextStats || { byCategory: {}, right: 0, wrong: 0 };
  const ctxTotal = ctx.right + ctx.wrong;
  const ctxAccuracy = ctxTotal ? Math.round((ctx.right / ctxTotal) * 100) : null;
  const elsewhere = history.filter((h) => h.chapter !== "context");
  const elsewhereAccuracy = elsewhere.length ? Math.round((elsewhere.filter((h) => h.correct).length / elsewhere.length) * 100) : null;

  return (
    <>
      <h2 className="font-display" style={{ fontSize: 25 }}>Progress{childName ? " — " + childName : ""}</h2>
      <div className="stat-row">
        <Stat label="Attempts this week" value={weekItems.length} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Chapters cleared" value={Math.max(0, unlockedTo - 1)} />
      </div>
      <div className="pace-box"><strong>Pace to exam:</strong> {remaining} words still to master in {dExam} days — about <b className="font-mono" style={{ color: "var(--gold-300)" }}>{perDay}</b> new words/day to arrive ready.</div>

      <h3 style={{ fontSize: 15, margin: "18px 0 10px" }}>Grimoire progress</h3>
      <div className="progress-bars">
        {CHAPTERS.map((ch) => { const best = stars[ch.id] || 0; return (
          <div key={ch.id} className="progress-bar-row">
            <span className="progress-bar-icon">{ch.id <= unlockedTo || best > 0 ? ch.sigil : "🔒"}</span>
            <span className="progress-bar-name">{ch.name}</span>
            <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${best}%`, background: ch.hue }} /></div>
            <span className="progress-bar-pct font-mono">{best}%</span>
          </div>
        ); })}
      </div>

      <h3 style={{ fontSize: 15, margin: "18px 0 10px" }}>Last 7 days</h3>
      <div className="week-chart">
        {days.map((d, i) => (
          <div key={i} className="week-col">
            <div className="week-bar-wrap"><div className="week-bar-total" style={{ height: `${(d.total / maxDay) * 100}%` }}><div className="week-bar-correct" style={{ height: d.total ? `${(d.correct / d.total) * 100}%` : "0%" }} /></div></div>
            <div className="week-label">{d.label}</div>
          </div>
        ))}
      </div>
      <div className="legend-row"><span><i style={{ background: "var(--emerald)" }} /> correct</span><span><i style={{ background: "var(--hairline)" }} /> attempts</span></div>

      <div className="two-col">
        <div className="panel" style={{ borderColor: "#4fa07a44" }}>
          <h4 style={{ color: "var(--emerald-soft)", fontSize: 14, margin: "0 0 8px" }}>💪 Strong spellings</h4>
          {strong.length ? strong.map((w) => <div key={w} className="word-row">{w}</div>) : <p className="muted">Play a few chapters to build this list.</p>}
        </div>
        <div className="panel" style={{ borderColor: "#c25a5144" }}>
          <h4 style={{ color: "var(--ruby-soft)", fontSize: 14, margin: "0 0 8px" }}>🎯 Words to drill</h4>
          {weak.length ? weak.map((w) => <div key={w} className="word-row">{w}</div>) : <p className="muted">No misses recorded yet — nice.</p>}
        </div>
      </div>

      {ctxTotal > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, margin: "0 0 4px" }}>Context Transfer <span className="plan-badge pro" style={{ marginLeft: 4 }}>Premium</span></h3>
          <p className="muted" style={{ marginTop: 0 }}>Context Clues accuracy compared with everywhere else — a big gap either way is worth a look, not a single number to chase.</p>
          <div className="row-between" style={{ marginTop: 10 }}>
            <span style={{ fontSize: 13.5 }}>Context Clues (in a passage)</span>
            <span className="font-mono" style={{ color: "var(--ruby-soft)", fontWeight: 700 }}>{ctxAccuracy}% <span className="faint">({ctxTotal} attempt{ctxTotal === 1 ? "" : "s"})</span></span>
          </div>
          <div className="transfer-bar-track"><div className="transfer-bar-fill" style={{ width: `${ctxAccuracy}%` }} /></div>
          {elsewhereAccuracy !== null && (
            <>
              <div className="row-between" style={{ marginTop: 10 }}>
                <span style={{ fontSize: 13.5 }}>Everywhere else (Grimoire, exams, mysteries)</span>
                <span className="font-mono" style={{ color: "var(--sapphire-soft)", fontWeight: 700 }}>{elsewhereAccuracy}% <span className="faint">({elsewhere.length} attempts)</span></span>
              </div>
              <div className="transfer-bar-track"><div className="transfer-bar-fill" style={{ width: `${elsewhereAccuracy}%`, background: "var(--sapphire)" }} /></div>
            </>
          )}
          {Object.keys(ctx.byCategory).length > 0 && (
            <>
              <p className="muted" style={{ marginBottom: 6 }}>By error type, in Context Clues only:</p>
              {Object.entries(ctx.byCategory).map(([cat, v]) => {
                const t = v.right + v.wrong;
                const pct = t ? Math.round((v.right / t) * 100) : 0;
                return (
                  <div key={cat} className="row-between" style={{ fontSize: 13, margin: "4px 0" }}>
                    <span className="muted">{CONTEXT_CATEGORY_LABEL[cat] || cat}</span>
                    <span className="font-mono">{pct}% ({t})</span>
                  </div>
                );
              })}
            </>
          )}
          {ctxTotal < 10 && <p className="faint" style={{ marginTop: 10 }}>Still an early signal — more attempts will make this more reliable.</p>}
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <p className="muted" style={{ margin: 0 }}><strong style={{ color: "var(--text)" }}>Weekly email report (Pro):</strong> a Sunday summary — accuracy trend, chapters cleared, strongest + weakest words, paced against the exam countdown, sent to the parent email.</p>
      </div>
    </>
  );
}
const Stat = ({ label, value }) => (<div className="stat-card"><div className="stat-value font-mono">{value}</div><div className="stat-label">{label}</div></div>);
