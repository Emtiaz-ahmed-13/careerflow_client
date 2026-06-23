"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, auth } from "@/lib/api/client";
import type { User } from "@/types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const me = await api<User>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
      auth.clearTokens();
    }
  };

  useEffect(() => {
    (async () => {
      const tokens = auth.getTokens();
      if (tokens) await refreshUser();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!user && !isPublic) router.push("/login");
    if (user && (pathname === "/login" || pathname === "/register")) router.push("/dashboard");
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const data = await api<{ accessToken: string; refreshToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    auth.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setUser(data.user);
    router.push("/dashboard");
  };

  const register = async (formData: Record<string, string>) => {
    const data = await api<{ accessToken: string; refreshToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    auth.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setUser(data.user);
    router.push("/dashboard");
  };

  const logout = () => {
    auth.clearTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
