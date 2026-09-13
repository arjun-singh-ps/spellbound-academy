# Spellbound Academy

A gamified 11+ spelling, vocabulary and verbal-reasoning trainer. Parents
sign in with a real email/password account, add one profile per child
("Wordsmith"), and switch into a PIN-locked Parent Dashboard to manage
word lists, exam dates, and (eventually) billing. Kids play through a
five-chapter "Grimoire" of four original game formats, all sharing one
scoring engine that pays a real bonus for answering quickly.

## Games

| Chapter | Game | What it tests |
|---|---|---|
| 1. Foundations | **Rune Assembly** | Hear a word, tap its letters into place before the casting ring closes |
| 2. The Long Scroll | **Curse Breaker** | A sentence scrolls across the desk — tap the misspelt word before it scrolls away |
| 3. The Familiar's Study | **Familiar's Riddle** | Analogies (tap) and synonym/antonym pairs (swipe) — verbal reasoning & vocabulary |
| 4. Rapid Casting Hall | **Rapid Casting** | Pure speed: judge a word right/wrong against a 4-second clock |
| 5. Magister's Trial | All four, mixed | Fiendish words only, the final exam |

Every correct answer scores `base (by difficulty) + speed bonus (up to
+75% for a near-instant answer) + velocity combo (extra for a streak of
*fast* correct answers)` — see `src/lib/scoring.js`. The Result screen
breaks that down so a child can see exactly how speed paid off.

## Adding a school's word list

Parent Dashboard → Settings → **Add your own words** supports four ways
in, all client-side (nothing is uploaded to a server):

- Paste a list, or upload a `.txt`/`.csv`
- **Snap a photo** of a printed spelling list — on-device OCR (`tesseract.js`, WebAssembly) reads it in the browser
- **Upload a PDF** — extracts each page's embedded text layer directly (`pdfjs-dist`); any page with no usable text layer (a scanned/photographed page) falls back to rendering just that page and running it through the same OCR engine. This is decided per page, not once for the whole file, so a typed cover page followed by scanned worksheet pages is still read in full — one bad/unreadable page is also skipped rather than aborting the rest

Every path ends at the same **keep/drop review checklist** before
anything is actually added — OCR misreads, and a PDF's headers/page
numbers/instructions aren't spelling words, so nothing gets added
silently. For a large list the checklist has a search box and
keep-all/drop-all buttons rather than making you tap through hundreds
of chips one at a time. `pdfjs-dist` (~450KB) is lazy-loaded only when
a parent opens that panel, not part of the bundle every child downloads
to play.

Tested against a real 1000-word 11+ vocabulary PDF: extracted cleanly
in under 2 seconds, including working around a real-world PDF quirk
where certain exporters bake a stray space into ligature glyphs (`fi`,
`fl`, `ffi`, `ffl` — e.g. "confi scated" instead of "confiscated"),
which `src/lib/extractWords.js` corrects for. Custom words are capped
at ~150 KiB of serialized size (not just a word count) so a very large
import can't push the family's Firestore document over its 256 KiB
limit.

## Running locally (demo mode)

No setup required — it runs with progress saved only in this browser
(localStorage) until you connect Firebase:

```bash
npm install
npm run dev
```

## Connecting Firebase (real accounts + cross-device sync)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (this **is** Google Cloud — every Firebase project is also a GCP project).
2. **Build → Authentication → Get started → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (start in production mode — the rules in `firestore.rules` already lock every family's data to its own account).
4. **Project settings → General → Your apps → Add app → Web**, copy the config values into a new `.env` file (copy `.env.example` and fill it in).
5. `npm run dev` again — the demo-mode banner disappears once real config is detected.

## Deploying to Firebase Hosting (free, on Google Cloud)

```bash
npm install -g firebase-tools     # one-time
firebase login                    # opens a browser to sign in with your Google account
firebase use --add                # pick the project you created above
npm run build
firebase deploy --only hosting,firestore:rules
```

Firebase Hosting's free tier (10 GB storage, 360 MB/day transfer) comfortably
covers one family using this daily. You'll get a `https://<project>.web.app`
URL your son can bookmark/install to his homescreen (Safari → Share →
Add to Home Screen) for an app-like icon, no App Store needed.

### Give your own family Pro for free

The plan gate (`src/lib/plan.js`) has a third tier, `pro_gift`, that
isn't sold anywhere — it's the free-forever override for a self-hosted
deployment like this one. After you've signed in once, open the
Firestore console (Build → Firestore Database → your project), find
`families/<your uid>`, and edit the `plan` field to `"pro_gift"`. No
payment integration required.

## Going to the App Store (iPhone, paid subscription)

This React codebase is written so it can become a real iPhone app
without a rewrite:

1. **Wrap it with [Capacitor](https://capacitorjs.com/)** (`npm install @capacitor/core @capacitor/ios` then `npx cap init` / `npx cap add ios`) — it packages this same Vite build into a native iOS shell that opens in Xcode. This is the same technique used by many production App Store apps; it's the pragmatic path to "real app" without rewriting the UI in Swift.
2. **Subscriptions via [RevenueCat](https://www.revenuecat.com/)** — it wraps Apple's StoreKit so you don't hand-roll receipt validation. Define your Monthly/Annual products in App Store Connect, mirror them in RevenueCat, and swap `Billing.jsx`'s demo `setPlan()` call for RevenueCat's purchase flow; RevenueCat's webhook then updates the same `families/{uid}.plan` field server-side (a small Cloud Function) so entitlement stays in sync with the Firestore rules already in this repo.
3. **Apple Developer Program** ($99/yr) is required to submit. App Store review for subscription apps is stricter about clear pricing and a working restore-purchases flow — both are cheap to get right early.
4. **Push notifications** (weekly report nudges, streak reminders) would use `@capacitor/push-notifications` + Firebase Cloud Messaging, which is already part of the Firebase project you set up above.

None of this is wired up yet — `Billing.jsx` is a demo paywall (see the
notice on that screen) so you can see what Pro unlocks before spending
money on an Apple Developer account.

## Project layout

```
src/
  data/        word bank, verbal-reasoning bank, chapter config
  lib/         scoring engine, question builders, weighted word picker, plan gating, Firebase-or-localStorage store
  state/       AppState.jsx — the one context every screen reads from
  components/  screens (auth, profile picker, PIN gate, chapter map, parent dashboard) and components/games/ (the four game UIs)
```

## Known gaps (prototype, not production)

- No password reset / email verification flow yet (Firebase Auth supports both; not wired into the UI).
- No weekly email report sending (would need a scheduled Cloud Function + an email provider like SendGrid/Resend).
- The JS bundle is ~800 KB gzipped ~245 KB (mostly the Firebase SDK) — fine for a family app, worth code-splitting (`vite`'s dynamic `import()`) before wider release.
