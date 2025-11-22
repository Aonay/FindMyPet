import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { colors, radii, spacing, typography } from "./constants/theme";
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
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Image
                source={{ uri: "https://i.pravatar.cc/" }} // Placeholder avatar
                style={styles.avatarImage}
              />
            </View>
            <View>
              <Text style={styles.welcomeLabel}>Bem vindo,</Text>
              <Text style={styles.welcomeName}>{user?.nome || "Usuário"}!</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/register-loss")}
            activeOpacity={0.9}
          >
            <View style={styles.bigButtonIcon}>
              <Text style={styles.bigButtonIconText}>🐶</Text>
            </View>
            <View>
              <Text style={styles.bigButtonTitle}>PERDI</Text>
              <Text style={styles.bigButtonSubtitle}>MEU PET</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/register-encounter")}
            activeOpacity={0.9}
          >
            <View style={styles.bigButtonIcon}>
              <Text style={styles.bigButtonIconText}>🔍</Text>
            </View>
            <View>
              <Text style={styles.bigButtonTitle}>ENCONTREI</Text>
              <Text style={styles.bigButtonSubtitle}>UM PET</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feed de Animais Perdidos</Text>
            <TouchableOpacity onPress={() => router.push("/my-records")}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator
              color={colors.primary}
              size="large"
              style={styles.loader}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {nearbyRecords.length > 0 ? (
                nearbyRecords.map((record) => (
                  <TouchableOpacity
                    key={record.id}
                    onPress={() =>
                      router.push({
                        pathname: "/details",
                        params: { recordId: record.id },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <HomeCard record={record} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  Nenhum registro próximo encontrado
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matchs Próximos</Text>
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
                  activeOpacity={0.8}
                >
                  <HomeCard record={record} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Nenhum match encontrado</Text>
          )}
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
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  welcomeLabel: {
    fontSize: typography.body,
    color: colors.text,
  },
  welcomeName: {
    fontSize: typography.subtitle,
    fontWeight: "bold",
    color: colors.textDark,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  bigButton: {
    flex: 1,
    height: 140,
    borderRadius: radii.lg,
    padding: spacing.md,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  bigButtonIcon: {
    alignSelf: "flex-start",
  },
  bigButtonIconText: {
    fontSize: 32,
    color: colors.white,
  },
  bigButtonTitle: {
    color: colors.white,
    fontSize: typography.subtitle,
    fontWeight: "bold",
  },
  bigButtonSubtitle: {
    color: colors.white,
    fontSize: typography.subtitle,
    fontWeight: "bold",
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: "bold",
    color: "#1E40AF", // Dark blue for section titles
  },
  seeAll: {
    fontSize: typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  carousel: {
    gap: spacing.md,
    paddingRight: spacing.lg,
    paddingBottom: spacing.sm, // For shadow
  },
  loader: {
    marginVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.caption,
    color: colors.text,
    fontStyle: "italic",
  },
});
