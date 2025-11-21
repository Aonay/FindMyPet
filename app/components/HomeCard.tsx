import { StyleSheet, Text, View } from "react-native";
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
  const name = `Pet ${record.especie}`;
  const breed = record.raca || "Raça desconhecida";
  const color = record.cor_pelagem || "Cor desconhecida";
  const status = record.estado || "encontro";
  const statusColor = statusColors[status] || colors.primary;
  const statusIcon = statusIcons[status] || "❤️";

  return (
    <View style={[styles.card, { backgroundColor: statusColor }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{statusIcon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {breed}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {color}
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{status?.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 160,
    borderRadius: radii.lg,
    padding: spacing.md,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 32,
  },
  info: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.body,
    fontWeight: "700",
    color: colors.textDark,
  },
  detail: {
    fontSize: typography.caption,
    color: colors.textDark,
    opacity: 0.9,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDark,
  },
});
