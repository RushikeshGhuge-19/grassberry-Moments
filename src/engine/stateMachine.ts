/**
 * Journey state machine. Same logic as the PRD's section 5.1/5.2 table.
 * Ported 1:1 from the original Python prototype (state_machine.py) so the
 * two stay provably equivalent.
 *
 * The red-light case: ARRIVAL_CANDIDATE reverts to IN_TRANSIT if movement
 * resumes before the dwell threshold is hit. That revert IS the false-stop
 * handling.
 */

import { Activity, JourneyState } from "./types";

export const SPEED_MOVING_THRESHOLD_KMH = 5.0;
export const DWELL_ARRIVED_THRESHOLD_SECONDS = 120; // 2 min

export function transition(
  current: JourneyState,
  activity: Activity,
  speedKmh: number,
  dwellSeconds: number,
  stabilityOk: boolean = true
): JourneyState {
  const isMoving = speedKmh > SPEED_MOVING_THRESHOLD_KMH;

  switch (current) {
    case "IDLE":
      if (activity === "automotive" && isMoving) return "MOBILITY_STARTED";
      return "IDLE";

    case "MOBILITY_STARTED":
      if (activity === "automotive" && isMoving) return "IN_TRANSIT";
      if (!isMoving) return "IDLE";
      return "MOBILITY_STARTED";

    case "IN_TRANSIT":
      if (activity === "automotive" && isMoving) return "IN_TRANSIT";
      if (!isMoving) return "ARRIVAL_CANDIDATE";
      return "IN_TRANSIT";

    case "ARRIVAL_CANDIDATE":
      if (isMoving) return "IN_TRANSIT"; // red-light / false-stop revert
      if (stabilityOk && dwellSeconds >= DWELL_ARRIVED_THRESHOLD_SECONDS) {
        return "ARRIVED";
      }
      return "ARRIVAL_CANDIDATE";

    case "ARRIVED":
      if (activity === "walking") return "POST_ARRIVAL";
      if (activity === "automotive" && isMoving) return "IN_TRANSIT";
      return "ARRIVED";

    case "POST_ARRIVAL":
      if (activity === "automotive" && isMoving) return "IN_TRANSIT";
      return "POST_ARRIVAL";

    default:
      return current;
  }
}
