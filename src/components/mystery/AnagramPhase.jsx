import React, { useEffect, useState } from "react";
import { shuffle } from "../../lib/random.js";

// Drag-and-drop is notoriously flaky on iOS Safari, so tile arrangement
// uses the same proven tap-to-place pattern as Rune Assembly instead of
// native HTML5 drag — tiles are >=44px (Apple's minimum touch target),
// and a plain text input is always available alongside as the keyboard
// fallback the brief asked for.
export default function AnagramPhase({ word, onSolved }) {
  const [bank, setBank] = useState([]);
  const [tray, setTray] = useState([]);
  const [usedIds, setUsedIds] = useState([]);
  const [typed, setTyped] = useState("");
  const [failed, setFailed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBank(shuffle(word.w.split("").map((c, id) => ({ c, id }))));
    setTray([]); setUsedIds([]); setTyped(""); setFailed(false); setHintUsed(false); setMessage("");
  }, [word]);

  function tapTile(tile) {
    if (usedIds.includes(tile.id) || tray.length >= word.w.length) return;
    setTray((t) => [...t, tile]);
    setUsedIds((u) => [...u, tile.id]);
    setTyped("");
  }
  function undo() {
    if (!tray.length) return;
    const last = tray[tray.length - 1];
    setTray(tray.slice(0, -1));
    setUsedIds(usedIds.filter((id) => id !== last.id));
  }
  function onType(e) {
    setTyped(e.target.value);
    setTray([]); setUsedIds([]);
  }

  function currentGuess() {
    return (tray.length ? tray.map((t) => t.c).join("") : typed).trim().toLowerCase();
  }

  function submit() {
    const guess = currentGuess();
    if (guess.length !== word.w.length) { setMessage(`Fill in all ${word.w.length} letters first.`); return; }
    if (guess === word.w.toLowerCase()) {
      onSolved(!failed);
      return;
    }
    setFailed(true);
    setMessage("Not quite — try again.");
    setTray([]); setUsedIds([]); setTyped("");
  }

  function useHint() {
    if (hintUsed || tray.length >= word.w.length) return;
    const neededChar = word.w[tray.length];
    const candidate = bank.find((t) => !usedIds.includes(t.id) && t.c.toLowerCase() === neededChar.toLowerCase());
    if (candidate) { setTray((t) => [...t, candidate]); setUsedIds((u) => [...u, candidate.id]); }
    setHintUsed(true);
    setMessage("");
  }

  return (
    <>
      <div className="q-prompt">Unscramble the {word.w.length} letters to spell the mystery word</div>
      <div className="anagram-tray">
        {Array.from({ length: word.w.length }).map((_, i) => (
          <div key={i} className="anagram-slot">{tray[i] ? tray[i].c.toUpperCase() : ""}</div>
        ))}
      </div>
      <div className="anagram-bank">
        {bank.map((tile) => (
          <button key={tile.id} className="anagram-tile" disabled={usedIds.includes(tile.id)} onClick={() => tapTile(tile)}>{tile.c}</button>
        ))}
      </div>
      <div className="row" style={{ justifyContent: "center", marginTop: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={undo} disabled={!tray.length}>⌫ Undo</button>
      </div>

      <div className="faint" style={{ textAlign: "center", margin: "16px 0 6px" }}>or type it instead</div>
      <input id="anagram-type-input" className="field" value={typed} onChange={onType}
        placeholder="Type the mystery word…" style={{ textAlign: "center", fontSize: 18, fontFamily: "var(--font-mono)" }}
        maxLength={word.w.length} autoCapitalize="off" autoComplete="off" spellCheck={false} />

      {message && <p className="muted" style={{ textAlign: "center", color: "var(--ruby-soft)", marginTop: 10 }}>{message}</p>}
      {failed && !hintUsed && (
        <div className="row" style={{ justifyContent: "center", marginTop: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={useHint}>💡 Use a hint (reveals the next letter)</button>
        </div>
      )}

      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={submit}>Submit answer →</button>
    </>
  );
}
