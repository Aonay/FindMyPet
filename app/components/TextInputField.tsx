import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";

type Props = TextInputProps & {
  label?: string;
};

export function TextInputField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.text}
        style={[styles.input, style as StyleProp<TextStyle>]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    fontSize: typography.caption,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    fontSize: typography.body,
    color: colors.textDark,
  },
});
