import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { Activity } from "../engine/types";

/**
 * IMPORTANT SIMPLIFICATION, flag this in the pitch:
 * Expo's managed workflow has no direct binding to Core Motion (iOS) or the
 * Activity Recognition Transition API (Android) — those need a native dev
 * build. This hook substitutes GPS speed for the "activity" signal:
 *   < 1.5 km/h  -> stationary
 *   1.5-7 km/h  -> walking
 *   > 7 km/h    -> automotive
 * Good enough to prove the state machine and ranking logic. A real build
 * would swap this classifier for native motion APIs without touching
 * anything else in src/engine/.
 */
function classifyActivity(speedKmh: number): Activity {
  if (speedKmh > 7) return "automotive";
  if (speedKmh > 1.5) return "walking";
  return "stationary";
}

export function useLocationTracking(
  enabled: boolean,
  onTick: (
    activity: Activity,
    speedKmh: number,
    lat: number,
    lng: number,
    stabilityOk?: boolean,
    timestampMs?: number
  ) => void
) {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [lastKnown, setLastKnown] = useState<{ lat: number; lng: number; speedKmh: number } | null>(null);
  const subscription = useRef<Location.LocationSubscription | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestSample = useRef<{
    activity: Activity;
    speedKmh: number;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (Platform.OS === "web") {
        setPermissionGranted(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      setPermissionGranted(status === "granted");
      if (status !== "granted" || !enabled) return;

      subscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 0 },
        (loc) => {
          const speedMs = loc.coords.speed ?? 0;
          const speedKmh = Math.max(0, speedMs * 3.6);
          const activity = classifyActivity(speedKmh);
          const isFirstFix = latestSample.current === null;
          latestSample.current = {
            activity,
            speedKmh,
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          };
          setLastKnown({ lat: loc.coords.latitude, lng: loc.coords.longitude, speedKmh });
          if (isFirstFix) {
            onTick(activity, speedKmh, loc.coords.latitude, loc.coords.longitude, true, loc.timestamp);
          }
        }
      );

      refreshTimer.current = setInterval(() => {
        const sample = latestSample.current;
        if (!sample) return;
        onTick(sample.activity, sample.speedKmh, sample.lat, sample.lng, true, Date.now());
      }, 1000);
    }

    start();

    return () => {
      cancelled = true;
      subscription.current?.remove();
      subscription.current = null;
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      refreshTimer.current = null;
      latestSample.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { permissionGranted, lastKnown };
}
