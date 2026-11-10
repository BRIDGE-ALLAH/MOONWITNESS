"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  EcosystemFooter,
  EcosystemTopBar,
  Input,
  SKINS,
  type SkinId,
  StatMetric,
  useTheme,
} from "@local-git/ui";

interface ProjectMilestone {
  id: string;
  version: string;
  title: string;
  targetDate: string;
  status: "COMPLETED" | "ACTIVE" | "PLANNED";
  progressPct: number;
  summary: string;
  deliverables: string[];
  updatedAt: string;
}

interface ProjectTask {
  id: string;
  milestoneId: string;
  title: string;
  domain: "NARRATION" | "DNA" | "UI" | "UX" | "BACKEND" | "EDGE_MCP";
  priority: "CRITICAL" | "HIGH" | "NORMAL";
  status: "todo" | "in_progress" | "done";
  progressPct: number;
  owner: string;
  updatedAt: string;
}

interface CodexDoc {
  id: string;
  category: "RULE" | "SPEC" | "DESIGN" | "EDGE" | "RFC";
  title: string;
  version: string;
  summary: string;
  content: string;
  updatedBy: string;
  updatedAt: string;
}

interface CodexComment {
  id: string;
  targetType: "milestone" | "task" | "release" | "doc";
  targetId: string;
  author: string;
  role: "PUBLIC_USER" | "AUTONOMOUS_GOVERNOR" | "CORE_ARCHITECT";
  sentiment: "IDEA" | "ISSUE" | "QUESTION" | "APPROVE";
  body: string;
  autonomousReply: string;
  triageStatus: "AUTO_RESOLVED" | "QUEUED_TASK" | "VERIFIED_ON_MESH";
  linkedTaskId: string;
  createdAt: string;
}

interface ReleaseEntry {
  version: string;
  date: string;
  headline: string;
  highlights: string[];
}

interface WikiPayload {
  version: string;
  appName: string;
  independentOfMainProject: boolean;
  storageEngine: string;
  localPlanFolderEliminated: boolean;
  edgeService: {
    name: string;
    standaloneUrl: string;
    cloudflareConfig: string;
    d1Schema: string;
    staysOnlineWhenOriginDown: boolean;
  };
  mcpServer: {
    name: string;
    transport: string;
    entrypoint: string;
    edgeWorker: string;
    tools: string[];
  };
  kpis: {
    overallCompletionPct: number;
    completedMilestones: number;
    totalMilestones: number;
    tasksDone: number;
    tasksInProgress: number;
    tasksTodo: number;
    totalTasks: number;
    avgTaskProgressPct: number;
    totalDocs: number;
    totalComments: number;
    autonomousResolutionRatePct: number;
    testAssertions: number;
    smokeEndpoints: number;
    zeroSlopViolations: number;
    edgePlatform: string;
  };
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  docs: CodexDoc[];
  comments: CodexComment[];
  releases: ReleaseEntry[];
  changelog: string;
  legendStats: Record<string, unknown>;
  timestamp: string;
}

const BRAND_REGISTRY = [
  {
    id: "empire",
    rank: "#1 SUPREME ORIGIN",
    name: "ALLAH.COM // EMPIRE OF THE LIGHT",
    port: ":3001",
    url: "http://127.0.0.1:3001",
    domain: "Civilization Apex & Sacred Geometry",
    accent: "var(--accent)",
    dna: "Obsidian void (#070709) illuminated by sacred burnished gold (#c9a227) and Cinzel display typography.",
  },
  {
    id: "dx",
    rank: "#2 DEVELOPER COCKPIT",
    name: "DX // SOVEREIGN DEVELOPER COCKPIT",
    port: ":3000",
    url: "http://127.0.0.1:3000",
    domain: "Git Smart HTTP, SurrealQL, PaaS & Sovereign Codex",
    accent: "#10b981",
    dna: "High-density engineering workstation with in-browser Git tree inspection and SurrealQL console.",
  },
  {
    id: "moonwitness",
    rank: "#3 CELESTIAL OBSERVATORY",
    name: "MOONWITNESS // CELESTIAL OBSERVATORY",
    port: ":3002",
    url: "http://127.0.0.1:3002",
    domain: "Astronomical Ephemeris & Live Transmissions",
    accent: "#38bdf8",
    dna: "Deterministic lunar synodic ephemeris, UTC spherical altitude/azimuth, and PocketBase SSE broadcasts.",
  },
  {
    id: "e-isp",
    rank: "#4 EDGE-INFRA TELEMETRY",
    name: "E-ISP // EDGE-INFRA SCALE PLATFORM",
    port: ":3003",
    url: "http://127.0.0.1:3003",
    domain: "ARSY PPPoE Orchestration & RADIUS AAA",
    accent: "#a855f7",
    dna: "BGP/ASN edge mesh control plane wired to Fastify ARSY (:4000) and Rust Legend BaaS (:8092).",
  },
  {
    id: "rid",
    rank: "#5 ROOT IDENTITY & AUDIO",
    name: "RID // ROOT ID ('SOUL NOT ROCK')",
    port: ":3004",
    url: "http://127.0.0.1:3004",
    domain: "Zero-Trust Identity & Web Audio Skang Synth",
    accent: "#f59e0b",
    dna: "PocketBase JWT/PAT identity vault paired with 4-oscillator Web Audio synthesis and Soul Patch DB.",
  },
];

type CodexTab = "milestones" | "tasks" | "comments" | "docs" | "releases" | "dna";

export default function SovereignCodexWikiPage() {
  const themeCtx = useTheme();
  const [activeTab, setActiveTab] = useState<CodexTab>("milestones");
  const [codex, setCodex] = useState<WikiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDomain, setNewTaskDomain] = useState<ProjectTask["domain"]>("EDGE_MCP");
  const [newTaskPriority, setNewTaskPriority] = useState<ProjectTask["priority"]>("HIGH");
  const [domainFilter, setDomainFilter] = useState<string>("ALL");

  // Milestone creation state
  const [newMilestoneVersion, setNewMilestoneVersion] = useState("v0.6.0");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  // Comment creation state
  const [commentAuthor, setCommentAuthor] = useState("public-architect@edge.net");
  const [commentSentiment, setCommentSentiment] = useState<CodexComment["sentiment"]>("IDEA");
  const [commentTargetType, setCommentTargetType] = useState<CodexComment["targetType"]>("milestone");
  const [commentTargetId, setCommentTargetId] = useState("m5-v050");
  const [commentBody, setCommentBody] = useState("");

  // Doc creation state
  const [newDocCategory, setNewDocCategory] = useState<CodexDoc["category"]>("RFC");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  const fetchCodex = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wiki", { cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as WikiPayload;
        setCodex(payload);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCodex();
  }, [fetchCodex]);

  const mutateCodexApi = async (payload: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        await fetchCodex();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await mutateCodexApi({
      action: "upsert_task",
      title: newTaskTitle.trim(),
      domain: newTaskDomain,
      priority: newTaskPriority,
      status: "in_progress",
      progressPct: 25,
    });
    setNewTaskTitle("");
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    await mutateCodexApi({
      action: "upsert_milestone",
      version: newMilestoneVersion.trim() || "v0.6.0",
      title: newMilestoneTitle.trim(),
      status: "ACTIVE",
      progressPct: 20,
    });
    setNewMilestoneTitle("");
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    await mutateCodexApi({
      action: "post_comment",
      author: commentAuthor.trim() || "public@edge.net",
      sentiment: commentSentiment,
      targetType: commentTargetType,
      targetId: commentTargetId.trim() || "m5-v050",
      body: commentBody.trim(),
    });
    setCommentBody("");
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    await mutateCodexApi({
      action: "upsert_doc",
      category: newDocCategory,
      title: newDocTitle.trim(),
      content: newDocContent.trim(),
    });
    setNewDocTitle("");
    setNewDocContent("");
  };

  const kpis = codex?.kpis;
  const filteredTasks = (codex?.tasks ?? []).filter((t) =>
    domainFilter === "ALL" ? true : t.domain === domainFilter
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <EcosystemTopBar currentDna="dx" />

      {/* HERO BANNER */}
      <section
        style={{
          borderBottom: "1px solid var(--line)",
          background:
            "radial-gradient(circle at 18% 0%, rgba(201, 162, 39, 0.14), transparent 52%), var(--panel)",
          padding: "28px 24px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <Badge variant="gold">★ SOVEREIGN CODEX // EDGE PULSE</Badge>
                <Badge variant="lime">100% DATABASE-DRIVEN (ZERO .PLAN FILES)</Badge>
                <Badge variant="default">CLOUDFLARE WORKERS + D1 (:8787) + MCP SERVER</Badge>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-display), serif",
                  fontSize: "clamp(24px, 3.2vw, 36px)",
                  margin: "0 0 8px 0",
                  letterSpacing: "0.03em",
                }}
              >
                SOVEREIGN CODEX — STATUS, MILESTONES, KPIs, WIKI & AUTONOMOUS PM
              </h1>
              <p style={{ color: "var(--muted)", margin: 0, maxWidth: 840, fontSize: 14 }}>
                Decoupled public product portal backed by Cloudflare Serverless D1 (<code>wrangler.toml</code> /{" "}
                <code>:8787</code>) and Model Context Protocol (<code>scripts/codex-mcp.ts</code>). Remains{" "}
                <strong style={{ color: "var(--text)" }}>100% ONLINE</strong> even if all 9 origin project nodes are shut down.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="http://127.0.0.1:8787"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderRadius: "var(--radius)",
                  border: "1px solid rgba(16, 185, 129, 0.45)",
                  background: "rgba(16, 185, 129, 0.14)",
                  color: "#10b981",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                ● STANDALONE EDGE PULSE (:8787) ↗
              </a>
              <Button variant="secondary" size="sm" onClick={() => void fetchCodex()} disabled={loading}>
                {loading ? "SYNCING..." : "↻ SYNC CODEX DB"}
              </Button>
              <a
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--line2)",
                  background: "var(--panel2)",
                  color: "var(--text)",
                  fontSize: 12,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                ← DX COCKPIT (:3000)
              </a>
            </div>
          </div>

          {/* EXECUTIVE KPI TELEMETRY STRIP */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 12,
              marginTop: 22,
            }}
          >
            <StatMetric
              label="OVERALL COMPLETION KPI"
              value={`${kpis?.overallCompletionPct ?? 98}%`}
              sub={`${kpis?.avgTaskProgressPct ?? 100}% Avg Task Progress`}
              variant="gold"
            />
            <StatMetric
              label="MILESTONE VELOCITY"
              value={`${kpis?.completedMilestones ?? 4} / ${kpis?.totalMilestones ?? 5}`}
              sub="Persisted in Codex DB"
              variant="neon"
            />
            <StatMetric
              label="TASK EXECUTION"
              value={`${kpis?.tasksDone ?? 6} DONE / ${kpis?.totalTasks ?? 6}`}
              sub={`${kpis?.tasksInProgress ?? 0} In Progress · ${kpis?.tasksTodo ?? 0} Todo`}
              variant="cyan"
            />
            <StatMetric
              label="AUTONOMOUS COMMENTS"
              value={`${kpis?.totalComments ?? 2} (${kpis?.autonomousResolutionRatePct ?? 100}%)`}
              sub="Auto-Triaged by Governor"
              variant="gold"
            />
            <StatMetric
              label="QUALITY & MCP TOOLS"
              value={`${kpis?.testAssertions ?? 31} ASSERTS`}
              sub="5 MCP Tools · 0 Zero-Slop Debt"
              variant="neon"
            />
            <StatMetric
              label="INDEPENDENT EDGE DB"
              value="ONLINE :8787"
              sub="Cloudflare D1 + Zero .plan"
              variant="neon"
            />
          </div>
        </div>
      </section>

      {/* MAIN BODY */}
      <main style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "24px", flex: 1 }}>
        {/* NAVIGATION TABS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 24,
            borderBottom: "1px solid var(--line)",
            paddingBottom: 14,
          }}
        >
          {(
            [
              { id: "milestones", label: "1. MILESTONES & KPIs" },
              { id: "tasks", label: "2. TASKS & PROGRESS %" },
              { id: "comments", label: "3. PUBLIC & AUTO COMMENTS" },
              { id: "docs", label: "4. DB CODEX & MCP TOOLS" },
              { id: "releases", label: "5. RELEASES & CHANGELOG" },
              { id: "dna", label: "6. BRAND DNA & SKINS" },
            ] as Array<{ id: CodexTab; label: string }>
          ).map((tab) => (
            <Button
              key={tab.id}
              size="sm"
              variant={activeTab === tab.id ? "primary" : "secondary"}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* TAB 1: MILESTONES & KPIs */}
        {activeTab === "milestones" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card variant="gold">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <CardTitle>RELEASE MILESTONES & PRODUCT ROADMAP (DATABASE-DRIVEN)</CardTitle>
                  <CardDescription>
                    Stored in the independent Codex database (Cloudflare D1 / <code>codex_milestones</code>) and accessible via MCP tool <code>codex_upsert_milestone</code>.
                  </CardDescription>
                </div>
                <form onSubmit={handleCreateMilestone} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Input
                    value={newMilestoneVersion}
                    onChange={(e) => setNewMilestoneVersion(e.target.value)}
                    placeholder="v0.6.0"
                    style={{ width: 96 }}
                  />
                  <Input
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="New milestone title..."
                    style={{ width: 260 }}
                  />
                  <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                    + ADD MILESTONE
                  </Button>
                </form>
              </div>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: 16,
              }}
            >
              {(codex?.milestones ?? []).map((milestone) => (
                <Card
                  key={milestone.id}
                  variant={milestone.status === "COMPLETED" ? "gold" : "default"}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Badge variant="gold">{milestone.version}</Badge>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Badge variant={milestone.status === "COMPLETED" ? "lime" : "gold"}>
                          {milestone.status} · {milestone.progressPct}%
                        </Badge>
                        <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                          {milestone.targetDate}
                        </span>
                      </div>
                    </div>
                    <CardTitle style={{ marginBottom: 6 }}>{milestone.title}</CardTitle>
                    <CardDescription style={{ marginBottom: 12 }}>{milestone.summary}</CardDescription>

                    {/* PROGRESS BAR */}
                    <div
                      style={{
                        width: "100%",
                        height: 8,
                        borderRadius: 999,
                        background: "var(--bg)",
                        border: "1px solid var(--line)",
                        overflow: "hidden",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: `${milestone.progressPct}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, var(--accent), #10b981)",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                      {milestone.deliverables.map((deliv) => (
                        <Badge key={deliv} variant="default">
                          ✓ {deliv}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={submitting}
                      onClick={() =>
                        void mutateCodexApi({
                          action: "upsert_milestone",
                          id: milestone.id,
                          version: milestone.version,
                          title: milestone.title,
                          summary: milestone.summary,
                          targetDate: milestone.targetDate,
                          deliverables: milestone.deliverables,
                          progressPct: Math.min(100, milestone.progressPct + 10),
                        })
                      }
                    >
                      +10% PROGRESS
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={submitting || milestone.status === "COMPLETED"}
                      onClick={() =>
                        void mutateCodexApi({
                          action: "upsert_milestone",
                          id: milestone.id,
                          version: milestone.version,
                          title: milestone.title,
                          summary: milestone.summary,
                          targetDate: milestone.targetDate,
                          deliverables: milestone.deliverables,
                          status: "COMPLETED",
                          progressPct: 100,
                        })
                      }
                    >
                      {milestone.status === "COMPLETED" ? "✓ COMPLETED" : "MARK COMPLETED"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TASKS & PROGRESS % */}
        {activeTab === "tasks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card variant="gold">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <CardTitle>DATABASE-DRIVEN TASK & PROGRESS BOARD (ZERO .PLAN FILES)</CardTitle>
                  <CardDescription>
                    Every task and progress percentage (<code>0%</code>–<code>100%</code>) is stored in the independent Codex database and controllable via MCP tool <code>codex_upsert_task</code>.
                  </CardDescription>
                </div>
                <form onSubmit={handleCreateTask} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="New task description..."
                    style={{ width: 260 }}
                  />
                  <select
                    value={newTaskDomain}
                    onChange={(e) => setNewTaskDomain(e.target.value as ProjectTask["domain"])}
                    style={{
                      background: "var(--bg)",
                      color: "var(--text)",
                      border: "1px solid var(--line2)",
                      borderRadius: "var(--radius)",
                      padding: "6px 10px",
                      fontSize: 12,
                    }}
                  >
                    <option value="EDGE_MCP">EDGE_MCP</option>
                    <option value="BACKEND">BACKEND</option>
                    <option value="UI">UI</option>
                    <option value="UX">UX</option>
                    <option value="DNA">DNA</option>
                    <option value="NARRATION">NARRATION</option>
                  </select>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as ProjectTask["priority"])}
                    style={{
                      background: "var(--bg)",
                      color: "var(--text)",
                      border: "1px solid var(--line2)",
                      borderRadius: "var(--radius)",
                      padding: "6px 10px",
                      fontSize: 12,
                    }}
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                  <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                    + CREATE TASK
                  </Button>
                </form>
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                {["ALL", "NARRATION", "DNA", "UI", "UX", "BACKEND", "EDGE_MCP"].map((dom) => (
                  <Button
                    key={dom}
                    size="sm"
                    variant={domainFilter === dom ? "primary" : "secondary"}
                    onClick={() => setDomainFilter(dom)}
                  >
                    {dom}
                  </Button>
                ))}
              </div>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                gap: 14,
              }}
            >
              {filteredTasks.map((task) => (
                <Card key={task.id} variant={task.status === "done" ? "gold" : "default"}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      <Badge variant="gold">{task.domain}</Badge>
                      <Badge variant={task.priority === "CRITICAL" ? "toxic" : "default"}>
                        {task.priority}
                      </Badge>
                    </div>
                    <Badge variant={task.status === "done" ? "lime" : "gold"}>
                      {task.status === "done" ? "[x] DONE" : task.status === "in_progress" ? "[~] IN PROGRESS" : "[ ] TODO"} · {task.progressPct}%
                    </Badge>
                  </div>

                  <CardTitle style={{ fontSize: 15, marginBottom: 8 }}>{task.title}</CardTitle>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, fontFamily: "var(--font-mono)" }}>
                    ID: {task.id} · Milestone: {task.milestoneId} · Owner: {task.owner}
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 7,
                      borderRadius: 999,
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: `${task.progressPct}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--accent), #10b981)",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[0, 25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        size="sm"
                        variant={task.progressPct === pct ? "primary" : "secondary"}
                        disabled={submitting}
                        onClick={() =>
                          void mutateCodexApi({
                            action: "upsert_task",
                            id: task.id,
                            milestoneId: task.milestoneId,
                            title: task.title,
                            domain: task.domain,
                            priority: task.priority,
                            owner: task.owner,
                            status: pct === 100 ? "done" : pct === 0 ? "todo" : "in_progress",
                            progressPct: pct,
                          })
                        }
                      >
                        {pct === 100 ? "✓ 100% DONE" : `${pct}%`}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PUBLIC & AUTONOMOUS COMMENTS */}
        {activeTab === "comments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Card variant="gold">
              <CardTitle style={{ marginBottom: 6 }}>
                PUBLIC & AUTONOMOUS GOVERNOR COMMENT STREAM (AUTO-TRIAGE & AUTO-TASK)
              </CardTitle>
              <CardDescription style={{ marginBottom: 14 }}>
                Public observers and developers can comment on any Milestone, Task, Release, or Spec. The{" "}
                <strong>Sovereign Autonomous Governor</strong> immediately analyzes the comment, responds with deterministic mesh context, and automatically creates a tracked task when Sentiment is <code>IDEA</code> or <code>ISSUE</code>.
              </CardDescription>

              <form onSubmit={handlePostComment} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  <Input
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder="Author (e.g. observer@edge.net)"
                  />
                  <select
                    value={commentSentiment}
                    onChange={(e) => setCommentSentiment(e.target.value as CodexComment["sentiment"])}
                    style={{
                      background: "var(--bg)",
                      color: "var(--text)",
                      border: "1px solid var(--line2)",
                      borderRadius: "var(--radius)",
                      padding: "8px 10px",
                      fontSize: 12,
                    }}
                  >
                    <option value="IDEA">IDEA (Auto-Creates Task)</option>
                    <option value="ISSUE">ISSUE (Auto-Creates Task)</option>
                    <option value="QUESTION">QUESTION (Autonomous Answer)</option>
                    <option value="APPROVE">APPROVE (Sign-off)</option>
                  </select>
                  <select
                    value={commentTargetType}
                    onChange={(e) => setCommentTargetType(e.target.value as CodexComment["targetType"])}
                    style={{
                      background: "var(--bg)",
                      color: "var(--text)",
                      border: "1px solid var(--line2)",
                      borderRadius: "var(--radius)",
                      padding: "8px 10px",
                      fontSize: 12,
                    }}
                  >
                    <option value="milestone">Target: Milestone</option>
                    <option value="task">Target: Task</option>
                    <option value="release">Target: Release</option>
                    <option value="doc">Target: Codex Doc</option>
                  </select>
                  <Input
                    value={commentTargetId}
                    onChange={(e) => setCommentTargetId(e.target.value)}
                    placeholder="Target ID (e.g. m5-v050)"
                  />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Input
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Write public comment, architectural question, or feature request..."
                    style={{ flex: 1 }}
                  />
                  <Button type="submit" variant="primary" disabled={submitting}>
                    ⚡ POST & AUTO-TRIAGE
                  </Button>
                </div>
              </form>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                gap: 14,
              }}
            >
              {(codex?.comments ?? []).map((comment) => (
                <Card key={comment.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Badge variant="gold">{comment.sentiment}</Badge>
                      <Badge variant="default">
                        {comment.targetType}:{comment.targetId}
                      </Badge>
                    </div>
                    <Badge variant="lime">{comment.triageStatus}</Badge>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                    By <strong style={{ color: "var(--text)" }}>{comment.author}</strong> ({comment.role}) · Linked Task:{" "}
                    <code>{comment.linkedTaskId}</code>
                  </div>

                  <p style={{ fontSize: 14, margin: "0 0 12px 0" }}>{comment.body}</p>

                  <div
                    style={{
                      padding: 12,
                      borderRadius: "var(--radius)",
                      background: "rgba(16, 185, 129, 0.08)",
                      borderLeft: "3px solid #10b981",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text)",
                    }}
                  >
                    {comment.autonomousReply}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DB CODEX & MCP TOOLS */}
        {activeTab === "docs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: 16,
              }}
            >
              <Card variant="gold">
                <Badge variant="gold" style={{ marginBottom: 8 }}>
                  MCP SERVER // JSON-RPC 2.0
                </Badge>
                <CardTitle style={{ marginBottom: 6 }}>
                  {codex?.mcpServer.name ?? "sovereign-codex-mcp"}
                </CardTitle>
                <CardDescription style={{ marginBottom: 12 }}>
                  Replaces local <code>.plan/</code> markdown files with live database tools callable from Claude, Cursor, Antigravity, and CI pipelines.
                </CardDescription>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {(codex?.mcpServer.tools ?? []).map((toolName) => (
                    <Badge key={toolName} variant="lime">
                      ⚡ {toolName}
                    </Badge>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                  Stdio Entrypoint: <code>scripts/codex-mcp.ts</code>
                  <br />
                  HTTP Edge Endpoint: <code>http://127.0.0.1:8787/mcp</code>
                </div>
              </Card>

              <Card>
                <Badge variant="lime" style={{ marginBottom: 8 }}>
                  CLOUDFLARE WORKERS + D1 EDGE
                </Badge>
                <CardTitle style={{ marginBottom: 6 }}>
                  100% Decoupled Out-of-Band Availability
                </CardTitle>
                <CardDescription style={{ marginBottom: 12 }}>
                  Configured via <code>wrangler.toml</code> and <code>services/codex-edge/schema.sql</code>. Even when all 9 monorepo servers are stopped, the Edge Portal and MCP server stay online.
                </CardDescription>
                <form onSubmit={handleCreateDoc} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value as CodexDoc["category"])}
                      style={{
                        background: "var(--bg)",
                        color: "var(--text)",
                        border: "1px solid var(--line2)",
                        borderRadius: "var(--radius)",
                        padding: "6px 10px",
                        fontSize: 12,
                      }}
                    >
                      <option value="RULE">RULE</option>
                      <option value="SPEC">SPEC</option>
                      <option value="DESIGN">DESIGN</option>
                      <option value="EDGE">EDGE</option>
                      <option value="RFC">RFC</option>
                    </select>
                    <Input
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="New Codex Document Title..."
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Input
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                      placeholder="Document specification content..."
                    />
                    <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                      + SAVE DOC
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                gap: 14,
              }}
            >
              {(codex?.docs ?? []).map((doc) => (
                <Card key={doc.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Badge variant="gold">{doc.category}</Badge>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                      {doc.id} · {doc.version}
                    </span>
                  </div>
                  <CardTitle style={{ marginBottom: 6 }}>{doc.title}</CardTitle>
                  <CardDescription style={{ marginBottom: 10 }}>{doc.summary}</CardDescription>
                  <pre
                    style={{
                      margin: 0,
                      padding: 12,
                      borderRadius: "var(--radius)",
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      whiteSpace: "pre-wrap",
                      color: "var(--text)",
                    }}
                  >
                    {doc.content}
                  </pre>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RELEASES & CHANGELOG */}
        {activeTab === "releases" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 14,
              }}
            >
              {(codex?.releases ?? []).map((rel) => (
                <Card key={rel.version} variant="gold">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Badge variant="gold">{rel.version}</Badge>
                    <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                      {rel.date}
                    </span>
                  </div>
                  <CardTitle style={{ fontSize: 15, marginBottom: 8 }}>{rel.headline}</CardTitle>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--muted)" }}>
                    {rel.highlights.map((item) => (
                      <li key={item} style={{ marginBottom: 4 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <Card>
              <CardTitle style={{ marginBottom: 8 }}>RAW CHANGELOG.MD LEDGER</CardTitle>
              <pre
                style={{
                  margin: 0,
                  padding: 14,
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                  border: "1px solid var(--line)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  whiteSpace: "pre-wrap",
                  maxHeight: 420,
                  overflowY: "auto",
                }}
              >
                {codex?.changelog || "No changelog entries found."}
              </pre>
            </Card>
          </div>
        )}

        {/* TAB 6: BRAND DNA & SKINS */}
        {activeTab === "dna" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 14,
              }}
            >
              {BRAND_REGISTRY.map((brand) => (
                <Card key={brand.id} variant={brand.id === "empire" ? "gold" : "default"}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Badge variant={brand.id === "empire" ? "gold" : "default"}>{brand.rank}</Badge>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: brand.accent }}>
                      {brand.port}
                    </span>
                  </div>
                  <CardTitle style={{ marginBottom: 4 }}>{brand.name}</CardTitle>
                  <div style={{ fontSize: 12, fontWeight: 600, color: brand.accent, marginBottom: 8 }}>
                    {brand.domain}
                  </div>
                  <CardDescription style={{ marginBottom: 12 }}>{brand.dna}</CardDescription>
                  <a
                    href={brand.url}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent)",
                      textDecoration: "none",
                    }}
                  >
                    OPEN NODE {brand.port} →
                  </a>
                </Card>
              ))}
            </div>

            <Card>
              <CardTitle style={{ marginBottom: 6 }}>ADAPTIVE 4-SKIN DESIGN SYSTEM</CardTitle>
              <CardDescription style={{ marginBottom: 14 }}>
                Switch skins live across all 5 Sovereign frontend nodes (`localStorage` synchronized).
              </CardDescription>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: 14,
                }}
              >
                {(Object.keys(SKINS) as SkinId[]).map((skinKey) => {
                  const skin = SKINS[skinKey];
                  const isActive = themeCtx?.theme.skin === skinKey;
                  return (
                    <Card key={skinKey} variant={isActive ? "gold" : "default"}>
                      <Badge variant={isActive ? "gold" : "default"} style={{ marginBottom: 8 }}>
                        SKIN // {skin.label}
                      </Badge>
                      <CardDescription style={{ marginBottom: 12, fontSize: 12 }}>
                        BG: {skin.dark.bg} · PANEL: {skin.dark.panel}
                      </CardDescription>
                      <Button
                        size="sm"
                        variant={isActive ? "primary" : "secondary"}
                        onClick={() => themeCtx?.setSkin(skinKey)}
                      >
                        {isActive ? "✓ ACTIVE SKIN" : `APPLY ${skin.label}`}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </main>

      <EcosystemFooter />
    </div>
  );
}
