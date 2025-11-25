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
          <Image
            source={require("../assets/logo2.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>CADASTRO</Text>
        </View>
        <TextInputField
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          editable={!isLoading}
        />
        <TextInputField
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
        <TextInputField
          placeholder="CPF"
          keyboardType="number-pad"
          value={cpf}
          onChangeText={setCpf}
          editable={!isLoading}
        />
        <TextInputField
          placeholder="Senha"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!isLoading}
        />
        <TextInputField
          placeholder="Confirmacao"
          secureTextEntry
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
        <Link href="/" style={styles.link}>
          Entrar
        </Link>
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
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    textAlign: "center",
    fontSize: typography.title,
    fontWeight: "700",
    color: colors.info,
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
  submit: {
    marginTop: spacing.lg,
  },
  link: {
    textAlign: "center",
    color: colors.info,
    fontSize: typography.body,
    marginTop: spacing.md,
  },
});
