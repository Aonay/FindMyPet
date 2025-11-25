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
  const [rememberMe, setRememberMe] = useState(false);

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
        <View style={styles.card}>
          <View style={styles.header}>
            <Image source={require("../assets/logo2.png")} style={styles.logo} />
            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
          </View>

          <View style={styles.form}>
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
              showPasswordToggle
              value={senha}
              onChangeText={setSenha}
              editable={!isLoading}
            />

            <TouchableOpacity style={styles.forgot} disabled={isLoading} onPress={() => Alert.alert('Senha', 'Funcionalidade em breve') }>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <PrimaryButton
              label={isLoading ? "Entrando..." : "Entrar"}
              onPress={handleLogin}
              style={styles.primaryButton}
            />

            {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />}

            <TouchableOpacity style={styles.registerRow} onPress={() => router.push('/register')}>
              <Text style={styles.registerText}>Não tem uma conta? <Text style={styles.registerLink}>Cadastre-se</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logo: {
    width: 96,
    height: 96,
    resizeMode: "contain",
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.text,
  },
  form: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  forgot: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  forgotText: {
    color: colors.info,
    fontSize: typography.caption,
  },
  primaryButton: {
    marginTop: spacing.md,
    borderRadius: 14,
    paddingVertical: 14,
  },
  registerRow: {
    marginTop: spacing.md,
    alignItems: "center",
    paddingVertical: 8,
  },
  registerText: {
    fontSize: typography.caption,
    color: colors.text,
  },
  registerLink: {
    color: colors.info,
    fontWeight: "700",
  },
});
