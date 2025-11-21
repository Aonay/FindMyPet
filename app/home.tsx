import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeCard } from "./components/HomeCard";
import { PrimaryButton } from "./components/PrimaryButton";
import { SectionHeader } from "./components/SectionHeader";
import { colors, spacing, typography } from "./constants/theme";
import { useAuth } from "./context/AuthContext";
import {
  getMatchesForUser,
  getNearbyRecords,
  Registro,
} from "./services/database";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [nearbyRecords, setNearbyRecords] = useState<Registro[]>([]);
  const [matchRecords, setMatchRecords] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [user?.id]);

  const loadRecords = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Para testes, usar coordenadas fixas. Em produção, usar geolocalização
      const nearby = await getNearbyRecords(-23.55, -46.6, 5);
      const matches = await getMatchesForUser(user.id, 10);
      setNearbyRecords(nearby.slice(0, 5));
      setMatchRecords(matches.slice(0, 5));
    } catch (err) {
      console.error("Erro ao carregar registros:", err);
      Alert.alert("Erro", "Nao foi possivel carregar os registros");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>{`Bem vindo ${user?.nome}`}</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Registrar Encontro"
              onPress={() => router.push("/register-encounter")}
              variant="secondary"
            />
          </View>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Registrar Perda"
              onPress={() => router.push("/register-loss")}
              variant="secondary"
            />
          </View>
          <View style={styles.actionButton}>
            <PrimaryButton
              label="Meus Registros"
              onPress={() => router.push("/my-records")}
              variant="outline"
            />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={styles.loader}
          />
        ) : (
          <>
            <SectionHeader title="Registros Proximos" />
            {nearbyRecords.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {nearbyRecords.map((record) => (
                  <TouchableOpacity
                    key={record.id}
                    onPress={() =>
                      router.push({
                        pathname: "/details",
                        params: { recordId: record.id },
                      })
                    }
                  >
                    <HomeCard record={record} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>
                Nenhum registro proximo encontrado
              </Text>
            )}

            <SectionHeader title="Matchs Proximos" />
            {matchRecords.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
              >
                {matchRecords.map((record) => (
                  <TouchableOpacity
                    key={record.id}
                    onPress={() =>
                      router.push({
                        pathname: "/details",
                        params: { recordId: record.id },
                      })
                    }
                  >
                    <HomeCard record={record} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>Nenhum match encontrado</Text>
            )}
          </>
        )}
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
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcome: {
    fontSize: typography.subtitle,
    color: colors.info,
    textAlign: "center",
  },
  logoutText: {
    fontSize: typography.caption,
    color: colors.danger,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  carousel: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.caption,
    color: colors.text,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
});
