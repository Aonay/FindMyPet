import { Image, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";
import { Registro } from "../services/database";

type Props = {
  record: Registro;
};

const statusColors: Record<string, string> = {
  perda: colors.danger,
  encontro: colors.success,
  PERDIDO: colors.danger,
  ENCONTRADO: colors.success,
  arquivado: colors.warning,
  ARQUIVADO: colors.warning,
};

const statusIcons: Record<string, string> = {
  perda: "🔍",
  encontro: "❤️",
  PERDIDO: "🔍",
  ENCONTRADO: "❤️",
  arquivado: "📦",
  ARQUIVADO: "📦",
};

export function HomeCard({ record }: Props) {
  const name = record.especie;
  const breed = record.raca || "Raça desconhecida";
  const color = record.cor_pelagem || "Cor desconhecida";
  const status = record.estado || "encontro";
  const statusColor = statusColors[status] || colors.primary;
  const statusIcon = statusIcons[status] || "❤️";


  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        {record.imagem_url ? (
          <Image
            source={{ uri: record.imagem_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.icon}>{statusIcon}</Text>
        )}
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{status?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {breed}
        </Text>
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>📍 2km</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginRight: spacing.md,
    marginBottom: spacing.sm, // For shadow
  },
  iconContainer: {
    width: "100%",
    height: 160, // Square aspect ratio
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  icon: {
    fontSize: 48,
  },
  info: {
    padding: spacing.sm,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    color: colors.textDark,
    textTransform: "uppercase",
  },
  detail: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  badge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm, // Moved to left
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.primary, // Default
  },
  badgeText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
