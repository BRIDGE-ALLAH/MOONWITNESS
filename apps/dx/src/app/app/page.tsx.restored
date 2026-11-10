"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity, ArrowDownToLine, ArrowUpRight, Boxes, Check, ChevronDown,
  CircleDot, Copy, FolderGit2, GitBranch, GitCommitHorizontal, HardDrive,
  KeyRound, LogOut, Plus, RefreshCw, Search, Server, ShieldCheck,
  TerminalSquare, X, ArrowLeft, Skull, Flame, Play, Square, RotateCw,
  Container, FileText, Cpu, Zap, Radio
} from "lucide-react";
import type { RecordModel } from "pocketbase";
import { pb, gitEngineUrl } from "@/lib/pocketbase";
import { defaultBrandingConfig } from "@/config/branding";
import {
  Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Textarea, Select,
  StatMetric, ModalDialog, StatusBanner, EmptyState, TerminalWindow
} from "@local-git/ui";

type Repo = {
  id: string;
  name: string;
  slug: string;
  path: string;
  description?: string;
  visibility: "public" | "private";
  default_branch: string;
  created: string;
};

type ContainerItem = {
  id: string;
  names: string;
  image: string;
  state: string;
  status: string;
  ports: string;
};

type TokenResult = { id: string; name: string; token: string; token_prefix: string };
type UserRecord = RecordModel & { name?: string; username?: string; email?: string };

async function engineRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${gitEngineUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? `Request failed (${response.status})`);
  return payload as T;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

export default function AppPage() {
  const [user, setUser] = useState<UserRecord | null>(pb.authStore.record as UserRecord | null);
  const [activeTab, setActiveTab] = useState<"repos" | "paas">("repos");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [containerLogs, setContainerLogs] = useState<{ id: string; name: string; logs: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoSlug, setNewRepoSlug] = useState("");
  const [newRepoDescription, setNewRepoDescription] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [tokenName, setTokenName] = useState("Local development");
  const [tokenScopes, setTokenScopes] = useState(["repo:read", "repo:write"]);
  const [createdToken, setCreatedToken] = useState<TokenResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => pb.authStore.onChange((_token, record) => setUser(record as UserRecord | null), true), []);

  const loadRepos = useCallback(async () => {
    if (!pb.authStore.token) return;
    setLoading(true);
    setError("");
    try {
      const result = await engineRequest<{ items: Repo[] }>("/api/v1/repositories", pb.authStore.token);
      setRepos(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load repositories");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContainers = useCallback(async () => {
    if (!pb.authStore.token) return;
    setLoading(true);
    setError("");
    try {
      const result = await engineRequest<{ items: ContainerItem[] }>("/api/v1/containers", pb.authStore.token);
      setContainers(result.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Docker containers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === "repos") void loadRepos();
      if (activeTab === "paas") void loadContainers();
    } else {
      setRepos([]);
      setContainers([]);
    }
  }, [user, activeTab, loadRepos, loadContainers]);

  const handleContainerAction = async (containerId: string, action: "start" | "stop" | "restart" | "logs", containerName = "") => {
    if (!pb.authStore.token) return;
    setBusy(true);
    setError("");
    try {
      const result = await engineRequest<{ ok: boolean; result: { output: string } }>("/api/v1/containers/action", pb.authStore.token, {
        method: "POST",
        body: JSON.stringify({ containerId, action }),
      });
      if (action === "logs") {
        setContainerLogs({ id: containerId, name: containerName || containerId, logs: result.result.output || "No logs available." });
      } else {
        setNotice(`Container ${containerName || containerId} ${action}ed.`);
        await loadContainers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} container`);
    } finally {
      setBusy(false);
    }
  };

  const filteredRepos = useMemo(() => repos.filter((repo) =>
    `${repo.name} ${repo.slug} ${repo.description ?? ""}`.toLowerCase().includes(query.toLowerCase())), [repos, query]);

  const filteredContainers = useMemo(() => containers.filter((c) =>
    `${c.names} ${c.image} ${c.status}`.toLowerCase().includes(query.toLowerCase())), [containers, query]);

  const runningCount = useMemo(() => containers.filter((c) => c.state === "running").length, [containers]);
  const containerHealthPct = containers.length > 0 ? Math.round((runningCount / containers.length) * 100) : 100;

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (authMode === "signup") {
        await pb.collection("users").create({ email, password, passwordConfirm: password, username: username.trim().toLowerCase(), name: name.trim() });
      }
      await pb.collection("users").authWithPassword(email, password);
      setNotice(authMode === "signup" ? `Account created. Welcome to ${defaultBrandingConfig.name}.` : "Welcome back.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally { setBusy(false); }
  }

  async function createRepo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const item = await engineRequest<Repo>("/api/v1/repositories", pb.authStore.token, {
        method: "POST",
        body: JSON.stringify({ name: newRepoName.trim(), slug: newRepoSlug || slugify(newRepoName), description: newRepoDescription, visibility }),
      });
      setRepos((current) => [item, ...current]);
      setShowCreate(false); setNewRepoName(""); setNewRepoSlug(""); setNewRepoDescription("");
      setNotice(`Repository ${item.path} created.`);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create repository"); }
    finally { setBusy(false); }
  }

  async function createAccessToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setCreatedToken(null);
    try {
      const result = await engineRequest<TokenResult>("/api/v1/tokens", pb.authStore.token, {
        method: "POST", body: JSON.stringify({ name: tokenName, scopes: tokenScopes }),
      });
      setCreatedToken(result); setNotice("Personal access token created. Copy it now; it will not be shown again.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create token"); }
    finally { setBusy(false); }
  }

  async function copyText(value: string) {
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setError("Clipboard access failed. Select and copy the value manually."); }
  }

  function signOut() { pb.authStore.clear(); setNotice("Signed out."); setCreatedToken(null); }

  if (!user) {
    return (
      <main className="auth-screen">
        <div className="auth-art"><div className="art-grid" /><div className="orbit orbit-a" /><div className="orbit orbit-b" />
          <div className="art-copy"><div className="eyebrow"><span className="signal" /> {defaultBrandingConfig.labels.privateInfrastructure}</div>
            <div className="wordmark large">{defaultBrandingConfig.prefix}<span>{defaultBrandingConfig.suffix}</span><i>{defaultBrandingConfig.badge}</i></div>
            <h1>{defaultBrandingConfig.headline.primary}<br /><em>{defaultBrandingConfig.headline.highlight}</em></h1>
            <p>{defaultBrandingConfig.description}</p>
            <div className="art-stamp">{defaultBrandingConfig.stamp[0]}<br />{defaultBrandingConfig.stamp[1]}<br /><b>{defaultBrandingConfig.stamp[2]}</b></div>
          </div>
          <div className="art-bottom">
            <span>{defaultBrandingConfig.labels.selfHosted}</span>
            <Link href="/" style={{ color: "#000", textDecoration: "underline", fontWeight: 900 }}>← BACK TO LANDING</Link>
            <span>EST. {defaultBrandingConfig.buildYear} — BUILD {defaultBrandingConfig.version}</span>
          </div>
        </div>
        <section className="auth-panel">
          <div className="mobile-brand">
            <Link href="/" style={{ color: "var(--acid-yellow)", textDecoration: "none", fontSize: "12px", display: "block", marginBottom: "16px" }}>← LANDING PAGE</Link>
            <div className="wordmark">{defaultBrandingConfig.prefix}<span>{defaultBrandingConfig.suffix}</span><i>{defaultBrandingConfig.badge}</i></div>
          </div>
          <Card variant="grunge" className="auth-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge variant="outline">{authMode === "login" ? "MEMBER ACCESS" : "NEW OPERATOR"} / 00{authMode === "login" ? "1" : "2"}</Badge>
              <Link href="/" style={{ color: "var(--neon-lime)", fontSize: "11px", fontWeight: 900, textDecoration: "none" }}>← EXIT</Link>
            </div>
            <h2 className="mt-4">{authMode === "login" ? "Sign in." : "Create your account."}</h2>
            <p className="subcopy">{authMode === "login" ? defaultBrandingConfig.subcopy.login : defaultBrandingConfig.subcopy.signup}</p>
            <form onSubmit={submitAuth} className="form-stack">
              {authMode === "signup" && <>
                <label>DISPLAY NAME<Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></label>
                <label>USERNAME<Input required minLength={3} pattern="[a-zA-Z0-9_-]+" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. rocksoul" autoComplete="username" /></label>
              </>}
              <label>EMAIL ADDRESS<Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@local.dev" autoComplete="email" /></label>
              <label>PASSWORD<Input required type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 10 characters" autoComplete={authMode === "login" ? "current-password" : "new-password"} /></label>
              <Button variant="toxic" size="lg" className="w-full mt-2" disabled={busy}>
                {busy ? <RefreshCw className="spin" size={16} /> : <ArrowUpRight size={16} />}{authMode === "login" ? "Enter HQ" : "Create account"}
              </Button>
            </form>
            <div className="switch-auth">{authMode === "login" ? "New to this server?" : "Already have an account?"}<button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setError(""); }}>{authMode === "login" ? "Create account" : "Sign in"}</button></div>
            {error && <div className="alert error"><X size={15} />{error}</div>}
            <div className="local-note"><ShieldCheck size={15} /> Authentication handled by your PocketBase instance.</div>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark">{defaultBrandingConfig.shortName}<span>+</span></div><div className="wordmark">{defaultBrandingConfig.prefix}<span>{defaultBrandingConfig.suffix}</span><i>{defaultBrandingConfig.badge}</i><small>{defaultBrandingConfig.subtitle}</small></div></div>
        
        {/* GAME HUD OPERATOR STATUS */}
        <div className="p-3 mx-2 my-3 border border-[#222] bg-[#050505] font-mono text-[10px]">
          <div className="flex items-center justify-between mb-1.5 text-gray-400">
            <span>OPERATOR LVL 99</span>
            <Badge variant="lime" className="text-[9px] px-1.5 py-0">RANK S</Badge>
          </div>
          <div className="text-[11px] font-bold text-white mb-2">{user.name || user.username}</div>
          
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                <span>HP // ENGINE</span>
                <span className="text-[#00ff66]">100%</span>
              </div>
              <div className="w-full h-1.5 bg-[#111] border border-[#222]">
                <div className="h-full bg-[#00ff66] w-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                <span>MP // CONTAINERS</span>
                <span className="text-[#00f0ff]">{containerHealthPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#111] border border-[#222]">
                <div className="h-full bg-[#00f0ff]" style={{ width: `${containerHealthPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>
        <button className={`nav-item ${activeTab === "repos" ? "active" : ""}`} onClick={() => setActiveTab("repos")}>
          <FolderGit2 size={17} /> Repositories <span className="nav-count">{repos.length.toString().padStart(2, "0")}</span>
        </button>
        <button className={`nav-item ${activeTab === "paas" ? "active" : ""}`} onClick={() => setActiveTab("paas")}>
          <Container size={17} /> Docker PaaS Hub <span className="nav-count" style={{ background: "var(--toxic)", color: "#fff" }}>{containers.length.toString().padStart(2, "0")}</span>
        </button>
        <button className="nav-item" onClick={() => setShowToken(true)}><KeyRound size={17} /> Access tokens</button>
        <Link href="/" className="nav-item" style={{ textDecoration: "none" }}><ArrowLeft size={17} /> Landing Page</Link>
        <div className="side-label side-label-spaced">SYSTEM</div>
        <div className="system-status"><span className="status-dot" /><div><b>{defaultBrandingConfig.labels.systemOnline}</b><small>API / DATA PLANE READY</small></div></div>
        <div className="sidebar-bottom"><div className="user-chip"><div className="avatar">{(user.name || user.username || "U").slice(0, 1).toUpperCase()}</div><div className="user-meta"><b>{user.name || user.username}</b><small>@{user.username}</small></div><button className="icon-button subtle" title="Sign out" onClick={signOut}><LogOut size={16} /></button></div><div className="version">{defaultBrandingConfig.name.toUpperCase()} <span>v{defaultBrandingConfig.version}</span></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="ps-btn triangle" style={{ marginRight: "4px" }}>▲</span>
            <span className="ps-btn circle" style={{ marginRight: "4px" }}>●</span>
            <span className="ps-btn cross" style={{ marginRight: "4px" }}>✖</span>
            <span className="ps-btn square" style={{ marginRight: "8px" }}>◼</span>
            <span>WORKSPACE</span><b>/</b> {activeTab === "repos" ? "REPOSITORIES" : "DOCKER PAAS CLUSTER"}
          </div>
          <div className="top-actions">
            <Badge variant="gold">
              {defaultBrandingConfig.trinity.supremeOrigin.arabic} ALLAH #1
            </Badge>
            <Badge variant="toxic">
              SIN CAN BE BETTER HUMAN
            </Badge>
            <Badge variant="lime">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black mr-1" /> {defaultBrandingConfig.labels.nodeOnline}
            </Badge>
            <button className="icon-button" title="Refresh" onClick={activeTab === "repos" ? loadRepos : loadContainers}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
            <div className="top-avatar">{(user.username || "U").slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow muted">COMMAND CENTER / {activeTab === "repos" ? "SOURCE CONTROL" : "CONTAINER PAAS ENGINE"} / P1 [LVL 99]</div>
              <h1>Good to see you, <em>{user.name || user.username}.</em></h1>
              <p>{defaultBrandingConfig.tagline} — <strong style={{ color: "var(--acid-yellow)" }}>{defaultBrandingConfig.philosophy.coreMotto}</strong></p>
            </div>
            {activeTab === "repos" ? (
              <Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={17} /> New repository</Button>
            ) : (
              <Button variant="primary" onClick={loadContainers}><RefreshCw size={17} /> Rescan Containers</Button>
            )}
          </div>

          {notice && <StatusBanner variant="success" message={notice} onDismiss={() => setNotice("")} />}
          {error && <StatusBanner variant="error" message={error} onDismiss={() => setError("")} />}

          {/* TAB 1: REPOSITORIES */}
          {activeTab === "repos" && (
            <>
              <div className="stat-grid">
                <StatMetric label="REPOSITORIES" value={repos.length.toString().padStart(2, "0")} sub="/// CONTROLLED BY YOU" icon={<FolderGit2 size={16} />} />
                <StatMetric label="PRIVATE REPOS" value={repos.filter((r) => r.visibility === "private").length.toString().padStart(2, "0")} sub="ACCESS RESTRICTED" icon={<ShieldCheck size={16} />} />
                <StatMetric label="PUBLIC REPOS" value={repos.filter((r) => r.visibility === "public").length.toString().padStart(2, "0")} sub="OPEN TO CLONE" icon={<ArrowUpRight size={16} />} />
                <StatMetric label="GIT ENGINE" value="READY." sub="HTTP SMART PROTOCOL" variant="neon" valueColor="#00ff66" icon={<Activity size={16} />} />
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <div><div className="eyebrow muted">SOURCE CONTROL / 01</div><h2>Your repositories <span>{repos.length.toString().padStart(2, "0")}</span></h2></div>
                  <div className="section-tools"><div className="search-box"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a repository..." /></div><button className="icon-button" onClick={loadRepos} title="Refresh"><RefreshCw size={16} /></button></div>
                </div>
                <div className="repo-table">
                  <div className="repo-table-head"><span>REPOSITORY</span><span>VISIBILITY</span><span>DEFAULT BRANCH</span><span>CREATED</span><span /></div>
                  {loading ? (
                    <EmptyState icon={<RefreshCw className="spin" size={20} />} title="SYNCING REPOSITORIES..." />
                  ) : filteredRepos.length === 0 ? (
                    <EmptyState
                      icon={<FolderGit2 size={24} />}
                      title={query ? "NO MATCHES FOUND" : "NOTHING HERE. YET."}
                      description={query ? "Try another search term." : "Create your first repository and push your first commit."}
                      action={!query ? <Button variant="secondary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create repository</Button> : undefined}
                    />
                  ) : filteredRepos.map((repo) => (
                    <div className="repo-row" key={repo.id}><div className="repo-name"><div className="repo-icon"><GitBranch size={17} /></div><div><b>{repo.name}</b><small>{repo.path}</small>{repo.description && <p>{repo.description}</p>}</div></div><div><Badge variant={repo.visibility === "private" ? "default" : "cyan"}>{repo.visibility === "private" ? <ShieldCheck size={12} /> : <ArrowUpRight size={12} />}{repo.visibility.toUpperCase()}</Badge></div><div className="branch-cell"><GitBranch size={13} />{repo.default_branch || "main"}</div><div className="date-cell">{new Date(repo.created).toLocaleDateString()}</div><div className="row-action"><button className="icon-button" title="Copy clone URL" onClick={() => copyText(`${gitEngineUrl}/git/${repo.path}.git`)}><Copy size={15} /></button></div></div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* TAB 2: DOCKER PAAS HUB */}
          {activeTab === "paas" && (
            <>
              <div className="stat-grid">
                <StatMetric label="TOTAL CONTAINERS" value={containers.length.toString().padStart(2, "0")} sub="LOCAL DOCKER DAEMON" icon={<Container size={16} />} />
                <StatMetric label="RUNNING NODES" value={runningCount.toString().padStart(2, "0")} sub="ACTIVE MICROSERVICES" variant="neon" valueColor="#00ff66" icon={<Activity size={16} />} />
                <StatMetric label="STOPPED / IDLE" value={(containers.length - runningCount).toString().padStart(2, "0")} sub="READY TO RESUME" variant="toxic" valueColor="#f4ff00" icon={<Square size={16} />} />
                <StatMetric label="PAAS ENGINE" value="ONLINE." sub="DOCKER SUBPROCESS BRIDGE" variant="gold" valueColor="#00f0ff" icon={<Server size={16} />} />
              </div>

              <section className="section-block">
                <div className="section-heading">
                  <div><div className="eyebrow muted">PAAS ORCHESTRATION / 01</div><h2>Local Container Instances <span>{containers.length.toString().padStart(2, "0")}</span></h2></div>
                  <div className="section-tools"><div className="search-box"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter containers..." /></div><button className="icon-button" onClick={loadContainers} title="Refresh"><RefreshCw size={16} /></button></div>
                </div>

                <div className="repo-table">
                  <div className="repo-table-head" style={{ gridTemplateColumns: "minmax(200px, 1.8fr) minmax(110px, .9fr) minmax(140px, 1fr) minmax(140px, 1.2fr) 180px" }}>
                    <span>CONTAINER / IMAGE</span>
                    <span>STATE</span>
                    <span>STATUS</span>
                    <span>PORTS</span>
                    <span style={{ textAlign: "right" }}>ACTIONS</span>
                  </div>
                  {loading ? (
                    <EmptyState icon={<RefreshCw className="spin" size={20} />} title="INSPECTING DOCKER ENGINE..." />
                  ) : filteredContainers.length === 0 ? (
                    <EmptyState icon={<Container size={24} />} title="NO CONTAINERS FOUND" description="No local containers currently matching query." />
                  ) : (
                    filteredContainers.map((c) => (
                      <div className="repo-row" key={c.id} style={{ gridTemplateColumns: "minmax(200px, 1.8fr) minmax(110px, .9fr) minmax(140px, 1fr) minmax(140px, 1.2fr) 180px" }}>
                        <div className="repo-name">
                          <div className="repo-icon" style={{ background: c.state === "running" ? "var(--neon-lime)" : "#333", color: "#000" }}>
                            <Container size={17} />
                          </div>
                          <div>
                            <b>{c.names || c.id.slice(0, 12)}</b>
                            <small>{c.image}</small>
                          </div>
                        </div>
                        <div>
                          <Badge variant={c.state === "running" ? "lime" : "default"}>
                            {c.state.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="branch-cell" style={{ fontSize: "11px", color: "#aaa" }}>
                          {c.status}
                        </div>
                        <div className="date-cell" style={{ fontSize: "11px", color: "var(--acid-yellow)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.ports || "Internal Only"}
                        </div>
                        <div className="row-action" style={{ display: "flex", gap: "6px" }}>
                          {c.state === "running" ? (
                            <button className="icon-button" title="Stop Container" disabled={busy} onClick={() => handleContainerAction(c.id, "stop", c.names)} style={{ color: "var(--toxic)" }}>
                              <Square size={14} />
                            </button>
                          ) : (
                            <button className="icon-button" title="Start Container" disabled={busy} onClick={() => handleContainerAction(c.id, "start", c.names)} style={{ color: "var(--neon-lime)" }}>
                              <Play size={14} />
                            </button>
                          )}
                          <button className="icon-button" title="Restart Container" disabled={busy} onClick={() => handleContainerAction(c.id, "restart", c.names)} style={{ color: "var(--acid-yellow)" }}>
                            <RotateCw size={14} />
                          </button>
                          <button className="icon-button" title="View Logs" disabled={busy} onClick={() => handleContainerAction(c.id, "logs", c.names)} style={{ color: "var(--cyan)" }}>
                            <FileText size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          <section className="bottom-grid">
            <Card variant="default" className="p-5">
              <div className="panel-title"><TerminalSquare size={17} /> QUICK START <span>///</span></div>
              <p className="text-gray-400 text-xs mb-3">Clone your repository and start shipping.</p>
              <div className="code-line">
                <code>git clone http://127.0.0.1:3200/git/{user.username}/your-repo.git</code>
                <button onClick={() => copyText(`git clone ${gitEngineUrl}/git/${user.username}/your-repo.git`)} title="Copy command"><Copy size={14} /></button>
              </div>
              <small className="text-gray-500 text-[10px] block mt-2">Use your personal access token when Git asks for a password.</small>
            </Card>
            <Card variant="grunge" className="p-5">
              <div className="panel-title"><Server size={17} /> NODE STATUS <span>LIVE</span></div>
              <div className="space-y-2 mt-3 font-mono text-xs">
                <div className="flex justify-between border-b border-[#222] pb-1.5"><span className="text-gray-400">CONTROL PLANE</span><Badge variant="cyan">POCKETBASE :8091</Badge></div>
                <div className="flex justify-between border-b border-[#222] pb-1.5"><span className="text-gray-400">DATA PLANE</span><Badge variant="lime">NATIVE GIT :3200</Badge></div>
                <div className="flex justify-between"><span className="text-gray-400">CONTAINER PAAS</span><Badge variant="toxic">DOCKER READY</Badge></div>
              </div>
            </Card>
          </section>
        </div>
      </section>

      {/* MODAL CONTAINER LOGS */}
      <ModalDialog
        open={Boolean(containerLogs)}
        onClose={() => setContainerLogs(null)}
        eyebrow={`CONTAINER LOGS // ${containerLogs?.id.slice(0, 12) || ""}`}
        title={containerLogs?.name || "Logs"}
        maxWidth="780px"
      >
        <TerminalWindow title={`STDOUT // ${containerLogs?.name || ""}`} variant="neon">
          <pre style={{ margin: 0, maxHeight: "360px", overflowY: "auto", color: "#00ff66", whiteSpace: "pre-wrap" }}>
            {containerLogs?.logs}
          </pre>
        </TerminalWindow>
        <div className="modal-actions" style={{ marginTop: 14 }}>
          <Button variant="primary" onClick={() => setContainerLogs(null)}>Close</Button>
        </div>
      </ModalDialog>

      {/* MODAL CREATE REPO */}
      <ModalDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        eyebrow="REPOSITORY / CREATE"
        title="New repository."
      >
        <form onSubmit={createRepo} className="form-stack">
          <label>REPOSITORY NAME<Input required maxLength={80} value={newRepoName} onChange={(e) => { setNewRepoName(e.target.value); setNewRepoSlug(slugify(e.target.value)); }} placeholder="e.g. moonships" /></label>
          <label>SLUG<Input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={newRepoSlug} onChange={(e) => setNewRepoSlug(e.target.value)} placeholder="moonships" /></label>
          <label>DESCRIPTION <span className="optional">OPTIONAL</span><Textarea maxLength={280} value={newRepoDescription} onChange={(e) => setNewRepoDescription(e.target.value)} placeholder="What are you building?" rows={3} /></label>
          <label>VISIBILITY
            <Select value={visibility} onChange={(e) => setVisibility(e.target.value as "private" | "public")}>
              <option value="private">Private — only you can access</option>
              <option value="public">Public — anyone can clone</option>
            </Select>
          </label>
          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="primary" disabled={busy}>{busy ? "CREATING..." : <><Plus size={16} /> Create repository</>}</Button>
          </div>
        </form>
      </ModalDialog>

      {/* MODAL ACCESS TOKEN */}
      <ModalDialog
        open={showToken}
        onClose={() => { setShowToken(false); setCreatedToken(null); }}
        eyebrow="SECURITY / CREDENTIALS"
        title="Personal access token."
      >
        {createdToken ? (
          <div className="token-created">
            <div className="token-success"><Check size={16} /> TOKEN CREATED — COPY NOW</div>
            <p>This secret cannot be displayed again. Store it in your password manager.</p>
            <div className="token-value"><code>{createdToken.token}</code><Button variant="secondary" onClick={() => copyText(createdToken.token)}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy"}</Button></div>
            <div className="token-meta">PREFIX <b>{createdToken.token_prefix}</b> · NAME <b>{createdToken.name}</b></div>
            <Button variant="primary" className="w-full mt-3" onClick={() => { setShowToken(false); setCreatedToken(null); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={createAccessToken} className="form-stack">
            <p className="subcopy">Use this token as the password when Git prompts for HTTP credentials.</p>
            <label>TOKEN NAME<Input required maxLength={80} value={tokenName} onChange={(e) => setTokenName(e.target.value)} /></label>
            <div className="scope-box">
              <span>PERMISSIONS</span>
              <label className="check-row"><input type="checkbox" checked={tokenScopes.includes("repo:read")} onChange={(e) => setTokenScopes((s) => e.target.checked ? [...s, "repo:read"] : s.filter((v) => v !== "repo:read"))} /> Read / clone repositories</label>
              <label className="check-row"><input type="checkbox" checked={tokenScopes.includes("repo:write")} onChange={(e) => setTokenScopes((s) => e.target.checked ? [...s, "repo:write"] : s.filter((v) => v !== "repo:write"))} /> Push / write repositories</label>
            </div>
            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowToken(false)}>Cancel</Button>
              <Button variant="primary" disabled={busy || tokenScopes.length === 0}>{busy ? "GENERATING..." : <><KeyRound size={16} /> Generate token</>}</Button>
            </div>
          </form>
        )}
      </ModalDialog>
      <div className="copy-toast" data-show={copied}><Check size={14} /> COPIED TO CLIPBOARD</div>
    </main>
  );
}
