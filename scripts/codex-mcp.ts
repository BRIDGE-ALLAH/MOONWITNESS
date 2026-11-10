#!/usr/bin/env bun
/**
 * SOVEREIGN CODEX — UNIVERSAL MODEL CONTEXT PROTOCOL (MCP) SERVER & CLI
 * Primary Global Edge Endpoint: https://codex.a-l-l-a-h.com/mcp (Cloudflare Workers + D1)
 * Secondary Mirror Endpoint   : https://codex.e-isp.id/mcp
 * Offline Fallback            : data/codex-independent-db.json
 *
 * Ensures every AI coding agent (Antigravity, Claude Code, Cursor, Windsurf, Copilot, OpenCode)
 * reads and writes live to Cloudflare D1 on codex.a-l-l-a-h.com while maintaining a local mirror.
 */

import { buildCodexDashboardSnapshot, mutateCodex } from "../services/codex-edge/src/store";

const REMOTE_EDGE_MCP_URL =
  process.env.CODEX_EDGE_MCP_URL || "https://codex.a-l-l-a-h.com/mcp";

const MCP_TOOLS = [
  {
    name: "codex_get_dashboard",
    description:
      "Fetch live Sovereign Codex KPIs, 9-node status probes, milestones, tasks, progress %, governance docs, releases, and autonomous comments from https://codex.a-l-l-a-h.com (Cloudflare D1).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "codex_upsert_milestone",
    description:
      "Create or update a release milestone on https://codex.a-l-l-a-h.com (Cloudflare D1) and local mirror.",
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
    description:
      "Create or update an engineering task and progress % (0-100) on https://codex.a-l-l-a-h.com (replaces local .plan/TASK.md).",
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
    description:
      "Create or update a governance specification document (RULE, SPEC, DESIGN, EDGE, RFC) on https://codex.a-l-l-a-h.com.",
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
      "Post a comment or autonomous agent report to https://codex.a-l-l-a-h.com and trigger Autonomous Governor Triage.",
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
      "Publish or update an official release record, changelog, and direct binary download URLs (GitHub release mirror) in the independent Codex DB.",
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
];

async function callRemoteCloudflareMcp(toolName: string, args: Record<string, unknown>): Promise<unknown | null> {
  try {
    const response = await fetch(REMOTE_EDGE_MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: toolName,
          arguments: args,
        },
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      result?: { content?: Array<{ text?: string }> };
    };
    const text = body.result?.content?.[0]?.text;
    return text ? (JSON.parse(text) as unknown) : null;
  } catch {
    return null;
  }
}

async function executeTool(toolName: string, args: Record<string, unknown>) {
  if (toolName === "codex_get_dashboard") {
    const [remoteSnap, localSnap] = await Promise.all([
      callRemoteCloudflareMcp("codex_get_dashboard", {}),
      buildCodexDashboardSnapshot({ probeNodes: true }),
    ]);
    if (remoteSnap && typeof remoteSnap === "object") {
      return {
        ...(remoteSnap as Record<string, unknown>),
        publicDomains: ["https://codex.a-l-l-a-h.com", "https://codex.e-isp.id"],
        nodeProbes: localSnap.nodeProbes,
      };
    }
    return localSnap;
  }

  if (toolName === "codex_get_releases") {
    const [remoteSnap, localSnap] = await Promise.all([
      callRemoteCloudflareMcp("codex_get_releases", {}),
      buildCodexDashboardSnapshot({ probeNodes: false }),
    ]);
    return remoteSnap || localSnap.releases;
  }

  const actionMap: Record<string, string> = {
    codex_upsert_milestone: "upsert_milestone",
    codex_upsert_task: "upsert_task",
    codex_upsert_doc: "upsert_doc",
    codex_post_comment: "post_comment",
    codex_upsert_release: "upsert_release",
  };
  const mapped = actionMap[toolName];
  if (!mapped) {
    throw new Error(`Unknown MCP tool: ${toolName}`);
  }

  // Write to both Cloudflare D1 Edge (https://codex.a-l-l-a-h.com/mcp) and local mirror
  const [remoteOut, localOut] = await Promise.all([
    callRemoteCloudflareMcp(toolName, args),
    mutateCodex({ ...args, action: mapped }, { legendToken: process.env.LEGEND_SERVICE_TOKEN }),
  ]);

  return {
    ...(localOut as Record<string, unknown>),
    cloudflareEdgeSynced: remoteOut !== null,
    edgeDomains: ["https://codex.a-l-l-a-h.com", "https://codex.e-isp.id"],
  };
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--dashboard")) {
    const snap = await executeTool("codex_get_dashboard", {});
    console.log(JSON.stringify(snap, null, 2));
    return;
  }

  const toolIdx = argv.indexOf("--tool");
  if (toolIdx >= 0 && argv[toolIdx + 1]) {
    const toolName = argv[toolIdx + 1];
    const argsIdx = argv.indexOf("--args");
    let parsedArgs: Record<string, unknown> = {};
    if (argsIdx >= 0 && argv[argsIdx + 1]) {
      try {
        parsedArgs = JSON.parse(argv[argsIdx + 1]) as Record<string, unknown>;
      } catch {
        parsedArgs = {};
      }
    }
    const flagKeys = [
      "id",
      "title",
      "version",
      "status",
      "domain",
      "priority",
      "milestoneId",
      "owner",
      "summary",
      "targetDate",
      "category",
      "content",
      "author",
      "sentiment",
      "targetType",
      "targetId",
      "body",
      "tagName",
      "channel",
      "changelogMd",
      "githubReleaseUrl",
    ];
    for (const key of flagKeys) {
      const idx = argv.indexOf(`--${key}`);
      if (idx >= 0 && argv[idx + 1]) {
        parsedArgs[key] = argv[idx + 1];
      }
    }
    const pctIdx = argv.indexOf("--progressPct");
    if (pctIdx >= 0 && argv[pctIdx + 1]) {
      parsedArgs.progressPct = Number(argv[pctIdx + 1]);
    }
    const out = await executeTool(toolName, parsedArgs);
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  // Stdio JSON-RPC 2.0 Loop
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of Bun.stdin.stream()) {
    buffer += decoder.decode(chunk, { stream: true });
    let newlineIdx = buffer.indexOf("\n");
    while (newlineIdx >= 0) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      newlineIdx = buffer.indexOf("\n");
      if (!line) continue;

      try {
        const rpc = JSON.parse(line) as {
          jsonrpc?: string;
          id?: string | number | null;
          method?: string;
          params?: Record<string, unknown>;
        };
        const id = rpc.id ?? 1;
        const method = rpc.method ?? "";

        if (method === "initialize") {
          process.stdout.write(
            `${JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {
                protocolVersion: "2024-11-05",
                serverInfo: { name: "sovereign-codex-mcp", version: "0.4.0" },
                capabilities: { tools: {} },
              },
            })}\n`
          );
        } else if (method === "tools/list") {
          process.stdout.write(
            `${JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: { tools: MCP_TOOLS },
            })}\n`
          );
        } else if (method === "tools/call") {
          const toolName = String(rpc.params?.name ?? "");
          const args = ((rpc.params?.arguments as Record<string, unknown>) ?? {}) as Record<string, unknown>;
          const result = await executeTool(toolName, args);
          process.stdout.write(
            `${JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] },
            })}\n`
          );
        } else if (rpc.id !== undefined) {
          process.stdout.write(
            `${JSON.stringify({
              jsonrpc: "2.0",
              id,
              result: {},
            })}\n`
          );
        }
      } catch (err) {
        process.stdout.write(
          `${JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: { code: -32000, message: err instanceof Error ? err.message : "Invalid JSON-RPC request" },
          })}\n`
        );
      }
    }
  }
}

void main();
