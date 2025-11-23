import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Linking } from "react-native";
import * as Location from "expo-location";
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
import { colors, radii, spacing, typography } from "./constants/theme";
import { getRegistroById, Registro, updateRegistro } from "./services/database";
import { MaterialIcons } from "@expo/vector-icons";

export default function DetailsScreen() {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId?: string }>();
  const [record, setRecord] = useState<Registro | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);

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

  useEffect(() => {
    // after record is loaded, try to resolve an address for its coordinates
    const resolveAddress = async () => {
      if (!record) return;
      if (typeof record.latitude !== "number" || typeof record.longitude !== "number") return;
      setIsAddressLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setAddress(`${record.latitude}, ${record.longitude}`);
          return;
        }
        const geocoded = await Location.reverseGeocodeAsync({
          latitude: record.latitude,
          longitude: record.longitude,
        });
        if (geocoded && geocoded.length > 0) {
          const addr = geocoded[0];
          const parts = [addr.name, addr.street, addr.city, addr.region, addr.postalCode, addr.country].filter(Boolean);
          setAddress(parts.join(", ") || `${record.latitude}, ${record.longitude}`);
        } else {
          setAddress(`${record.latitude}, ${record.longitude}`);
        }
      } catch (err) {
        console.warn("Erro ao obter endereco:", err);
        setAddress(`${record.latitude}, ${record.longitude}`);
      } finally {
        setIsAddressLoading(false);
      }
    };

    resolveAddress();
  }, [record]);

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

  const name = record.especie;
  const lastSeen = record.observacoes || "Sem informações";
  const breed = record.raca || "Raça desconhecida";
  const color = record.cor_pelagem || "Cor desconhecida";
  const eyeColor = record.cor_olhos || "";
  const size = record.tamanho || "";
  const status = record.estado || "encontro";
  const visto = record.last_seen_at || "Sem informações";

  const statusColor =
    status === "PERDIDO" ? colors.danger : colors.success;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          {record.imagem_url ? (
            <TouchableOpacity
              onPress={() => setShowFullImage(true)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: record.imagem_url }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View style={[styles.mainImage, styles.imagePlaceholder]}>
              <Text style={styles.placeholderIcon}>
                {record.especie === "GATO" ? "🐱" : "🐶"}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.contentCard}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor }]}>
              <Text style={styles.badgeText}>{status}</Text>
            </View>
          </View>

          {/* <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{record.especie}</Text>
            </View>

            <View style={styles.tag}>
              <Text style={styles.tagText}>Raça: {breed}</Text>
            </View>
          </View> */}

          <View style={styles.section}>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <Text>📍</Text>
              </View>
              <View>
                <Text style={styles.sectionLabel}>Visto por último</Text>
                <Text style={styles.locationText}>
                  {visto.length > 30
                    ? visto.substring(0, 30) + "..."
                    : visto}
                </Text>
              </View>
            </View>
            <MapPlaceholder
              latitude={record.latitude}
              longitude={record.longitude}
            />
            <View style={{ marginTop: spacing.sm }}>
              {isAddressLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : address ? (
                <TouchableOpacity
                  onPress={() => {
                    // open maps with query; prefer google maps query with coordinates
                    const query = encodeURIComponent(address);
                    const lat = record.latitude;
                    const lon = record.longitude;
                    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                    Linking.openURL(url).catch((err) =>
                      Alert.alert("Erro", "Nao foi possivel abrir o mapa")
                    );
                  }}
                >
                  <View style={styles.addressRow}>
                    <MaterialIcons name="place" size={18} color={colors.info} style={styles.addressIcon} />
                    <Text style={[styles.locationText, styles.addressText, { textDecorationLine: "underline", color: colors.info }]}> 
                      {address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Detalhes</Text>
            <Text style={styles.description}>
              {record.observacoes || "Sem observações adicionais."}
            </Text>
            <Text style={styles.metaText}>
              Cor: {color} • Olhos: {eyeColor} • Porte: {size}
            </Text>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Contatar Dono"
              onPress={() => Alert.alert("Contato", "Funcionalidade em breve")}
              leftIcon={<Text style={{ color: "#fff", fontSize: 18 }}>📞</Text>}
            />
            <PrimaryButton
              label="Enviar Mensagem"
              variant="secondary"
              onPress={() => Alert.alert("Mensagem", "Funcionalidade em breve")}
              leftIcon={<Text style={{ color: "#fff", fontSize: 18 }}>💬</Text>}
              style={{ backgroundColor: "#E5E7EB" }}
            />
            {/* Hack to override secondary style for the grey button look */}
          </View>

          <View style={styles.ownerActions}>
            <Text style={styles.ownerTitle}>Gerenciar Registro</Text>
            <View style={styles.ownerButtons}>
              <PrimaryButton
                label={isUpdating ? "Atualizando..." : "Arquivar Caso"}
                onPress={handleArchive}
                variant="outline"
                style={{ borderColor: colors.warning }}
              />
            </View>
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
    backgroundColor: "#F3F4F6", // Light gray background behind image
  },
  container: {
    paddingBottom: spacing.xl,
  },
  header: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
    marginTop: -2,
  },
  imageContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#E5E7EB",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  placeholderIcon: {
    fontSize: 80,
  },
  contentCard: {
    marginTop: -40,
    marginHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textDark,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  tagsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  tagText: {
    color: colors.textDark,
    fontWeight: "600",
    fontSize: 14,
  },
  section: {
    gap: spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2", // Light red
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: typography.subtitle,
    fontWeight: "bold",
    color: colors.textDark,
  },
  locationText: {
    fontSize: typography.body,
    color: colors.text,
  },
  description: {
    fontSize: typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  metaText: {
    fontSize: typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  ownerActions: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  ownerTitle: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.textDark,
  },
  ownerButtons: {
    flexDirection: "row",
    gap: spacing.md,
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
  errorText: {
    color: colors.danger,
    fontSize: typography.body,
    textAlign: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  addressText: {
    flex: 1,
  },
});
