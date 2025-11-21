import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RegisterForm } from "./components/RegisterForm";
import { colors } from "./constants/theme";
import { useAuth } from "./context/AuthContext";
import { createRegistro, RegistroInsert } from "./services/database";

export default function RegisterEncounterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: RegistroInsert) => {
    if (!user?.id) {
      Alert.alert("Erro", "Usuário não autenticado");
      return;
    }

    setIsLoading(true);
    try {
      const registro = await createRegistro(user.id, data);
      if (registro) {
        Alert.alert("Sucesso", "Encontro registrado com sucesso!");
        router.back();
      }
    } catch (err: any) {
      Alert.alert(
        "Erro ao registrar encontro",
        err.message || "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <RegisterForm title="Registrar Encontro" onSubmit={handleSubmit} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
