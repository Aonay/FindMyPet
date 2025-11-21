import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Usuario } from "../services/database";
import {
  clearSession,
  getSession,
  saveSession,
} from "../services/sessionManager";

type AuthContextType = {
  user: Usuario | null;
  isLoading: boolean;
  login: (user: Usuario) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: Usuario | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  async function bootstrapAsync() {
    try {
      const session = await getSession();
      setUser(session?.user || null);
    } catch (err) {
      console.error("Erro ao recuperar sessão:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (userData: Usuario) => {
    await saveSession({ user: userData });
    setUser(userData);
  };

  const logout = async () => {
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
