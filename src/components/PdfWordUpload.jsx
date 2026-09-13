import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import { wordsFromText } from "../lib/extractWords.js";

// pdfjs-dist is ~450KB — loaded on demand (not at app startup) since only
// a parent opening this panel ever needs it, not every child just playing.
let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfjsLib, workerUrlModule]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrlModule.default;
      return pdfjsLib;
    });
  }
  return pdfjsPromise;
}

// PDF -> extract its embedded text layer (fast, exact) when there is one;
// a scanned/image-only PDF falls back to rendering each page to a canvas
// and running the same on-device OCR the photo importer uses. Either way
// nothing is added until the parent confirms it in the review checklist.
export default function PdfWordUpload({ onAdd }) {
  const [state, setState] = useState("idle"); // idle | reading | review | error
  const [progress, setProgress] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("");

  async function runPdf(file) {
    setState("reading");
    setProgress("Opening PDF…");
    setCandidates([]);
    setNote("");
    let ocrWorker = null;
    let skippedPages = 0;
    try {
      const pdfjsLib = await loadPdfjs();
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const maxPages = Math.min(pdf.numPages, 25);

      // Decide PAGE BY PAGE whether OCR is needed, rather than once for
      // the whole file — a common real-world PDF mixes a typed cover
      // page with scanned pages after it, and checking the file as a
      // whole would find the cover page's text, call it done, and never
      // look at the scanned pages that actually hold the word list.
      // Each page is also wrapped in its own try/catch so one page that
      // fails to parse or render doesn't abort every other page.
      const perPageWords = [];
      for (let i = 1; i <= maxPages; i++) {
        try {
          setProgress(`Reading page ${i} of ${maxPages}…`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          let pageWords = wordsFromText(content.items.map((it) => it.str).join(" "), { max: 500 });

          if (!pageWords.length) {
            // No usable text layer on this page — treat it as a scanned
            // image and OCR just this page.
            setProgress(`Page ${i} looks scanned — reading it visually…`);
            if (!ocrWorker) {
              ocrWorker = await createWorker("eng", 1, {
                logger: (m) => {
                  if (m.status === "recognizing text") setProgress(`Scanning page ${i} of ${maxPages}… ${Math.round(m.progress * 100)}%`);
                },
              });
            }
            // Cap the render size well under mobile Safari's canvas
            // limits — a full-resolution scanned page at scale:2 can
            // exceed what iOS allows, which would silently fail.
            const base = page.getViewport({ scale: 1 });
            const maxDim = 1800;
            const scale = Math.max(1, Math.min(2, maxDim / Math.max(base.width, base.height)));
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(viewport.width);
            canvas.height = Math.round(viewport.height);
            await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
            const { data } = await ocrWorker.recognize(canvas);
            pageWords = wordsFromText(data.text || "", { max: 500 });
          }
          perPageWords.push(...pageWords);
        } catch (pageErr) {
          skippedPages++;
          console.warn(`Spellbound Academy: skipped PDF page ${i} — ${pageErr && pageErr.message}`);
        }
      }
      if (ocrWorker) { await ocrWorker.terminate(); ocrWorker = null; }

      const found = Array.from(new Set(perPageWords)).slice(0, 1500);
      if (!found.length) {
        setState("error");
        setNote("No clear words found in that PDF. Try a clearer scan, or paste the words instead.");
        return;
      }
      setCandidates(found.map((w) => ({ w, keep: true })));
      setNote(skippedPages ? `Note: ${skippedPages} page(s) couldn't be read and were skipped.` : "");
      setState("review");
    } catch (e) {
      if (ocrWorker) { try { await ocrWorker.terminate(); } catch (_) { /* already gone */ } }
      setState("error");
      setNote("That PDF couldn't be read (" + (e && e.message ? e.message : "unknown error") + "). Try another file, or paste the words instead.");
    }
  }

  function onFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) runPdf(file);
  }

  function confirm() {
    const keep = candidates.filter((c) => c.keep).map((c) => c.w);
    const n = onAdd(keep);
    setNote(n < keep.length ? `Added ${n} word(s) — the rest were already in your list or hit the family word-list limit.` : `Added ${n} word(s) from the PDF.`);
    setState("idle");
    setCandidates([]);
    setFilter("");
  }
  function cancel() { setState("idle"); setCandidates([]); setFilter(""); }
  function toggleWord(w) { setCandidates((arr) => arr.map((x) => x.w === w ? { ...x, keep: !x.keep } : x)); }
  function setAllKeep(keep) { setCandidates((arr) => arr.map((x) => ({ ...x, keep }))); }

  return (
    <div style={{ marginTop: 12 }}>
      <label className="file-btn" style={{ display: "inline-flex" }}>
        📕 Upload a PDF word list
        <input type="file" accept="application/pdf" onChange={onFile} style={{ display: "none" }} />
      </label>

      {state === "reading" && (
        <div className="card-tight" style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{progress}</div>
          <div className="faint" style={{ marginTop: 6 }}>The file stays on this device the whole time.</div>
        </div>
      )}

      {state === "review" && (
        <div className="panel" style={{ marginTop: 10 }}>
          <h3 style={{ fontSize: 14, margin: "0 0 8px" }}>Found {candidates.length} word(s) — check before adding</h3>
          <p className="muted">PDFs often carry headers, page numbers and instructions too — drop anything that isn't a spelling word.</p>
          {note && <p className="muted" style={{ color: "var(--gold-300)" }}>{note}</p>}

          <div className="row" style={{ marginTop: 10 }}>
            <input className="field" style={{ flex: 1, minWidth: 140 }} placeholder="Search to filter…" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <button className="btn btn-ghost btn-sm" onClick={() => setAllKeep(true)}>Keep all</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setAllKeep(false)}>Drop all</button>
          </div>

          <div className="grid-auto" style={{ marginTop: 10, maxHeight: 420, overflowY: "auto", paddingRight: 4 }}>
            {candidates.filter((c) => c.w.includes(filter.trim().toLowerCase())).map((c) => (
              <button key={c.w} className="word-chip" style={{ opacity: c.keep ? 1 : 0.4 }} onClick={() => toggleWord(c.w)}>
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
