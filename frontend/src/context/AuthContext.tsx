import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImage?: string;
  referralCode?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
          }
        }
      } catch {
        // Not authenticated — that's fine
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      await fetch(`${apiBase}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
