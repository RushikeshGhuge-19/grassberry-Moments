import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

import HomeScreen, { DiscoveryStatus } from "./src/screens/HomeScreen";
import DemoScreen from "./src/screens/DemoScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import { useJourney } from "./src/hooks/useJourney";
import { useLocationTracking } from "./src/hooks/useLocationTracking";
import { requestNotificationPermission } from "./src/notifications/notify";
import {
  DiscoveredPlace,
  discoverPartnerCatalogue,
  discoveredPlaceToBranch,
  dedupeAgainstSeeded,
  buildLocalPartnerCatalogue,
} from "./src/services/placesService";
import { hasLiveDiscovery } from "./src/config/places";

type Tab = "home" | "demo" | "dashboard";

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [liveMode, setLiveMode] = useState(false);

  const journey = useJourney();

  const { permissionGranted } = useLocationTracking(liveMode, journey.tick);

  useEffect(() => {
    requestNotificationPermission().catch(() => {});
  }, []);

  // Live brand discovery: ONE-TIME at app start (first GPS fix after Live
  // mode is turned on). This builds the local Grassberry partner catalogue
  // from Geoapify, merges the matched partners straight into the engine's
  // branch list, and then never calls the network again — GPS + decide()
  // run entirely off local data from here on, same as the seeded branches.
  const [nearbyPlaces, setNearbyPlaces] = useState<DiscoveredPlace[]>(() => buildLocalPartnerCatalogue());
  const [discoveryStatus, setDiscoveryStatus] = useState<DiscoveryStatus>(
    hasLiveDiscovery() ? "loading" : "disabled"
  );
  const hasDiscoveredRef = useRef(false);

  useEffect(() => {
    if (!liveMode || !journey.lastPosition || !hasLiveDiscovery() || hasDiscoveredRef.current) return;
    hasDiscoveredRef.current = true;

    // The initial GPS fix gates when discovery runs AND is passed through so
    // results rank/sort "near me first" — the search area itself stays the
    // fixed Nashik-wide circle (not shrunk or recentered on the user), see
    // discoverPartnerCatalogue().
    setDiscoveryStatus("loading");
    discoverPartnerCatalogue(journey.lastPosition)
      .then((places) => {
        setNearbyPlaces(places);
        const partnerPlaces = Array.from(
          new Map(
            places
              .filter((p) => p.isPartner)
              .map((place) => [place.placeId, place])
          ).values()
        );

        const deduped = dedupeAgainstSeeded(partnerPlaces, journey.branches);
        const removed = partnerPlaces.length - deduped.length;

        journey.mergeDiscoveredPartners(deduped.map(discoveredPlaceToBranch));

        console.log(`[Nashik partners] Removed ${removed} duplicates`);
        console.log(`[Nashik partners] Added ${deduped.length} new branches`);
        console.log("[Nashik partners] Discovery complete");

        setDiscoveryStatus(partnerPlaces.length > 0 ? "ready" : "error");
      })
      .catch(() => setDiscoveryStatus("error"));
  }, [liveMode, journey.lastPosition]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {tab === "home" && (
        <HomeScreen
          journeyState={journey.state}
          dwellSeconds={journey.dwellSeconds}
          lastSpeedKmh={journey.lastSpeedKmh}
          lastPosition={journey.lastPosition}
          activeMoment={journey.activeMoment}
          liveMode={liveMode}
          onToggleLiveMode={setLiveMode}
          permissionGranted={permissionGranted}
          branches={journey.branches}
          onDismissMoment={() => journey.dismissMoment(24)}
          onSeedHere={() => {
            if (journey.lastPosition) {
              journey.addTestBranchHere(journey.lastPosition.lat, journey.lastPosition.lng);
            }
          }}
          nearbyPlaces={nearbyPlaces}
          discoveryStatus={discoveryStatus}
        />
      )}

      {tab === "demo" && (
        <DemoScreen
          branches={journey.branches}
          journeyState={journey.state}
          dwellSeconds={journey.dwellSeconds}
          activeMoment={journey.activeMoment}
          tick={journey.tick}
          reset={journey.reset}
          dismissMoment={journey.dismissMoment}
          nearbyPlaces={nearbyPlaces}
        />
      )}

      {tab === "dashboard" && <DashboardScreen traceLog={journey.traceLog} />}

      <View style={styles.tabBar}>
        <TabButton label="Home" active={tab === "home"} onPress={() => setTab("home")} />
        <TabButton label="Demo" active={tab === "demo"} onPress={() => setTab("demo")} />
        <TabButton label="Dashboard" active={tab === "dashboard"} onPress={() => setTab("dashboard")} />
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FA" },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#fff",
    paddingBottom: 6,
    paddingTop: 8,
  },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 6 },
  tabLabel: { fontSize: 13, color: "#9AA0A6", fontWeight: "600" },
  tabLabelActive: { color: "#0A66FF" },
});