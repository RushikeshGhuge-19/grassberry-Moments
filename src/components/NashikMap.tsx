import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Branch } from "../engine/types";
import { NASHIK_CENTER } from "../data/seedBranches";
import { DiscoveredPlace, dedupeAgainstSeeded } from "../services/placesService";

const MARKER_COLORS: Record<string, string> = {
  coffee: "#6F4E37",
  shopping: "#0A66FF",
  fashion: "#D0202F",
  dining: "#D2691E",
  entertainment: "#8E44AD",
  test: "#19A974",
};

export default function NashikMap({
  branches,
  userPosition,
  radiusM = 500,
  nearbyPlaces = [],
}: {
  branches: Branch[];
  userPosition: { lat: number; lng: number } | null;
  radiusM?: number;
  nearbyPlaces?: DiscoveredPlace[];
}) {
  const mapRef = useRef<MapView | null>(null);
  const center = userPosition ?? NASHIK_CENTER;

  const dedupedNearby = useMemo(
    () => dedupeAgainstSeeded(
      Array.from(new Map(nearbyPlaces.map((place) => [place.placeId, place])).values()),
      branches
    ),
    [nearbyPlaces, branches]
  );

  useEffect(() => {
    if (!mapRef.current) return;

    if (userPosition) {
      mapRef.current.animateToRegion(
        {
          latitude: userPosition.lat,
          longitude: userPosition.lng,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        },
        400
      );
      return;
    }

    const coordinates = [
      ...branches.map((branch) => ({ latitude: branch.lat, longitude: branch.lng })),
      ...nearbyPlaces.map((place) => ({ latitude: place.lat, longitude: place.lng })),
    ];

    if (coordinates.length > 1) {
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 80, right: 40, bottom: 100, left: 40 },
        animated: true,
      });
    }
  }, [userPosition?.lat, userPosition?.lng, branches, nearbyPlaces]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={!!userPosition}
        showsMyLocationButton={false}
      >
        {userPosition && (
          <Circle
            center={{ latitude: userPosition.lat, longitude: userPosition.lng }}
            radius={radiusM}
            strokeColor="rgba(10,102,255,0.4)"
            fillColor="rgba(10,102,255,0.08)"
          />
        )}

        {branches.map((branch) => (
          <Marker
            key={branch.id}
            coordinate={{ latitude: branch.lat, longitude: branch.lng }}
            title={`${branch.brandName} — ${branch.branchName}`}
            description={branch.status === "CLOSED" ? "Closed" : branch.headline}
            pinColor={
              branch.status === "CLOSED"
                ? "#999"
                : MARKER_COLORS[branch.category] ?? "#0A66FF"
            }
            zIndex={branch.merchantId === "raymond" ? 1000 : 0}
          />
        ))}

        {dedupedNearby.map((place) => {
          const closed = place.openNow === false;
          const color = place.isPartner
            ? MARKER_COLORS[place.category] ?? "#0A66FF"
            : "#B9BEC6";

          return (
            <Marker
              key={place.placeId}
              coordinate={{ latitude: place.lat, longitude: place.lng }}
              title={place.isPartner ? `⭐ ${place.name}` : place.name}
              description={
                place.isPartner
                  ? `${place.headline ?? "Grassberry partner"}${
                      place.openNow === true
                        ? " · Open now"
                        : place.openNow === false
                        ? " · Closed now"
                        : ""
                    }`
                  : "Not a Grassberry partner yet"
              }
              pinColor={closed ? "#C9CDD3" : color}
              opacity={closed ? 0.55 : place.isPartner ? 1 : 0.8}
            />
          );
        })}
      </MapView>

      {!userPosition && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Enable Live GPS to see your position</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 280, borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  map: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  overlayText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
