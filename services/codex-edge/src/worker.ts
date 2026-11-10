#!/usr/bin/env bun
/**
 * SOVEREIGN CODEX // EDGE PULSE (sovereign-codex-edge)
 * 100% Independent Public Status, Project Management, Wiki, KPI, Changelog & MCP Edge Application.
 * - Deploys to Cloudflare Workers + Cloudflare D1 (`wrangler deploy`)
 * - Runs standalone on `:8787` (`bun run codex:edge`) with ZERO dependency on :3000-:3004, :8091, or :8092.
 * - Stays 100% ONLINE even when all 9 origin monorepo nodes are OFF/DOWN.
 */

import {
  buildCodexDashboardSnapshot,
  type D1DatabaseLike,
  mutateCodex,
} from "./store";

export interface Env {
  CODEX_DB?: D1DatabaseLike;
  LEGEND_SERVICE_TOKEN?: string;
  SOVEREIGN_VERSION?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export async function sendTelegramNotification(
  env: Env | undefined,
  message: string
): Promise<void> {
  const token =
    env?.TELEGRAM_BOT_TOKEN ||
    (typeof process !== "undefined" ? process.env?.TELEGRAM_BOT_TOKEN : undefined);
  const chatId =
    env?.TELEGRAM_CHAT_ID ||
    (typeof process !== "undefined" ? (process.env?.TELEGRAM_CHAT_ID || process.env?.TELEGRAM_GROUP_ID) : undefined);
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Non-blocking: background notification failure must not fail the primary codex request
  }
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

async function handleMcpJsonRpc(request: Request, env?: Env): Promise<Response> {
  try {
    const rpc = (await request.json()) as {
      jsonrpc?: string;
      id?: string | number | null;
      method?: string;
      params?: Record<string, unknown>;
    };
    const id = rpc.id ?? 1;
    const method = rpc.method ?? "";

    if (method === "initialize") {
      return jsonResponse({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "sovereign-codex-edge-mcp",
            version: "0.4.0",
          },
          capabilities: {
            tools: {},
          },
        },
      });
    }

    if (method === "tools/list") {
      return jsonResponse({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "codex_get_dashboard",
              description:
                "Fetch independent Sovereign Codex KPIs, 9-node out-of-band status probes, milestones, tasks, progress %, governance docs, releases, and autonomous comments.",
              inputSchema: { type: "object", properties: {} },
            },
            {
              name: "codex_upsert_milestone",
              description: "Create or update a release milestone in the independent Codex database.",
              inputSchema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  version: { type: "string" },
                  title: { type: "string" },
                  targetDate: { type: "string" },
                  status: { type: "string", enum: ["COMPLETED", "ACTIVE", "PLANNED"] },
                  progressPct: { type: "number" },
                  summary: { type: "string" },
                },
                required: ["title", "version"],
              },
            },
            {
              name: "codex_upsert_task",
              description: "Create or update an engineering task and progress percentage (replaces .plan/TASK.md).",
              inputSchema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  milestoneId: { type: "string" },
                  title: { type: "string" },
                  domain: { type: "string", enum: ["NARRATION", "DNA", "UI", "UX", "BACKEND", "EDGE_MCP"] },
                  priority: { type: "string", enum: ["CRITICAL", "HIGH", "NORMAL"] },
                  status: { type: "string", enum: ["todo", "in_progress", "done"] },
                  progressPct: { type: "number" },
                  owner: { type: "string" },
                },
                required: ["title"],
              },
            },
            {
              name: "codex_upsert_doc",
              description: "Create or update a governance specification document (replaces .plan/{RULE,SPEC,DESIGN}.md).",
              inputSchema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  category: { type: "string", enum: ["RULE", "SPEC", "DESIGN", "EDGE", "RFC"] },
                  title: { type: "string" },
                  version: { type: "string" },
                  content: { type: "string" },
                },
                required: ["title", "content"],
              },
            },
            {
              name: "codex_post_comment",
              description:
                "Post a public or agent comment and trigger Autonomous Governor Triage & automatic task creation.",
              inputSchema: {
                type: "object",
                properties: {
                  targetType: { type: "string", enum: ["milestone", "task", "release", "doc"] },
                  targetId: { type: "string" },
                  author: { type: "string" },
                  sentiment: { type: "string", enum: ["IDEA", "ISSUE", "QUESTION", "APPROVE"] },
                  body: { type: "string" },
                },
                required: ["body"],
              },
            },
            {
              name: "codex_upsert_release",
              description:
                "Publish or update an official release record, changelog, and direct download links (GitHub release mirror) in the independent Codex DB.",
              inputSchema: {
                type: "object",
                properties: {
                  tagName: { type: "string" },
                  version: { type: "string" },
                  title: { type: "string" },
                  channel: { type: "string", enum: ["stable", "nightly", "daily"] },
                  changelogMd: { type: "string" },
                  githubReleaseUrl: { type: "string" },
                  artifacts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        directUrl: { type: "string" },
                        targetOs: { type: "string" },
                      },
                      required: ["name", "directUrl"],
                    },
                  },
                },
                required: ["tagName"],
              },
            },
            {
              name: "codex_get_releases",
              description: "Fetch all official releases, changelog history, and direct binary download URLs from the independent Codex DB.",
              inputSchema: { type: "object", properties: {} },
            },
          ],
        },
      });
    }

    if (method === "tools/call") {
      const toolName = String(rpc.params?.name ?? "");
      const args = ((rpc.params?.arguments as Record<string, unknown>) ?? {}) as Record<string, unknown>;

      if (toolName === "codex_get_dashboard") {
        const snapshot = await buildCodexDashboardSnapshot({ d1: env?.CODEX_DB });
        return jsonResponse({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(snapshot, null, 2) }],
          },
        });
      }

      if (toolName === "codex_get_releases") {
        const snapshot = await buildCodexDashboardSnapshot({ d1: env?.CODEX_DB });
        return jsonResponse({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(snapshot.releases, null, 2) }],
          },
        });
      }

      const actionMap: Record<string, string> = {
        codex_upsert_milestone: "upsert_milestone",
        codex_upsert_task: "upsert_task",
        codex_upsert_doc: "upsert_doc",
        codex_post_comment: "post_comment",
        codex_upsert_release: "upsert_release",
      };

      const mappedAction = actionMap[toolName];
      if (!mappedAction) {
        return jsonResponse({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Unknown MCP tool: ${toolName}` },
        });
      }

      const outcome = await mutateCodex(
        { ...args, action: mappedAction },
        { d1: env?.CODEX_DB, legendToken: env?.LEGEND_SERVICE_TOKEN }
      );

      // Trigger Telegram notification for MCP executions
      let mcpMsg = `🤖 *SOVEREIGN MCP EXECUTION*\nTool: \`${toolName}\``;
      if (outcome.release) {
        mcpMsg = `🚀 *SOVEREIGN RELEASE PUBLISHED* (${outcome.release.tagName})\nVersion: *${outcome.release.version}* [${outcome.release.channel.toUpperCase()}]\nTitle: *${outcome.release.title}*\n📥 [GitHub Release](${outcome.release.githubReleaseUrl})\n\n${outcome.release.changelogMd.slice(0, 300)}`;
      } else if (outcome.task) {
        mcpMsg += `\nTask: *${outcome.task.title}*\nStatus: \`${outcome.task.status.toUpperCase()}\` (${outcome.task.progressPct}%)`;
      } else if (outcome.milestone) {
        mcpMsg += `\nMilestone: *${outcome.milestone.title}* (${outcome.milestone.version})\nStatus: \`${outcome.milestone.status}\``;
      }
      await sendTelegramNotification(env, mcpMsg);
      return jsonResponse({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(outcome, null, 2) }],
        },
      });
    }

    return jsonResponse({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Unsupported JSON-RPC method: ${method}` },
    });
  } catch (err) {
    return jsonResponse(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: err instanceof Error ? err.message : "MCP execution failed" },
      },
      400
    );
  }
}

function renderStandaloneEdgeHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" data-dna="codex" data-mode="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SOVEREIGN CODEX // EDGE PULSE (:8787 / Cloudflare D1)</title>
  <style>
    :root {
      --bg: #030804;
      --panel: #061108;
      --panel2: #0b1a0e;
      --line: #14331a;
      --text: #e2fbe8;
      --muted: #6e9a76;
      --accent: #00ff66;
      --gold: #00ff66;
      --green: #10b981;
      --red: #ef4444;
      --cyan: #06b6d4;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #030804;
      color: var(--text);
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
      line-height: 1.5;
      overflow-x: hidden;
    }
    #living-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: 0.7;
    }
    .content-wrap {
      position: relative;
      z-index: 1;
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    header {
      border-bottom: 2px solid var(--accent);
      background: rgba(6, 17, 8, 0.92);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 20;
      padding: 16px 24px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      box-shadow: 0 0 20px rgba(0,255,102,0.12);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 2px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid var(--line);
      background: var(--panel2);
    }
    .badge.gold { border-color: var(--accent); color: var(--accent); background: rgba(0, 255, 102, 0.1); }
    .badge.green { border-color: rgba(16, 185, 129, 0.5); color: var(--green); background: rgba(16, 185, 129, 0.12); }
    .badge.red { border-color: rgba(239, 68, 68, 0.5); color: var(--red); background: rgba(239, 68, 68, 0.12); }
    .container { max-width: 1280px; margin: 0 auto; padding: 24px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .card {
      background: rgba(6, 17, 8, 0.85);
      border: 1px solid var(--line);
      border-radius: 2px;
      padding: 18px;
      backdrop-filter: blur(8px);
      box-shadow: 3px 3px 0 rgba(0,0,0,0.5);
      transition: all 0.2s ease;
    }
    .card:hover {
      border-color: var(--accent);
      box-shadow: 0 0 15px rgba(0,255,102,0.2), 3px 3px 0 rgba(0,0,0,0.5);
    }
    .card.gold { border-color: var(--line); }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    button {
      background: var(--panel2);
      color: var(--text);
      border: 1px solid var(--line);
      border-radius: 2px;
      padding: 8px 16px;
      font-size: 11px;
      font-family: inherit;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      cursor: pointer;
      transition: all 0.15s;
    }
    button:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    button.active, button.primary {
      background: var(--accent);
      color: #030804;
      border-color: var(--accent);
      box-shadow: 0 0 12px rgba(0,255,102,0.3);
    }
    input, select, textarea {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      width: 100%;
    }
    .progress-track {
      width: 100%;
      height: 8px;
      background: var(--bg);
      border-radius: 999px;
      overflow: hidden;
      border: 1px solid var(--line);
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--gold), var(--green));
      transition: width 0.25s ease;
    }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 14px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
  </style>
</head>
<body>
  <canvas id="living-canvas"></canvas>
  <div class="content-wrap">
  <header>
    <div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span class="badge gold">★ SOVEREIGN CODEX // EDGE PULSE</span>
        <span class="badge green">100% INDEPENDENT SERVERLESS (D1 / :8787)</span>
        <span class="badge mono" id="ver-badge">v0.4.0</span>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px;">
        Stays 100% ONLINE even if all 9 origin monorepo servers (:3000-:3004, :3200, :4000, :8091, :8092) are OFF.
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <a href="http://127.0.0.1:3000/wiki" style="color:var(--accent);font-size:12px;text-decoration:none;border:1px solid var(--line);padding:6px 12px;border-radius:2px;background:var(--panel2);">↗ DX WIKI (:3000/wiki)</a>
      <button onclick="loadDashboard()">↻ REFRESH</button>
    </div>
  </header>

  <div class="container">
    <div class="kpi-grid" id="kpi-strip"></div>

    <div class="tabs">
      <button class="active" id="tab-btn-status" onclick="setTab('status')">1. LIVE 9-NODE STATUS PROBE</button>
      <button id="tab-btn-milestones" onclick="setTab('milestones')">2. MILESTONES & ROADMAP</button>
      <button id="tab-btn-tasks" onclick="setTab('tasks')">3. TASKS & PROGRESS %</button>
      <button id="tab-btn-comments" onclick="setTab('comments')">4. PUBLIC & AUTONOMOUS COMMENTS</button>
      <button id="tab-btn-docs" onclick="setTab('docs')">5. DB CODEX & MCP TOOLS</button>
      <button id="tab-btn-releases" onclick="setTab('releases')">6. RELEASES & CHANGELOG</button>
    </div>

    <div id="view-container"></div>
  </div>
  </div>

  <script>
    // Procedural Living Canvas for Codex Edge
    const canvas = document.getElementById('living-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;
      window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      });
      let t = 0;
      function loop() {
        t += 0.02;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0, 255, 102, 0.035)';
        ctx.font = '10px monospace';
        for (let col = 0; col < w; col += 60) {
          const rowY = (t * 70 + col * 14) % h;
          ctx.fillText('0x' + Math.floor(Math.sin(t + col) * 99 + 100).toString(16), col, rowY);
        }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    }
    let currentTab = 'status';
    let dashboard = null;

    function setTab(tab) {
      currentTab = tab;
      ['status','milestones','tasks','comments','docs','releases'].forEach(t => {
        const el = document.getElementById('tab-btn-' + t);
        if (el) el.className = t === tab ? 'active' : '';
      });
      renderView();
    }

    async function loadDashboard() {
      const res = await fetch('/api/codex');
      dashboard = await res.json();
      document.getElementById('ver-badge').textContent = 'v' + dashboard.version;
      renderKpis();
      renderView();
    }

    function renderKpis() {
      if (!dashboard) return;
      const k = dashboard.kpis;
      const e = dashboard.edgeService;
      document.getElementById('kpi-strip').innerHTML = [
        { label: 'OVERALL COMPLETION', val: k.overallCompletionPct + '%', sub: k.avgTaskProgressPct + '% avg task progress' },
        { label: 'ORIGIN MESH NODES', val: e.originNodesOnline + ' / ' + e.originNodesTotal, sub: 'Codex Edge stays UP if 0/9' },
        { label: 'MILESTONES', val: k.completedMilestones + ' / ' + k.totalMilestones, sub: 'Persisted in Codex DB' },
        { label: 'ACTIVE TASKS', val: k.tasksDone + ' DONE / ' + k.totalTasks, sub: k.tasksInProgress + ' in progress' },
        { label: 'AUTO-TRIAGE COMMENTS', val: k.totalComments + ' (' + k.autonomousResolutionRatePct + '%)', sub: 'Autonomous Governor active' },
        { label: 'QUALITY & MCP', val: k.testAssertions + ' ASSERTS', sub: '5 MCP tools · 0 Slop' }
      ].map(item => \`
        <div class="card gold">
          <div style="font-size:11px;color:var(--muted);font-weight:700;">\${item.label}</div>
          <div class="mono" style="font-size:22px;font-weight:800;color:var(--gold);margin:4px 0;">\${item.val}</div>
          <div style="font-size:11px;color:var(--muted);">\${item.sub}</div>
        </div>
      \`).join('');
    }

    async function postAction(payload) {
      await fetch('/api/codex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadDashboard();
    }

    function renderView() {
      if (!dashboard) return;
      const box = document.getElementById('view-container');
      if (currentTab === 'status') {
        box.innerHTML = \`
          <div class="card" style="margin-bottom:16px;">
            <div style="font-weight:700;margin-bottom:6px;">OUT-OF-BAND 9-NODE STATUS MONITOR (DECOUPLED FROM MONOREPO)</div>
            <div style="font-size:13px;color:var(--muted);">
              This Edge Portal runs independently on <b>:8787 / Cloudflare Workers + D1</b>. Even if you stop all project servers, this dashboard and <code>POST /mcp</code> stay online.
            </div>
          </div>
          <div class="grid-3">
            \${dashboard.nodeProbes.map(n => \`
              <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <span class="badge \${n.status === 'ONLINE' ? 'green' : 'red'}">\${n.status}</span>
                  <span class="mono" style="font-size:12px;color:var(--muted);">:\${n.port} · \${n.latencyMs}ms</span>
                </div>
                <div style="font-weight:700;font-size:14px;">\${n.name}</div>
                <div class="mono" style="font-size:11px;color:var(--muted);margin-top:4px;">\${n.url}</div>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (currentTab === 'milestones') {
        box.innerHTML = \`
          <div class="grid-2">
            \${dashboard.milestones.map(m => \`
              <div class="card \${m.status === 'COMPLETED' ? 'gold' : ''}">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span class="badge gold mono">\${m.version}</span>
                  <span class="badge \${m.status === 'COMPLETED' ? 'green' : 'gold'}">\${m.status} · \${m.progressPct}%</span>
                </div>
                <div style="font-weight:700;font-size:16px;margin-bottom:6px;">\${m.title}</div>
                <div style="font-size:13px;color:var(--muted);margin-bottom:12px;">\${m.summary}</div>
                <div class="progress-track" style="margin-bottom:10px;"><div class="progress-fill" style="width:\${m.progressPct}%"></div></div>
                <div style="display:flex;gap:6px;">
                  <button onclick='postAction({action:"upsert_milestone",id:"\${m.id}",version:"\${m.version}",title:\${JSON.stringify(m.title)},summary:\${JSON.stringify(m.summary)},progressPct:Math.min(100,\${m.progressPct}+10)})'>+10% PROGRESS</button>
                  <button class="primary" onclick='postAction({action:"upsert_milestone",id:"\${m.id}",version:"\${m.version}",title:\${JSON.stringify(m.title)},summary:\${JSON.stringify(m.summary)},status:"COMPLETED",progressPct:100})'>✓ COMPLETE</button>
                </div>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (currentTab === 'tasks') {
        box.innerHTML = \`
          <div class="card" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;">
            <input id="new-task-title" placeholder="New engineering task title (persisted in independent Codex DB)..." style="flex:1;min-width:240px;" />
            <select id="new-task-domain" style="width:150px;">
              <option value="EDGE_MCP">EDGE_MCP</option>
              <option value="BACKEND">BACKEND</option>
              <option value="UI">UI</option>
              <option value="UX">UX</option>
              <option value="DNA">DNA</option>
            </select>
            <button class="primary" onclick="postAction({action:'upsert_task',title:document.getElementById('new-task-title').value,domain:document.getElementById('new-task-domain').value,status:'in_progress',progressPct:25})">+ ADD TASK</button>
          </div>
          <div class="grid-2">
            \${dashboard.tasks.map(t => \`
              <div class="card">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span class="badge gold">\${t.domain}</span>
                  <span class="badge \${t.status === 'done' ? 'green' : 'gold'}">\${t.status.toUpperCase()} · \${t.progressPct}%</span>
                </div>
                <div style="font-weight:700;margin-bottom:8px;">\${t.title}</div>
                <div class="progress-track" style="margin-bottom:10px;"><div class="progress-fill" style="width:\${t.progressPct}%"></div></div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <button onclick='postAction({action:"upsert_task",id:"\${t.id}",title:\${JSON.stringify(t.title)},domain:"\${t.domain}",status:"todo",progressPct:0})'>[ ] 0%</button>
                  <button onclick='postAction({action:"upsert_task",id:"\${t.id}",title:\${JSON.stringify(t.title)},domain:"\${t.domain}",status:"in_progress",progressPct:50})'>[~] 50%</button>
                  <button class="primary" onclick='postAction({action:"upsert_task",id:"\${t.id}",title:\${JSON.stringify(t.title)},domain:"\${t.domain}",status:"done",progressPct:100})'>[x] 100% DONE</button>
                </div>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (currentTab === 'comments') {
        box.innerHTML = \`
          <div class="card gold" style="margin-bottom:16px;">
            <div style="font-weight:700;margin-bottom:8px;">PUBLIC & AUTONOMOUS GOVERNOR COMMENT STREAM</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;">
              <input id="c-author" placeholder="Your handle / email (e.g. dev@edge.net)" />
              <select id="c-sentiment">
                <option value="IDEA">IDEA (Auto-Spawns Task)</option>
                <option value="ISSUE">ISSUE (Auto-Spawns Task)</option>
                <option value="QUESTION">QUESTION (Instant AI Triage)</option>
                <option value="APPROVE">APPROVE</option>
              </select>
              <input id="c-target" value="m5-v050" placeholder="Target ID (e.g. m5-v050)" />
            </div>
            <div style="display:flex;gap:8px;">
              <input id="c-body" placeholder="Write public comment or feature request — Autonomous Governor replies & triages immediately..." />
              <button class="primary" style="white-space:nowrap;" onclick="postAction({action:'post_comment',author:document.getElementById('c-author').value,sentiment:document.getElementById('c-sentiment').value,targetId:document.getElementById('c-target').value,body:document.getElementById('c-body').value})">⚡ POST & AUTO-TRIAGE</button>
            </div>
          </div>
          <div class="grid-2">
            \${dashboard.comments.map(c => \`
              <div class="card">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span class="badge gold">\${c.sentiment} · \${c.targetId}</span>
                  <span class="badge green">\${c.triageStatus}</span>
                </div>
                <div style="font-size:12px;color:var(--muted);margin-bottom:4px;">From <b>\${c.author}</b> (\${c.role})</div>
                <div style="font-size:14px;margin-bottom:10px;">\${c.body}</div>
                <div style="background:rgba(16,185,129,0.08);border-left:3px solid var(--green);padding:10px;border-radius:4px;font-size:12px;" class="mono">
                  \${c.autonomousReply}
                </div>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (currentTab === 'docs') {
        box.innerHTML = \`
          <div class="grid-2">
            \${dashboard.docs.map(d => \`
              <div class="card">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span class="badge gold">\${d.category}</span>
                  <span class="mono" style="font-size:11px;color:var(--muted);">\${d.id} · \${d.version}</span>
                </div>
                <div style="font-weight:700;margin-bottom:6px;">\${d.title}</div>
                <pre class="mono" style="white-space:pre-wrap;font-size:12px;color:var(--muted);background:var(--bg);padding:10px;border-radius:6px;">\${d.content}</pre>
              </div>
            \`).join('')}
          </div>
        \`;
      } else if (currentTab === 'releases') {
        const releasesList = dashboard.releases || [];
        box.innerHTML = `
          <div class="grid-2">
            \${releasesList.map(r => \`
              <div class="card gold">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;align-items:center;">
                  <span class="badge gold mono">\${r.tagName || r.version}</span>
                  <span class="badge \${r.channel === 'stable' ? 'green' : 'cyan'}">\${(r.channel || 'STABLE').toUpperCase()}</span>
                </div>
                <div style="font-weight:700;font-size:15px;margin-bottom:6px;">\${r.title || r.headline || 'Official Sovereign Monorepo Release'}</div>
                <div style="font-size:12px;color:var(--muted);margin-bottom:10px;" class="mono">Published: \${(r.publishedAt || r.date || '').slice(0, 10)}</div>
                <div style="background:var(--bg);padding:10px;border-radius:6px;margin-bottom:12px;font-size:12px;white-space:pre-wrap;color:var(--muted);font-family:inherit;">
                  \${r.changelogMd || (r.highlights ? r.highlights.join('\\n') : '')}
                </div>
                \${r.artifacts && r.artifacts.length > 0 ? \`
                  <div style="font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;">DIRECT DOWNLOADS (GITHUB MIRROR):</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
                    \${r.artifacts.map(a => \`
                      <a href="\${a.directUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;background:rgba(217,119,6,0.15);border:1px solid var(--gold);color:var(--gold);padding:6px 10px;border-radius:4px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">
                        ⬇ \${a.name} [\${(a.targetOs || 'any').toUpperCase()}]
                      </a>
                    \`).join('')}
                  </div>
                \` : ''}
                \${r.githubReleaseUrl ? \`
                  <a href="\${r.githubReleaseUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:var(--cyan);text-decoration:none;display:inline-block;">
                    ↗ View Full Release on GitHub
                  </a>
                \` : ''}
              </div>
            \`).join('')}
          </div>
        \`;
      }
    }

    loadDashboard();
  </script>
</body>
</html>`;
}

export async function handleCodexEdgeRequest(request: Request, env?: Env): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);

  if (url.pathname === "/health") {
    return jsonResponse({
      status: "ok",
      service: "sovereign-codex-edge",
      name: "SOVEREIGN CODEX // EDGE PULSE",
      independentOfMainProject: true,
      staysOnlineWhenOriginDown: true,
      version: env?.SOVEREIGN_VERSION ?? "0.4.0",
      timestamp: new Date().toISOString(),
    });
  }

  if (url.pathname === "/mcp" && request.method === "POST") {
    return handleMcpJsonRpc(request, env);
  }

  if (url.pathname === "/api/codex") {
    if (request.method === "GET") {
      const snapshot = await buildCodexDashboardSnapshot({ d1: env?.CODEX_DB });
      return jsonResponse(snapshot);
    }
    if (request.method === "POST" || request.method === "PUT") {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        const result = await mutateCodex(body, {
          d1: env?.CODEX_DB,
          legendToken: env?.LEGEND_SERVICE_TOKEN,
        });

        // Trigger Telegram Dispatcher on Codex mutation
        const action = typeof body.action === "string" ? body.action : "upsert_task";
        let notifMsg = `⚡ *SOVEREIGN CODEX // UPDATE*\nAction: \`${action}\``;
        if (result.task) {
          notifMsg += `\nTask: *${result.task.title}*\nDomain: \`${result.task.domain}\` | Status: \`${result.task.status.toUpperCase()}\` (${result.task.progressPct}%)`;
        } else if (result.milestone) {
          notifMsg += `\nMilestone: *${result.milestone.title}* (${result.milestone.version})\nStatus: \`${result.milestone.status}\` (${result.milestone.progressPct}%)`;
        } else if (result.comment) {
          notifMsg += `\nNew Comment by *${result.comment.author}* [${result.comment.sentiment}]:\n"${result.comment.body}"\nAuto-Triage: \`${result.comment.triageStatus}\``;
        }
        await sendTelegramNotification(env, notifMsg);

        return jsonResponse(result, 201);
      } catch (err) {
        return jsonResponse(
          { error: err instanceof Error ? err.message : "Failed to mutate Codex state" },
          400
        );
      }
    }
  }

  return new Response(renderStandaloneEdgeHtml(), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...CORS_HEADERS,
    },
  });
}

const standalonePort =
  typeof process !== "undefined" && process.env?.CODEX_PORT
    ? Number(process.env.CODEX_PORT)
    : 8787;

export default {
  port: standalonePort,
  hostname: "0.0.0.0",
  async fetch(request: Request, env?: Env): Promise<Response> {
    return handleCodexEdgeRequest(request, {
      ...env,
      LEGEND_SERVICE_TOKEN:
        env?.LEGEND_SERVICE_TOKEN ??
        (typeof process !== "undefined" ? process.env?.LEGEND_SERVICE_TOKEN : undefined),
      SOVEREIGN_VERSION: env?.SOVEREIGN_VERSION ?? "0.4.0",
    });
  },
};

