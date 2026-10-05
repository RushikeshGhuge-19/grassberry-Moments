import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Branch, JourneyState, Activity, Moment } from "../engine/types";
import MomentCard from "../components/MomentCard";
import NashikMap from "../components/NashikMap";
import { DiscoveredPlace } from "../services/placesService";
import { DWELL_ARRIVED_THRESHOLD_SECONDS } from "../engine/stateMachine";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function DemoScreen({
  branches,
  journeyState,
  dwellSeconds,
  activeMoment,
  tick,
  reset,
  dismissMoment,
  nearbyPlaces,
}: {
  branches: Branch[];
  journeyState: JourneyState;
  dwellSeconds: number;
  activeMoment: Moment | null;
  tick: (activity: Activity, speedKmh: number, lat: number, lng: number) => void;
  reset: () => void;
  dismissMoment: (cooldownHours?: number) => void;
  nearbyPlaces: DiscoveredPlace[];
}) {
  const pickable = branches.filter((b) => b.category !== "test").slice(0, 10);
  const [targetId, setTargetId] = useState(pickable.find((b) => b.id === "b3")?.id ?? pickable[0].id);
  const [running, setRunning] = useState<string | null>(null);
  const target = branches.find((b) => b.id === targetId)!;

  async function runDrivePast() {
    setRunning("Drive past");
    reset();
    await sleep(200);
    tick("automotive", 40, target.lat, target.lng); // -> MOBILITY_STARTED
    await sleep(500);
    tick("automotive", 40, target.lat, target.lng); // -> IN_TRANSIT
    await sleep(500);
    tick("automotive", 40, target.lat, target.lng); // still IN_TRANSIT — never slows
    setRunning(null);
  }

  async function runRedLight() {
    setRunning("Red light");
    reset();
    await sleep(200);
    tick("automotive", 40, target.lat, target.lng);
    await sleep(400);
    tick("automotive", 40, target.lat, target.lng); // -> IN_TRANSIT
    await sleep(400);
    tick("stationary", 0, target.lat, target.lng); // -> ARRIVAL_CANDIDATE, dwell 15s
    await sleep(500);
    tick("stationary", 0, target.lat, target.lng); // dwell 30s, still candidate
    await sleep(500);
    tick("automotive", 30, target.lat, target.lng); // light turns green -> reverts to IN_TRANSIT
    setRunning(null);
  }

  async function runParkAndArrive() {
    setRunning("Park & arrive");
    reset();
    await sleep(200);
    tick("automotive", 40, target.lat, target.lng);
    await sleep(300);
    tick("automotive", 40, target.lat, target.lng); // -> IN_TRANSIT
    await sleep(300);
    // dwell needs to reach 120s; each stationary tick adds 15s -> 8 ticks
    for (let i = 0; i < 8; i++) {
      tick("stationary", 0, target.lat, target.lng);
      await sleep(150);
    }
    setRunning(null);
  }

  async function runWalkAway() {
    setRunning("Walk away");
    tick("walking", 3, target.lat, target.lng);
    await sleep(300);
    setRunning(null);
  }

  async function runRepeatVisit() {
    setRunning("Repeat visit (cooldown)");
    // Assumes a moment was just shown & dismissed at this branch.
    reset();
    await sleep(200);
    tick("automotive", 40, target.lat, target.lng);
    await sleep(300);
    tick("automotive", 40, target.lat, target.lng);
    await sleep(300);
    for (let i = 0; i < 8; i++) {
      tick("stationary", 0, target.lat, target.lng);
      await sleep(150);
    }
    setRunning(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Demo scenarios</Text>
      <Text style={styles.subtitle}>
        Current state: <Text style={styles.stateText}>{journeyState}</Text> · dwell {Math.floor(dwellSeconds)}s
        {journeyState === "ARRIVAL_CANDIDATE" &&
          ` · arrival in ${Math.max(0, Math.ceil(DWELL_ARRIVED_THRESHOLD_SECONDS - dwellSeconds))}s`}
      </Text>

      <NashikMap branches={branches} userPosition={null} nearbyPlaces={nearbyPlaces} />

      <Text style={styles.sectionLabel}>Target branch</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {pickable.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.chip, b.id === targetId && styles.chipActive]}
            onPress={() => setTargetId(b.id)}
          >
            <Text style={[styles.chipText, b.id === targetId && styles.chipTextActive]}>
              {b.brandName} · {b.branchName}
              {b.status === "CLOSED" ? " (closed)" : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScenarioButton label="Drive past at 40 km/h" note="Expect: stays IN_TRANSIT, never arrives" onPress={runDrivePast} busy={running === "Drive past"} />
      <ScenarioButton label="Stop at a red light" note="Expect: brief ARRIVAL_CANDIDATE, reverts to IN_TRANSIT" onPress={runRedLight} busy={running === "Red light"} />
      <ScenarioButton label="Park & arrive (3+ min)" note="Expect: reaches ARRIVED, a Moment may fire" onPress={runParkAndArrive} busy={running === "Park & arrive"} />
      <ScenarioButton label="Walk away from here" note="Expect: ARRIVED -> POST_ARRIVAL" onPress={runWalkAway} busy={running === "Walk away"} />
      <ScenarioButton
        label="Dismiss, then revisit immediately"
        note="Expect: same merchant suppressed on cooldown"
        onPress={async () => {
          dismissMoment(24);
          await runRepeatVisit();
        }}
        busy={running === "Repeat visit (cooldown)"}
      />

      <TouchableOpacity style={styles.resetButton} onPress={() => reset()}>
        <Text style={styles.resetText}>Reset journey</Text>
      </TouchableOpacity>

      {activeMoment && (
        <MomentCard moment={activeMoment} onDismiss={() => dismissMoment(24)} onOpen={() => dismissMoment(24)} />
      )}
    </ScrollView>
  );
}

function ScenarioButton({
  label,
  note,
  onPress,
  busy,
}: {
  label: string;
  note: string;
  onPress: () => void;
  busy: boolean;
}) {
  return (
    <TouchableOpacity style={styles.scenarioButton} onPress={onPress} disabled={busy}>
      <Text style={styles.scenarioLabel}>{busy ? "Running…" : label}</Text>
      <Text style={styles.scenarioNote}>{note}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#111" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4, marginBottom: 16 },
  stateText: { fontWeight: "800", color: "#0A66FF" },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#888", marginBottom: 8, textTransform: "uppercase" },
  chip: { backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: "#eee" },
  chipActive: { backgroundColor: "#0A66FF", borderColor: "#0A66FF" },
  chipText: { fontSize: 12, color: "#333", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  scenarioButton: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10 },
  scenarioLabel: { fontSize: 15, fontWeight: "700", color: "#111" },
  scenarioNote: { fontSize: 12, color: "#888", marginTop: 4 },
  resetButton: { alignItems: "center", paddingVertical: 14, marginTop: 6 },
  resetText: { color: "#D23", fontWeight: "700" },
});
