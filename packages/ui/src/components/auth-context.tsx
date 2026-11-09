"use client";

import PocketBase, { type RecordModel } from "pocketbase";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const PB_DEFAULT_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PB_URL) ||
  "http://127.0.0.1:8091";

let clientInstance: PocketBase | null = null;

export function getPocketBaseClient(): PocketBase {
  if (typeof window === "undefined") {
    const pb = new PocketBase(PB_DEFAULT_URL);
    pb.autoCancellation(false);
    return pb;
  }
  if (!clientInstance) {
    clientInstance = new PocketBase(PB_DEFAULT_URL);
    clientInstance.autoCancellation(false);
  }
  return clientInstance;
}

export type EcosystemUser = RecordModel & {
  email?: string;
  name?: string;
  username?: string;
  avatar?: string;
};

export interface AuthContextValue {
  pb: PocketBase;
  user: EcosystemUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  logout: () => void;
  loginWithPassword: (identity: string, pass: string) => Promise<EcosystemUser>;
  registerWithPassword: (email: string, pass: string, username?: string, name?: string) => Promise<EcosystemUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [pb] = useState(() => getPocketBaseClient());
  const [user, setUser] = useState<EcosystemUser | null>(() => {
    return (pb.authStore.record as EcosystemUser | null) || null;
  });
  const [token, setToken] = useState<string | null>(() => pb.authStore.token || null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsub = pb.authStore.onChange((nextTok, nextRecord) => {
      setToken(nextTok || null);
      setUser((nextRecord as EcosystemUser | null) || null);
    }, true);
    return () => unsub();
  }, [pb]);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setLoginModalOpen(false), []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    setToken(null);
  }, [pb]);

  const loginWithPassword = useCallback(
    async (identity: string, pass: string) => {
      const authData = await pb.collection("users").authWithPassword<EcosystemUser>(identity, pass);
      setUser(authData.record);
      setToken(authData.token);
      setLoginModalOpen(false);
      return authData.record;
    },
    [pb]
  );

  const registerWithPassword = useCallback(
    async (email: string, pass: string, username?: string, name?: string) => {
      const created = await pb.collection("users").create<EcosystemUser>({
        email,
        password: pass,
        passwordConfirm: pass,
        username: username || email.split("@")[0],
        name: name || username || email.split("@")[0],
      });
      const authData = await pb.collection("users").authWithPassword<EcosystemUser>(email, pass);
      setUser(authData.record);
      setToken(authData.token);
      setLoginModalOpen(false);
      return authData.record;
    },
    [pb]
  );

  const value: AuthContextValue = {
    pb,
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loginModalOpen,
    openLoginModal,
    closeLoginModal,
    logout,
    loginWithPassword,
    registerWithPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function useAuthSafe(): AuthContextValue | null {
  return useContext(AuthContext);
}
