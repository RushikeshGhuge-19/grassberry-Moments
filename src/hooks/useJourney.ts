import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Branch, DecisionTrace, JourneyState, Moment } from "../engine/types";
import { transition, SPEED_MOVING_THRESHOLD_KMH } from "../engine/stateMachine";
import { arrivalConfidence, dwellScore, stabilityScore, poiProximityScore } from "../engine/confidence";
import { decide } from "../engine/decide";
import { SEED_BRANCHES, SEED_VOUCHERS, DEMO_USER_ID } from "../data/seedBranches";
import { distanceMeters } from "../engine/geo";
import { fireMomentNotification } from "../notifications/notify";

export interface TraceLogEntry {
  trace: DecisionTrace;
  moment: Moment | null;
  at: number;
}

export function useJourney() {
  const [state, setState] = useState<JourneyState>("IDLE");
  const [dwellSeconds, setDwellSeconds] = useState(0);
  const [lastPosition, setLastPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [lastSpeedKmh, setLastSpeedKmh] = useState(0);
  const [activeMoment, setActiveMoment] = useState<Moment | null>(null);
  const [traceLog, setTraceLog] = useState<TraceLogEntry[]>([]);
  const cooldowns = useRef<Map<string, number>>(new Map()); // merchantId -> expiry timestamp ms
  const alreadyArrivedHere = useRef<string | null>(null); // dedupe: don't re-fire every tick while sitting in ARRIVED
  const lastLiveTickAt = useRef<number | null>(null);
  const journeyStateRef = useRef<JourneyState>("IDLE");

  const [branches, setBranches] = useState<Branch[]>(SEED_BRANCHES);
  const branchesRef = useRef<Branch[]>(branches);
  useEffect(() => {
    branchesRef.current = branches;
  }, [branches]);

  /** Lets you test Live mode without driving to Nashik: drop a temporary
   * branch right where you're standing. */
  const addTestBranchHere = useCallback((lat: number, lng: number) => {
    const newBranch: Branch = {
      id: `test_${Date.now()}`,
      merchantId: "m_test",
      brandName: "Test Spot",
      branchName: "Your current location",
      category: "test",
      lat,
      lng,
      openHour: "00:00",
      closeHour: "23:59",
      status: "ACTIVE",
      discountPct: 20,
      headline: "20% test privilege — seeded at your location",
    };
    setBranches((prev) => [...prev, newBranch]);
  }, []);

  /** One-time merge point: folds Mappls-discovered Grassberry partners
   *  (already converted to Branch[]) into the engine's branch list, deduped
   *  by id. Called once after startup discovery resolves — GPS + decide()
   *  take it from there with no further network involvement. */
  const mergeDiscoveredPartners = useCallback((discovered: Branch[]) => {
    setBranches((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const additions = discovered.filter((b) => !existingIds.has(b.id));
      if (additions.length === 0) return prev;
      return [...prev, ...additions];
    });
  }, []);

  const liveCooldownSet = useCallback((): Set<string> => {
    const now = Date.now();
    const active = new Set<string>();
    cooldowns.current.forEach((expiresAt, merchantId) => {
      if (expiresAt > now) active.add(merchantId);
    });
    return active;
  }, []);

  const reset = useCallback(() => {
    setState("IDLE");
    setDwellSeconds(0);
    setLastPosition(null);
    setLastSpeedKmh(0);
    setActiveMoment(null);
    alreadyArrivedHere.current = null;
    lastLiveTickAt.current = null;
    journeyStateRef.current = "IDLE";
  }, []);

  /**
   * One tick of the engine. Call this from live GPS updates or from a
   * demo-mode scripted scenario — same function either way.
   */
  const tick = useCallback(
    (
      activity: Activity,
      speedKmh: number,
      lat: number,
      lng: number,
      stabilityOk: boolean = true,
      timestampMs?: number
    ) => {
      setDwellSeconds((prevDwell) => {
        let newDwell: number;
        const tracksDwell =
          journeyStateRef.current === "IN_TRANSIT" ||
          journeyStateRef.current === "ARRIVAL_CANDIDATE" ||
          journeyStateRef.current === "ARRIVED" ||
          journeyStateRef.current === "POST_ARRIVAL";

        if (timestampMs != null) {
          const previousTimestamp = lastLiveTickAt.current;
          lastLiveTickAt.current = timestampMs;
          const elapsedSeconds = previousTimestamp == null
            ? 0
            : Math.max(0, (timestampMs - previousTimestamp) / 1000);
          newDwell = tracksDwell && speedKmh <= SPEED_MOVING_THRESHOLD_KMH
            ? prevDwell + elapsedSeconds
            : 0;
        } else {
          // Demo ticks intentionally represent 15-second scripted steps.
          lastLiveTickAt.current = null;
          newDwell = tracksDwell && speedKmh <= SPEED_MOVING_THRESHOLD_KMH ? prevDwell + 15 : 0;
        }

        setState((prevState) => {
          const newState = transition(prevState, activity, speedKmh, newDwell, stabilityOk);
          journeyStateRef.current = newState;

          // Only evaluate a recommendation the moment we FIRST reach ARRIVED —
          // not on every subsequent tick while still sitting there.
          if (newState === "ARRIVED" && alreadyArrivedHere.current !== `${lat.toFixed(4)},${lng.toFixed(4)}`) {
            alreadyArrivedHere.current = `${lat.toFixed(4)},${lng.toFixed(4)}`;

            const currentBranches = branchesRef.current;
            const nearest = Math.min(...currentBranches.map((b) => distanceMeters(lat, lng, b.lat, b.lng)));
            const confidence = arrivalConfidence(
              1.0, // activity signal: we're confidently stationary/walking at this point
              stabilityScore(stabilityOk ? 10 : 90),
              dwellScore(newDwell),
              poiProximityScore(nearest),
              0,
              0.7
            );

            const nowHour = new Date().getHours() + new Date().getMinutes() / 60;
            const result = decide(
              currentBranches,
              SEED_VOUCHERS,
              liveCooldownSet(),
              lat,
              lng,
              confidence,
              nowHour
            );

            setTraceLog((prev) => [{ trace: result.trace, moment: result.moment, at: Date.now() }, ...prev]);

            if (result.moment) {
              setActiveMoment(result.moment);
              fireMomentNotification(result.moment).catch(() => {});
            }
          }

          if (newState !== "ARRIVED") {
            alreadyArrivedHere.current = null;
          }

          return newState;
        });

        return newDwell;
      });

      setLastPosition({ lat, lng });
      setLastSpeedKmh(speedKmh);
    },
    [liveCooldownSet]
  );

  const dismissMoment = useCallback((cooldownHours: number = 24) => {
    if (activeMoment) {
      cooldowns.current.set(activeMoment.merchantId, Date.now() + cooldownHours * 60 * 60 * 1000);
    }
    setActiveMoment(null);
  }, [activeMoment]);

  return {
    state,
    dwellSeconds,
    lastPosition,
    lastSpeedKmh,
    activeMoment,
    traceLog,
    branches,
    tick,
    reset,
    dismissMoment,
    addTestBranchHere,
    mergeDiscoveredPartners,
  };
}