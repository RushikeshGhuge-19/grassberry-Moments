/** Decision trace — PRD section 16.1 / Appendix B. Powers the Dashboard screen. */

import { Candidate, DecisionTrace } from "./types";

export function buildTrace(
  eligible: Candidate[],
  rejected: { candidate: Candidate; reason: string }[],
  selected: Candidate | null,
  contextConfidence: number,
  extraReasonCodes: string[] = []
): DecisionTrace {
  const reasonCodes = [...extraReasonCodes];
  if (selected) {
    reasonCodes.push("OPEN_NOW", `DISTANCE_${Math.round(selected.distanceM)}M`);
    if (selected.voucherOwned) reasonCodes.push("VOUCHER_OWNED");
  }

  return {
    contextConfidence: Math.round(contextConfidence * 1000) / 1000,
    candidates: eligible.length + rejected.length,
    eligibleCandidates: eligible.length,
    selected: selected ? selected.branchId : null,
    reasonCodes,
    suppressed: rejected.map((r) => ({ branchId: r.candidate.branchId, reason: r.reason })),
    timestamp: Date.now(),
  };
}
