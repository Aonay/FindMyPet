import { Image, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";
import { Registro } from "../services/database";

type UnifiedRecord = (Registro) & {
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
        {(record as any).imagem_url ? (
          <Image
            source={{ uri: (record as any).imagem_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.iconText}>{(record as any).especie === "GATO" ? "🐱" : "🐶"}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.meta}>{`Cor: ${color}`}</Text>
        <Text style={styles.meta}>{`Raca: ${breed}`}</Text>
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
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  compactCard: {
    width: 260,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  iconText: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: "bold",
    color: colors.textDark,
  },
  meta: {
    fontSize: typography.caption,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
