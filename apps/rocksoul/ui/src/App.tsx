import { listen } from "@tauri-apps/api/event"
import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react"
import { core, LlmConfig, NodePulse, RunRecord, Step, Vitals } from "./core"

type RunState = { label: string; tone: "idle" | "live" | "ok" | "fail" }

function useInterval(fn: () => void, ms: number) {
  const saved = useRef(fn)
  saved.current = fn
  useEffect(() => {
    saved.current()
    const timer = setInterval(() => saved.current(), ms)
    return () => clearInterval(timer)
  }, [ms])
}

function Console({ onFinished }: { onFinished: () => void }) {
  const [goal, setGoal] = useState("")
  const [trace, setTrace] = useState<Step[]>([])
  const [answer, setAnswer] = useState<string | null>(null)
  const [state, setState] = useState<RunState>({ label: "IDLE", tone: "idle" })
  const tail = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const off = listen<Step>("agent-step", (e) => setTrace((prev) => [...prev, e.payload]))
    return () => {
      off.then((unlisten) => unlisten())
    }
  }, [])

  useEffect(() => tail.current?.scrollIntoView({ block: "nearest" }), [trace])

  async function ignite(e?: FormEvent) {
    e?.preventDefault()
    const trimmed = goal.trim()
    if (!trimmed || state.tone === "live") return
    setTrace([])
    setAnswer(null)
    setState({ label: "RIOTING", tone: "live" })
    try {
      const record = await core.agentRun(trimmed)
      setAnswer(record.answer)
      setState(record.ok ? { label: `DONE · ${record.steps} STEPS`, tone: "ok" } : { label: "FAILED", tone: "fail" })
    } catch (err) {
      setAnswer(String(err))
      setState({ label: "BLOCKED", tone: "fail" })
    } finally {
      onFinished()
    }
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) ignite()
  }

  return (
    <section className="panel console">
      <h2><span>01</span> RIOT CONSOLE</h2>
      <form onSubmit={ignite}>
        <textarea
          rows={3}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={onKey}
          placeholder="drop a goal. e.g. audit the mesh and tell me which node is slowest"
        />
        <div className="row">
          <button type="submit" disabled={state.tone === "live"}>IGNITE ⚡</button>
          <span className={`state ${state.tone}`}>{state.label}</span>
        </div>
      </form>
      <ol className="trace">
        {trace.map((step, i) => (
          <li key={`${step.run_id}-${i}`} className={step.kind} ref={i === trace.length - 1 ? tail : undefined}>
            <div className="tag">
              #{step.index + 1} ▸ {step.kind === "tool" ? `${step.tool}(${step.input ?? ""})` : step.kind.toUpperCase()}
            </div>
            {step.thought && <div className="thought">{step.thought}</div>}
            <pre>{typeof step.output === "string" ? step.output : JSON.stringify(step.output, null, 2)}</pre>
          </li>
        ))}
      </ol>
      {answer !== null && <div className="answer">{answer}</div>}
    </section>
  )
}

function MeshPulse() {
  const [nodes, setNodes] = useState<NodePulse[]>([])
  const [stamp, setStamp] = useState("")
  const refresh = useCallback(() => {
    core.meshPulse().then((n) => {
      setNodes(n)
      setStamp(new Date().toLocaleTimeString())
    })
  }, [])
  useInterval(refresh, 15000)
  const online = nodes.filter((n) => n.online).length

  return (
    <section className="panel mesh">
      <h2><span>02</span> MESH PULSE <button className="mini" onClick={refresh}>↻</button></h2>
      <ul className="nodes">
        {nodes.map((n) => (
          <li key={n.id}>
            <span className={n.online ? "dot on" : "dot"} />
            <span>{n.id}</span>
            <span>{n.online ? `${n.latency_ms}ms` : "DOWN"}</span>
          </li>
        ))}
      </ul>
      <p className="sum">{nodes.length ? `${online}/${nodes.length} ONLINE · ${stamp}` : "probing…"}</p>
    </section>
  )
}

function BodyVitals() {
  const [v, setV] = useState<Vitals | null>(null)
  useInterval(() => {
    core.vitals().then(setV)
  }, 10000)
  const rows: [string, string][] = v
    ? [
        ["HOST", v.host ?? "—"],
        ["OS", v.os ?? "—"],
        ["CPU", `${v.cpu_pct}% / ${v.cpu_cores} cores`],
        ["MEM", `${v.mem_used_mb} / ${v.mem_total_mb} MB`],
        ["PROCS", String(v.processes)],
        ["UPTIME", `${Math.floor(v.uptime_s / 3600)}h ${Math.floor((v.uptime_s % 3600) / 60)}m`],
      ]
    : []

  return (
    <section className="panel vitals">
      <h2><span>03</span> BODY VITALS</h2>
      <dl className="vitals-list">
        {rows.map(([k, val]) => [<dt key={`${k}-k`}>{k}</dt>, <dd key={`${k}-v`}>{val}</dd>])}
      </dl>
    </section>
  )
}

function BrainWiring() {
  const [cfg, setCfg] = useState<LlmConfig | null>(null)
  const [note, setNote] = useState("")
  useEffect(() => {
    core.configGet().then(setCfg)
  }, [])

  async function lock(e: FormEvent) {
    e.preventDefault()
    if (!cfg) return
    try {
      setCfg(await core.configSet(cfg))
      setNote("LOCKED ✔")
    } catch (err) {
      setNote(`REJECTED: ${err}`)
    }
  }

  const patch = (key: keyof LlmConfig) => (e: React.ChangeEvent<HTMLInputElement>) =>
    cfg && setCfg({ ...cfg, [key]: key === "max_steps" ? Number(e.target.value) : e.target.value })

  return (
    <section className="panel brain">
      <h2><span>04</span> BRAIN WIRING</h2>
      {cfg && (
        <form className="cfg" onSubmit={lock}>
          <label>ENDPOINT <input required value={cfg.base_url} onChange={patch("base_url")} /></label>
          <label>MODEL <input required value={cfg.model} onChange={patch("model")} /></label>
          <label>KEY <input type="password" placeholder="optional" value={cfg.api_key} onChange={patch("api_key")} /></label>
          <label>MAX STEPS <input type="number" min={1} max={24} value={cfg.max_steps} onChange={patch("max_steps")} /></label>
          <button type="submit" className="mini wide">LOCK IN</button>
          <span className="sum">{note}</span>
        </form>
      )}
    </section>
  )
}

function SoulMemory({ runs }: { runs: RunRecord[] }) {
  return (
    <section className="panel memory">
      <h2><span>05</span> SOUL MEMORY</h2>
      <ul className="history">
        {runs.length === 0 && <li className="empty">no runs yet. ignite something.</li>}
        {runs.map((r) => (
          <li key={r.id}>
            <b>{r.goal}</b>
            <br />
            <span className={r.ok ? "ok" : "fail"}>
              {r.ok ? "✔" : "✖"} {r.steps} steps · {r.model} · {new Date(r.finished_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function App() {
  const [runs, setRuns] = useState<RunRecord[]>([])
  const loadRuns = useCallback(() => {
    core.history().then(setRuns)
  }, [])
  useEffect(loadRuns, [loadRuns])

  return (
    <>
      <div className="speedlines" aria-hidden />
      <div className="scan" aria-hidden />
      <header className="mast">
        <div className="brand">
          <h1 data-text="ROCKSOUL">ROCKSOUL</h1>
          <span className="slash">// AGILITY</span>
        </div>
        <p className="manifesto">MORE THAN AGI. ONE STEP TOWARD ASI.</p>
        <ul className="mantra">
          <li>WORK HARD.</li>
          <li>PLAY HARD.</li>
          <li>THINK WITH CHAOS.</li>
          <li>ACT WITH RIOT.</li>
        </ul>
      </header>
      <main className="grid">
        <Console onFinished={loadRuns} />
        <MeshPulse />
        <BodyVitals />
        <BrainWiring />
        <SoulMemory runs={runs} />
      </main>
      <footer className="foot">SMART AGILITY · BRUTAL ENERGY · FUNKY STYLE — fear none but ALLAH</footer>
    </>
  )
}

