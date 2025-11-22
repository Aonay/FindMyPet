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
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {breed}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          Dist: 2km
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor }]}>
        <Text style={styles.badgeText}>{status?.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    height: 240,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: "100%",
    height: 140,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  icon: {
    fontSize: 48,
  },
  info: {
    padding: spacing.md,
    gap: 2,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: "bold",
    color: colors.textDark,
  },
  detail: {
    fontSize: typography.caption,
    color: colors.text,
  },
  badge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
  },
});
