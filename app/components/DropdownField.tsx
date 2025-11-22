import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
} from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";

export type Option = {
    label: string;
    value: string;
};

type Props = {
    label: string;
    value: string;
    options: Option[];
    onSelect: (value: string) => void;
    placeholder?: string;
};

export function DropdownField({
    label,
    value,
    options,
    onSelect,
    placeholder = "Selecione...",
}: Props) {
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (val: string) => {
        onSelect(val);
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.inputText,
                        !selectedOption && { color: colors.text }, // Placeholder color
                    ]}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Selecione {label}</Text>
                            <ScrollView style={styles.optionsList}>
                                {options.map((item) => (
                                    <TouchableOpacity
                                        key={item.value}
                                        style={[
                                            styles.optionItem,
                                            item.value === value && styles.selectedOption,
                                        ]}
                                        onPress={() => handleSelect(item.value)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                item.value === value && styles.selectedOptionText,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.value === value && (
                                            <Ionicons
                                                name="checkmark"
                                                size={20}
                                                color={colors.primary}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    label: {
        fontSize: typography.caption,
        fontWeight: "600",
        color: colors.textDark,
        marginLeft: spacing.xs,
    },
    input: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F3F4F6",
        borderRadius: radii.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12, // Matches TextInputField height roughly
        borderWidth: 1,
        borderColor: "transparent",
    },
    inputText: {
        fontSize: typography.body,
        color: colors.textDark,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        maxHeight: "80%",
        padding: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalTitle: {
        fontSize: typography.subtitle,
        fontWeight: "bold",
        color: colors.textDark,
        marginBottom: spacing.md,
        textAlign: "center",
    },
    optionsList: {
        marginBottom: spacing.md,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    selectedOption: {
        backgroundColor: colors.accent,
        borderRadius: radii.sm,
    },
    optionText: {
        fontSize: typography.body,
        color: colors.textDark,
    },
    selectedOptionText: {
        color: colors.primary,
        fontWeight: "bold",
    },
    closeButton: {
        padding: spacing.md,
        alignItems: "center",
    },
    closeButtonText: {
        color: colors.danger,
        fontWeight: "600",
        fontSize: typography.body,
    },
});
