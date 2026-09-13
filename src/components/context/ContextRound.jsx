import React from "react";
import MysteryQuestion from "../mystery/MysteryQuestion.jsx";

export default function ContextRound({ passage, question, eliminated, onAnswer }) {
  return (
    <div className="parchment-card">
      <div className="context-passage font-parchment">
        {passage.before}{" "}
        <span className="context-highlight">{passage.shown}</span>{" "}
        {passage.after}
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #00000018", margin: "16px 0" }} />
      <MysteryQuestion q={question} eliminated={eliminated} onAnswer={onAnswer} />
    </div>
  );
}
