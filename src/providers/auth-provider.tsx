"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, auth } from "@/lib/api/client";
import type { User } from "@/types";

type OnboardingStatus = {
  completed: boolean;
  hasResume: boolean;
  hasCommitment: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  onboardingComplete: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshOnboarding: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refreshOnboarding = async () => {
    try {
      const status = await api<OnboardingStatus>("/goals/onboarding-status");
      const done = status.completed || localStorage.getItem("careerflow_onboarding_done") === "1";
      setOnboardingComplete(done);
      return done;
    } catch {
      setOnboardingComplete(true);
      return true;
    }
  };

  const refreshUser = async () => {
    try {
      const me = await api<User>("/auth/me");
      setUser(me);
      await refreshOnboarding();
    } catch {
      setUser(null);
      setOnboardingComplete(null);
      auth.clearTokens();
    }
  };

  useEffect(() => {
    (async () => {
      const tokens = auth.getTokens();
      if (tokens) await refreshUser();
      else setLoading(false);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (loading || !user || onboardingComplete === null) return;
    const isPublic = PUBLIC_PATHS.includes(pathname);
    if (!user && !isPublic) router.push("/login");
    if (user && (pathname === "/login" || pathname === "/register")) {
      router.push(onboardingComplete ? "/goal-session" : "/onboarding");
    }
    if (user && !onboardingComplete && !isPublic && pathname !== "/onboarding") {
      router.push("/onboarding");
    }
    if (user && onboardingComplete && pathname === "/onboarding") {
      router.push("/goal-session");
    }
  }, [user, loading, onboardingComplete, pathname, router]);

  const login = async (email: string, password: string) => {
    const data = await api<{ accessToken: string; refreshToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    auth.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setUser(data.user);
    const done = await refreshOnboarding();
    router.push(done ? "/goal-session" : "/onboarding");
  };

  const register = async (formData: Record<string, string>) => {
    const data = await api<{ accessToken: string; refreshToken: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    auth.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setUser(data.user);
    setOnboardingComplete(false);
    router.push("/onboarding");
  };

  const logout = () => {
    auth.clearTokens();
    setUser(null);
    setOnboardingComplete(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, onboardingComplete, login, register, logout, refreshUser, refreshOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
