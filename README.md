# Grassberry Moments — phone prototype

Real app. Runs on your own Android or iPhone via Expo Go. No Mac, no App
Store, no backend server — the whole engine (state machine, confidence
scoring, filters, ranking, decision trace) runs on-device, ported from
Rajat's PRD formulas.

## Run it (first time)

```
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (install from Play Store / App
Store first) on your phone. The app loads over your WiFi — phone and
laptop must be on the same network.

## Live brand discovery (new)

Home no longer shows only the 14 hand-seeded branches. With Live GPS on and
a key in `.env` (copy `.env.example`, see `src/config/places.ts`), the map
calls Google Places (New) Nearby Search around your actual position — same
source Google/Apple Maps use — and plots every nearby brand, refetching as
you move. Each pin is tagged against the Grassberry partner list (same
brand-match logic Edge runs at checkout): partner brands get their category
color and privilege headline, non-partners get a dim grey pin, and anything
Google reports as currently closed is shown dimmed with "Closed now" —
real-time, not the static `openHour`/`closeHour` fields in the seed data.
No key configured -> silently falls back to the seeded branches, so the
demo never depends on a live network call. This is cosmetic only for now:
the decision engine (`src/engine/`) still runs off `branches`
(seed + any test branch you drop), untouched — live-discovered pins don't
yet feed Moments. See "next" ideas in the pitch notes for promoting matched
live partners into the engine itself.

## Three tabs

- **Home** — a real map (Apple Maps on iOS, Google Maps on Android inside
  Expo Go, no API key needed) showing Nashik, every seeded branch as a
  pin, and your actual position once Live GPS is on. Below it: live engine
  status. Toggle "Live GPS mode" to feed your phone's real location and
  speed into the engine. A real system notification fires when it decides
  to show something.
- **Demo** — one-tap scripted scenarios (drive past, red light, park &
  arrive, repeat visit) that drive the same engine deterministically. Use
  this for recording the pitch video — it's repeatable, Live mode isn't.
- **Dashboard** — every decision logged with reason codes. This is the
  screen that proves it's a real ranked/filtered pipeline, not a toy.

## What's real vs simplified — say this in the pitch

- **Real**: state machine, arrival confidence formula, hard filters,
  scoring (voucher-owned weight intentionally bumped from 0.20 to 0.35 —
  PRD section 11.3 says it should "often outrank" a discount; the
  original weight didn't reliably do that), decision trace, branch data
  (hand-seeded, 14 Nashik-only coordinates), the map itself.
- **Simplified, flagged on purpose**: "activity" (automotive / walking /
  stationary) is classified from GPS speed, not real Core
  Motion / Activity Recognition sensors. Expo's managed workflow doesn't
  bind those natively — a real build would swap the classifier in
  `src/hooks/useLocationTracking.ts` without touching anything in
  `src/engine/`. No CarPlay, no Android Auto, no partner webhooks — out
  of scope for a prototype, in scope for "what I'd build next."

## Recording the demo

1. Demo tab → pick a branch → "Drive past at 40 km/h" → nothing happens.
2. Same branch → "Stop at a red light" → briefly candidate, reverts.
3. Same branch → "Park & arrive" → notification fires, Moment card appears.
4. Dismiss it → "Dismiss, then revisit immediately" → suppressed, cooldown.
5. Dashboard tab → show the reason codes behind all four.

## Project layout

```
src/engine/       state machine, confidence, filters, ranking, trace, decide()
src/data/         seeded branches + vouchers
src/hooks/        useJourney (engine state), useLocationTracking (real GPS)
src/notifications/ real local notification on Moment
src/screens/       Home, Demo, Dashboard
src/components/    MomentCard, NashikMap
```
