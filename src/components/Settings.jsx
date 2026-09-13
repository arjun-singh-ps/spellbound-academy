import React, { useState } from "react";
import { useApp } from "../state/AppState.jsx";
import { WORD_BANK, BOARDS } from "../data/words.js";
import { TIER_COLOR } from "../data/chapters.js";
import { limitsFor } from "../lib/plan.js";
import PhotoWordUpload from "./PhotoWordUpload.jsx";
import PdfWordUpload from "./PdfWordUpload.jsx";

export default function Settings() {
  const {
    family, addChild, removeChild, toggleWord, addCustomWords, removeCustomWord,
    setBoard, setParentPin, setMockDate, setExamDate,
  } = useApp();
  const [q, setQ] = useState("");
  const [newPin, setNewPin] = useState("");
  const [saved, setSaved] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [pasted, setPasted] = useState("");
  const [note, setNote] = useState("");

  const childNames = Object.entries(family.children);
  const limits = limitsFor(family.plan);
  const board = family.board || "all";
  const filtered = WORD_BANK.filter((e) => e.w.toLowerCase().includes(q.toLowerCase()));

  async function onFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const n = addCustomWords(text.split(/[\s,;\n\r]+/));
    setNote(`Added ${n} word(s) from ${file.name}.`);
    e.target.value = "";
  }

  return (
    <>
      <h2 className="font-display" style={{ fontSize: 25 }}>Settings</h2>

      <div className="panel" style={{ margin: "12px 0" }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Manage Wordsmiths</h3>
        <div className="grid-auto">
          {childNames.map(([id, c]) => (
            <div key={id} className="word-chip"><span>{c.name}</span><button className="chip-remove" onClick={() => removeChild(id)}>remove ✕</button></div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <input id="settings-new-child" className="field" value={newChildName} onChange={(e) => setNewChildName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (addChild(newChildName), setNewChildName(""))} placeholder="Add another Wordsmith…" />
          <button className="btn btn-primary" onClick={() => { addChild(newChildName); setNewChildName(""); }}
            disabled={childNames.length >= limits.maxChildren}>Add →</button>
        </div>
        {childNames.length >= limits.maxChildren && <p className="faint" style={{ marginTop: 6 }}>Free plan holds {limits.maxChildren} profile — see Membership to add more.</p>}
      </div>

      <div className="panel" style={{ margin: "12px 0" }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Exam calendar</h3>
        <div className="row">
          <label className="field-label">Mocks<input id="mock-date" className="field" type="date" value={family.mockDate || ""} onChange={(e) => setMockDate(e.target.value)} /></label>
          <label className="field-label">Exam<input id="exam-date" className="field" type="date" value={family.examDate || ""} onChange={(e) => setExamDate(e.target.value)} /></label>
        </div>
        <p className="muted">The shelf countdown and revision pace scale to these dates.</p>
      </div>

      <div className="panel" style={{ margin: "12px 0" }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Parent PIN</h3>
        <div className="row">
          <input id="new-pin" className="field" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="New 4-digit PIN" inputMode="numeric" maxLength={6} />
          <button className="btn btn-primary" onClick={() => { if (newPin.length >= 4) { setParentPin(newPin); setNewPin(""); setSaved(true); setTimeout(() => setSaved(false), 1500); } }}>Save</button>
        </div>
        {saved && <div className="card-tight" style={{ marginTop: 8, color: "var(--gold-300)" }}>PIN updated.</div>}
      </div>

      <div className="panel" style={{ margin: "12px 0" }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Exam board</h3>
        <div className="row">
          {Object.entries(BOARDS).map(([id, b]) => (
            <button key={id} className={"board-btn" + (board === id ? " active" : "")} onClick={() => setBoard(id)}>{b.label}</button>
          ))}
        </div>
      </div>

      <div className="panel" style={{ margin: "12px 0" }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Add your own words</h3>
        <p className="muted">Snap a photo, upload a PDF or a .txt/.csv, or paste this week's spelling list. {!limits.customWords && "(Pro feature — free plan can still preview it here.)"}</p>

        <PhotoWordUpload onAdd={addCustomWords} />
        <PdfWordUpload onAdd={addCustomWords} />

        <textarea id="paste-words" className="field" style={{ marginTop: 14 }} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={"Or paste words, comma or new-line separated…\ne.g. rhythm, conscience, queue"} />
        <div className="row">
          <button className="btn btn-primary" onClick={() => { const n = addCustomWords(pasted.split(/[\n,;]+/)); setNote(`Added ${n} word(s).`); setPasted(""); }}>Add words →</button>
          <label className="file-btn">📄 Upload .txt/.csv<input type="file" accept=".txt,.csv" onChange={onFile} style={{ display: "none" }} /></label>
        </div>
        {note && <div className="card-tight" style={{ marginTop: 10, color: "var(--gold-300)" }}>{note}</div>}
        {family.customWords && family.customWords.length > 0 && (
          <div className="grid-auto" style={{ marginTop: 12 }}>
            {family.customWords.map((e, i) => (
              <div key={e.w + i} className="word-chip"><span>{e.w}</span><button className="chip-remove" onClick={() => removeCustomWord(e.w)}>remove ✕</button></div>
            ))}
          </div>
        )}
      </div>

      <div className="panel" style={{ margin: "12px 0" }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Inbuilt word list</h3>
        <p className="muted">Untick any word to remove it from every chapter.</p>
        <input id="word-search" className="field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
        <div className="grid-auto" style={{ marginTop: 10 }}>
          {filtered.map((e) => { const isIn = !(family.removedWords || []).includes(e.w); return (
            <button key={e.w} className="word-chip" style={{ opacity: isIn ? 1 : 0.4, borderColor: isIn ? TIER_COLOR[e.t] + "66" : undefined }} onClick={() => toggleWord(e.w)}>
              <span>{e.w}</span><span className="faint">{isIn ? "in ✓" : "out"}</span>
            </button>
          ); })}
        </div>
      </div>
    </>
  );
}
