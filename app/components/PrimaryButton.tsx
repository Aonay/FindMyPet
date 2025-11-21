import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
  leftIcon?: ReactNode;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  style,
  leftIcon,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        style,
      ]}
    >
      {leftIcon}
      <Text style={[styles.text, variant === "outline" && styles.textOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  text: {
    color: colors.card,
    fontSize: typography.subtitle,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "transparent",
  },
  textOutline: {
    color: colors.primary,
  },
});
