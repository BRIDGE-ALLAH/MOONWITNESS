#!/usr/bin/env bun
/**
 * SOVEREIGN CODEX — STANDALONE MODEL CONTEXT PROTOCOL (MCP) SERVER & CLI
 * Replaces local .plan/ markdown files with 100% database-driven MCP tools.
 * Works completely independently even when all 9 origin monorepo nodes are OFF.
 *
 * Modes:
 *  1. Stdio MCP Server (default): Reads JSON-RPC 2.0 lines from stdin, writes to stdout.
 *  2. CLI Execution:
 *     bun run scripts/codex-mcp.ts --dashboard
 *     bun run scripts/codex-mcp.ts --tool codex_upsert_task --args '{"title":"Ship Edge D1","status":"done"}'
 */

import { buildCodexDashboardSnapshot, mutateCodex } from "../services/codex-edge/src/store";

const MCP_TOOLS = [
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
    description: "Post a public or agent comment and trigger Autonomous Governor Triage & automatic task creation.",
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
];

async function executeTool(toolName: string, args: Record<string, unknown>) {
  if (toolName === "codex_get_dashboard") {
    return buildCodexDashboardSnapshot({ probeNodes: true });
  }
  const actionMap: Record<string, string> = {
    codex_upsert_milestone: "upsert_milestone",
    codex_upsert_task: "upsert_task",
    codex_upsert_doc: "upsert_doc",
    codex_post_comment: "post_comment",
  };
  const mapped = actionMap[toolName];
  if (!mapped) {
    throw new Error(`Unknown MCP tool: ${toolName}`);
  }
  return mutateCodex({ ...args, action: mapped }, { legendToken: process.env.LEGEND_SERVICE_TOKEN });
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes("--dashboard")) {
    const snap = await buildCodexDashboardSnapshot({ probeNodes: true });
    console.log(JSON.stringify(snap, null, 2));
    return;
  }

  const toolIdx = argv.indexOf("--tool");
  if (toolIdx >= 0 && argv[toolIdx + 1]) {
    const toolName = argv[toolIdx + 1];
    const argsIdx = argv.indexOf("--args");
    const parsedArgs =
      argsIdx >= 0 && argv[argsIdx + 1] ? (JSON.parse(argv[argsIdx + 1]) as Record<string, unknown>) : {};
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

