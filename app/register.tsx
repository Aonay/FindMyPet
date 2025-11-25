import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "./components/PrimaryButton";
import { TextInputField } from "./components/TextInputField";
import { colors, spacing, typography } from "./constants/theme";
import { useAuth } from "./context/AuthContext";
import { registerUser } from "./services/database";

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // CPF mask helper
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const part1 = digits.substring(0, 3);
    const part2 = digits.substring(3, 6);
    const part3 = digits.substring(6, 9);
    const part4 = digits.substring(9, 11);
    let out = part1;
    if (part2) out += "." + part2;
    if (part3) out += "." + part3;
    if (part4) out += "-" + part4;
    return out;
  };

  const handleCpfChange = (val: string) => {
    setCpf(formatCpf(val));
  };
  const handleRegister = async () => {
    if (!nome || !email || !cpf || !senha || !confirma) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    if (senha !== confirma) {
      Alert.alert("Erro", "Senhas nao coincidem");
      return;
    }

    setIsLoading(true);
    try {
      const user = await registerUser(nome, email, cpf, senha);
      if (user) {
        await login(user);
        router.replace("/home");
      }
    } catch (err: any) {
      Alert.alert("Erro ao cadastrar", err.message || "Tente novamente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={require("../assets/logo2.png")} style={styles.logo} />
          <Text style={styles.title}>Cadastro</Text>
          <Text style={styles.subtitle}>Crie sua conta e comece a usar</Text>
        </View>

        <View style={styles.card}>
          <TextInputField
            label="Nome"
            placeholder="Seu nome completo"
            value={nome}
            onChangeText={setNome}
            editable={!isLoading}
          />

          <TextInputField
            label="Email"
            placeholder="seu@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          <TextInputField
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            value={cpf}
            onChangeText={handleCpfChange}
            editable={!isLoading}
          />

          <TextInputField
            label="Senha"
            placeholder="Crie uma senha"
            secureTextEntry
            showPasswordToggle
            value={senha}
            onChangeText={setSenha}
            editable={!isLoading}
          />

          <TextInputField
            label="Confirmar senha"
            placeholder="Repita sua senha"
            secureTextEntry
            showPasswordToggle
            value={confirma}
            onChangeText={setConfirma}
            editable={!isLoading}
          />

          <PrimaryButton
            label={isLoading ? "Cadastrando..." : "Cadastrar"}
            onPress={handleRegister}
            style={styles.submit}
          />
          {isLoading && <ActivityIndicator color={colors.primary} />}

          <TouchableOpacity onPress={() => router.replace('/')} style={styles.loginLink}>
            <Text style={styles.loginText}>Já tem uma conta? <Text style={styles.loginAction}>Entrar</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  logo: {
    width: 96,
    height: 96,
    resizeMode: "contain",
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text,
  },
  card: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  submit: {
    marginTop: spacing.md,
    borderRadius: 12,
    paddingVertical: 14,
  },
  loginLink: {
    marginTop: spacing.md,
    alignItems: "center",
    paddingVertical: 10,
  },
  loginText: {
    fontSize: typography.caption,
    color: colors.text,
  },
  loginAction: {
    color: colors.info,
    fontWeight: "700",
  },
});
