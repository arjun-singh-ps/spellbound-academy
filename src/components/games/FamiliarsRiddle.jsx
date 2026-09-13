import React, { useRef, useState } from "react";

export default function FamiliarsRiddle({ q, onAnswer }) {
  if (q.sub === "analogy") {
    const a = q.analogy;
    return (
      <>
        <div className="q-prompt">Complete the analogy</div>
        <div className="riddle-stem font-display">{a.a} <span className="riddle-arrow">→</span> {a.b} &nbsp;::&nbsp; {a.c} <span className="riddle-arrow">→</span> ?</div>
        <div className="choice-list">
          {q.options.map((o, i) => (
            <button key={o.label + i} className="choice-row" onClick={() => onAnswer(o.isAnswer)}>
              <span className="choice-letter" style={{ background: "var(--sapphire)" }}>{"ABCD"[i]}</span>
              <span className="choice-label">{o.label}</span>
            </button>
          ))}
        </div>
      </>
    );
  }
  return <SynAntCard pair={q.pair} onAnswer={onAnswer} />;
}

function SynAntCard({ pair, onAnswer }) {
  const [drag, setDrag] = useState({ x: 0, active: false });
  const startX = useRef(0);
  const judged = useRef(false);

  function down(e) {
    if (judged.current) return;
    startX.current = e.clientX;
    setDrag({ x: 0, active: true });
  }
  function move(e) {
    if (!drag.active || judged.current) return;
    setDrag({ x: e.clientX - startX.current, active: true });
  }
  function up() {
    if (judged.current) return;
    if (Math.abs(drag.x) > 90) {
      judge(drag.x > 0 ? "syn" : "ant");
    } else {
      setDrag({ x: 0, active: false });
    }
  }
  function judge(guess) {
    if (judged.current) return;
    judged.current = true;
    onAnswer(guess === pair.rel);
  }

  return (
    <>
      <div className="q-prompt">Are these synonyms or antonyms?</div>
      <div className="swipe-card-wrap">
        <div className="swipe-card" role="button" tabIndex={0}
          style={{ transform: `translateX(${drag.x}px) rotate(${drag.x / 18}deg)`, transition: drag.active ? "none" : "transform .25s ease" }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up}
          onPointerLeave={() => !judged.current && setDrag({ x: 0, active: false })}>
          {pair.a} <span style={{ opacity: 0.5 }}>/</span> {pair.b}
        </div>
      </div>
      <div className="swipe-hint"><span>← Antonyms</span><span>Synonyms →</span></div>
      <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => judge("ant")}>Antonyms</button>
        <button className="btn btn-primary btn-sm" onClick={() => judge("syn")}>Synonyms</button>
      </div>
    </>
  );
}
