import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User, UserRole } from "@/types";
import { seedUsers } from "@/data/seed";

const STORAGE_KEY = "uninest.session";
const USERS_KEY = "uninest.users";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, _password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string; role: UserRole; phone?: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored) as User[];
  } catch {
    /* noop */
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
  return seedUsers;
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* noop */
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email) {
        const users = readUsers();
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!found) throw new Error("Conta não encontrada. Verifica o email ou regista-te.");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        setUser(found);
        return found;
      },
      async register({ name, email, role, phone }) {
        const users = readUsers();
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Já existe uma conta com este email.");
        }
        const newUser: User = {
          id: `u-${Date.now()}`,
          name,
          email,
          role,
          phone,
          createdAt: new Date().toISOString(),
        };
        const next = [...users, newUser];
        writeUsers(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
      },
      logout() {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
