import * as Location from "expo-location";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "./components/PrimaryButton";
import { TextInputField } from "./components/TextInputField";
import { colors, spacing, typography } from "./constants/theme";
import { useAuth } from "./context/AuthContext";
import { loginUser } from "./services/database";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginUser(email, senha);
      if (user) {
        await login(user);

        // Request location permission after successful login
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão de localização",
            "Para usar todos os recursos do app, precisamos acessar sua localização"
          );
        }

        router.replace("/home");
      }
    } catch (err: any) {
      Alert.alert("Erro ao fazer login", err.message || "Tente novamente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../assets/logo2.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>LOGIN</Text>
        </View>
        <TextInputField
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
        <TextInputField
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!isLoading}
        />
        <TouchableOpacity disabled={isLoading}>
          <Text style={styles.linkMuted}>Esqueci minha senha</Text>
        </TouchableOpacity>
        <PrimaryButton
          label={isLoading ? "Entrando..." : "Entrar"}
          onPress={handleLogin}
          style={styles.primaryButton}
        />
        {isLoading && <ActivityIndicator color={colors.primary} />}
        <Link href="/register" style={styles.link}>
          Cadastre-se
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    textAlign: "center",
    fontSize: typography.title,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: spacing.sm,
    borderRadius: 20,
  },
  linkMuted: {
    fontSize: typography.caption,
    color: colors.text,
    textAlign: "center",
  },
  primaryButton: {
    marginTop: spacing.md,
  },
  link: {
    textAlign: "center",
    color: colors.info,
    fontSize: typography.body,
    marginTop: spacing.md,
  },
});
