import React from "react";
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from "react-native";
import MomentCard from "../components/MomentCard";
import NashikMap from "../components/NashikMap";
import { Branch, JourneyState, Moment } from "../engine/types";
import { distanceMeters } from "../engine/geo";
import { DWELL_ARRIVED_THRESHOLD_SECONDS } from "../engine/stateMachine";
import { DiscoveredPlace } from "../services/placesService";

export type DiscoveryStatus = "disabled" | "loading" | "ready" | "error";

const STATE_COLORS: Record<JourneyState, string> = {
  IDLE: "#9AA0A6",
  MOBILITY_STARTED: "#F2A900",
  IN_TRANSIT: "#F2A900",
  ARRIVAL_CANDIDATE: "#FF7A00",
  ARRIVED: "#19A974",
  POST_ARRIVAL: "#19A974",
};

export default function HomeScreen({
  journeyState,
  dwellSeconds,
  lastSpeedKmh,
  lastPosition,
  activeMoment,
  liveMode,
  onToggleLiveMode,
  permissionGranted,
  branches,
  onDismissMoment,
  onSeedHere,
  nearbyPlaces = [],
  discoveryStatus = "disabled",
  topUpCount = 0,
}: {
  journeyState: JourneyState;
  dwellSeconds: number;
  lastSpeedKmh: number;
  lastPosition: { lat: number; lng: number } | null;
  activeMoment: Moment | null;
  liveMode: boolean;
  onToggleLiveMode: (v: boolean) => void;
  permissionGranted: boolean | null;
  branches: Branch[];
  onDismissMoment: () => void;
  onSeedHere: () => void;
  nearbyPlaces?: DiscoveredPlace[];
  discoveryStatus?: DiscoveryStatus;
  topUpCount?: number;
}) {
  const nearestM = lastPosition
    ? Math.min(...branches.map((b) => distanceMeters(lastPosition.lat, lastPosition.lng, b.lat, b.lng)))
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Grassberry Moments</Text>
      <Text style={styles.subtitle}>Engine status</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Live GPS mode</Text>
        <Switch value={liveMode} onValueChange={onToggleLiveMode} />
      </View>
      {liveMode && permissionGranted === false && (
        <Text style={styles.warning}>Location permission not granted — enable it in system settings.</Text>
      )}

      <NashikMap
        branches={branches}
        userPosition={liveMode ? lastPosition : null}
        nearbyPlaces={nearbyPlaces}
      />

      <Text style={styles.discoveryStatus}>
        {discoveryStatus === "disabled" &&
          `${branches.length} verified Nashik branches loaded — add a Geoapify key (.env) to search live for more.`}
        {discoveryStatus === "loading" && "Searching Nashik for additional live partner branches…"}
        {discoveryStatus === "ready" &&
          (topUpCount > 0
            ? `${branches.length} partner branches loaded — ${topUpCount} found live, rest verified.`
            : `${branches.length} verified Nashik branches loaded — no additional live matches this run.`)}
        {discoveryStatus === "error" &&
          `${branches.length} verified Nashik branches loaded — live search failed, nothing lost.`}
      </Text>

      <View style={[styles.badge, { backgroundColor: STATE_COLORS[journeyState] }]}>
        <Text style={styles.badgeText}>{journeyState}</Text>
      </View>

      <View style={styles.statsBlock}>
        <StatRow label="Dwell" value={`${Math.floor(dwellSeconds)}s`} />
        <StatRow
          label="Arrival in"
          value={
            journeyState === "ARRIVED" || journeyState === "POST_ARRIVAL"
              ? "Arrived"
              : journeyState === "ARRIVAL_CANDIDATE"
              ? `${Math.max(0, Math.ceil(DWELL_ARRIVED_THRESHOLD_SECONDS - dwellSeconds))}s`
              : "—"
          }
        />
        <StatRow label="Speed" value={`${lastSpeedKmh.toFixed(1)} km/h`} />
        <StatRow label="Nearest branch" value={nearestM != null ? `${Math.round(nearestM)}m` : "—"} />
        <StatRow
          label="Position"
          value={lastPosition ? `${lastPosition.lat.toFixed(4)}, ${lastPosition.lng.toFixed(4)}` : "—"}
        />
      </View>

      {liveMode && (
        <TouchableOpacity style={styles.seedButton} onPress={onSeedHere} disabled={!lastPosition}>
          <Text style={styles.seedButtonText}>Seed a test branch at my current location</Text>
        </TouchableOpacity>
      )}

      {!liveMode && (
        <Text style={styles.hint}>
          Switch to the Demo tab to drive the engine with one-tap scenarios — no need to physically
          visit Nashik or Pune.
        </Text>
      )}

      {activeMoment && (
        <MomentCard
          moment={activeMoment}
          onDismiss={onDismissMoment}
          onOpen={onDismissMoment}
        />
      )}
      {!activeMoment && (
        <Text style={styles.silentNote}>No moment right now — that silence is the feature.</Text>
      )}
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 26, fontWeight: "800", color: "#111" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 2, marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", color: "#222" },
  warning: { color: "#D23", fontSize: 12, marginBottom: 10 },
  discoveryStatus: { color: "#666", fontSize: 12, marginTop: -10, marginBottom: 14 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 16 },
  badgeText: { color: "#fff", fontWeight: "800", letterSpacing: 0.5 },
  statsBlock: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 16 },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  statLabel: { color: "#888", fontSize: 13 },
  statValue: { color: "#111", fontSize: 13, fontWeight: "600" },
  seedButton: { backgroundColor: "#111", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 16 },
  seedButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  hint: { color: "#888", fontSize: 13, lineHeight: 18, marginBottom: 10 },
  silentNote: { color: "#aaa", fontSize: 13, textAlign: "center", marginTop: 20 },
});