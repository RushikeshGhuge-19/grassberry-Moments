import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Moment } from "../engine/types";

export default function MomentCard({
  moment,
  onDismiss,
  onOpen,
}: {
  moment: Moment;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(Math.round((moment.expiresAt - Date.now()) / 1000));

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.round((moment.expiresAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [moment.expiresAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.contextLabel}>GRASSBERRY NEARBY</Text>
        <Text style={styles.expiry}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </Text>
      </View>

      <Text style={styles.brand}>{moment.brandName}</Text>
      <Text style={styles.branch}>
        {moment.branchName} · {Math.round(moment.distanceM)}m away
      </Text>

      {moment.voucherOwned ? (
        <Text style={styles.headline}>You already have ₹{moment.voucherBalance} available</Text>
      ) : (
        <Text style={styles.headline}>{moment.headline}</Text>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctaButton} onPress={onOpen}>
          <Text style={styles.ctaText}>View privilege</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  contextLabel: { fontSize: 11, fontWeight: "700", color: "#0A66FF", letterSpacing: 0.5 },
  expiry: { fontSize: 11, fontWeight: "600", color: "#888" },
  brand: { fontSize: 20, fontWeight: "800", color: "#111", marginTop: 2 },
  branch: { fontSize: 13, color: "#666", marginTop: 2 },
  headline: { fontSize: 15, fontWeight: "600", color: "#111", marginTop: 10 },
  actionsRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  dismissButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: "#F0F1F3", alignItems: "center" },
  dismissText: { color: "#555", fontWeight: "600" },
  ctaButton: { flex: 2, paddingVertical: 10, borderRadius: 10, backgroundColor: "#0A66FF", alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "700" },
});
