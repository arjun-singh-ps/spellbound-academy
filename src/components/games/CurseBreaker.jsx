import React from "react";

export default function CurseBreaker({ q, onAnswer, timeLimitMs }) {
  return (
    <>
      <div className="q-prompt">Tap the misspelt word before the curse scrolls away</div>
      <div className="scroll-track">
        <div className="scroll-runner" style={{ animation: `scrollLeft ${timeLimitMs}ms linear forwards` }}>
          {q.tokens.map((tok, i) => {
            const clean = tok.replace(/[.,!?]/g, "");
            return (
              <button key={i} className="scroll-word" onClick={() => onAnswer(clean.toLowerCase() === q.wrongToken.toLowerCase())}>{tok}</button>
            );
          })}
        </div>
      </div>
    </>
  );
}
