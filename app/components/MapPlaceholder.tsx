import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";

type Props = {
  label?: string;
  onLocationChange?: (latitude: number, longitude: number) => void;
  latitude?: number;
  longitude?: number;
};

export function MapPlaceholder({
  label = "Mapa SDK",
  onLocationChange,
  latitude,
  longitude,
}: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // If coordinates are provided (saved from database), use them directly
  // Otherwise, load current device location (for registration)
  const shouldLoadCurrentLocation = latitude === undefined || longitude === undefined;

  useEffect(() => {
    if (shouldLoadCurrentLocation) {
      getCurrentLocation();
    }
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
      ) : location || (latitude && longitude) ? (
        <>
          <View style={styles.mapBackground}>
            {!imageError ? (
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri: getStaticMapUrl(
                      latitude ?? location?.coords.latitude ?? 0,
                      longitude ?? location?.coords.longitude ?? 0
                    ),
                  }}
                  style={styles.mapImage as any}
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
              </View>
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
    height: 200,
    borderRadius: radii.lg,
    backgroundColor: colors.accent,
    overflow: "hidden",
    position: "relative",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  } as any,
  mapBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
  } as any,
  mapFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
  mapFallbackText: {
    fontSize: 48,
    opacity: 0.3,
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: spacing.sm,
  },
  pinText: {
    fontSize: 24,
  },
  label: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "500",
  },
  coords: {
    fontSize: typography.caption,
    color: colors.text,
    opacity: 0.7,
  },
  errorText: {
    fontSize: typography.caption,
    color: colors.danger,
  },
});
