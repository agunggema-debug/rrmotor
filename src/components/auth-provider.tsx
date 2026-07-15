"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/login-modal";

export type AuthUser = {
  id: number;
  username: string;
  role: "ADMIN" | "MECHANIC" | "KASIR" | "CUSTOMER";
  userId?: number | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (username: string, password: string) => Promise<string | null>;
  googleLogin: (idToken: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!new URLSearchParams(window.location.search).get("redirect");
  });
  const [redirect, setRedirect] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("redirect");
  });

  // Cek sesi saat mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .finally(() => setLoading(false));
  }, []);

  const openLogin = useCallback(() => setIsOpen(true), []);
  const closeLogin = useCallback(() => setIsOpen(false), []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        return d.error ?? "Login gagal";
      }
      const d = await res.json();
      setUser(d);
      setIsOpen(false);
      if (redirect) {
        router.push(redirect);
        setRedirect(null);
      }
      return null;
    },
    [redirect, router]
  );

  const googleLogin = useCallback(
    async (idToken: string) => {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        return d.error ?? "Login Google gagal";
      }
      const d = await res.json();
      setUser(d);
      setIsOpen(false);
      if (redirect) {
        router.push(redirect);
        setRedirect(null);
      }
      return null;
    },
    [redirect, router]
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isOpen, openLogin, closeLogin, login, googleLogin, logout }}
    >
      {children}
      <LoginModal
        open={isOpen}
        onClose={closeLogin}
        onLogin={login}
        onGoogleLogin={googleLogin}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus di dalam AuthProvider");
  return ctx;
}
