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
import { RecordCard } from "./components/RecordCard";
import { colors, spacing, typography } from "./constants/theme";
import { useAuth } from "./context/AuthContext";
import { getUserRecords, Registro } from "./services/database";

export default function MyRecordsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<Registro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [user?.id]);

  const loadRecords = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const userRecords = await getUserRecords(user.id);
      setRecords(userRecords);
    } catch (err) {
      console.error("Erro ao carregar registros:", err);
      Alert.alert("Erro", "Nao foi possivel carregar seus registros");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Meus Registros</Text>
        {isLoading ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={styles.loader}
          />
        ) : records.length > 0 ? (
          <View style={styles.list}>
            {records.map((record) => (
              <TouchableOpacity
                key={record.id}
                onPress={() =>
                  router.push({
                    pathname: "/details",
                    params: { recordId: record.id },
                  })
                }
              >
                <RecordCard record={record} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Você não tem registros ainda</Text>
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
    gap: spacing.md,
  },
  title: {
    textAlign: "center",
    fontSize: typography.title,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
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
