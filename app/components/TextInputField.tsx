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
    color: colors.textDark,
    fontWeight: "600",
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    width: "100%",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#F3F4F6", // Light gray
    fontSize: typography.body,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: "transparent",
  },
});
