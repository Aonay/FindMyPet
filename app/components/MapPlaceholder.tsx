import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";

type Props = {
  label?: string;
  onLocationChange?: (latitude: number, longitude: number) => void;
};

export function MapPlaceholder({
  label = "Mapa SDK",
  onLocationChange,
}: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permissão negada");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      if (onLocationChange) {
        onLocationChange(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }
    } catch (err) {
      console.error("Erro ao obter localização:", err);
      setError("Erro ao obter localização");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate static map image URL using OpenStreetMap tiles
  const getStaticMapUrl = (lat: number, lon: number): string => {
    const zoom = 15;
    // Using OpenStreetMap tile server directly
    // Calculate tile coordinates
    const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, zoom)
    );

    // Use tile.openstreetmap.org which is more reliable
    return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <>
          <View style={styles.pin}>
            <Text style={styles.pinText}>📍</Text>
          </View>
          <ActivityIndicator color={colors.warning} />
          <Text style={styles.label}>Carregando localização...</Text>
        </>
      ) : error ? (
        <>
          <View style={styles.pin}>
            <Text style={styles.pinText}>📍</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </>
      ) : location ? (
        <>
          <View style={styles.mapBackground}>
            {!imageError ? (
              <Image
                source={{
                  uri: getStaticMapUrl(
                    location.coords.latitude,
                    location.coords.longitude
                  ),
                }}
                style={styles.mapImage}
                resizeMode="cover"
                onError={(e) => {
                  console.error(
                    "Error loading map image:",
                    e.nativeEvent.error
                  );
                  setImageError(true);
                }}
                onLoad={() => console.log("Map image loaded successfully")}
              />
            ) : (
              <View style={styles.mapFallback}>
                <Text style={styles.mapFallbackText}>🗺️</Text>
              </View>
            )}
          </View>
          {/* Center pin marker on the map */}
          <View style={styles.centerPin}>
            <Text style={styles.centerPinText}>📍</Text>
          </View>
          <View style={styles.overlay}>
            <View style={styles.pinSmall}>
              <Text style={styles.pinTextSmall}>📍</Text>
            </View>
            <Text style={styles.coordsOverlay}>
              {`${location.coords.latitude.toFixed(
                4
              )}, ${location.coords.longitude.toFixed(4)}`}
            </Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.pin}>
            <Text style={styles.pinText}>📍</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 180,
    borderRadius: radii.lg,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    overflow: "hidden",
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "150%",
    objectFit: "fill",
  },
  mapBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "#e8f4f8",
    justifyContent: "center",
    alignItems: "center",
  },
  mapFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0e8f0",
  },
  mapFallbackText: {
    fontSize: 48,
    opacity: 0.5,
  },
  centerPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -40 }],
    zIndex: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  centerPinText: {
    fontSize: 40,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    zIndex: 10,
  },
  pinSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 11,
  },
  pinTextSmall: {
    fontSize: 14,
  },
  coordsOverlay: {
    fontSize: typography.caption - 2,
    color: "#fff",
    fontWeight: "600",
  },
  pin: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  pinText: {
    fontSize: 24,
  },
  label: {
    fontSize: typography.caption,
    color: colors.text,
  },
  coords: {
    fontSize: typography.caption - 2,
    color: colors.text,
    opacity: 0.7,
  },
  errorText: {
    fontSize: typography.caption,
    color: colors.danger,
  },
});
