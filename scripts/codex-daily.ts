#!/usr/bin/env bun
/**
 * SOVEREIGN CODEX // DAILY STANDUP & DIGEST PULSE ENGINE
 * Automatically computes daily delta:
 * - Commits today
 * - Task completion status & progress %
 * - Milestone status & active blockers
 * - Full-stack health probes
 * - Broadcasts formatted markdown standup to Telegram Moonwitness
 * - Persists standup digest to Sovereign Codex Cloudflare D1
 *
 * Usage:
 *   bun scripts/codex-daily.ts [--post-comment] [--silent]
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCodexDashboardSnapshot, mutateCodex } from "../services/codex-edge/src/store";

function loadEnvTokens(): { botToken?: string; chatId?: string } {
  let botToken = process.env.TELEGRAM_BOT_TOKEN;
  let chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    try {
      const envPath = resolve(process.cwd(), ".env");
      if (existsSync(envPath)) {
        const lines = readFileSync(envPath, "utf8").split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("TELEGRAM_BOT_TOKEN=")) {
            botToken = trimmed.replace("TELEGRAM_BOT_TOKEN=", "").trim();
          }
          if (trimmed.startsWith("TELEGRAM_GROUP_ID=") || trimmed.startsWith("TELEGRAM_CHAT_ID=")) {
            chatId = trimmed.replace(/^TELEGRAM_(GROUP|CHAT)_ID=/, "").trim();
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  return { botToken, chatId };
}

function getGitCommitsToday(): string[] {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const out = execSync(`git log --since="${today} 00:00:00" --pretty=format:"• %s (%h)"`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? out.split("\n").filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function sendTelegramDigest(message: string): Promise<boolean> {
  const { botToken, chatId } = loadEnvTokens();
  if (!botToken || !chatId) {
    console.log("ℹ️ Skipping Telegram: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in env");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!data.ok) {
      console.error("⚠️ Telegram API Error:", data.description);
    }
    return Boolean(data.ok);
  } catch (e) {
    console.error("⚠️ Failed to send Telegram digest:", (e as Error).message);
    return false;
  }
}

async function main() {
  const isPostComment = process.argv.includes("--post-comment");
  console.log("⚡ Compiling Sovereign Daily Standup & Edge Digest...");

  const snapshot = await buildCodexDashboardSnapshot({ probeNodes: true });
  const commitsToday = getGitCommitsToday();
  const dateStr = new Date().toISOString().slice(0, 10);

  const doneTasks = snapshot.tasks.filter((t) => t.status === "done");
  const inProgressTasks = snapshot.tasks.filter((t) => t.status === "in_progress");
  const todoTasks = snapshot.tasks.filter((t) => t.status === "todo");

  const onlineNodes = snapshot.nodeProbes.filter((n) => n.status === "ONLINE").length;
  const totalNodes = snapshot.nodeProbes.length;

  let digest = `🌅 *SOVEREIGN MONOREPO // DAILY BRIEFING*\n📅 Date: \`${dateStr}\` | Node Health: \`${onlineNodes}/${totalNodes} ONLINE\`\n`;
  digest += `📊 Overall Completion: *${snapshot.kpis.overallCompletionPct}%* | Version: *v${snapshot.version}*\n`;
  digest += `🎯 Tasks: *${doneTasks.length} Done* · *${inProgressTasks.length} Active* · *${todoTasks.length} Todo*\n\n`;

  digest += `*🏆 Active Milestones:*\n`;
  for (const m of snapshot.milestones.slice(0, 3)) {
    const icon = m.status === "COMPLETED" ? "✅" : m.status === "ACTIVE" ? "⚡" : "⏳";
    digest += `${icon} *${m.title}* (${m.version}) — \`${m.progressPct}%\`\n`;
  }

  digest += `\n*🔨 Today's Commits (${commitsToday.length}):*\n`;
  if (commitsToday.length > 0) {
    digest += commitsToday.slice(0, 6).join("\n") + (commitsToday.length > 6 ? `\n• ...and ${commitsToday.length - 6} more` : "") + "\n";
  } else {
    digest += `• No code commits recorded today yet.\n`;
  }

  digest += `\n🌐 *Live Governance & Downloads:*\n`;
  digest += `• Codex Edge: https://codex.a-l-l-a-h.com\n`;
  digest += `• Mirror: https://codex.e-isp.id\n`;
  digest += `• MCP JSON-RPC: \`https://codex.a-l-l-a-h.com/mcp\``;

  console.log("\n" + digest + "\n");

  const sent = await sendTelegramDigest(digest);
  if (sent) {
    console.log("✅ Daily Digest successfully broadcasted to Telegram Moonwitness!");
  }

  if (isPostComment) {
    await mutateCodex({
      action: "post_comment",
      author: "autonomous-autopilot",
      role: "AUTONOMOUS_GOVERNOR",
      sentiment: "APPROVE",
      targetType: "milestone",
      targetId: snapshot.milestones[0]?.id || "m5-v050",
      body: `[DAILY STANDUP DIGEST ${dateStr}] Recorded ${commitsToday.length} commits. Completion rate: ${snapshot.kpis.overallCompletionPct}%. Nodes: ${onlineNodes}/${totalNodes} online.`,
    });
    console.log("✅ Daily Digest recorded to independent Codex comments.");
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
