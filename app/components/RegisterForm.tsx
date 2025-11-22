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
import { PrimaryButton } from "./PrimaryButton";
import { TextInputField } from "./TextInputField";

type Props = {
  title: string;
  onSubmit: (data: RegistroInsert) => void;
};

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
            <TextInputField
              label="Espécie"
              placeholder="Ex: Cachorro"
              value={formData.especie || ""}
              onChangeText={(val) =>
                setFormData({ ...formData, especie: val as any })
              }
            />
          </View>
          <View style={styles.flex}>
            <TextInputField
              label="Raça"
              placeholder="Ex: Golden"
              value={formData.raca || ""}
              onChangeText={(val) => setFormData({ ...formData, raca: val })}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flex}>
            <TextInputField
              label="Tamanho"
              placeholder="Pequeno/Médio/Grande"
              value={formData.tamanho || ""}
              onChangeText={(val) =>
                setFormData({ ...formData, tamanho: val as any })
              }
            />
          </View>
          <View style={styles.flex}>
            <TextInputField
              label="Cor da Pelagem"
              placeholder="Ex: Dourado"
              value={formData.cor_pelagem || ""}
              onChangeText={(val) =>
                setFormData({ ...formData, cor_pelagem: val })
              }
            />
          </View>
        </View>

        <TextInputField
          label="Cor dos Olhos"
          placeholder="Ex: Castanhos"
          value={formData.cor_olhos || ""}
          onChangeText={(val) => setFormData({ ...formData, cor_olhos: val })}
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
