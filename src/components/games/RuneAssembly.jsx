import React, { useEffect, useState } from "react";
import { speak, shuffle } from "../../lib/random.js";

export default function RuneAssembly({ q, onAnswer }) {
  const [bank, setBank] = useState([]);
  const [tray, setTray] = useState([]);
  const [usedIds, setUsedIds] = useState([]);

  useEffect(() => {
    setBank(shuffle(q.word.w.split("").map((c, i) => ({ c, id: i }))));
    setTray([]);
    setUsedIds([]);
    const t = setTimeout(() => speak(q.word.w), 350);
    return () => clearTimeout(t);
  }, [q]);

  function tapBank(tile) {
    if (usedIds.includes(tile.id) || tray.length >= q.word.w.length) return;
    const nextTray = [...tray, tile];
    setTray(nextTray);
    setUsedIds([...usedIds, tile.id]);
    if (nextTray.length === q.word.w.length) {
      const guess = nextTray.map((t) => t.c).join("").toLowerCase();
      setTimeout(() => onAnswer(guess === q.word.w.toLowerCase()), 180);
    }
  }
  function undo() {
    if (!tray.length) return;
    const last = tray[tray.length - 1];
    setTray(tray.slice(0, -1));
    setUsedIds(usedIds.filter((id) => id !== last.id));
  }

  return (
    <>
      <button className="listen-btn" onClick={() => speak(q.word.w)}>🔊 Hear the word again</button>
      <div className="q-prompt">Tap the runes into place to spell it</div>
      <div className="rune-tray">
        {Array.from({ length: q.word.w.length }).map((_, i) => (
          <div key={i} className="rune-slot">{tray[i] ? tray[i].c.toUpperCase() : ""}</div>
        ))}
      </div>
      <div className="rune-bank">
        {bank.map((tile) => (
          <button key={tile.id} className="rune-tile" disabled={usedIds.includes(tile.id)} onClick={() => tapBank(tile)}>{tile.c}</button>
        ))}
      </div>
      <div className="rune-actions">
        <button className="btn btn-ghost btn-sm" onClick={undo} disabled={!tray.length}>⌫ Undo last rune</button>
      </div>
    </>
  );
}
