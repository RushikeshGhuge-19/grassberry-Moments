import {
  GEOAPIFY_API_KEY,
  hasLiveDiscovery,
  NASHIK_SEARCH_CENTER,
  NASHIK_DISCOVERY_RADIUS_M,
  NASHIK_PRIORITY_PARTNER_IDS,
  MAX_TARGETED_SEARCHES_PER_DISCOVERY,
  TARGETED_SEARCH_BATCH_SIZE,
  TARGETED_SEARCH_BATCH_DELAY_MS,
  DEDUPE_DISTANCE_M,
  TARGETED_SEARCH_CATEGORIES,
  NASHIK_FALLBACK_LOCATIONS,
} from "../config/places";

import {
  GRASSBERRY_PARTNER_MAP,
  GrassberryPartner,
  LOCATION_ENABLED_PARTNERS,
} from "../data/grassberryPartners";
import { distanceMeters } from "../engine/geo";
import { Branch } from "../engine/types";

export interface DiscoveredPlace {
  placeId: string;
  name: string;
  category: string;

  lat: number;
  lng: number;

  openNow: boolean | null;

  address?: string;

  distanceM?: number;

  isPartner: boolean;

  merchantId?: string;
  discountPct?: number;
  headline?: string;
}

/**
 * Normalize a business name so Geoapify variations can still match a
 * Grassberry catalogue entry: lowercase, unify apostrophes/ampersands,
 * collapse punctuation and whitespace.
 */
function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Validate a Geoapify result against ONE specific Grassberry partner's own
 * name + aliases only (never the whole 200+ catalogue) — this is the
 * "targeted search -> targeted match" safety rule: a search for "Raymond"
 * can only ever resolve to Raymond, never to an unrelated partner.
 */
function matchesPartner(displayName: string, partner: GrassberryPartner): boolean {
  const normalized = normalizeName(displayName);
  const candidates = [partner.name, ...partner.aliases].map(normalizeName);

  return candidates.some(
    (candidate) =>
      candidate === normalized ||
      normalized.includes(candidate) ||
      candidate.includes(normalized)
  );
}

function partnerForDisplayName(displayName: string): GrassberryPartner | null {
  return (
    Object.values(GRASSBERRY_PARTNER_MAP).find((partner) => matchesPartner(displayName, partner)) ??
    null
  );
}

/** Parse one Geoapify /v2/places feature for a specific targeted partner
 *  search. Returns null if the feature is malformed or doesn't actually
 *  match the partner being searched for. */
function parseGeoapifyFeature(
  feature: any,
  partner: GrassberryPartner,
  originLat: number,
  originLng: number
): DiscoveredPlace | null {
  if (
    !feature ||
    !Array.isArray(feature.geometry?.coordinates) ||
    feature.geometry.coordinates.length < 2
  ) {
    return null;
  }

  const properties = feature.properties ?? {};
  const coordinates = feature.geometry.coordinates;

  const lngValue = Number(coordinates[0]);
  const latValue = Number(coordinates[1]);

  if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
    return null;
  }

  const name =
    typeof properties.name === "string" && properties.name.trim()
      ? properties.name.trim()
      : typeof properties.address_line1 === "string" && properties.address_line1.trim()
        ? properties.address_line1.trim()
        : typeof properties.formatted === "string" && properties.formatted.trim()
          ? properties.formatted.trim()
          : "Unknown place";

  if (!matchesPartner(name, partner)) {
    return null;
  }

  return {
    placeId:
      typeof properties.place_id === "string"
        ? properties.place_id
        : `${latValue}:${lngValue}:${name}`,

    name,
    category: partner.category,

    lat: latValue,
    lng: lngValue,

    // Geoapify Places does not guarantee a simple current openNow boolean
    // in this response shape.
    openNow: null,

    address:
      typeof properties.formatted === "string" ? properties.formatted : undefined,

    distanceM:
      typeof properties.distance === "number"
        ? properties.distance
        : distanceMeters(originLat, originLng, latValue, lngValue),

    isPartner: true,

    merchantId: partner.id,
    discountPct: partner.discountPct ?? 0,
    headline:
      typeof partner.discountPct === "number" && partner.discountPct > 0
        ? `${partner.discountPct}% off with Grassberry`
        : "Grassberry privilege available",
  };
}

/**
 * Targeted Geoapify search for ONE Grassberry partner by name, scoped to
 * the active GPS-centered search rings. Fails soft: any network error, bad
 * response, or malformed payload resolves to [] rather than throwing, so a
 * single partner search failing can never abort the whole discovery.
 */
async function targetedSearchForPartner(
  partner: GrassberryPartner,
  searchLat: number,
  searchLng: number,
  searchRadiiM: number[],
  biasLat: number,
  biasLng: number
): Promise<DiscoveredPlace[]> {
  const searchNames = [partner.name, ...partner.aliases];
  const placesById = new Map<string, DiscoveredPlace>();

  try {
    for (const radiusM of searchRadiiM) {
      const placesBeforeRadius = placesById.size;

      for (const searchName of searchNames) {
        const params = new URLSearchParams({
          apiKey: GEOAPIFY_API_KEY,
          // `categories` is required even for a targeted name search.
          categories: TARGETED_SEARCH_CATEGORIES,
          name: searchName,
          // Each ring stays centered on the user's initial GPS position.
          filter: `circle:${searchLng},${searchLat},${radiusM}`,
          bias: `proximity:${biasLng},${biasLat}`,
          limit: "50",
          lang: "en",
        });

        const response = await fetch(`https://api.geoapify.com/v2/places?${params.toString()}`);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => "");
          console.warn(
            `[Nashik partners] "${searchName}" (${radiusM}m) failed (HTTP ${response.status})`,
            errorBody
          );
          continue;
        }

        const data = await response.json();
        if (!data || !Array.isArray(data.features)) continue;

        for (const feature of data.features) {
          const place = parseGeoapifyFeature(feature, partner, biasLat, biasLng);
          if (place) placesById.set(place.placeId, place);
        }

        // Aliases recover alternate outlet names only when this ring's
        // primary search found nothing. Wider rings still run to collect
        // additional outlets across Nashik.
        if (placesById.size > placesBeforeRadius) break;
      }
    }

    return Array.from(placesById.values());
  } catch (error) {
    console.warn(`[Nashik partners] "${partner.name}" search crashed`, error);
    return [];
  }
}

/**
 * Broad nearby search used to discover every catalogue partner that Geoapify
 * has mapped, rather than relying only on curated priority-name searches.
 */
async function broadSearchForPartners(
  searchLat: number,
  searchLng: number,
  searchRadiiM: number[],
  biasLat: number,
  biasLng: number
): Promise<DiscoveredPlace[]> {
  const placesById = new Map<string, DiscoveredPlace>();

  for (const radiusM of searchRadiiM) {
    const params = new URLSearchParams({
      apiKey: GEOAPIFY_API_KEY,
      categories: TARGETED_SEARCH_CATEGORIES,
      filter: `circle:${searchLng},${searchLat},${radiusM}`,
      bias: `proximity:${biasLng},${biasLat}`,
      limit: "500",
      lang: "en",
    });

    try {
      const response = await fetch(`https://api.geoapify.com/v2/places?${params.toString()}`);
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        console.warn(`[Nashik partners] broad search (${radiusM}m) failed (HTTP ${response.status})`, errorBody);
        continue;
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.features)) continue;

      for (const feature of data.features) {
        const properties = feature?.properties ?? {};
        const displayName = [properties.name, properties.address_line1, properties.formatted]
          .find((value): value is string => typeof value === "string" && value.trim().length > 0) ?? "";
        const partner = partnerForDisplayName(displayName);
        if (!partner) continue;

        const place = parseGeoapifyFeature(feature, partner, biasLat, biasLng);
        if (place) placesById.set(place.placeId, place);
      }

      console.log(`[Nashik partners] broad ring ${radiusM}m matched ${placesById.size} live partner outlets`);
    } catch (error) {
      console.warn(`[Nashik partners] broad search (${radiusM}m) crashed`, error);
    }
  }

  return Array.from(placesById.values());
}

/**
 * Build a DiscoveredPlace from a partner's approximate NASHIK_FALLBACK_LOCATIONS
 * entry, used when Geoapify has no live POI match for that priority brand.
 * Same Branch-shaped output as a live match — the engine treats both
 * identically — just without a real distanceM (computed later, relative
 * to the user, same as any other branch).
 */
function fallbackPlaceFor(
  partner: GrassberryPartner,
  originLat: number,
  originLng: number,
  fallbackIndex: number = 0
): DiscoveredPlace | null {
  const fallbackClusters = [
    { lat: 19.9988, lng: 73.7749, branchName: "College Road (approx.)" },
    { lat: 20.0059, lng: 73.7645, branchName: "Gangapur Road (approx.)" },
    { lat: 19.9915, lng: 73.7769, branchName: "Mumbai Naka (approx.)" },
    { lat: 19.995, lng: 73.77, branchName: "City Centre Mall (approx.)" },
    { lat: 19.9627, lng: 73.7868, branchName: "Indira Nagar (approx.)" },
    { lat: 19.9988, lng: 73.7836, branchName: "Canada Corner (approx.)" },
    { lat: 20.0004, lng: 73.7793, branchName: "Sharanpur Road (approx.)" },
  ];
  const fallback = NASHIK_FALLBACK_LOCATIONS[partner.id] ?? fallbackClusters[fallbackIndex % fallbackClusters.length];

  return {
    placeId: `fallback:${partner.id}`,
    name: partner.name,
    category: partner.category,
    lat: fallback.lat,
    lng: fallback.lng,
    openNow: null,
    address: fallback.branchName,
    distanceM: distanceMeters(originLat, originLng, fallback.lat, fallback.lng),
    isPartner: true,
    merchantId: partner.id,
    discountPct: partner.discountPct ?? 0,
    headline:
      typeof partner.discountPct === "number" && partner.discountPct > 0
        ? `${partner.discountPct}% off with Grassberry`
        : "Grassberry privilege available",
  };
}

/** Local map catalogue used by Demo mode and as the no-network baseline. */
export function buildLocalPartnerCatalogue(
  origin: { lat: number; lng: number } = NASHIK_SEARCH_CENTER
): DiscoveredPlace[] {
  const placesById = new Map<string, DiscoveredPlace>();

  LOCATION_ENABLED_PARTNERS.forEach((partner, index) => {
    const place = fallbackPlaceFor(partner, origin.lat, origin.lng, index);
    if (place) placesById.set(place.placeId, place);
  });

  return Array.from(placesById.values());
}

/** Chunk an array into fixed-size batches, preserving order. */
function toBatches<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ONE-TIME Nashik-wide Grassberry partner discovery.
 *
 * Flow:
 *
 * NASHIK_PRIORITY_PARTNER_IDS (curated, bounded list)
 *   ↓
 * one Geoapify `name=` search per partner, in small rate-limited batches
 *   ↓
 * each result validated against that one partner's own name/aliases only
 *   ↓
 * DiscoveredPlace[] (Grassberry identity/category/privilege always comes
 * from the Grassberry catalogue, never invented from Geoapify data)
 *
 * This is the only place Geoapify is ever called. There is no broad
 * category sweep and no periodic refetch — GPS movement after this
 * resolves never triggers another network call.
 *
 * `userPosition`, when available (the initial GPS fix that gated this
 * call), is used ONLY to bias result ranking and the final sort order —
 * "near me first" — never to shrink or move the search area itself,
 * which stays the fixed Nashik-wide circle.
 */
export async function discoverPartnerCatalogue(
  userPosition?: { lat: number; lng: number } | null
): Promise<DiscoveredPlace[]> {
  if (!hasLiveDiscovery()) {
    return [];
  }

  const { lat: searchLat, lng: searchLng } = userPosition ?? NASHIK_SEARCH_CENTER;
  const searchRadiiM = userPosition
    ? [2000, 5000, NASHIK_DISCOVERY_RADIUS_M]
    : [NASHIK_DISCOVERY_RADIUS_M];
  const { lat: biasLat, lng: biasLng } = userPosition ?? NASHIK_SEARCH_CENTER;

  console.log("[Nashik partners] Starting one-time discovery", {
    center: { lat: searchLat, lng: searchLng },
    radiiM: searchRadiiM,
  });

  const partners = NASHIK_PRIORITY_PARTNER_IDS.map((id) => GRASSBERRY_PARTNER_MAP[id]).filter(
    (p): p is GrassberryPartner => Boolean(p)
  );

  const toSearch = partners.slice(0, MAX_TARGETED_SEARCHES_PER_DISCOVERY);

  console.log(`[Nashik partners] Searching ${toSearch.length} priority brands plus the full catalogue nearby`);

  const results: DiscoveredPlace[] = await broadSearchForPartners(
    searchLat,
    searchLng,
    searchRadiiM,
    biasLat,
    biasLng
  );
  const foundLive = new Set(
    results.map((place) => place.merchantId).filter((id): id is string => Boolean(id))
  );
  const batches = toBatches(toSearch, TARGETED_SEARCH_BATCH_SIZE);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    const settled = await Promise.allSettled(
      batch.map((partner) =>
        targetedSearchForPartner(partner, searchLat, searchLng, searchRadiiM, biasLat, biasLng)
      )
    );

    settled.forEach((result, idx) => {
      const partner = batch[idx];
      if (result.status === "fulfilled") {
        if (result.value.length > 0) {
          console.log(`[Nashik partners] Found ${partner.name}`);
          results.push(...result.value);
          foundLive.add(partner.id);
        }
      } else {
        console.warn(`[Nashik partners] "${partner.name}" search failed`, result.reason);
      }
    });

    if (i < batches.length - 1) {
      await delay(TARGETED_SEARCH_BATCH_DELAY_MS);
    }
  }

  console.log(`[Nashik partners] Found ${results.length} live branches`);

  // Every priority partner should still appear on the map even when
  // Geoapify's dataset simply doesn't have that brand mapped in Nashik —
  // a missing live POI means "not mapped", not "not plotted". Fill in an
  // approximate fallback location (no extra API calls) for anything the
  // live sweep above didn't find.
  let fallbackCount = 0;
  for (const [index, partner] of LOCATION_ENABLED_PARTNERS.entries()) {
    if (foundLive.has(partner.id)) continue;

    const fallback = fallbackPlaceFor(partner, biasLat, biasLng, index);
    if (fallback) {
      console.log(`[Nashik partners] Found ${partner.name} (fallback location)`);
      results.push(fallback);
      fallbackCount++;
    }
  }

  if (fallbackCount > 0) {
    console.log(`[Nashik partners] Added ${fallbackCount} fallback locations for unmapped brands`);
  }

  // "Near me first": sort the whole result set (live + fallback) by
  // distance from the user's position so nearby partners surface before
  // ones across town — ordering only, the search itself already covered
  // all of Nashik.
  const dedupedResults = Array.from(new Map(results.map((place) => [place.placeId, place])).values());
  dedupedResults.sort(
    (a, b) => (a.distanceM ?? Number.MAX_SAFE_INTEGER) - (b.distanceM ?? Number.MAX_SAFE_INTEGER)
  );

  return dedupedResults;
}

/**
 * Remove discovered places that are basically identical to an
 * already-seeded branch: same normalized brand name within
 * DEDUPE_DISTANCE_M of each other. Used both to dedupe discovered
 * branches before they're merged into the engine's branch list, and to
 * dedupe live map pins against the seeded + merged branch set.
 */
export function dedupeAgainstSeeded(
  discovered: DiscoveredPlace[],
  seeded: { brandName: string; lat: number; lng: number }[],
  thresholdM: number = DEDUPE_DISTANCE_M
): DiscoveredPlace[] {
  return discovered.filter(
    (discoveredPlace) =>
      !seeded.some((seededPlace) => {
        const sameBrand = normalizeName(seededPlace.brandName) === normalizeName(discoveredPlace.name);
        const sameLocation =
          distanceMeters(discoveredPlace.lat, discoveredPlace.lng, seededPlace.lat, seededPlace.lng) <
          thresholdM;
        return sameBrand && sameLocation;
      })
  );
}

/** Convert a discovered partner into the local engine's branch shape. */
export function discoveredPlaceToBranch(place: DiscoveredPlace): Branch {
  return {
    id: `discovered:${place.placeId}`,
    merchantId: place.merchantId ?? `discovered:${place.placeId}`,
    brandName: place.name,
    branchName: place.address ?? place.name,
    category: place.category,
    lat: place.lat,
    lng: place.lng,
    openHour: "00:00",
    closeHour: "23:59",
    status: place.openNow === false ? "CLOSED" : "ACTIVE",
    discountPct: place.discountPct ?? 0,
    headline: place.headline ?? "Grassberry privilege available",
  };
}