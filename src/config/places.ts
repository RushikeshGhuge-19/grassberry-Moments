/**
 * Live brand discovery config for the Grassberry Moments prototype.
 *
 * Scope:
 * - Nashik, Maharashtra only.
 * - Mappls (MapmyIndia) is a ONE-TIME, app-start discovery layer. It answers
 *   "where is this partner's physical location?" — nothing more. It never
 *   runs again during the session; GPS + the local engine handle everything
 *   after that.
 * - Grassberry identity/category/privilege data always comes from the
 *   Grassberry partner catalogue (src/data/grassberryPartners.ts), never
 *   from Mappls.
 *
 * Mappls was chosen over Geoapify for better real-world coverage of Indian
 * retail chains in a tier-2 city like Nashik — Geoapify/OSM data for this
 * is sparse, Mappls' own dataset is India-focused.
 */

/**
 * Mappls REST APIs use OAuth2 client-credentials auth, not a single static
 * API key: these two values are exchanged for a short-lived bearer token
 * (see getMapplsAccessToken() in placesService.ts) before any search call.
 * Like the Geoapify key before it, this is prototype-only — a production
 * build should mint this token on a backend, not ship the client secret in
 * the app bundle.
 */
export const MAPPLS_CLIENT_ID: string = process.env.EXPO_PUBLIC_MAPPLS_CLIENT_ID ?? "";
export const MAPPLS_CLIENT_SECRET: string = process.env.EXPO_PUBLIC_MAPPLS_CLIENT_SECRET ?? "";
export const GEOAPIFY_API_KEY: string = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY ?? "";

export function hasLiveDiscovery(): boolean {
  return GEOAPIFY_API_KEY.trim().length > 0;
}

export const MAPPLS_TOKEN_URL = "https://outpost.mappls.com/api/security/oauth/token";
export const MAPPLS_AUTOSUGGEST_URL = "https://search.mappls.com/search/places/autosuggest/json";

export const TARGETED_SEARCH_CATEGORIES = [
  "catering.cafe",
  "catering.restaurant",
  "catering.fast_food",
  "commercial",
  "commercial.shopping_mall",
  "commercial.clothing",
  "commercial.department_store",
  "entertainment",
  "entertainment.cinema",
].join(",");

/**
 * Nashik-wide fallback center and maximum radius for discovery when no GPS
 * position is available. With live GPS, discovery starts at the user's
 * position and expands through progressively larger rings.
 */
export const NASHIK_SEARCH_CENTER = { lat: 19.9975, lng: 73.7898 };
export const NASHIK_DISCOVERY_RADIUS_M = 15000;

/**
 * Curated list of Grassberry partner IDs (see GRASSBERRY_PARTNERS in
 * src/data/grassberryPartners.ts for the `id` field) worth a dedicated
 * Geoapify `name=` search in Nashik.
 *
 * This is intentionally a small, realistic subset of the 200+ catalogue —
 * discovery does ONE targeted search per entry here, not one per partner
 * in the full catalogue (see MAX_TARGETED_SEARCHES_PER_DISCOVERY as a
 * hard safety cap on top of this list).
 */
export const NASHIK_PRIORITY_PARTNER_IDS: string[] = [
  // Coffee
  "starbucks",
  "third-wave-coffee",
  "cafe-coffee-day",

  // Dining
  "barbeque-nation",
  "kfc",
  "subway",
  "dominos",
  "pizza-hut",
  "baskin-robbins",

  // Fashion / retail
  "westside",
  "pantaloons",
  "max-fashion",
  "raymond",
  "bata",
  "woodland",
  "levis",
  "louis-philippe",

  // Electronics
  "croma",
  "reliance-digital",
  "vijay-sales",

  // Fitness
  "decathlon",
  "healthkart",

  // Jewellery
  "tanishq",
  "kalyan-jewellers",
  "caratlane",

  // Entertainment
  "pvr-inox",
  "cinepolis",
];

/**
 * Safety cap on targeted `name=` lookups during the one-time discovery —
 * guards against firing a search for every entry in
 * NASHIK_PRIORITY_PARTNER_IDS at once if that list grows. There is no
 * periodic refetch in this architecture, so this only bounds the single
 * startup discovery, not a recurring poll.
 */
export const MAX_TARGETED_SEARCHES_PER_DISCOVERY = 30;

/** Batch size + delay for the rate-limited targeted search sweep. */
export const TARGETED_SEARCH_BATCH_SIZE = 5;
export const TARGETED_SEARCH_BATCH_DELAY_MS = 350;

/** Proximity threshold (meters) used to dedupe a discovered branch against
 * an already-seeded branch of the same brand. */
export const DEDUPE_DISTANCE_M = 120;



/**
 * Approximate fallback coordinate for every entry in
 * NASHIK_PRIORITY_PARTNER_IDS, keyed by the same Grassberry partner id.
 *
 * Geoapify/OSM coverage of Indian retail chains in a city like Nashik is
 * spotty — a brand genuinely existing in Nashik is not the same as it
 * being mapped as a POI. Missing a live match must not mean "don't plot
 * it": every priority partner should still show up on the map, scattered
 * across real Nashik commercial clusters (College Road, Gangapur Road,
 * Mumbai Naka, City Centre Mall, Nashik Road, Indira Nagar, Panchavati,
 * Canada Corner, Sharanpur Road), same spirit as the hand-seeded demo
 * branches in seedBranches.ts: "approximate real Nashik areas, not
 * verified store-exact." Swap for exact outlet coordinates before a real
 * demo/launch — these exist so the map is never missing a priority brand
 * just because Geoapify didn't happen to have it mapped.
 */
export const NASHIK_FALLBACK_LOCATIONS: Record<
  string,
  { lat: number; lng: number; branchName: string }
> = {
  // Coffee
  starbucks: { lat: 19.9988, lng: 73.7749, branchName: "College Road" },
  "third-wave-coffee": { lat: 20.0059, lng: 73.7645, branchName: "Gangapur Road" },
  "cafe-coffee-day": { lat: 19.9958, lng: 73.7898, branchName: "Ashok Stambh" },

  // Dining
  "barbeque-nation": { lat: 19.9981, lng: 73.7755, branchName: "College Road" },
  kfc: { lat: 19.9915, lng: 73.7769, branchName: "Mumbai Naka" },
  subway: { lat: 20.0004, lng: 73.7793, branchName: "Sharanpur Road" },
  dominos: { lat: 19.995, lng: 73.77, branchName: "City Centre Mall" },
  "pizza-hut": { lat: 19.979, lng: 73.7898, branchName: "Dwarka" },
  "baskin-robbins": { lat: 19.9988, lng: 73.7836, branchName: "Canada Corner" },

  // Fashion / retail
  westside: { lat: 19.9915, lng: 73.7769, branchName: "Mumbai Naka" },
  pantaloons: { lat: 19.995, lng: 73.77, branchName: "City Centre Mall" },
  "reliance-trends": { lat: 19.9680344, lng: 73.7818508, branchName: "TRENDS" },
  "max-fashion": { lat: 20.0059, lng: 73.7645, branchName: "Gangapur Road" },
  raymond: { lat: 19.9504534, lng: 73.775461, branchName: "The Raymond Shop" },
  bata: { lat: 19.9988, lng: 73.7749, branchName: "College Road" },
  woodland: { lat: 20.0004, lng: 73.7793, branchName: "Sharanpur Road" },
  levis: { lat: 19.995, lng: 73.77, branchName: "City Centre Mall" },
  "louis-philippe": { lat: 19.9988, lng: 73.7836, branchName: "Canada Corner" },

  // Electronics
  croma: { lat: 19.949, lng: 73.834, branchName: "Nashik Road" },
  "reliance-digital": { lat: 19.9627, lng: 73.7868, branchName: "Indira Nagar" },
  "vijay-sales": { lat: 19.9915, lng: 73.7769, branchName: "Mumbai Naka" },

  // Fitness
  decathlon: { lat: 19.9627, lng: 73.7868, branchName: "Indira Nagar" },
  healthkart: { lat: 20.0059, lng: 73.7645, branchName: "Gangapur Road" },

  // Jewellery
  tanishq: { lat: 19.9988, lng: 73.7836, branchName: "Canada Corner" },
  "kalyan-jewellers": { lat: 20.0112, lng: 73.7905, branchName: "Panchavati" },
  caratlane: { lat: 20.0004, lng: 73.7793, branchName: "Sharanpur Road" },

  // Entertainment
  "pvr-inox": { lat: 19.9952, lng: 73.7703, branchName: "City Centre Mall" },
  cinepolis: { lat: 19.9627, lng: 73.7868, branchName: "Indira Nagar" },
};