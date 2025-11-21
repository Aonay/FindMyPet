import AsyncStorage from "@react-native-async-storage/async-storage";
import { Usuario } from "./database";

const SESSION_KEY = "@findmypet_session";

export type Session = {
  user: Usuario;
  token?: string;
};

/**
 * Salva a sessão local
 */
export async function saveSession(session: Session): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error("Erro ao salvar sessão:", err);
    throw err;
  }
}

/**
 * Recupera a sessão local
 */
export async function getSession(): Promise<Session | null> {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (err) {
    console.error("Erro ao recuperar sessão:", err);
    return null;
  }
}

/**
 * Limpa a sessão local
 */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error("Erro ao limpar sessão:", err);
    throw err;
  }
}
