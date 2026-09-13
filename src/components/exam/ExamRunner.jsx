import React, { useEffect, useRef, useState } from "react";
import "../../styles/exam.css";

function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
function fmtClockH(totalMs) {
  const s = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function QuestionBody({ q, answer, onSelect }) {
  if (q.type === "oddOneOut") {
    const letters = "ABCDE";
    return (
      <>
        <div className="xh-prompt">{q.prompt}</div>
        <hr className="xh-divider" />
        <div className="xh-answer-label">Answer</div>
        <div className="xh-options">
          {q.options.map((o, i) => (
            <button key={i} className={"xh-option" + (answer.selected === i ? " selected" : "")} onClick={() => onSelect(i)}>
              <span className="xh-letter">{letters[i]}</span>
              <span className="xh-option-text">{o.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  }
  const letters = "ABCD";
  return (
    <>
      <div className="xh-prompt">{q.prompt}</div>
      <hr className="xh-divider" />
      <div className="xh-sentence">
        {q.segments.map((seg, i) => (
          <span key={i} className={"xh-segment" + (answer.selected === i ? " selected" : "")} onClick={() => onSelect(i)}>
            <span className="xh-segtag">{letters[i]}</span>{seg}
          </span>
        )).reduce((acc, el, i) => acc.concat(i ? [" ", el] : [el]), [])}
        <span>.</span>
      </div>
      <button className={"xh-nomistake" + (answer.selected === "N" ? " selected" : "")} onClick={() => onSelect("N")}>
        <span className="xh-letter">N</span><span className="xh-option-text">No mistake</span>
      </button>
    </>
  );
}

export default function ExamRunner({ exam, questions, onFinish, onExit }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(() => ({ status: "unanswered", selected: null, flagged: false, timeMs: 0 })));
  const [secondsLeft, setSecondsLeft] = useState(exam.minutes * 60);
  const [status, setStatus] = useState("in_progress"); // in_progress | paused | locked
  const [showInfo, setShowInfo] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const activeStart = useRef(Date.now());

  useEffect(() => {
    if (status !== "in_progress") return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (secondsLeft === 0 && status === "in_progress") finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  useEffect(() => {
    if (status !== "locked") return;
    const perQuestion = questions.map((q, i) => {
      const a = answers[i];
      let correct;
      if (q.type === "oddOneOut") correct = a.selected !== null && q.options[a.selected] && q.options[a.selected].isAnswer;
      else correct = (a.selected === "N" && q.correctIndex === -1) || a.selected === q.correctIndex;
      return { q, answer: a, correct };
    });
    onFinish(perQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function flushTime(i) {
    const now = Date.now();
    const elapsed = now - activeStart.current;
    activeStart.current = now;
    setAnswers((arr) => arr.map((a, idx) => (idx === i ? { ...a, timeMs: a.timeMs + elapsed } : a)));
  }
  function goTo(i) {
    if (i === index || status !== "in_progress") return;
    flushTime(index);
    setIndex(i);
  }
  function select(value) {
    if (status !== "in_progress") return;
    setAnswers((arr) => arr.map((a, idx) => (idx === index ? { ...a, selected: value, status: "answered" } : a)));
  }
  function toggleFlag() {
    setAnswers((arr) => arr.map((a, idx) => (idx === index ? { ...a, flagged: !a.flagged } : a)));
  }
  function skip() {
    if (status !== "in_progress") return;
    setAnswers((arr) => arr.map((a, idx) => (idx === index ? (a.status === "answered" ? a : { ...a, status: "skipped" }) : a)));
    if (index < questions.length - 1) goTo(index + 1); else flushTime(index);
  }
  function togglePause() {
    if (status === "in_progress") { flushTime(index); setStatus("paused"); }
    else if (status === "paused") { activeStart.current = Date.now(); setStatus("in_progress"); }
  }
  function finish() {
    flushTime(index);
    setStatus("locked");
  }

  const answeredCount = answers.filter((a) => a.status === "answered").length;
  const skippedCount = answers.filter((a) => a.status === "skipped").length;
  const unansweredCount = answers.filter((a) => a.status === "unanswered").length;
  const flaggedCount = answers.filter((a) => a.flagged).length;
  const q = questions[index];
  const a = answers[index];
  const liveTimeMs = a.timeMs + (status === "in_progress" ? Date.now() - activeStart.current : 0);

  return (
    <div className="xh-root">
      <div className="xh-statusbar">
        <span>Questions: {questions.length}</span>
        <span>Answered: {answeredCount}</span>
        <span>Skipped: <b className="warn">{skippedCount}</b></span>
        <span>Unanswered: {unansweredCount}</span>
        <span>Flagged: <b className="flag">{flaggedCount}</b></span>
        <span className="xh-spacer" />
        <span>Status: {status === "paused" ? "PAUSED" : "IN PROGRESS"}</span>
      </div>

      <div className="xh-body">
        <div className="xh-main">
          <div className="xh-card">
            <div className="xh-qnum">Question {index + 1}</div>
            {status === "paused" ? (
              <p style={{ color: "var(--xh-text-dim)" }}>Exam paused. Press Resume in the bottom bar to continue.</p>
            ) : (
              <QuestionBody q={q} answer={a} onSelect={select} />
            )}
          </div>
        </div>

        <div className="xh-side">
          <div className="xh-side-head"><span>Q</span><span>Time</span></div>
          <div className="xh-side-list">
            {questions.map((_, i) => {
              const rowA = answers[i];
              const rowMs = i === index ? liveTimeMs : rowA.timeMs;
              return (
                <div key={i} className={"xh-side-row" + (i === index ? " active" : "")} onClick={() => goTo(i)}>
                  <span className="xh-qn">
                    {i === index ? "▶" : ""} {i + 1}
                    {rowA.flagged && " 🚩"}
                    {rowA.status === "answered" && <span className="xh-dot" style={{ background: "var(--xh-good)", marginLeft: 2 }} />}
                  </span>
                  <span className="xh-time">{fmtClock(rowMs / 1000)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="xh-bottombar">
        <button className="xh-iconbtn" onClick={() => setShowInfo(true)}>ℹ<span className="lbl">Info</span></button>
        <button className={"xh-iconbtn" + (a.flagged ? " flagged" : "")} onClick={toggleFlag}>🚩<span className="lbl">Flag</span></button>
        <div className="xh-bottom-center">{index + 1} / {questions.length}{status === "in_progress" && <> · <button className="xh-btn xh-btn-ghost" style={{ padding: "4px 12px", marginLeft: 8 }} onClick={skip}>Skip →</button></>}</div>
        <button className="xh-iconbtn" onClick={togglePause}>{status === "paused" ? "▶" : "⏸"}<span className="lbl">{status === "paused" ? "Resume" : "Pause"}</span></button>
        <button className="xh-iconbtn" style={{ background: "var(--xh-bad)" }} onClick={() => setShowFinishConfirm(true)}>🏁<span className="lbl">Finish</span></button>
        <div className="xh-timer-box">{fmtClock(secondsLeft)}</div>
      </div>

      {showInfo && (
        <div className="xh-overlay" onClick={() => setShowInfo(false)}>
          <div className="xh-modal" onClick={(e) => e.stopPropagation()}>
            <h3>How this mock exam works</h3>
            <p>Answer questions in any order — click a question in the right-hand list to jump to it. <b>Flag</b> a question to come back to it later. The clock in the bottom right counts down for the whole exam; it submits automatically at zero.</p>
            <div className="xh-modal-actions"><button className="xh-btn xh-btn-primary" onClick={() => setShowInfo(false)}>Got it</button></div>
          </div>
        </div>
      )}
      {showFinishConfirm && (
        <div className="xh-overlay" onClick={() => setShowFinishConfirm(false)}>
          <div className="xh-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Finish exam?</h3>
            <p>{unansweredCount > 0 || skippedCount > 0
              ? `You have ${unansweredCount + skippedCount} question(s) without an answer. You can't change answers after finishing.`
              : "Every question has an answer. You can't change answers after finishing."}</p>
            <div className="xh-modal-actions">
              <button className="xh-btn xh-btn-ghost" onClick={() => setShowFinishConfirm(false)}>Keep going</button>
              <button className="xh-btn xh-btn-primary" onClick={finish}>Finish exam</button>
            </div>
          </div>
        </div>
      )}
      {showExitConfirm && (
        <div className="xh-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="xh-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Leave the exam?</h3>
            <p>Your progress on this attempt will be lost — it won't be scored or saved.</p>
            <div className="xh-modal-actions">
              <button className="xh-btn xh-btn-ghost" onClick={() => setShowExitConfirm(false)}>Keep going</button>
              <button className="xh-btn xh-btn-primary" style={{ background: "var(--xh-bad)" }} onClick={onExit}>Leave without saving</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowExitConfirm(true)} title="Leave exam"
        style={{ position: "absolute", top: 10, right: 10, background: "#ffffff33", border: "1px solid #ffffff55", color: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer" }}>✕</button>
    </div>
  );
}
