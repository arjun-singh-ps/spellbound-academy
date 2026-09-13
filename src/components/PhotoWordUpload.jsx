import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import { wordsFromText } from "../lib/extractWords.js";

// Photo -> on-device OCR (tesseract.js/WASM) -> a review checklist before
// anything is actually added to the word bank. The image itself is never
// uploaded anywhere; only the language model data tesseract needs is
// fetched over the network the first time it runs.
export default function PhotoWordUpload({ onAdd }) {
  const [preview, setPreview] = useState(null);
  const [state, setState] = useState("idle"); // idle | reading | review | error
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [note, setNote] = useState("");

  async function runOCR(file) {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setState("reading");
    setProgress(0);
    setCandidates([]);
    setNote("");
    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => { if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100)); },
      });
      const { data } = await worker.recognize(url);
      await worker.terminate();
      const found = wordsFromText(data.text || "");
      if (!found.length) {
        setState("error");
        setNote("No clear words found. A flatter, brighter photo of printed text reads best — or paste the words instead.");
        return;
      }
      setCandidates(found.map((w) => ({ w, keep: true })));
      setState("review");
    } catch (e) {
      setState("error");
      setNote("That image couldn't be read (" + (e && e.message ? e.message : "unknown error") + "). Try a clearer photo, or paste the words instead.");
    }
  }

  function onFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) runOCR(file);
  }

  function confirm() {
    const keep = candidates.filter((c) => c.keep).map((c) => c.w);
    const n = onAdd(keep);
    setNote(`Added ${n} word(s) from the photo.`);
    setState("idle");
    setCandidates([]);
    setPreview(null);
  }
  function cancel() { setState("idle"); setCandidates([]); setPreview(null); }

  return (
    <div>
      <label className="file-btn" style={{ display: "inline-flex", marginBottom: 4 }}>
        📷 Upload a photo of a word list
        <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
      </label>

      {state === "reading" && (
        <div className="card-tight row" style={{ gap: 12, marginTop: 10, alignItems: "center" }}>
          {preview && <img src={preview} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid var(--hairline)", flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 13.5 }}>Reading the photo… {progress}%</div>
            <div style={{ height: 7, background: "var(--wood-950)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,var(--gold-300),var(--gold-600))", transition: "width .3s" }} />
            </div>
            <div className="faint" style={{ marginTop: 6 }}>The photo stays on this device — it's never uploaded anywhere.</div>
          </div>
        </div>
      )}

      {state === "review" && (
        <div className="panel" style={{ marginTop: 10 }}>
          <h3 style={{ fontSize: 14, margin: "0 0 8px" }}>Found {candidates.length} word(s) — check before adding</h3>
          <p className="muted">Tap to keep or drop. Photos of handwriting can misread, so this matters.</p>
          <div className="grid-auto" style={{ marginTop: 10 }}>
            {candidates.map((c, i) => (
              <button key={c.w + i} className="word-chip" style={{ opacity: c.keep ? 1 : 0.4 }}
                onClick={() => setCandidates((arr) => arr.map((x, idx) => idx === i ? { ...x, keep: !x.keep } : x))}>
                <span>{c.w}</span><span className="faint">{c.keep ? "keep ✓" : "drop"}</span>
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={cancel}>Cancel</button>
            <button className="btn btn-primary" onClick={confirm}>Add {candidates.filter((c) => c.keep).length} word(s) →</button>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="card-tight" style={{ marginTop: 10, color: "var(--ruby-soft)" }}>
          {note} <button className="btn-link" onClick={cancel}>Dismiss</button>
        </div>
      )}
      {state === "idle" && note && <div className="card-tight" style={{ marginTop: 10, color: "var(--gold-300)" }}>{note}</div>}
    </div>
  );
}
