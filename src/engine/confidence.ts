/**
 * Arrival confidence — PRD section 4.3.
 * confidence = 0.25*activity + 0.20*stability + 0.20*dwell + 0.20*poiProximity
 *            + 0.10*projection + 0.05*timeContext
 */

export const WEIGHTS = {
  activity: 0.25,
  stability: 0.2,
  dwell: 0.2,
  poiProximity: 0.2,
  projection: 0.1,
  timeContext: 0.05,
};

export const CONFIDENCE_THRESHOLD = 0.7;

export function arrivalConfidence(
  activity: number,
  stability: number,
  dwell: number,
  poiProximity: number,
  projection: number = 0,
  timeContext: number = 0.5
): number {
  return (
    WEIGHTS.activity * activity +
    WEIGHTS.stability * stability +
    WEIGHTS.dwell * dwell +
    WEIGHTS.poiProximity * poiProximity +
    WEIGHTS.projection * projection +
    WEIGHTS.timeContext * timeContext
  );
}

export function meetsThreshold(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLD;
}

export function dwellScore(dwellSeconds: number, targetSeconds = 120): number {
  return Math.max(0, Math.min(1, dwellSeconds / targetSeconds));
}

export function stabilityScore(locationVarianceM: number, thresholdM = 75): number {
  return Math.max(0, Math.min(1, 1 - locationVarianceM / thresholdM));
}

/** Closest-branch distance -> 0..1 proximity score. 0 at >=500m, 1 at 0m. */
export function poiProximityScore(nearestDistanceM: number, maxM = 500): number {
  return Math.max(0, Math.min(1, 1 - nearestDistanceM / maxM));
}
