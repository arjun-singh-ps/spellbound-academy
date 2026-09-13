import React, { useState } from "react";
import { useApp } from "../../state/AppState.jsx";
import { buildPool } from "../../lib/pool.js";
import { pickMysteryWord, buildMysteryQuestions } from "../../lib/mysteryChallenge.js";
import MysteryPicker from "./MysteryPicker.jsx";
import MysteryQuestion from "./MysteryQuestion.jsx";
import AnagramPhase from "./AnagramPhase.jsx";
import MysteryResult from "./MysteryResult.jsx";

export default function MysteryChallengeFlow({ onExit }) {
  const { family, currentChildId, onRecord, patchChild } = useApp();
  const [phase, setPhase] = useState("pick"); // pick | questions | anagram | result
  const [difficulty, setDifficulty] = useState(null);
  const [word, setWord] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const [glowIndex, setGlowIndex] = useState(-1);
  const [eliminated, setEliminated] = useState([]);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  function start(diff) {
    const pool = buildPool(family);
    const child = family.children[currentChildId];
    const w = pickMysteryWord();
    const qs = buildMysteryQuestions(pool, child.stats, diff);
    setDifficulty(diff);
    setWord(w);
    setQuestions(qs);
    setQIndex(0);
    setRevealed(Array(w.w.length).fill(null));
    setGlowIndex(-1);
    setEliminated([]);
    setScore(0);
    setResult(null);
    setPhase("questions");
  }

  function answer(i) {
    const q = questions[qIndex];
    const correct = q.options[i].isAnswer;
    onRecord(q.statsKey, q.targetWord, correct, "mystery");
    if (!correct) { setEliminated((e) => [...e, i]); return; }
    const letter = word.w[qIndex];
    setRevealed((r) => { const n = [...r]; n[qIndex] = letter; return n; });
    setGlowIndex(qIndex);
    setScore((s) => s + 10);
    setTimeout(() => {
      setEliminated([]);
      const nextIndex = qIndex + 1;
      if (nextIndex >= questions.length) setPhase("anagram");
      else setQIndex(nextIndex);
    }, 700);
  }

  function onAnagramSolved(firstTry) {
    const bonus = firstTry ? 50 : 0;
    const finalScore = score + bonus;
    patchChild(currentChildId, (c) => ({
      ...c,
      totalScore: c.totalScore + finalScore,
      mysteryAttempts: [
        ...(c.mysteryAttempts || []),
        { date: new Date().toISOString().slice(0, 10), difficulty, word: word.w, score: finalScore, bonus: firstTry },
      ].slice(-20),
    }));
    setResult({ word: word.w, score: finalScore, bonus: firstTry, difficulty });
    setPhase("result");
  }

  if (phase === "pick") return <MysteryPicker onStart={start} onExit={onExit} />;

  if (phase === "questions" && questions[qIndex]) {
    const q = questions[qIndex];
    return (
      <main className="container">
        <div className="chapter-banner anim-rise" style={{ borderColor: "var(--sapphire)55", background: "linear-gradient(135deg, var(--sapphire)22, transparent)" }}>
          <div className="chapter-banner-l">
            <span style={{ fontSize: 24 }}>🔮</span>
            <div>
              <div className="chapter-banner-name font-display">Mystery Challenge</div>
              <div className="chapter-banner-game">{difficulty} · Question {qIndex + 1} of {questions.length}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onExit}>✕</button>
        </div>

        <div className="mystery-progress">{revealed.filter(Boolean).length} of {questions.length} letters revealed</div>
        <div className="mystery-tray">
          {revealed.map((letter, i) => (
            <div key={i} className={"mystery-slot" + (letter ? " filled" : "") + (glowIndex === i ? " glow" : "")}>
              {letter ? letter.toUpperCase() : "?"}
            </div>
          ))}
        </div>

        <div className="parchment-card" style={{ marginTop: 16 }}>
          <MysteryQuestion q={q} eliminated={eliminated} onAnswer={answer} />
        </div>
      </main>
    );
  }

  if (phase === "anagram" && word) {
    return (
      <main className="container">
        <div className="shelf-header">
          <h1 className="shelf-title" style={{ fontSize: 24 }}>🔮 The Final Anagram</h1>
          <p className="shelf-sub">All {word.w.length} letters are revealed. Arrange them to spell the mystery word for a +50 bonus.</p>
        </div>
        <div className="parchment-card">
          <AnagramPhase word={word} onSolved={onAnagramSolved} />
        </div>
      </main>
    );
  }

  if (phase === "result" && result) {
    return <MysteryResult result={result} onDone={onExit} onRetry={() => start(difficulty)} />;
  }
  return null;
}
