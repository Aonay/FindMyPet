import { readAsStringAsync } from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radii, spacing, typography } from "../constants/theme";
import { RegistroInsert } from "../services/database";
import { supabase } from "../services/supabaseClient";
import { MapPlaceholder } from "./MapPlaceholder";
import { DropdownField, Option } from "./DropdownField";
import { PrimaryButton } from "./PrimaryButton";
import { TextInputField } from "./TextInputField";

type Props = {
  title: string;
  onSubmit: (data: RegistroInsert) => void;
};

const ESPECIE_OPTIONS: Option[] = [
  { label: "Cachorro", value: "CACHORRO" },
  { label: "Gato", value: "GATO" },
];

const RACA_OPTIONS: Option[] = [
  { label: "SDR (Vira-lata)", value: "SDR" },
  { label: "Border Collie", value: "Border Collie" },
  { label: "Bulldog Francês", value: "Bulldog Francês" },
  { label: "Dachshund", value: "Dachshund" },
  { label: "Golden Retriever", value: "Golden Retriever" },
  { label: "Labrador Retriever", value: "Labrador Retriever" },
  { label: "Pastor Alemão", value: "Pastor Alemão" },
  { label: "Poodle", value: "Poodle" },
  { label: "Shih Tzu", value: "Shih Tzu" },
  { label: "Spitz Alemão", value: "Spitz Alemão" },
  { label: "Yorkshire", value: "Yorkshire" },
];

const TAMANHO_OPTIONS: Option[] = [
  { label: "Pequeno", value: "PEQUENO" },
  { label: "Médio", value: "MEDIO" },
  { label: "Grande", value: "GRANDE" },
];

const COR_PELAGEM_OPTIONS: Option[] = [
  { label: "Branco", value: "Branco" },
  { label: "Caramelo", value: "Caramelo" },
  { label: "Cinza", value: "Cinza" },
  { label: "Preto", value: "Preto" },
  { label: "Marrom", value: "Marrom" },
  { label: "Malhado", value: "Malhado" },
];

const COR_OLHOS_OPTIONS: Option[] = [
  { label: "Azul", value: "Azul" },
  { label: "Castanho", value: "Castanho" },
  { label: "Preto", value: "Preto" },
  { label: "Verde", value: "Verde" },
];

export function RegisterForm({ title, onSubmit }: Props) {
  const [formData, setFormData] = React.useState<Partial<RegistroInsert>>({
    estado: title.includes("Encontro") ? "ENCONTRADO" : "PERDIDO",
    especie: "CACHORRO",
    tamanho: "MEDIO",
    cor_pelagem: "",
    latitude: 0,
    longitude: 0,
  });
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleLocationChange = (latitude: number, longitude: number) => {
    setFormData({ ...formData, latitude, longitude });
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar a câmera"
      );
      return false;
    }
    return true;
  };

  const uploadImageToSupabase = async (uri: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      // Read file as base64
      const base64 = await readAsStringAsync(uri, {
        encoding: "base64",
      });

      // Convert base64 to binary
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Generate unique filename
      const fileExt = uri.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `pet-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("pet-photos")
        .upload(filePath, bytes, {
          contentType: `image/${fileExt}`,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        Alert.alert(
          "Erro",
          `Não foi possível fazer upload da imagem: ${error.message}`
        );
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("pet-photos")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Erro", "Erro ao processar a imagem");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);

        // Upload to Supabase
        const imageUrl = await uploadImageToSupabase(uri);
        if (imageUrl) {
          setFormData({ ...formData, imagem_url: imageUrl });
        }
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Erro", "Não foi possível abrir a câmera");
    }
  };

  const handleSubmit = () => {
    if (!formData.cor_pelagem || !formData.raca) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      alert("Aguarde a localização ser carregada");
      return;
    }
    onSubmit(formData as RegistroInsert);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <TouchableOpacity
        style={styles.imagePicker}
        onPress={handleTakePhoto}
        disabled={isUploading}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageIcon}>📷</Text>
            <Text style={styles.imageText}>
              {isUploading ? "Enviando..." : "Adicionar Foto"}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.formSection}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <DropdownField
              label="Espécie"
              value={formData.especie || ""}
              options={ESPECIE_OPTIONS}
              onSelect={(val) =>
                setFormData({ ...formData, especie: val as any })
              }
            />
          </View>
          <View style={styles.flex}>
            <DropdownField
              label="Raça"
              value={formData.raca || ""}
              options={RACA_OPTIONS}
              onSelect={(val) => setFormData({ ...formData, raca: val })}
              placeholder="Selecione a raça"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <DropdownField
              label="Tamanho"
              value={formData.tamanho || ""}
              options={TAMANHO_OPTIONS}
              onSelect={(val) =>
                setFormData({ ...formData, tamanho: val as any })
              }
            />
          </View>
          <View style={styles.flex}>
            <DropdownField
              label="Cor da Pelagem"
              value={formData.cor_pelagem || ""}
              options={COR_PELAGEM_OPTIONS}
              onSelect={(val) =>
                setFormData({ ...formData, cor_pelagem: val })
              }
            />
          </View>
        </View>

        <DropdownField
          label="Cor dos Olhos"
          value={formData.cor_olhos || ""}
          options={COR_OLHOS_OPTIONS}
          onSelect={(val) => setFormData({ ...formData, cor_olhos: val })}
        />

        <TextInputField
          label="Observações"
          placeholder="Detalhes adicionais sobre o pet ou local..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={formData.observacoes || ""}
          onChangeText={(val) => setFormData({ ...formData, observacoes: val })}
          style={{ height: 100 }}
        />
      </View>

      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Localização</Text>
        <MapPlaceholder onLocationChange={handleLocationChange} />
        <Text style={styles.hint}>
          A localização atual será usada para o registro.
        </Text>
      </View>

      <PrimaryButton
        label="Salvar Registro"
        onPress={handleSubmit}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    textAlign: "center",
    fontSize: typography.title,
    color: colors.textDark,
    fontWeight: "bold",
  },
  imagePicker: {
    width: "100%",
    height: 240,
    borderRadius: radii.lg,
    backgroundColor: colors.accent,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: spacing.sm,
  },
  imageIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  imageText: {
    fontSize: typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  formSection: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  mapSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: "600",
    color: colors.textDark,
  },
  hint: {
    fontSize: typography.caption,
    color: colors.text,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.md,
  },
});
