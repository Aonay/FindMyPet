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
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=68" }}
                style={styles.avatarImage}
              />
            </View>
            <View>
              <Text style={styles.welcomeLabel}>Bem-vindo,</Text>
              <Text style={styles.welcomeName}>{user?.nome || "Usuário"}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Main Actions Row */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/register-loss")}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <Text style={[styles.actionEmoji, { fontSize: 28 }]}>🐶</Text>
            </View>
            <Text style={styles.actionLabel}>Perdi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/register-encounter")}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <Text style={styles.actionEmoji}>🔍</Text>
            </View>
            <Text style={styles.actionLabel}>Encontrei</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.functional }]}
            onPress={() => router.push("/my-records")}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <Text style={styles.actionEmoji}>📝</Text>
            </View>
            <Text style={styles.actionLabel}>Registros</Text>
          </TouchableOpacity>
        </View>

        {/* Lost Pets Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Animais Perdidos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
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
                    activeOpacity={0.9}
                  >
                    <HomeCard record={record} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum registro próximo encontrado</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Nearby Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Matches Próximos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

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
                  activeOpacity={0.9}
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
    backgroundColor: colors.accent,
  },
  container: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    gap: 24, // Reduced spacing between sections
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  welcomeLabel: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  welcomeName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    color: colors.textDark,
  },
  logoutButton: {
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
    height: 54,
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconWrapper: {
    position: "absolute",
    top: -10,
    left: 6,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
  },
  actionEmoji: {
    fontSize: 18,
    lineHeight: 22,
    textAlign: "center",
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    marginTop: 6,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    color: colors.textDark,
  },
  seeAll: {
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    color: colors.functional,
  },
  carousel: {
    paddingRight: spacing.md,
    paddingBottom: spacing.xs,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    fontStyle: "italic",
    marginLeft: 4,
  },
});
