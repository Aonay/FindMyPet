import * as Crypto from "expo-crypto";
import * as Calendar from "expo-calendar";
import * as Location from "expo-location";
import { supabase } from "./supabaseClient";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  created_at: string;
  updated_at: string;
};

export type RegistroInsert = {
  estado: "PERDIDO" | "ENCONTRADO" | "ARQUIVADO";
  imagem_url?: string;
  especie: "CACHORRO" | "GATO" | "AVE" | "ROEDOR" | "REPTIL";
  raca?: string;
  tamanho: "PEQUENO" | "MEDIO" | "GRANDE";
  cor_pelagem: string;
  cor_olhos?: string;
  observacoes?: string;
  latitude: number;
  longitude: number;
  last_seen_at?: string;
};

export type Registro = RegistroInsert & {
  id: string;
  usuario_id: string;
  data_registro: string;
  arquivado_em?: string;
  created_at: string;
  updated_at: string;
};

/**
 * Hash a password using SHA256
 */
async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

/**
 * Registra um novo usuário no banco de dados
 */
export async function registerUser(
  nome: string,
  email: string,
  cpf: string,
  senha: string
): Promise<Usuario | null> {
  try {
    const senhaHash = await hashPassword(senha);

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nome,
          email: email.toLowerCase(),
          cpf: cpf.replace(/\D/g, ""),
          senha_hash: senhaHash,
        },
      ])
      .select("id, nome, email, cpf, created_at, updated_at");

    if (error) throw error;
    return data?.[0] || null;
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    throw err;
  }
}

/**
 * Faz login com email e senha
 */
export async function loginUser(
  email: string,
  senha: string
): Promise<Usuario | null> {
  try {
    const senhaHash = await hashPassword(senha);

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, cpf, created_at, updated_at, senha_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      throw new Error("Usuário não encontrado");
    }

    if (data.senha_hash !== senhaHash) {
      throw new Error("Senha inválida");
    }

    const { senha_hash, ...usuario } = data;
    return usuario;
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    throw err;
  }
}

/**
 * Busca um usuário pelo ID
 */
export async function getUserById(userId: string): Promise<Usuario | null> {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, cpf, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    throw err;
  }
}

/**
 * Cria um novo registro de pet
 */
export async function createRegistro(
  usuarioId: string,
  registroData: RegistroInsert
): Promise<Registro | null> {
  try {
    const { data, error } = await supabase
      .from("registros")
      .insert([
        {
          usuario_id: usuarioId,
          ...registroData,
        },
      ])
      .select();

    if (error) throw error;
    const created = data?.[0] || null;

    // Try to create a calendar event reminder 15 days after creation
    if (created) {
      // fire-and-forget; errors are logged inside helper
      createCalendarEventForRegistro(created).catch((err) =>
        console.error("Erro ao criar lembrete no calendário:", err)
      );
    }

    return created;
  } catch (err) {
    console.error("Erro ao criar registro:", err);
    throw err;
  }
}

async function createCalendarEventForRegistro(registro: Registro) {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      console.warn("Permissão de calendário não concedida");
      return;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (!calendars || calendars.length === 0) {
      console.warn("Nenhum calendário disponível para criar evento");
      return;
    }

    const writableCalendar = calendars.find((c) => (c as any).allowsModifications) || calendars[0];
    const calendarId = (writableCalendar as any).id;

    const createdAt = registro.created_at ? new Date(registro.created_at) : new Date();

    // Make the event an all-day event on the date 15 days after creation
    const eventStart = new Date(createdAt);
    eventStart.setDate(eventStart.getDate() + 15);
    eventStart.setHours(0, 0, 0, 0);
    const eventEnd = new Date(eventStart);
    eventEnd.setDate(eventEnd.getDate() + 1);

    const title =
      registro.estado === "ENCONTRADO"
        ? `Revisitar Local do Pet ${registro.especie} ${registro.cor_pelagem}`
        : `Confirmar Perda Pet ${registro.especie} ${registro.cor_pelagem}`;

    // Try to reverse-geocode latitude/longitude into a human readable address
    let locationText = `${registro.latitude},${registro.longitude}`;
    try {
      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (locPerm.status === "granted") {
        const geocoded = await Location.reverseGeocodeAsync({
          latitude: registro.latitude,
          longitude: registro.longitude,
        });
        if (geocoded && geocoded.length > 0) {
          const addr = geocoded[0];
          const parts = [addr.name, addr.street, addr.city, addr.region, addr.postalCode, addr.country].filter(Boolean);
          if (parts.length > 0) locationText = parts.join(", ");
        }
      }
    } catch (err) {
      console.warn("Não foi possível obter endereço via reverse geocode:", err);
    }

    const description =
      registro.estado === "ENCONTRADO"
        ? "Revisitar o local em que encontrou o pet e confirmar no aplicativo se ele ainda está lá"
        : "Confirmar se no aplicativo se o pet ainda esta Perdido";

    await Calendar.createEventAsync(calendarId, {
      title,
      startDate: eventStart,
      endDate: eventEnd,
      allDay: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: locationText,
      notes: `${description}\nRegistro ID: ${registro.id}`,
    });
  } catch (err) {
    console.error("Erro criando evento de calendário:", err);
  }
}

/**
 * Busca registros próximos por localização
 */
export async function getNearbyRecords(
  latitude: number,
  longitude: number,
  radiusKm: number = 5
): Promise<Registro[]> {
  try {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .in("estado", ["PERDIDO", "ENCONTRADO"])
      .order("data_registro", { ascending: false });

    if (error) throw error;

    // Filtro simples por raio (em produção, usar PostGIS do Supabase)
    return (data || []).filter((r) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        r.latitude,
        r.longitude
      );
      return distance <= radiusKm;
    });
  } catch (err) {
    console.error("Erro ao buscar registros próximos:", err);
    throw err;
  }
}

/**
 * Busca registros do usuário
 */
export async function getUserRecords(usuarioId: string): Promise<Registro[]> {
  try {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("data_registro", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Erro ao buscar registros do usuário:", err);
    throw err;
  }
}

/**
 * Busca um registro específico
 */
export async function getRegistroById(id: string): Promise<Registro | null> {
  try {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("Erro ao buscar registro:", err);
    throw err;
  }
}

/**
 * Atualiza um registro
 */
export async function updateRegistro(
  id: string,
  updates: Partial<RegistroInsert>
): Promise<Registro | null> {
  try {
    const { data, error } = await supabase
      .from("registros")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (err) {
    console.error("Erro ao atualizar registro:", err);
    throw err;
  }
}

/**
 * Arquiva um registro
 */
export async function archiveRegistro(id: string): Promise<Registro | null> {
  try {
    return await updateRegistro(id, {
      estado: "ARQUIVADO",
    });
  } catch (err) {
    console.error("Erro ao arquivar registro:", err);
    throw err;
  }
}

/**
 * Calcula distância entre dois pontos (em km) usando Haversine
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Busca matches (encontros que correspondem com perdas do usuário)
 */
export async function getMatchesForUser(
  usuarioId: string,
  radiusKm: number = 10
): Promise<Registro[]> {
  try {
    // Primeiro, busca as perdas do usuário
    const userLosses = await getUserRecords(usuarioId);
    const losses = userLosses.filter((r) => r.estado === "PERDIDO");

    if (losses.length === 0) {
      return [];
    }

    // Depois, busca registros de encontros próximos
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("estado", "ENCONTRADO")
      .neq("usuario_id", usuarioId)
      .order("data_registro", { ascending: false });

    if (error) throw error;

    // Filtra por similaridade de características e proximidade
    const matches = (data || []).filter((encontro) => {
      // Conta coincidências de características (no mínimo 3)
      let coincidencias = 0;

      for (const loss of losses) {
        if (loss.especie === encontro.especie) coincidencias++;
        if (loss.tamanho === encontro.tamanho) coincidencias++;
        if (
          loss.cor_pelagem.toLowerCase() === encontro.cor_pelagem.toLowerCase()
        )
          coincidencias++;
        if (loss.raca?.toLowerCase() === encontro.raca?.toLowerCase())
          coincidencias++;

        if (coincidencias >= 3) return true;
      }

      return false;
    });

    return matches;
  } catch (err) {
    console.error("Erro ao buscar matches:", err);
    throw err;
  }
}
