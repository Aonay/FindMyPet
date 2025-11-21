import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../constants/theme";

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.textDark,
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.text,
  },
});
