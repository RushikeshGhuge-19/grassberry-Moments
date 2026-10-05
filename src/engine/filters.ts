/** Hard filters — PRD section 11.2. Runs before scoring. */

import { Candidate } from "./types";

function parseHour(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h + m / 60;
}

export function isOpen(openHour: string, closeHour: string, nowHour: number): boolean {
  return nowHour >= parseHour(openHour) && nowHour <= parseHour(closeHour);
}

export function hardFilters(
  c: Candidate,
  radiusM: number,
  nowHour: number
): { passes: boolean; reason: string | null } {
  if (c.status !== "ACTIVE") return { passes: false, reason: "CLOSED" };
  if (!isOpen(c.openHour, c.closeHour, nowHour)) return { passes: false, reason: "CLOSED" };
  if (c.distanceM > radiusM) return { passes: false, reason: "OUT_OF_RANGE" };
  if (c.onCooldown) return { passes: false, reason: "COOLDOWN" };
  return { passes: true, reason: null };
}
