import React from "react";
import { useApp } from "../state/AppState.jsx";
import { PRICING, isPro } from "../lib/plan.js";

export default function Billing() {
  const { family, setPlan } = useApp();
  const pro = isPro(family.plan);

  return (
    <>
      <div className="paywall-hero">
        <span className={"plan-badge " + (pro ? "pro" : "free")}>{family.plan === "pro_gift" ? "Gifted Pro" : pro ? "Pro" : "Free plan"}</span>
        <h2 className="font-display" style={{ fontSize: 25, margin: "10px 0 6px" }}>Academy Membership</h2>
        <p className="muted" style={{ maxWidth: 440, margin: "0 auto" }}>
          Free gets one Wordsmith through Chapters 1–2. Pro unlocks the whole Grimoire, every Wordsmith in the family, custom word lists and the weekly parent report.
        </p>
      </div>

      <div className="pricing-grid">
        <div className="price-card">
          <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>Free</div>
          <div className="price-amount">£0</div>
          <div className="price-period">forever</div>
          <ul className="feature-list">
            <li>✅ 1 Wordsmith profile</li>
            <li>✅ Chapters 1–2</li>
            <li>❌ Custom word lists</li>
            <li>❌ Weekly parent report</li>
          </ul>
        </div>
        {PRICING.map((p) => (
          <div key={p.id} className={"price-card" + (p.id === "annual" ? " featured" : "")}>
            {p.badge && <span className="price-badge">{p.badge}</span>}
            <div style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{p.label}</div>
            <div className="price-amount">{p.price}</div>
            <div className="price-period">{p.period}</div>
            <ul className="feature-list">
              <li>✅ Up to 6 Wordsmiths</li>
              <li>✅ The full Grimoire</li>
              <li>✅ Custom word lists</li>
              <li>✅ Weekly parent report</li>
            </ul>
            <button className="btn btn-primary btn-block" onClick={() => setPlan("pro")} disabled={pro}>
              {pro ? "Current plan" : "Continue"}
            </button>
          </div>
        ))}
      </div>

      <div className="panel">
        <p className="muted" style={{ margin: 0 }}>
          <strong style={{ color: "var(--text)" }}>This is a demo build.</strong> The buttons above flip your plan locally so you can see what Pro unlocks — no card is charged, nothing is billed. A live version wires this to Stripe (web) or StoreKit via RevenueCat (iOS), described in the project README's "Going to the App Store" section.
        </p>
      </div>
      {pro && (
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn-link" onClick={() => setPlan("free")}>Reset to free plan (demo)</button>
        </div>
      )}
    </>
  );
}
