import React from "react";
import { useApp } from "../state/AppState.jsx";
import Reports from "./Reports.jsx";
import Settings from "./Settings.jsx";
import Billing from "./Billing.jsx";

export default function ParentDashboard() {
  const { family, viewChildId, setViewChildId, parentSub } = useApp();
  const entries = Object.entries(family.children);
  const child = viewChildId ? family.children[viewChildId] : null;

  return (
    <main className="container">
      {parentSub === "reports" && (
        <>
          {entries.length > 0 && (
            <div className="child-pill-row">
              {entries.map(([id, c]) => (
                <button key={id} className={"child-switch-pill" + (viewChildId === id ? " active" : "")} onClick={() => setViewChildId(id)}>{c.name}</button>
              ))}
            </div>
          )}
          {entries.length === 0
            ? <div className="panel"><p className="muted">Add a Wordsmith from Settings → Manage Wordsmiths to start tracking progress.</p></div>
            : child ? <Reports family={family} child={child} childName={child.name} /> : null}
        </>
      )}
      {parentSub === "settings" && <Settings />}
      {parentSub === "billing" && <Billing />}
    </main>
  );
}
