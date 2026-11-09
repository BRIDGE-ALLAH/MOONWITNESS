"use client";

import React, { useState } from "react";
import { useAuthSafe } from "./auth-context";
import { ModalDialog } from "./ecosystem-bar";
import { Button } from "./button";
import { Input } from "./input";
import { Badge } from "./badge";
import { StatusBanner } from "./ecosystem-bar";

export interface EcosystemLoginModalProps {
  appName?: string;
}

export function EcosystemLoginModal({ appName }: EcosystemLoginModalProps) {
  const auth = useAuthSafe();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!auth) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await auth.loginWithPassword(identity, password);
      } else {
        await auth.registerWithPassword(identity, password, username, name);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalDialog
      open={auth.loginModalOpen}
      onClose={auth.closeLoginModal}
      eyebrow={appName ? `${appName} // SOVEREIGN IDENTITY` : "SOVEREIGN IDENTITY // ALLAH #1"}
      title={tab === "login" ? "SIGN IN OPERATOR" : "CREATE OPERATOR ACCOUNT"}
      maxWidth="460px"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {error && <StatusBanner variant="error" message={error} onDismiss={() => setError("")} />}

        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--line2)", paddingBottom: "10px" }}>
          <Button
            type="button"
            variant={tab === "login" ? "primary" : "ghost"}
            size="sm"
            onClick={() => { setTab("login"); setError(""); }}
          >
            SIGN IN
          </Button>
          <Button
            type="button"
            variant={tab === "register" ? "primary" : "ghost"}
            size="sm"
            onClick={() => { setTab("register"); setError(""); }}
          >
            CREATE ACCOUNT
          </Button>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            {tab === "login" ? "Email or Username" : "Email Address"}
          </label>
          <Input
            type={tab === "login" ? "text" : "email"}
            required
            placeholder={tab === "login" ? "operator@a-l-l-a-h.com" : "you@sovereign.mesh"}
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            disabled={loading}
          />
        </div>

        {tab === "register" && (
          <>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                Username (optional)
              </label>
              <Input
                type="text"
                placeholder="operator-99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                Operator Call-Sign / Name
              </label>
              <Input
                type="text"
                placeholder="Captain Tariq"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </>
        )}

        <div>
          <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Password
          </label>
          <Input
            type="password"
            required
            placeholder="At least 8-10 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Badge variant="outline" style={{ fontSize: "10px" }}>
            PORT :8091 · POCKETBASE
          </Badge>
          <Button type="submit" variant="primary" size="md" disabled={loading}>
            {loading ? "AUTHENTICATING..." : tab === "login" ? "JACK IN ↗" : "REGISTER ↗"}
          </Button>
        </div>
      </form>
    </ModalDialog>
  );
}
