import React, { useRef, useState } from "react";
import { useApp } from "../../state/AppState.jsx";
import { isPro } from "../../lib/plan.js";
import { pickContextPassage, buildContextQuestion, todayKey, TOKENS_PER_BONUS, POINTS_PER_CORRECT, FREE_DAILY_ATTEMPTS } from "../../lib/contextClues.js";
import ContextPicker from "./ContextPicker.jsx";
import ContextRound from "./ContextRound.jsx";
import AnagramPhase from "../mystery/AnagramPhase.jsx";

export default function ContextCluesFlow({ onExit, onUpgrade }) {
  const { family, currentChildId, onRecord, patchChild } = useApp();
  const child = family.children[currentChildId];
  const pro = isPro(family.plan);

  const [phase, setPhase] = useState("pick"); // pick | playing | bonus
  const [passageIndex, setPassageIndex] = useState(null);
  const [passage, setPassage] = useState(null);
  const [question, setQuestion] = useState(null);
  const [eliminated, setEliminated] = useState([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [flash, setFlash] = useState(null);
  const [bonusWord, setBonusWord] = useState(null);
  const usedRef = useRef(0);

  function loadNewPassage() {
    if (!pro && usedRef.current >= FREE_DAILY_ATTEMPTS) { setPhase("pick"); return; }
    const { index, passage: p } = pickContextPassage(passageIndex);
    setPassageIndex(index);
    setPassage(p);
    setQuestion(buildContextQuestion(p));
    setEliminated([]);
    setFlash(null);
    if (!pro) {
      usedRef.current += 1;
      patchChild(currentChildId, { contextDaily: { date: todayKey(), count: usedRef.current } });
    }
  }

  function start() {
    usedRef.current = child.contextDaily && child.contextDaily.date === todayKey() ? child.contextDaily.count : 0;
    setSessionScore(0);
    setPhase("playing");
    loadNewPassage();
  }

  function answer(i) {
    const correct = question.options[i].isAnswer;
    const firstAttempt = eliminated.length === 0;
    if (firstAttempt) {
      // Diagnostic accuracy (feeds the parent dashboard's "context
      // transfer" signal) is judged on the FIRST pick only — retries
      // below are there so a wrong guess doesn't just dead-end the
      // child, but they shouldn't inflate the accuracy stat.
      onRecord("ctx:" + passage.target, passage.target, correct, "context");
      patchChild(currentChildId, (c) => {
        const byCategory = { ...((c.contextStats && c.contextStats.byCategory) || {}) };
        const cat = byCategory[passage.category] || { right: 0, wrong: 0 };
        byCategory[passage.category] = correct ? { ...cat, right: cat.right + 1 } : { ...cat, wrong: cat.wrong + 1 };
        const prevRight = (c.contextStats && c.contextStats.right) || 0;
        const prevWrong = (c.contextStats && c.contextStats.wrong) || 0;
        return { ...c, contextStats: { byCategory, right: prevRight + (correct ? 1 : 0), wrong: prevWrong + (correct ? 0 : 1) } };
      });
    }
    if (!correct) { setEliminated((e) => [...e, i]); return; }

    setSessionScore((s) => s + POINTS_PER_CORRECT);
    setFlash("correct");
    let earnedTokens = 0;
    patchChild(currentChildId, (c) => {
      earnedTokens = (c.contextTokens || 0) + 1;
      return { ...c, totalScore: c.totalScore + POINTS_PER_CORRECT, contextTokens: earnedTokens };
    });

    setTimeout(() => {
      if (earnedTokens % TOKENS_PER_BONUS === 0) { setBonusWord(passage.target); setPhase("bonus"); }
      else loadNewPassage();
    }, 900);
  }

  function afterBonus(firstTry) {
    if (firstTry) {
      setSessionScore((s) => s + 30);
      patchChild(currentChildId, (c) => ({ ...c, totalScore: c.totalScore + 30 }));
    }
    setBonusWord(null);
    loadNewPassage();
  }

  if (phase === "pick") return <ContextPicker onStart={start} onExit={onExit} onUpgrade={onUpgrade} />;

  const tokenPos = (child.contextTokens || 0) % TOKENS_PER_BONUS;

  if (phase === "bonus" && bonusWord) {
    return (
      <main className="container">
        <div className="shelf-header">
          <h1 className="shelf-title" style={{ fontSize: 22 }}>🪙 Bonus Round!</h1>
          <p className="shelf-sub">Three Definition Tokens earned. Unscramble this word from the passages for +30 bonus points.</p>
        </div>
        <div className="parchment-card"><AnagramPhase word={{ w: bonusWord }} onSolved={afterBonus} /></div>
      </main>
    );
  }

  if (phase === "playing" && passage && question) {
    return (
      <main className="container">
        <div className="chapter-banner anim-rise" style={{ borderColor: "var(--ruby)55", background: "linear-gradient(135deg, var(--ruby)18, transparent)" }}>
          <div className="chapter-banner-l">
            <span style={{ fontSize: 24 }}>📖</span>
            <div>
              <div className="chapter-banner-name font-display">Context Clues</div>
              <div className="chapter-banner-game">Session: {sessionScore} pts</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onExit}>✕</button>
        </div>

        <div className="token-progress">
          {Array.from({ length: TOKENS_PER_BONUS }).map((_, i) => (
            <div key={i} className={"token-dot" + (i < tokenPos ? " earned" : "")} />
          ))}
          <span className="faint" style={{ marginLeft: 6 }}>{tokenPos}/{TOKENS_PER_BONUS} Definition Tokens</span>
        </div>

        {flash === "correct" && (
          <div className="card-tight" style={{ background: "#4fa07a22", color: "var(--emerald)", textAlign: "center", marginBottom: 10, fontWeight: 700 }}>
            ✓ Correct! +{POINTS_PER_CORRECT} points
          </div>
        )}

        <ContextRound passage={passage} question={question} eliminated={eliminated} onAnswer={answer} />
      </main>
    );
  }
  return null;
}
