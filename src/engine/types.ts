export type Activity = "automotive" | "walking" | "stationary";

export type JourneyState =
  | "IDLE"
  | "MOBILITY_STARTED"
  | "IN_TRANSIT"
  | "ARRIVAL_CANDIDATE"
  | "ARRIVED"
  | "POST_ARRIVAL";

export interface Branch {
  id: string;
  merchantId: string;
  brandName: string;
  branchName: string;
  category: string;
  lat: number;
  lng: number;
  openHour: string; // "HH:MM"
  closeHour: string; // "HH:MM"
  status: "ACTIVE" | "CLOSED";
  discountPct: number;
  headline: string;
}

export interface VoucherRecord {
  merchantId: string;
  balance: number;
}

export interface Candidate {
  branchId: string;
  branchName: string;
  brandName: string;
  merchantId: string;
  distanceM: number;
  status: "ACTIVE" | "CLOSED";
  openHour: string;
  closeHour: string;
  onCooldown: boolean;
  discountPct: number;
  headline: string;
  voucherOwned: boolean;
  voucherBalance: number;
  categoryAffinity: number;
  merchantAffinity: number;
}

export interface Moment {
  id: string;
  branchId: string;
  merchantId: string;
  brandName: string;
  branchName: string;
  distanceM: number;
  headline: string;
  voucherOwned: boolean;
  voucherBalance: number;
  createdAt: number;
  expiresAt: number;
}

export interface DecisionTrace {
  contextConfidence: number;
  candidates: number;
  eligibleCandidates: number;
  selected: string | null;
  reasonCodes: string[];
  suppressed: { branchId: string; reason: string }[];
  timestamp: number;
}

export interface JourneySnapshot {
  state: JourneyState;
  dwellSeconds: number;
  lastLat: number | null;
  lastLng: number | null;
  lastSpeedKmh: number;
}
