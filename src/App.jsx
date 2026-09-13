import React from "react";
import { useApp } from "./state/AppState.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import ProfilePicker from "./components/ProfilePicker.jsx";
import PinGate from "./components/PinGate.jsx";
import Topbar from "./components/Topbar.jsx";
import ChapterMap from "./components/ChapterMap.jsx";
import ChapterRunner from "./components/ChapterRunner.jsx";
import ParentDashboard from "./components/ParentDashboard.jsx";

export default function App() {
  const {
    authChecked, user, family, isFirebaseConfigured,
    mode, setMode, sub, setSub, pinPrompt,
    activeChapter, setActiveChapter,
  } = useApp();

  if (!authChecked || (user && !family)) {
    return <div className="app-shell"><main className="container center-text" style={{ paddingTop: 80 }}>Opening the Grimoire…</main></div>;
  }
  if (mode === "auth" || !user) {
    return <div className="app-shell"><AuthScreen /></div>;
  }
  if (pinPrompt) {
    return <div className="app-shell"><PinGate /></div>;
  }
  if (mode === "profiles") {
    return <div className="app-shell"><ProfilePicker /></div>;
  }

  return (
    <div className="app-shell">
      <Topbar />
      {!isFirebaseConfigured && (
        <div className="banner-warn">⚠ Demo mode — no Firebase project connected, so progress only lives on this device/browser.</div>
      )}
      {mode === "student" && sub === "map" && <ChapterMap />}
      {mode === "student" && sub === "chapter" && activeChapter && (
        <ChapterRunner chapter={activeChapter} onExit={() => setSub("map")} onGoTo={(ch) => setActiveChapter(ch)} />
      )}
      {mode === "parent" && <ParentDashboard />}
    </div>
  );
}
