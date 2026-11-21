# ⏰ LastChance — Never Pay for Forgetting

**Every deadline that can cost you money, in one free place.**

People lose money quietly, on dates:

- **70% of people admit to forgetting to cancel a free trial and getting billed**
- About **3 in 4 subscribers** have been charged after a free trial because they
  failed to cancel it
- Unused and accidental subscriptions cost UK consumers an estimated
  **£688 million in a single year** — 40% auto-renewed without their knowledge,
  39% were free trials they forgot to cancel

Return windows close in 14–30 days. Warranties expire the week before something
breaks. Trials convert at midnight. These deadlines live scattered across
emails, receipts and memory — until they're gone.

Existing deadline apps are Android-only, iOS-only, limited to 3–5 free records,
or charge a subscription. **LastChance is the free, unlimited, works-everywhere
version people didn't have:**

- ❌ No record limits ❌ No subscription ❌ No ads ❌ No account
- ✅ Unlimited deadlines, every feature free, MIT open source
- ✅ Works on Android, iPhone and the web from one codebase

## What it tracks

📦 Product returns · 💸 Refund follow-ups · 🎟️ Free trials · 🔁 Subscription
renewals · 🛡️ Warranties · ☂️ Insurance · 🪪 Documents & ID expiry ·
🏋️ Memberships · 🧾 Bills · ✨ Anything custom

## Features

- **Auto deadline calculator** — pick a purchase date + window (7d–5y) and the
  deadline is worked out for you
- **Money at risk** — every deadline carries an amount; the dashboard totals
  what's at risk, what you've **saved** by acting in time, and what was lost
- **Urgency dashboard** — Overdue / Today / Next 7 days / Next 30 days / Later,
  colour-coded, with a “Needs action” alert list naming your exact next step
- **A checklist for every job** — each type comes with the real steps (pack it,
  label it, drop it, confirm the refund…) and tracks them per item
- **Calendar reminders that actually reach you** — one tap exports an `.ics`
  file with alarms 7, 3 and 1 day before *and* on the day, for any item or all
  of them, into Google / Apple Calendar
- **Search, filters and sorting** by type, status, amount or deadline
- **Saved-rate stats** — see your track record improve
- **Export / import (JSON)** — your data is yours, stored only on your device
- Dark mode, offline PWA, installable on Android & iOS

## Use it now

Open this repo's GitHub Pages site in any browser — it works as a web app.

## Install

### Android — APK
Releases on this repo carry `app-debug.apk` (built by GitHub Actions on version
tags), or open the web app in Chrome → ⋮ → **Install app**.

### iPhone / iPad
Open the web app in Safari → Share → **Add to Home Screen**.

## Build / develop

Plain HTML, CSS and JavaScript — no build step for the web version.

```bash
python3 -m http.server 8000   # web: http://localhost:8000
npm install                    # native wrappers (Capacitor)
mkdir -p www && cp index.html styles.css app.js manifest.webmanifest service-worker.js icon.svg www/
npx cap add android   # or ios
npx cap sync
```

Workflow sources live in `ci/`; copy them to `.github/workflows/` to activate
(GitHub restricts apps from writing workflow files directly — a repo owner can
add them in the web UI in under a minute).

## License

MIT — free for everyone, forever. See [LICENSE](LICENSE).
