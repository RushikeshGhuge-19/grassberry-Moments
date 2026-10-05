import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TraceLogEntry } from "../hooks/useJourney";

export default function DashboardScreen({ traceLog }: { traceLog: TraceLogEntry[] }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.title}>Decision dashboard</Text>
      <Text style={styles.subtitle}>
        Every arrival evaluation, win or lose — this is the proof the engine isn't a black box.
      </Text>

      {traceLog.length === 0 && (
        <Text style={styles.empty}>No decisions logged yet. Run a scenario in the Demo tab.</Text>
      )}

      {traceLog.map((entry, i) => (
        <View key={i} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>
              {entry.moment ? `Selected: ${entry.moment.brandName} (${entry.moment.branchName})` : "No moment shown"}
            </Text>
            <Text style={styles.entryTime}>{new Date(entry.at).toLocaleTimeString()}</Text>
          </View>

          <Text style={styles.confidence}>
            Confidence {entry.trace.contextConfidence.toFixed(2)} · {entry.trace.eligibleCandidates}/
            {entry.trace.candidates} eligible
          </Text>

          <View style={styles.tagsRow}>
            {entry.trace.reasonCodes.map((code, j) => (
              <View key={j} style={[styles.tag, tagStyleFor(code)]}>
                <Text style={styles.tagText}>{code}</Text>
              </View>
            ))}
          </View>

          {entry.trace.suppressed.length > 0 && (
            <View style={styles.suppressedBlock}>
              <Text style={styles.suppressedLabel}>Suppressed candidates:</Text>
              {entry.trace.suppressed.map((s, k) => (
                <Text key={k} style={styles.suppressedLine}>
                  {s.branchId} — {s.reason}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

function tagStyleFor(code: string) {
  if (code.startsWith("VOUCHER")) return { backgroundColor: "#19A974" };
  if (code.startsWith("LOW_CONFIDENCE") || code.startsWith("NO_CANDIDATE")) return { backgroundColor: "#D23" };
  return { backgroundColor: "#0A66FF" };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA", paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#111" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4, marginBottom: 16, lineHeight: 18 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 40 },
  entry: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  entryTitle: { fontSize: 14, fontWeight: "700", color: "#111", flex: 1, marginRight: 8 },
  entryTime: { fontSize: 11, color: "#aaa" },
  confidence: { fontSize: 12, color: "#666", marginBottom: 8 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  tagText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  suppressedBlock: { marginTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0", paddingTop: 8 },
  suppressedLabel: { fontSize: 11, fontWeight: "700", color: "#888", marginBottom: 4 },
  suppressedLine: { fontSize: 11, color: "#aaa" },
});
