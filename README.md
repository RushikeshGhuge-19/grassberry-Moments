# Grassberry Moments — phone prototype

Real app. Runs on your own Android or iPhone via Expo Go. No Mac, no App
Store, no backend server — the whole engine (state machine, confidence
scoring, filters, ranking, decision trace) runs on-device.
## Run it (first time)

```
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app (install from Play Store / App
Store first) on your phone. The app loads over your WiFi — phone and
laptop must be on the same network.


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
