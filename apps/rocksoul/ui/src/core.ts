import { invoke } from "@tauri-apps/api/core"

export interface Step {
  run_id: string
  index: number
  kind: "tool" | "final" | "error"
  thought: string
  tool: string | null
  input: string | null
  output: unknown
}

export interface RunRecord {
  id: string
  goal: string
  answer: string
  steps: number
  ok: boolean
  model: string
  started_at: string
  finished_at: string
}

export interface NodePulse {
  id: string
  url: string
  online: boolean
  latency_ms: number
  status: number
}

export interface Vitals {
  cpu_pct: number
  cpu_cores: number
  mem_used_mb: number
  mem_total_mb: number
  processes: number
  host: string | null
  os: string | null
  uptime_s: number
}

export interface LlmConfig {
  base_url: string
  model: string
  api_key: string
  max_steps: number
}

export const core = {
  agentRun: (goal: string) => invoke<RunRecord>("agent_run", { goal }),
  meshPulse: () => invoke<NodePulse[]>("mesh_pulse"),
  vitals: () => invoke<Vitals>("system_vitals"),
  history: () => invoke<RunRecord[]>("run_history"),
  configGet: () => invoke<LlmConfig>("config_get"),
  configSet: (config: LlmConfig) => invoke<LlmConfig>("config_set", { config }),
}

