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
import { colors, spacing, typography } from "../constants/theme";
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
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imageText}>
            {isUploading ? "Enviando..." : "Adicionar Imagem"}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextInputField
            placeholder="Especie"
            value={formData.especie || ""}
            onChangeText={(val) =>
              setFormData({ ...formData, especie: val as any })
            }
          />
        </View>
        <View style={styles.flex}>
          <TextInputField
            placeholder="Raca"
            value={formData.raca || ""}
            onChangeText={(val) => setFormData({ ...formData, raca: val })}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <TextInputField
            placeholder="Tamanho"
            value={formData.tamanho || ""}
            onChangeText={(val) =>
              setFormData({ ...formData, tamanho: val as any })
            }
          />
        </View>
        <View style={styles.flex}>
          <TextInputField
            placeholder="Cor da Pelagem"
            value={formData.cor_pelagem || ""}
            onChangeText={(val) =>
              setFormData({ ...formData, cor_pelagem: val })
            }
          />
        </View>
      </View>
      <TextInputField
        placeholder="Cor dos Olhos"
        value={formData.cor_olhos || ""}
        onChangeText={(val) => setFormData({ ...formData, cor_olhos: val })}
      />
      <TextInputField
        placeholder="Observacoes"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        value={formData.observacoes || ""}
        onChangeText={(val) => setFormData({ ...formData, observacoes: val })}
      />
      <MapPlaceholder onLocationChange={handleLocationChange} />
      <PrimaryButton
        label="Salvar"
        onPress={handleSubmit}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    textAlign: "center",
    fontSize: typography.title,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.accent,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imageText: {
    textAlign: "center",
    color: colors.text,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
