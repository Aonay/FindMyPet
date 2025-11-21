import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";
import { PetRecord } from "../data/mock";
import { Registro } from "../services/database";

type UnifiedRecord = (PetRecord | Registro) & {
  estado?: string;
  status?: string;
};

const statusColors: Record<string, string> = {
  perda: colors.danger,
  encontro: colors.success,
  PERDIDO: colors.danger,
  ENCONTRADO: colors.success,
  arquivado: colors.warning,
  ARQUIVADO: colors.warning,
};

type Props = {
  record: UnifiedRecord;
  compact?: boolean;
};

export function RecordCard({ record, compact }: Props) {
  const name = (record as any).name || `Pet ${(record as any).especie}`;
  const lastSeen =
    (record as any).lastSeen ||
    (record as any).observacoes ||
    "Sem informações";
  const breed =
    (record as any).breed || (record as any).raca || "Raça desconhecida";
  const color =
    (record as any).color || (record as any).cor_pelagem || "Cor desconhecida";
  const eyeColor = (record as any).eyeColor || (record as any).cor_olhos || "";
  const size = (record as any).size || (record as any).tamanho || "";
  const status = (record as any).status || (record as any).estado || "encontro";

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>❤</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.meta}>{`Ultimo: ${lastSeen}`}</Text>
        <Text style={styles.meta}>{`Cor: ${color} | Raca: ${breed}`}</Text>
        {!compact && eyeColor && (
          <Text
            style={styles.meta}
          >{`Olhos: ${eyeColor} • Porte: ${size}`}</Text>
        )}
      </View>
      <View
        style={[
          styles.badge,
          { backgroundColor: statusColors[status] || colors.warning },
        ]}
      >
        <Text style={styles.badgeText}>{status?.toLowerCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  compactCard: {
    width: 220,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.info,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.caption,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: colors.textDark,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});
