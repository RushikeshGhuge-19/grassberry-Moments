/**
 * decide() — ties distance (geo.ts) -> hard filters (filters.ts) ->
 * scoring (ranking.ts) -> trace (trace.ts) together. Same shape as the
 * Python prototype's decide.py, running entirely on-device.
 */

import { Branch, Candidate, DecisionTrace, Moment, VoucherRecord } from "./types";
import { distanceMeters } from "./geo";
import { hardFilters } from "./filters";
import { rank } from "./ranking";
import { buildTrace } from "./trace";
import { meetsThreshold } from "./confidence";

export interface DecideResult {
  moment: Moment | null;
  trace: DecisionTrace;
}

export function decide(
  branches: Branch[],
  vouchers: VoucherRecord[],
  cooldownMerchantIds: Set<string>,
  lat: number,
  lng: number,
  contextConfidence: number,
  nowHour: number,
  radiusM: number = 500
): DecideResult {
  if (!meetsThreshold(contextConfidence)) {
    return {
      moment: null,
      trace: buildTrace([], [], null, contextConfidence, ["LOW_CONFIDENCE"]),
    };
  }

  const voucherByMerchant = new Map(vouchers.map((v) => [v.merchantId, v.balance]));

  const candidates: Candidate[] = branches.map((b) => {
    const voucherBalance = voucherByMerchant.get(b.merchantId) ?? 0;
    return {
      branchId: b.id,
      branchName: b.branchName,
      brandName: b.brandName,
      merchantId: b.merchantId,
      distanceM: distanceMeters(lat, lng, b.lat, b.lng),
      status: b.status,
      openHour: b.openHour,
      closeHour: b.closeHour,
      onCooldown: cooldownMerchantIds.has(b.merchantId),
      discountPct: b.discountPct,
      headline: b.headline,
      voucherOwned: voucherBalance > 0,
      voucherBalance,
      categoryAffinity: 0.5, // placeholder — no affinity model in the prototype
      merchantAffinity: 0.5,
    };
  });

  const eligible: Candidate[] = [];
  const rejected: { candidate: Candidate; reason: string }[] = [];

  for (const c of candidates) {
    const { passes, reason } = hardFilters(c, radiusM, nowHour);
    if (passes) eligible.push(c);
    else rejected.push({ candidate: c, reason: reason! });
  }

  if (eligible.length === 0) {
    return {
      moment: null,
      trace: buildTrace(eligible, rejected, null, contextConfidence, rejected.length === 0 ? ["NO_CANDIDATE"] : []),
    };
  }

  const ranked = rank(eligible);
  const winner = ranked[0];
  const stillRejected = [
    ...rejected,
    ...ranked.slice(1).map((c) => ({ candidate: c, reason: "LOWER_RANK" })),
  ];

  const trace = buildTrace(eligible, stillRejected, winner, contextConfidence);

  const now = Date.now();
  const moment: Moment = {
    id: `m_${now}`,
    branchId: winner.branchId,
    merchantId: winner.merchantId,
    brandName: winner.brandName,
    branchName: winner.branchName,
    distanceM: winner.distanceM,
    headline: winner.headline,
    voucherOwned: winner.voucherOwned,
    voucherBalance: winner.voucherBalance,
    createdAt: now,
    expiresAt: now + 30 * 60 * 1000,
  };

  return { moment, trace };
}
