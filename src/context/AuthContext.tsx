import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api";
import type { User, UserRole } from "@/types";

const SESSION_KEY = "uninest.session";
const TOKEN_KEY = "uninest.token";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: UserRole; phone?: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user: me } = await apiRequest<MeResponse>("/auth/me", {
          token
        });
        setUser(me);
        localStorage.setItem(SESSION_KEY, JSON.stringify(me));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void bootstrapSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const { user: loggedUser, token } = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          body: { email, password }
        });

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(loggedUser));
        setUser(loggedUser);
        return loggedUser;
      },
      async register({ name, email, password, role, phone }) {
        const { user: newUser, token } = await apiRequest<AuthResponse>("/auth/register", {
          method: "POST",
          body: { name, email, password, role, phone }
        });

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
      },
      logout() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
