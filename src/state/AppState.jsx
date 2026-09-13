import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { isFirebaseConfigured } from "../firebase.js";
import {
  subscribeAuth, signUpWithEmail, signInWithEmail, signOutUser,
  getOrCreateFamily, saveFamily, emptyChild,
} from "../lib/store.js";
import { CHAPTERS } from "../data/chapters.js";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [currentChildId, setCurrentChildId] = useState(null);
  const [viewChildId, setViewChildId] = useState(null);
  const [mode, setMode] = useState("loading"); // loading | auth | profiles | student | parent
  const [sub, setSub] = useState("map"); // student: map | chapter
  const [parentSub, setParentSub] = useState("reports"); // parent: reports | settings | billing
  const [pinPrompt, setPinPrompt] = useState(false);
  const [activeChapter, setActiveChapter] = useState(null);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsub = subscribeAuth(async (u) => {
      setUser(u);
      setAuthChecked(true);
      if (u) {
        const f = await getOrCreateFamily(u.uid, u.email);
        setFamily(f);
        setMode("profiles");
      } else {
        setFamily(null);
        setMode("auth");
      }
    });
    return unsub;
  }, []);

  // Debounced save, with an immediate flush on tab-hide/close so a
  // change made right before a reload or closed tab isn't lost to a
  // debounce window that never got to fire.
  const saveTimer = useRef(null);
  const pendingRef = useRef(null); // { uid, family } once a save is queued
  const flush = () => {
    if (!pendingRef.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const { uid, family: f } = pendingRef.current;
    pendingRef.current = null;
    saveFamily(uid, f).catch(() => {});
  };
  useEffect(() => {
    if (!family || !user) return;
    pendingRef.current = { uid: user.uid, family };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 350);
    return () => clearTimeout(saveTimer.current);
  }, [family, user]);
  useEffect(() => {
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  async function afterAuth(u) {
    setUser(u);
    const f = await getOrCreateFamily(u.uid, u.email);
    setFamily(f);
    setMode("profiles");
  }
  async function signUp(email, password) {
    setAuthError("");
    try { await afterAuth(await signUpWithEmail(email, password)); }
    catch (e) { setAuthError(friendlyAuthError(e)); throw e; }
  }
  async function signIn(email, password) {
    setAuthError("");
    try { await afterAuth(await signInWithEmail(email, password)); }
    catch (e) { setAuthError(friendlyAuthError(e)); throw e; }
  }
  async function signOut() {
    await signOutUser();
    setUser(null); setFamily(null);
    setCurrentChildId(null); setViewChildId(null); setMode("auth");
  }

  function patchFamily(mut) {
    setFamily((prev) => ({ ...prev, ...(typeof mut === "function" ? mut(prev) : mut) }));
  }
  function patchChild(id, mut) {
    setFamily((prev) => {
      const c = prev.children[id] || emptyChild(id);
      const nc = typeof mut === "function" ? mut(c) : { ...c, ...mut };
      return { ...prev, children: { ...prev.children, [id]: nc } };
    });
  }
  function addChild(name) {
    const n = name.trim(); if (!n) return null;
    const id = n.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
    patchFamily((prev) => ({ children: { ...prev.children, [id]: emptyChild(n) } }));
    setViewChildId(id);
    return id;
  }
  function removeChild(id) {
    patchFamily((prev) => { const c = { ...prev.children }; delete c[id]; return { children: c }; });
    if (currentChildId === id) setCurrentChildId(null);
    if (viewChildId === id) setViewChildId(null);
  }
  function finishChapter(chapter, pct, runScore, runBestStreak) {
    const passed = pct >= chapter.pass;
    patchChild(currentChildId, (c) => {
      const stars = { ...c.stars, [chapter.id]: Math.max(c.stars[chapter.id] || 0, pct) };
      let unlockedTo = c.unlockedTo;
      if (passed && chapter.id === unlockedTo && chapter.id < CHAPTERS.length) unlockedTo = chapter.id + 1;
      return { ...c, stars, totalScore: c.totalScore + runScore, bestStreak: Math.max(c.bestStreak, runBestStreak), unlockedTo };
    });
    return !passed ? (chapter.id > 1 ? "retreat" : "retry") : "pass";
  }
  function onRecord(statsKey, displayWord, correct, chapterId) {
    patchChild(currentChildId, (c) => {
      const s = c.stats[statsKey] || { box: 0, right: 0, wrong: 0 };
      const ns = correct
        ? { ...s, box: Math.min(5, s.box + 1), right: s.right + 1 }
        : { ...s, box: Math.max(0, s.box - 2), wrong: s.wrong + 1 };
      const history = [...c.history, { date: new Date().toISOString().slice(0, 10), word: displayWord, correct, chapter: chapterId }].slice(-300);
      return { ...c, stats: { ...c.stats, [statsKey]: ns }, history };
    });
  }

  function toggleWord(w) {
    patchFamily((prev) => {
      const list = prev.removedWords || [];
      const has = list.includes(w);
      return { removedWords: has ? list.filter((x) => x !== w) : [...list, w] };
    });
  }
  // Firestore caps a single document at 256 KiB and the whole family doc
  // also carries history/stats/settings, so custom words are capped by
  // actual serialized size (not just a word count) — comfortably fits a
  // full ~1000-word vocabulary list with room to spare for everything
  // else in the doc.
  const CUSTOM_WORDS_MAX_BYTES = 150 * 1024;
  function addCustomWords(list) {
    const cleaned = list.map((w) => w.trim()).filter((w) => /^[A-Za-z'-]{2,}$/.test(w))
      .map((w) => ({ w: w.toLowerCase(), t: w.length > 9 ? 3 : w.length > 6 ? 2 : 1, hook: "Your word — spell it carefully.", board: "gct", source: "parent" }));
    let added = 0;
    patchFamily((prev) => {
      const existing = prev.customWords || [];
      const have = new Set(existing.map((x) => x.w));
      const fresh = cleaned.filter((x) => !have.has(x.w));
      const combined = [...existing];
      let bytes = JSON.stringify(existing).length;
      for (const w of fresh) {
        const wBytes = JSON.stringify(w).length + 1;
        if (bytes + wBytes > CUSTOM_WORDS_MAX_BYTES) break;
        combined.push(w);
        bytes += wBytes;
        added++;
      }
      return { customWords: combined };
    });
    return added;
  }
  function removeCustomWord(w) { patchFamily((prev) => ({ customWords: (prev.customWords || []).filter((x) => x.w !== w) })); }
  function setBoard(b) { patchFamily({ board: b }); }
  function setParentPin(p) { patchFamily({ parentPin: p }); }
  function setMockDate(d) { patchFamily({ mockDate: d }); }
  function setExamDate(d) { patchFamily({ examDate: d }); }
  function setPlan(p) { patchFamily({ plan: p }); }

  const value = {
    authChecked, user, family, isFirebaseConfigured, authError,
    signUp, signIn, signOut,
    toggleWord, addCustomWords, removeCustomWord, setBoard, setParentPin, setMockDate, setExamDate, setPlan,
    currentChildId, setCurrentChildId, viewChildId, setViewChildId,
    mode, setMode, sub, setSub, parentSub, setParentSub,
    pinPrompt, setPinPrompt, activeChapter, setActiveChapter,
    patchFamily, patchChild, addChild, removeChild, finishChapter, onRecord,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function friendlyAuthError(e) {
  const code = e && e.code ? e.code : "";
  if (code.includes("email-already-in-use")) return "That email already has an account — try signing in instead.";
  if (code.includes("weak-password")) return "Password needs to be at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email or password didn't match.";
  if (code.includes("invalid-email")) return "That doesn't look like a valid email.";
  return "Something went wrong — please try again.";
}
