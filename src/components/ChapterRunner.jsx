import React, { useEffect, useRef, useState } from "react";
import { useApp } from "../state/AppState.jsx";
import { buildPool } from "../lib/pool.js";
import { buildQuestion, resolveGame } from "../lib/questions.js";
import { scoreAnswer } from "../lib/scoring.js";
import { GAME_LABEL, TIER_LABEL, TIER_COLOR, CHAPTERS } from "../data/chapters.js";
import RuneAssembly from "./games/RuneAssembly.jsx";
import CurseBreaker from "./games/CurseBreaker.jsx";
import FamiliarsRiddle from "./games/FamiliarsRiddle.jsx";
import RapidCasting from "./games/RapidCasting.jsx";
import Feedback from "./Feedback.jsx";
import Result from "./Result.jsx";

export default function ChapterRunner({ chapter, onExit, onGoTo }) {
  const { family, currentChildId, onRecord, finishChapter } = useApp();
  const child = family.children[currentChildId];
  const pool = buildPool(family);

  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [runScore, setRunScore] = useState(0);
  const [quickStreak, setQuickStreak] = useState(0);
  const [bestQuickStreak, setBestQuickStreak] = useState(0);
  const [totals, setTotals] = useState({ base: 0, speedBonus: 0, comboBonus: 0 });
  const [phase, setPhase] = useState("ask");
  const [q, setQ] = useState(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastBreakdown, setLastBreakdown] = useState({ base: 0, speedBonus: 0, comboBonus: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [outcome, setOutcome] = useState(null);

  const askStart = useRef(0);
  const answeredRef = useRef(false);
  const timeoutRef = useRef(null);
  // The qIndex effect below schedules the per-question auto-timeout, but
  // that effect's closure is captured at the moment `qIndex` changes —
  // *before* the `setQ(built)` a few lines later has taken effect. If the
  // timeout called `answer` directly, it would close over the PREVIOUS
  // question's (possibly null, on the first question) `q`. Routing it
  // through a ref that every render keeps pointed at the current `answer`
  // guarantees the timeout always sees the live question.
  const answerRef = useRef(() => {});
  useEffect(() => { answerRef.current = answer; });

  useEffect(() => {
    if (qIndex >= chapter.q) { finish(); return; }
    const game = resolveGame(chapter.game, qIndex);
    const built = buildQuestion(game, { pool, stats: child.stats, tierMax: chapter.tierMax, qIndex });
    setQ(built);
    setPhase("ask");
    answeredRef.current = false;
    askStart.current = performance.now();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => answerRef.current(false), chapter.timeLimitMs);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex]);

  function answer(correct) {
    if (answeredRef.current || !q) return;
    answeredRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const timeTakenMs = performance.now() - askStart.current;
    const breakdown = scoreAnswer({ tier: q.tier, correct, timeTakenMs, timeLimitMs: chapter.timeLimitMs, quickStreak });
    onRecord(q.statsKey, q.reveal, correct, chapter.id);
    setLastCorrect(correct);
    setLastBreakdown(breakdown);
    if (correct) {
      setCorrectCount((c) => c + 1);
      setRunScore((v) => v + breakdown.total);
      setTotals((t) => ({ base: t.base + breakdown.base, speedBonus: t.speedBonus + breakdown.speedBonus, comboBonus: t.comboBonus + breakdown.comboBonus }));
    }
    if (breakdown.isQuick) {
      const ns = quickStreak + 1;
      setQuickStreak(ns);
      setBestQuickStreak((b) => Math.max(b, ns));
    } else setQuickStreak(0);
    setPhase("feedback");
  }

  function finish() {
    const pct = Math.round((correctCount / chapter.q) * 100);
    const out = finishChapter(chapter, pct, runScore, bestQuickStreak);
    setOutcome({ pct, out });
    setDone(true);
  }

  function resetRun() {
    setQIndex(0); setCorrectCount(0); setRunScore(0); setQuickStreak(0); setBestQuickStreak(0);
    setTotals({ base: 0, speedBonus: 0, comboBonus: 0 }); setDone(false); setOutcome(null);
  }

  if (done && outcome) {
    return (
      <Result chapter={chapter} outcome={outcome} runScore={runScore} runBestQuickStreak={bestQuickStreak}
        breakdownTotals={totals} onMap={onExit} onRetry={resetRun}
        onRetreat={() => { const prev = CHAPTERS[chapter.id - 2]; onGoTo(prev); resetRun(); }} />
    );
  }
  if (!q) return <main className="container">Turning the page…</main>;

  const gameType = q.type;
  const gameLabel = GAME_LABEL[resolveGame(chapter.game, qIndex)];

  return (
    <main className="container">
      <div className="chapter-banner anim-rise" style={{ background: `linear-gradient(135deg, ${chapter.hue}22, transparent)`, borderColor: chapter.hue + "55" }}>
        <div className="chapter-banner-l">
          <span style={{ fontSize: 24 }}>{chapter.sigil}</span>
          <div>
            <div className="chapter-banner-name font-display">{chapter.name}</div>
            <div className="chapter-banner-game">{gameLabel}{chapter.game === "trial" && " · Trial"}</div>
          </div>
        </div>
        <button className="btn-icon" onClick={onExit}>✕</button>
      </div>

      <div className="progress-dots">
        {Array.from({ length: chapter.q }).map((_, i) => (
          <div key={i} className="progress-dot" style={{ background: i < qIndex ? chapter.hue : i === qIndex ? "var(--text)" : "var(--hairline)" }} />
        ))}
        <span className="progress-count font-mono">{qIndex + 1}/{chapter.q}</span>
      </div>

      {phase === "ask" && (
        <div key={"timer" + qIndex} className="casting-ring-track">
          <div className="casting-ring-fill" style={{ animation: `castingDrain ${chapter.timeLimitMs}ms linear forwards` }} />
        </div>
      )}

      {quickStreak >= 2 && phase === "ask" && (
        <div className="velocity-strip">⚡ Velocity streak ×{quickStreak} — keep casting fast!</div>
      )}

      <div className="tier-row">
        <span className="tier-pill" style={{ background: TIER_COLOR[q.tier] + "22", color: TIER_COLOR[q.tier], border: `1px solid ${TIER_COLOR[q.tier]}55` }}>{TIER_LABEL[q.tier]}</span>
      </div>

      <div key={"card" + qIndex} className="anim-pop">
        <div className="parchment-card">
          {phase === "ask" ? (
            <>
              {gameType === "rune" && <RuneAssembly q={q} onAnswer={answer} />}
              {gameType === "curse" && <CurseBreaker q={q} onAnswer={answer} timeLimitMs={chapter.timeLimitMs} />}
              {gameType === "riddle" && <FamiliarsRiddle q={q} onAnswer={answer} />}
              {gameType === "rapid" && <RapidCasting q={q} onAnswer={answer} />}
            </>
          ) : (
            <Feedback q={q} correct={lastCorrect} breakdown={lastBreakdown} onNext={() => setQIndex((i) => i + 1)} last={qIndex + 1 >= chapter.q} />
          )}
        </div>
      </div>
    </main>
  );
}
