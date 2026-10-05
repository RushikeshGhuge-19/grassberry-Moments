/**
 * Hand-seeded, Nashik only. Coordinates approximate real Nashik areas, not
 * verified store-exact. Say so in the pitch — this is the one thing
 * you'll ask Rajat for real data on next.
 */

import { Branch, VoucherRecord } from "../engine/types";

export const DEMO_USER_ID = "test_user_1";

export const SEED_BRANCHES: Branch[] = [
  // Nashik
  { id: "b1", merchantId: "m1", brandName: "Starbucks", branchName: "College Road", category: "coffee", lat: 19.9988, lng: 73.7749, openHour: "08:00", closeHour: "23:00", status: "ACTIVE", discountPct: 10, headline: "10% off any beverage" },
  { id: "b2", merchantId: "m1", brandName: "Starbucks", branchName: "Gangapur Road", category: "coffee", lat: 20.0059, lng: 73.7645, openHour: "08:00", closeHour: "23:00", status: "ACTIVE", discountPct: 10, headline: "10% off any beverage" },
  { id: "b3", merchantId: "m2", brandName: "Westside", branchName: "Mumbai Naka", category: "shopping", lat: 19.9915, lng: 73.7769, openHour: "10:00", closeHour: "21:30", status: "ACTIVE", discountPct: 15, headline: "15% off storewide" },
  { id: "b4", merchantId: "m3", brandName: "Pizza Hut", branchName: "Dwarka", category: "dining", lat: 19.979, lng: 73.7898, openHour: "11:00", closeHour: "23:00", status: "ACTIVE", discountPct: 20, headline: "20% off dine-in" },
  { id: "b5", merchantId: "m4", brandName: "Croma", branchName: "Nashik Road", category: "shopping", lat: 19.949, lng: 73.834, openHour: "10:00", closeHour: "21:00", status: "ACTIVE", discountPct: 5, headline: "5% off electronics" },
  { id: "b6", merchantId: "m5", brandName: "Decathlon", branchName: "Indira Nagar", category: "shopping", lat: 19.9627, lng: 73.7868, openHour: "09:00", closeHour: "21:00", status: "ACTIVE", discountPct: 10, headline: "10% off sportswear" },
  { id: "b7", merchantId: "m6", brandName: "Barbeque Nation", branchName: "College Road", category: "dining", lat: 19.9981, lng: 73.7755, openHour: "12:00", closeHour: "23:30", status: "ACTIVE", discountPct: 12, headline: "₹500 off buffet for two" },
  { id: "b8", merchantId: "m7", brandName: "Zudio", branchName: "College Road", category: "shopping", lat: 19.9985, lng: 73.776, openHour: "10:00", closeHour: "21:30", status: "ACTIVE", discountPct: 20, headline: "20% off fashion" },
  { id: "b9", merchantId: "m1", brandName: "Starbucks", branchName: "Indira Nagar (closed for renovation)", category: "coffee", lat: 19.963, lng: 73.7871, openHour: "08:00", closeHour: "23:00", status: "CLOSED", discountPct: 10, headline: "10% off any beverage" },

  // Nashik mall cluster — 5 branches within ~100m (City Centre Mall area)
  { id: "b10", merchantId: "m2", brandName: "Westside", branchName: "City Centre Mall", category: "shopping", lat: 19.995, lng: 73.77, openHour: "10:00", closeHour: "22:00", status: "ACTIVE", discountPct: 15, headline: "15% off storewide" },
  { id: "b11", merchantId: "m4", brandName: "Croma", branchName: "City Centre Mall", category: "shopping", lat: 19.9951, lng: 73.7702, openHour: "10:00", closeHour: "22:00", status: "ACTIVE", discountPct: 5, headline: "5% off electronics" },
  { id: "b12", merchantId: "m7", brandName: "Zudio", branchName: "City Centre Mall", category: "shopping", lat: 19.9949, lng: 73.7699, openHour: "10:00", closeHour: "22:00", status: "ACTIVE", discountPct: 20, headline: "20% off fashion" },
  { id: "b13", merchantId: "m8", brandName: "PVR Cinemas", branchName: "City Centre Mall", category: "entertainment", lat: 19.9952, lng: 73.7703, openHour: "10:00", closeHour: "23:30", status: "ACTIVE", discountPct: 25, headline: "Buy 1 Get 1 on tickets (weekday)" },
  { id: "b14", merchantId: "m3", brandName: "Pizza Hut", branchName: "City Centre Mall", category: "dining", lat: 19.995, lng: 73.7701, openHour: "11:00", closeHour: "23:00", status: "ACTIVE", discountPct: 20, headline: "20% off dine-in" },

  // User-provided approximate Raymond outlet location.
  { id: "b15", merchantId: "raymond", brandName: "Raymond", branchName: "The Raymond Shop", category: "fashion", lat: 19.9504534, lng: 73.775461, openHour: "10:00", closeHour: "21:00", status: "ACTIVE", discountPct: 9, headline: "9% off with Grassberry" },
];

/** Nashik city center — used to center the map before a real GPS fix arrives. */
export const NASHIK_CENTER = { lat: 19.9975, lng: 73.7898 };

// Vouchers already owned by the demo user — the "Your Grassberry" priority case.
export const SEED_VOUCHERS: VoucherRecord[] = [
  { merchantId: "m2", balance: 1000 }, // Westside
  { merchantId: "m6", balance: 500 },  // Barbeque Nation
  { merchantId: "m1", balance: 150 },  // Starbucks
];