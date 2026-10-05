/**
 * Candidate scoring — adapted from PRD section 11.1.
 *
 * Deliberate change from the PRD's own formula: voucher_owned weight bumped
 * from 0.20 to 0.35 (taken from distance/discount). The PRD's own text
 * (11.3) says an owned voucher should "often outrank" a generic discount —
 * flag this as an improvement you made on the spec when you pitch it.
 */

import { Candidate } from "./types";

export const WEIGHTS = {
  distance: 0.2,
  discount: 0.15,
  voucher: 0.35,
  categoryAffinity: 0.15,
  merchantAffinity: 0.15,
};

export const MAX_RELEVANT_DISTANCE_M = 500;
export const MAX_RELEVANT_DISCOUNT_PCT = 25;

export function score(c: Candidate): number {
  const distance = Math.max(0, 1 - c.distanceM / MAX_RELEVANT_DISTANCE_M);
  const discount = Math.min(c.discountPct / MAX_RELEVANT_DISCOUNT_PCT, 1);
  const voucher = c.voucherOwned ? 1 : 0;

  return (
    WEIGHTS.distance * distance +
    WEIGHTS.discount * discount +
    WEIGHTS.voucher * voucher +
    WEIGHTS.categoryAffinity * c.categoryAffinity +
    WEIGHTS.merchantAffinity * c.merchantAffinity
  );
}

export function rank(candidates: Candidate[]): Candidate[] {
  return [...candidates].sort((a, b) => score(b) - score(a));
}
