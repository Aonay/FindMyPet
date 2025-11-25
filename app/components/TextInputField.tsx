import React, { useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  TouchableOpacity,
} from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

type Props = TextInputProps & {
  label?: string;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
};

export function TextInputField({ label, style, rightIcon, showPasswordToggle, secureTextEntry, ...rest }: Props) {
  const [visible, setVisible] = useState(!secureTextEntry);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={colors.text + "80"}
          style={[styles.input, style as StyleProp<TextStyle>]}
          secureTextEntry={secureTextEntry && !visible}
          {...rest}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} style={styles.iconButton}>
            <MaterialIcons name={visible ? "visibility" : "visibility-off"} size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
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
  inputWrapper: {
    width: "100%",
    position: "relative",
  },
  input: {
    width: "100%",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "#F6F8FA",
    fontSize: typography.body,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconButton: {
    position: "absolute",
    right: spacing.sm,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 6,
  },
  rightIcon: {
    position: "absolute",
    right: spacing.sm,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
});
