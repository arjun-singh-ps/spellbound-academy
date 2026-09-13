// Data-access layer. Talks to real Firebase (Auth + Firestore) when the
// app has been connected to a project; otherwise falls back to a local
// "demo mode" backed by localStorage so the Academy is fully playable
// (single browser, single device) before you've deployed anything.
import { auth, db, isFirebaseConfigured } from "../firebase.js";
import {
  onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function emptyChild(name) {
  return { name, unlockedTo: 1, stars: {}, totalScore: 0, bestStreak: 0, stats: {}, history: [] };
}
export function emptyFamily(email) {
  return {
    email,
    parentPin: "1234",
    plan: "free", // "free" | "pro" | "pro_gift" (see PLAN_LIMITS in lib/plan.js)
    createdAt: Date.now(),
    mockDate: "2027-05-27",
    examDate: "2027-09-30",
    board: "all",
    removedWords: [],
    customWords: [],
    children: {},
  };
}
export { emptyChild };

// ---------------- Auth ----------------

export function subscribeAuth(callback) {
  if (isFirebaseConfigured) return onAuthStateChanged(auth, callback);
  // Demo mode: restore any locally "signed in" user, synchronously-ish.
  const raw = localStorage.getItem("academy_demo_user");
  callback(raw ? JSON.parse(raw) : null);
  return () => {};
}

export async function signUpWithEmail(email, password) {
  if (isFirebaseConfigured) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  }
  const user = { uid: "demo:" + email.toLowerCase(), email: email.toLowerCase(), isDemo: true };
  localStorage.setItem("academy_demo_user", JSON.stringify(user));
  return user;
}

export async function signInWithEmail(email, password) {
  if (isFirebaseConfigured) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }
  const user = { uid: "demo:" + email.toLowerCase(), email: email.toLowerCase(), isDemo: true };
  localStorage.setItem("academy_demo_user", JSON.stringify(user));
  return user;
}

export async function signOutUser() {
  if (isFirebaseConfigured) { await fbSignOut(auth); return; }
  localStorage.removeItem("academy_demo_user");
}

// ---------------- Family data ----------------

export async function getOrCreateFamily(uid, email) {
  if (isFirebaseConfigured) {
    const ref = doc(db, "families", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();
    const fresh = emptyFamily(email);
    await setDoc(ref, fresh);
    return fresh;
  }
  const key = "academy_family_" + uid;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  const fresh = emptyFamily(email);
  localStorage.setItem(key, JSON.stringify(fresh));
  return fresh;
}

export async function saveFamily(uid, family) {
  if (isFirebaseConfigured) { await setDoc(doc(db, "families", uid), family); return; }
  localStorage.setItem("academy_family_" + uid, JSON.stringify(family));
}
