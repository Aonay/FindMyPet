import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPlaceholder } from "./components/MapPlaceholder";
import { PrimaryButton } from "./components/PrimaryButton";
import { colors, spacing, typography } from "./constants/theme";
import { getRegistroById, Registro, updateRegistro } from "./services/database";

export default function DetailsScreen() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId?: string }>();
  const [record, setRecord] = useState<Registro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    loadRecord();
  }, [recordId]);

  const loadRecord = async () => {
    if (!recordId) return;
    setIsLoading(true);
    try {
      const data = await getRegistroById(recordId);
      setRecord(data);
    } catch (err) {
      console.error("Erro ao carregar registro:", err);
      Alert.alert("Erro", "Nao foi possivel carregar o registro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!record?.id) return;
    setIsUpdating(true);
    try {
      await updateRegistro(record.id, { estado: "ARQUIVADO" });
      Alert.alert("Sucesso", "Registro arquivado");
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Nao foi possivel arquivar");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Registro nao encontrado</Text>
      </SafeAreaView>
    );
  }

  const name = `Pet ${record.especie}`;
  const lastSeen = record.observacoes || "Sem informações";
  const breed = record.raca || "Raça desconhecida";
  const color = record.cor_pelagem || "Cor desconhecida";
  const eyeColor = record.cor_olhos || "";
  const size = record.tamanho || "";
  const status = record.estado || "encontro";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Detalhes</Text>

        {record.imagem_url && (
          <TouchableOpacity
            style={styles.imageCard}
            onPress={() => setShowFullImage(true)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: record.imagem_url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageHint}>Toque para ampliar</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.card}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>{`Ultimo encontro: ${lastSeen}`}</Text>
          <Text style={styles.meta}>{`Especie: ${record.especie}`}</Text>
          <Text style={styles.meta}>{`Raca: ${breed}`}</Text>
          <Text
            style={styles.meta}
          >{`Cor: ${color} | Olhos: ${eyeColor}`}</Text>
          <Text style={styles.meta}>{`Porte: ${size}`}</Text>
          <Text style={styles.meta}>
            {record.observacoes || "Sem observacoes"}
          </Text>
        </View>
        <MapPlaceholder />
        <View style={styles.questionBox}>
          <Text
            style={styles.question}
          >{`Animal ainda ${status?.toLowerCase()}?`}</Text>
          <View style={styles.actions}>
            <PrimaryButton
              label={isUpdating ? "Atualizando..." : "Arquivar"}
              onPress={handleArchive}
              variant="secondary"
            />
            <PrimaryButton
              label="Voltar"
              onPress={() => router.back()}
              variant="outline"
            />
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setShowFullImage(false)}
            activeOpacity={0.9}
          >
            <View style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </View>
          </TouchableOpacity>
          {record?.imagem_url && (
            <Image
              source={{ uri: record.imagem_url }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  title: {
    textAlign: "center",
    fontSize: typography.title,
    color: colors.primary,
    fontWeight: "700",
  },
  card: {
    padding: spacing.lg,
    borderRadius: spacing.lg,
    backgroundColor: colors.info,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.subtitle,
    fontWeight: "700",
    color: colors.textDark,
  },
  meta: {
    color: colors.text,
    fontSize: typography.caption,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.body,
    textAlign: "center",
  },
  questionBox: {
    padding: spacing.lg,
    borderRadius: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  question: {
    fontSize: typography.subtitle,
    color: colors.textDark,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  imageCard: {
    borderRadius: spacing.lg,
    backgroundColor: colors.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
    backgroundColor: colors.accent,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: spacing.sm,
    alignItems: "center",
  },
  imageHint: {
    color: "#fff",
    fontSize: typography.caption,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50,
    right: spacing.xl,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});
