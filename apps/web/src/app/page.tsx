"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame, Terminal, Zap, ShieldAlert, Cpu, ArrowUpRight,
  GitBranch, Server, Skull, Lock, Radio, Database,
  Layers, Code2, Rocket, CloudLightning, Box, Gauge,
  Activity, RefreshCw, Volume2, VolumeX, Sparkles,
  Wifi, Bomb, Coins, Fingerprint, AlertTriangle,
  Sun, Moon, Compass, Star
} from "lucide-react";
import { defaultBrandingConfig } from "@/config/branding";

export default function LandingPage() {
  const [sfx, setSfx] = useState(true);
  const [cmdInput, setCmdInput] = useState("");
  const [termOutput, setTermOutput] = useState<string[]>([
    "BISMILLAH // A-L-L-A-H.COM COGNITIVE SOVEREIGNTY INITIALIZED.",
    "SUPREME AUTHORITY: ALLAH [NUMBER ONE // ABSOLUTE]",
    "CREATIVE PRESENCE: MOONWITNESS [LUNAR OBSERVATORY ACTIVE]",
    "OPERATIONAL ENGINE: DX RIOT [BARE-METAL ARMED]",
    "Type 'tawhid', 'trinity', 'ship', 'manifesto', or 'nuke'..."
  ]);

  // LAB INTERACTIVE STATES
  const [meshNodes, setMeshNodes] = useState(3);
  const [meshSyncing, setMeshSyncing] = useState(false);
  const [nukeArmed, setNukeArmed] = useState(false);
  const [nuked, setNuked] = useState(false);
  const [bountyState, setBountyState] = useState("Escrow Ready: $150.00 locked");
  const [keystrokeLog, setKeystrokeLog] = useState<string[]>([]);
  const [keystrokeText, setKeystrokeText] = useState("");

  // PSX MEMORY CARD & RETRO GAME STATES
  const [memCardBlocks, setMemCardBlocks] = useState([
    { id: 1, label: "DX_CORE", active: true, toxic: false },
    { id: 2, label: "TAWHID", active: true, toxic: false },
    { id: 3, label: "MOON_OBS", active: true, toxic: false },
    { id: 4, label: "BETTER_HUMAN", active: true, toxic: true },
    { id: 5, label: "EMPTY_05", active: false, toxic: false },
    { id: 6, label: "EMPTY_06", active: false, toxic: false },
    { id: 7, label: "EMPTY_07", active: false, toxic: false },
    { id: 8, label: "EMPTY_08", active: false, toxic: false },
  ]);
  const [memCardStatus, setMemCardStatus] = useState("MEMORY CARD 01: 4/8 BLOCKS WRITTEN // IMMUTABLE STATE");

  const playPsxBootSound = () => {
    if (!sfx || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.18, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
      master.connect(ctx.destination);

      // Sub Bass Drone
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 2.5);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 3.0);
      subOsc.connect(subGain);
      subGain.connect(master);
      subOsc.start(now);
      subOsc.stop(now + 3.2);

      // Pad chord (A2, E3, A3, D4)
      const freqs = [110, 164.81, 220, 293.66];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(280, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);
        filter.frequency.exponentialRampToValueAtTime(200, now + 3.0);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08 / freqs.length, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 3.2);
      });

      // Transient chimes
      [880, 1320, 1760].forEach((freq, i) => {
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = "sine";
        chime.frequency.setValueAtTime(freq, now + 0.15 + i * 0.08);
        chimeGain.gain.setValueAtTime(0.03, now + 0.15 + i * 0.08);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + i * 0.08);
        chime.connect(chimeGain);
        chimeGain.connect(master);
        chime.start(now + 0.15 + i * 0.08);
        chime.stop(now + 1.3 + i * 0.08);
      });
    } catch {
      // AudioContext policy
    }
  };

  const saveToMemCard = () => {
    playPsxBootSound();
    setMemCardBlocks((prev) =>
      prev.map((b) => (b.id === 5 ? { ...b, label: "OP_CHECKPOINT", active: true, toxic: true } : b))
    );
    setMemCardStatus("CHECKPOINT WRITTEN TO MEMORY CARD SLOT 01: IMMUTABLE TAWHID STATE SAVED");
  };

  const playClickSfx = () => {
    if (!sfx || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed without gesture
    }
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSfx();
    const cmd = cmdInput.trim().toLowerCase();
    if (!cmd) return;

    let res = "";
    if (cmd === "help") {
      res = "DIRECTIVES: tawhid, trinity, ship, manifesto, nuke, clear";
    } else if (cmd === "tawhid") {
      res = "☝️ ALLAH NUMBER ONE // LĀ ILĀHA ILLALLĀH // ZERO CORPORATE IDOLS.";
    } else if (cmd === "trinity") {
      res = "ORIGIN: ALLAH (Empire of the Light) | PRESENCE: MoonWitness | ENGINE: DX Platform.";
    } else if (cmd === "ship") {
      res = "🚀 MAXIMUM VELOCITY ENGAGED // ALL BARE-METAL ENGINES FIRING.";
    } else if (cmd === "manifesto") {
      res = "🏴‍☠️ WE REJECT CORPORATE SLOP. LOW-PROFILE DEVOTION, FERAL SOVEREIGN CODE.";
    } else if (cmd === "nuke") {
      res = "💥 ALL CLOUD TELEMETRY INCINERATED. YOU ARE NOW UNTRACEABLE.";
    } else if (cmd === "clear") {
      setTermOutput([]);
      setCmdInput("");
      return;
    } else {
      res = `COMMAND '${cmd}' UNRECOGNIZED. SYSTEM OPERATES IN UNRULY MODE.`;
    }

    setTermOutput((prev) => [...prev, `dx > ${cmdInput}`, res]);
    setCmdInput("");
  };

  const triggerMeshSync = () => {
    playClickSfx();
    setMeshSyncing(true);
    setTimeout(() => {
      setMeshSyncing(false);
      setMeshNodes((prev) => prev + 1);
    }, 700);
  };

  const triggerNuke = () => {
    playClickSfx();
    if (!nukeArmed) {
      setNukeArmed(true);
    } else {
      setNuked(true);
      setTimeout(() => {
        setNuked(false);
        setNukeArmed(false);
      }, 2500);
    }
  };

  const triggerBountyClaim = () => {
    playClickSfx();
    setBountyState("✓ COMMIT VERIFIED: $150.00 Released to @operator-7");
  };

  const handleKeystroke = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeystrokeText(val);
    if (val.length > 0) {
      const flightTime = Math.floor(Math.random() * 60 + 35);
      const cadence = `Flight: ${flightTime}ms | Cadence: Human Organic`;
      setKeystrokeLog((prev) => [cadence, ...prev].slice(0, 3));
    }
  };

  return (
    <div className="landing-root">
      {/* PLAYSTATION RETRO GAME ARCADE HUD */}
      <div className="psx-top-bar">
        <div className="psx-hud-cluster">
          <div className="psx-buttons">
            <span className="ps-btn triangle">▲</span>
            <span className="ps-btn circle">●</span>
            <span className="ps-btn cross">✖</span>
            <span className="ps-btn square">◼</span>
          </div>
          <span>P1: SOVEREIGN_OPERATOR</span>
          <span>LVL 99 // {defaultBrandingConfig.gameDna.consoleStyle}</span>
        </div>
        <div className="psx-hud-cluster">
          <div className="psx-meter">
            <span>HP [TAWHID]:</span>
            <div className="psx-meter-bar">
              <div className="psx-meter-fill" style={{ width: "100%" }} />
            </div>
            <b>100%</b>
          </div>
          <div className="psx-meter">
            <span>MP [DX_FORGE]:</span>
            <div className="psx-meter-bar">
              <div className="psx-meter-fill toxic" style={{ width: "100%" }} />
            </div>
            <b>100%</b>
          </div>
          <button className="psx-boot-btn" onClick={playPsxBootSound} title="Play PlayStation ambient boot synth">
            <Sparkles size={13} /> PSX CHORD
          </button>
        </div>
      </div>

      {/* LOW PROFILE TAWHID STRIP */}
      <div className="tawhid-header-banner">
        <div className="tawhid-badge">
          <span className="tawhid-arabic">{defaultBrandingConfig.trinity.supremeOrigin.arabic}</span>
          <span>ALLAH #1 // SUPREME SOURCE OF ALL KNOWLEDGE &amp; POWER</span>
        </div>
        <div className="tawhid-sub">
          {defaultBrandingConfig.trinity.supremeOrigin.creed}
        </div>
      </div>

      {/* GLITCH RUNNING TICKER */}
      <div className="riot-ticker">
        <div className="ticker-inner">
          <span>⚠️ {defaultBrandingConfig.subtitle} // LOW PROFILE DEVOTION × MAXIMUM BARE-METAL VELOCITY // ⚠️</span>
          <span>⚠️ {defaultBrandingConfig.subtitle} // LOW PROFILE DEVOTION × MAXIMUM BARE-METAL VELOCITY // ⚠️</span>
        </div>
      </div>

      {/* TOP NAV */}
      <header className="landing-nav">
        <div className="nav-brand">
          <div className="sacred-seal">
            <span>#1</span>
            {defaultBrandingConfig.trinity.supremeOrigin.arabic}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: "4px" }}>
            <span className="brand-title">{defaultBrandingConfig.prefix}<em>{defaultBrandingConfig.suffix}</em></span>
            <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--neon-lime)", fontWeight: 900 }}>A-L-L-A-H.COM // EMPIRE OF THE LIGHT</span>
          </div>
        </div>
        <div className="nav-links">
          <div className="sound-bar">
            {sfx ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>CYBER_SFX: {sfx ? "ON" : "OFF"}</span>
            <button className="sound-toggle" onClick={() => setSfx(!sfx)}>TOGGLE</button>
          </div>
          <a href="#trinity" className="nav-anchor" onClick={playClickSfx}>TAWHID &amp; TRINITY</a>
          <a href="#philosophy" className="nav-anchor" style={{ color: "var(--toxic)" }} onClick={playClickSfx}>★ BETTER HUMAN</a>
          <a href="#suite" className="nav-anchor" onClick={playClickSfx}>DEV SUITE</a>
          <a href="#lab" className="nav-anchor" onClick={playClickSfx}>WEAPONS LAB</a>
          <a href="#manifesto" className="nav-anchor" onClick={playClickSfx}>MANIFESTO</a>
          <Link href="/app" className="button primary riot-btn" onClick={playClickSfx}>
            ENTER COCKPIT <ArrowUpRight size={18} />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
            <span className="tape-tag">#ALLAH_NUMBER_ONE</span>
            <span className="sticker-red">EMPIRE_OF_THE_LIGHT</span>
            <span className="sticker-green">MOONWITNESS_CREATIVE</span>
            <span className="sticker-red">DX_ENGINE</span>
          </div>

          <h1 className="hero-title">
            ALLAH IS NUMBER ONE.<br />
            <em className="toxic-highlight">ZERO FALSE CLOUD IDOLS.</em><br />
            FERAL SOVEREIGN CODE.
          </h1>

          <p className="hero-subtext">
            Sujud dan kepatuhan mutlak hanya kepada <strong>ALLAH</strong> (Sumber Tertinggi // Empire of the Light). 
            Tidak tunduk pada monopoli korporat. Mengamati semesta melalui kehadiran kreatif <strong>MoonWitness</strong>, 
            dan membangun senjata kode mandiri dengan performa buas <strong>DX Platform</strong>.
          </p>

          <div className="hero-ctas">
            <Link href="/app" className="button primary hero-btn" onClick={playClickSfx}>
              <Skull size={20} /> BUKA COCKPIT OPERATOR
            </Link>
            <a href="#trinity" className="button secondary hero-btn" onClick={playClickSfx}>
              <Compass size={20} /> HIERARKI KESATUAN
            </a>
          </div>

          <div className="hero-stats">
            <div className="hstat-box">
              <b>SUPREME #1</b>
              <span>ALLAH (A-L-L-A-H.COM)</span>
            </div>
            <div className="hstat-box">
              <b>CREATIVE</b>
              <span>MOONWITNESS</span>
            </div>
            <div className="hstat-box">
              <b>PRODUCT</b>
              <span>DX PLATFORM</span>
            </div>
            <div className="hstat-box">
              <b>TAWHID</b>
              <span>ABSOLUTE SOVEREIGNTY</span>
            </div>
          </div>
        </div>

        <div className="hero-art-box">
          <div className="terminal-window">
            <div className="term-head">
              <span className="circle red" />
              <span className="circle yellow" />
              <span className="circle green" />
              <span className="term-title">SOVEREIGN-KERNEL // ALLAH #1 &gt; MOONWITNESS &gt; DX</span>
            </div>
            <div className="term-body">
              <p className="term-line"><span className="term-prompt">empire &gt;</span> probe-creed</p>
              <p className="term-success">[☝️] SUPREME CREATOR: ALLAH // EMPIRE OF THE LIGHT [ABSOLUTE]</p>
              <p className="term-log">[☾] CREATIVE WITNESS: MoonWitness Celestial Observatory [ONLINE]</p>
              <p className="term-log">[⚡] HARDCORE WEAPON: DX Bare-Metal Engine [READY ON :3200]</p>
              <p className="term-line"><span className="term-prompt">empire &gt;</span> ship --submission-to-creator=only</p>
              <p className="term-success">✓ ZERO VENDOR SLAVERY. CODE SHIPPED IN PURITY &amp; VELOCITY.</p>
              <p className="term-line blink"><span className="term-prompt">empire &gt;</span> <span className="cursor">█</span></p>
            </div>
          </div>
          <div className="floating-stamp">
            <span>ALLAH #1<br />EMPIRE OF LIGHT<br /><b>#SOVEREIGN</b></span>
          </div>
        </div>
      </section>

      {/* THE UNIFIED TRINITY SECTION */}
      <section id="trinity" className="trinity-section">
        <div className="section-header">
          <span className="sec-tag">/// SACRED HIERARCHY &amp; UNIFIED ARCHITECTURE</span>
          <h2>ALLAH NUMBER ONE // SATU KESATUAN UTUH</h2>
          <p>Kombinasi low-profile ketauhidan mendalam dengan kebebasan developer tanpa belas kasihan korporat.</p>
        </div>

        <div className="trinity-hierarchy">
          {/* TRINITY 1: THE SUPREME ORIGIN */}
          <div className="trinity-card source">
            <div className="trinity-pill">SUMBER UTAMA // THE SUPREME ORIGIN (NUMBER ONE)</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>{defaultBrandingConfig.trinity.supremeOrigin.entity}</h3>
              <span style={{ fontSize: "32px", color: "var(--acid-yellow)", fontFamily: "serif" }}>{defaultBrandingConfig.trinity.supremeOrigin.arabic}</span>
            </div>
            <div className="trinity-subtitle">{defaultBrandingConfig.trinity.supremeOrigin.domain} · {defaultBrandingConfig.trinity.supremeOrigin.realm}</div>
            <p>
              {defaultBrandingConfig.trinity.supremeOrigin.thesis}
              <br /><br />
              <strong>{defaultBrandingConfig.trinity.supremeOrigin.creed}</strong>
            </p>
            <div className="trinity-spec">
              <span>CANONICAL AXIS</span>
              <b>NUMBER 1 // MAHA TINGGI &amp; MAHA PENCIPTA</b>
            </div>
          </div>

          {/* TRINITY 2: THE CREATIVE PRESENCE */}
          <div className="trinity-card presence">
            <div className="trinity-pill">CREATIVE PRESENCE // THE LIVING UNIVERSE</div>
            <h3>{defaultBrandingConfig.trinity.creativePresence.entity}</h3>
            <div className="trinity-subtitle">{defaultBrandingConfig.trinity.creativePresence.role}</div>
            <p>
              {defaultBrandingConfig.trinity.creativePresence.thesis}
              <br /><br />
              Observatorium semesta yang mengabadikan ilmu pengetahuan, narasi, estetika lunar, dan riset mendalam. 
              <strong> Lunar Chronicles</strong> membentangkan peta bintang dan kronik kehidupan.
            </p>
            <div className="trinity-spec">
              <span>UNIVERSE ARCHIVE</span>
              <b>LUNAR CHRONICLES · KNOWLEDGE · NARRATIVE</b>
            </div>
          </div>

          {/* TRINITY 3: THE OPERATIONAL PRODUCT */}
          <div className="trinity-card product">
            <div className="trinity-pill">PRODUK &amp; SENJATA OPERASIONAL // THE ENGINE</div>
            <h3>{defaultBrandingConfig.trinity.flagshipProduct.name}</h3>
            <div className="trinity-subtitle">{defaultBrandingConfig.trinity.flagshipProduct.role}</div>
            <p>
              {defaultBrandingConfig.trinity.flagshipProduct.thesis}
              <br /><br />
              Kendaraan operasional berkecepatan tinggi: <strong>Bare-Metal Git Engine (Smart HTTP)</strong>, 
              PocketBase BaaS SQLite control plane, dan Docker mesh bergaya <strong>Riot Anarchy</strong>.
            </p>
            <div className="trinity-spec">
              <span>OPERATIONAL MATRIX</span>
              <b>BARE-METAL SOVEREIGN WORKSPACE</b>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTER 01: SIN CAN BE BETTER HUMAN // MANGA COMIC ARTWORK MATRIX */}
      <section id="philosophy" className="comic-story-section">
        <div className="manga-speedlines-bg" />
        <div className="manga-screentone-overlay" />

        <div className="comic-section-header">
          <div className="comic-motto-pill">
            ★ {defaultBrandingConfig.philosophy.coreMotto} ★
          </div>
          <h2>
            {defaultBrandingConfig.gameDna.chapter}
          </h2>
          <p style={{ color: "#aaa", fontSize: "15px", maxWidth: "780px", margin: "0 auto", lineHeight: "1.6" }}>
            {defaultBrandingConfig.philosophy.subtext}
          </p>
        </div>

        {/* 4 COMIC PANELS */}
        <div className="comic-grid">
          {defaultBrandingConfig.philosophy.panels.map((p, i) => (
            <div key={i} className={`comic-panel-box ${p.visualTheme}`}>
              <div className="comic-panel-top">
                <span className="comic-panel-tag">{p.panelNumber}</span>
                <span className="comic-panel-badge">{p.badge}</span>
              </div>

              {/* KANJI SFX STAMP */}
              <div className={`kanji-fx-stamp ${i === 1 ? "lime" : i === 2 ? "toxic" : i === 3 ? "gold" : ""}`}>
                {p.kanjiSfx}
                <span className="romaji-sub-sfx">{p.romajiSfx}</span>
              </div>

              <div>
                <h3 className="comic-panel-title">{p.title}</h3>
                <div className="comic-caption-box">
                  <span className="comic-caption-tag">[ NARRATIVE CHRONICLE ]</span>
                  {p.caption}
                </div>

                {p.dialogue && (
                  <div className="comic-bubble">
                    {p.dialogue}
                  </div>
                )}
              </div>

              <div className="comic-panel-footer">
                <span className="comic-quote">"{p.quote}"</span>
                <span style={{ color: "#666" }}>MW×DX // SACRED MANGA ARTWORK</span>
              </div>
            </div>
          ))}
        </div>

        {/* PLAYSTATION MEMORY CARD + ROCKSOUL SOUND SYSTEM DECK */}
        <div className="rocksoul-audio-deck">
          <div className="rocksoul-deck-info">
            <b>PLAYSTATION RETRO RIG // MEMORY CARD SLOT 01</b>
            <span>{memCardStatus}</span>
          </div>
          <div className="psx-memcard" style={{ padding: "10px", margin: "0" }}>
            <div className="memcard-blocks" style={{ margin: "0 0 8px 0" }}>
              {memCardBlocks.map((blk) => (
                <div key={blk.id} className={`memcard-block ${blk.active ? "active" : "free"} ${blk.toxic ? "toxic" : ""}`}>
                  {blk.label}
                </div>
              ))}
            </div>
          </div>
          <button className="psx-boot-btn" onClick={saveToMemCard}>
            <Database size={14} /> SAVE TO MEMORY CARD
          </button>
        </div>
      </section>

      {/* ANARCHY WEAPONS LAB (THE 4 ANTI-SLOP INNOVATIONS) */}
      <section id="lab" className="anarchy-lab-section">
        <div className="section-header">
          <span className="sec-tag">/// CLASSIFIED R&amp;D EXPERIMENTS</span>
          <h2>ANARCHY WEAPONS LAB</h2>
          <p>Empat terobosan anti-slop yang mendobrak pemerasan vendor dan mengembalikan kedaulatan developer.</p>
        </div>

        <div className="lab-grid">
          {/* WEAPON 1: P2P MESH */}
          <div className="lab-card">
            <div className="lab-header">
              <span className="lab-tag cyan">INNOVATION 01 // AIRDROP GIT</span>
              <Wifi size={24} style={{ color: "var(--cyan)" }} />
            </div>
            <h3>ZERO-PORT P2P MESH COMMITS</h3>
            <p>Push dan sinkronisasi repo git langsung antar-laptop via broadcast mDNS &amp; WebRTC data channel lokal tanpa internet, router kantor, atau IP statis.</p>
            <div className="lab-interactive">
              <div className="mesh-status-node">
                <span>LOCAL MESH NODES DETECTED:</span>
                <b>{meshNodes} MACHINES ONLINE</b>
              </div>
              <button className="button primary lab-sim-btn" onClick={triggerMeshSync}>
                {meshSyncing ? "BROADCASTING mDNS PACKETS..." : "SIMULATE 'git push mesh'"}
              </button>
            </div>
          </div>

          {/* WEAPON 2: DEAD MAN'S NUKE */}
          <div className="lab-card">
            <div className="lab-header">
              <span className="lab-tag toxic">INNOVATION 02 // PANIC PROTOCOL</span>
              <Bomb size={24} style={{ color: "var(--toxic)" }} />
            </div>
            <h3>DEAD MAN’S SWITCH &amp; ZERO-WIPE</h3>
            <p>Menghadapi audit paksa atau penyitaan fisik? Satu pemicu menulis ulang database SQLite lokal dan kunci rahasia menjadi zero-filled cryptographic white noise.</p>
            <div className="lab-interactive">
              <div className="mesh-status-node">
                <span>FAILSAFE STATUS:</span>
                <b style={{ color: nuked ? "var(--toxic)" : nukeArmed ? "var(--acid-yellow)" : "var(--neon-lime)" }}>
                  {nuked ? "💥 MEMORY &amp; KEYS DESTROYED!" : nukeArmed ? "⚠️ ARMED: CLICK AGAIN TO ZERO-WIPE" : "IDLE &amp; SECURE"}
                </b>
              </div>
              <button
                className="button secondary lab-sim-btn"
                style={{ borderColor: nukeArmed ? "var(--toxic)" : "#444", background: nukeArmed ? "var(--blood)" : "#111" }}
                onClick={triggerNuke}
              >
                {nukeArmed ? "CONFIRM EMERGENCY ZERO-WIPE" : "ARM BARREL NUKE HOOK"}
              </button>
            </div>
          </div>

          {/* WEAPON 3: MICRO-BOUNTY ESCROW */}
          <div className="lab-card">
            <div className="lab-header">
              <span className="lab-tag yellow">INNOVATION 03 // GIT ESCROW</span>
              <Coins size={24} style={{ color: "var(--acid-yellow)" }} />
            </div>
            <h3>COMMIT STREAM MICRO-BOUNTY</h3>
            <p>Sematkan dana bounty langsung di git trailer (`[bounty: $150 to @operator]`). Hook post-receive otomatis memverifikasi merge dan mencairkan saldo kontributor.</p>
            <div className="lab-interactive">
              <div className="mesh-status-node">
                <span>SMART CONTRACT STATUS:</span>
                <b style={{ color: "var(--acid-yellow)" }}>{bountyState}</b>
              </div>
              <button className="button primary lab-sim-btn" onClick={triggerBountyClaim}>
                SIMULATE MERGE &amp; UNLOCK ESCROW
              </button>
            </div>
          </div>

          {/* WEAPON 4: KEYSTROKE BIOMETRICS */}
          <div className="lab-card">
            <div className="lab-header">
              <span className="lab-tag lime">INNOVATION 04 // BOT FILTER</span>
              <Fingerprint size={24} style={{ color: "var(--neon-lime)" }} />
            </div>
            <h3>KEYSTROKE BIOMETRIC CADENCE</h3>
            <p>Analisis flight-time dan ritme ketikan jari manusia saat menulis commit. Memastikan kode ditulis manusia asli dan memblokir spam scraping AI bot.</p>
            <div className="lab-interactive">
              <input
                type="text"
                value={keystrokeText}
                onChange={handleKeystroke}
                placeholder="Ketik di sini untuk menguji dinamika flight-time jari..."
                style={{
                  width: "100%",
                  background: "#050505",
                  border: "2px solid #333",
                  color: "var(--neon-lime)",
                  fontFamily: "var(--mono)",
                  fontWeight: 900,
                  fontSize: "12px",
                  padding: "8px 12px",
                  marginBottom: "8px",
                  outline: "none"
                }}
              />
              <div style={{ font: "10px var(--mono)", color: "#888", fontWeight: 700 }}>
                {keystrokeLog.length === 0 ? "Menunggu irama ketikan..." : keystrokeLog.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE RIOT SHELL */}
      <section className="quickstart-section" style={{ paddingTop: "20px" }}>
        <div className="quickstart-card" style={{ borderColor: "var(--neon-lime)" }}>
          <div className="qs-header">
            <span className="sec-tag">/// LIVE EMPIRE CLI SHELL</span>
            <h2>INTERACTIVE OPERATOR CLI</h2>
            <p>Ketik perintah untuk berinteraksi langsung dengan cluster.</p>
          </div>
          <div className="qs-codebox" style={{ minHeight: "130px", maxHeight: "180px", overflowY: "auto" }}>
            {termOutput.map((line, idx) => (
              <div key={idx} style={{ color: line.startsWith("dx >") || line.startsWith("empire >") ? "var(--acid-yellow)" : "var(--neon-lime)", fontSize: "12px", fontFamily: "var(--mono)", fontWeight: 900 }}>
                {line}
              </div>
            ))}
          </div>
          <form onSubmit={handleCommand} style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <span style={{ color: "var(--toxic)", fontFamily: "var(--mono)", fontWeight: 900, fontSize: "14px", lineHeight: "42px" }}>dx &gt;</span>
            <input
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              placeholder="ketik 'tawhid', 'trinity', 'ship', atau 'nuke'..."
              style={{
                flex: 1,
                background: "#000",
                border: "2px solid #333",
                color: "#fff",
                fontFamily: "var(--mono)",
                fontWeight: 900,
                padding: "0 14px",
                outline: "none"
              }}
            />
            <button type="submit" className="button primary" style={{ height: "42px" }}>RUN</button>
          </form>
        </div>
      </section>

      {/* SUITE: BEYOND GIT */}
      <section id="suite" className="arsenal-section">
        <div className="section-header">
          <span className="sec-tag">/// DEVELOPER SUITE MATRIX</span>
          <h2>ARSENAL FULL-STACK DEVELOPER</h2>
          <p>Bukan cuma source control—seluruh kerajaan dev berada di bawah kendali mandiri Anda.</p>
        </div>

        <div className="arsenal-grid">
          <div className="arsenal-card">
            <div className="card-top">
              <GitBranch size={28} className="icon-neon" />
              <span className="card-num">01</span>
            </div>
            <h3>BARE-METAL GIT ENGINE</h3>
            <p>Daemon Git Smart HTTP native berbasis subprocess `git-http-backend`. Bare repository disimpan langsung di disk lokal tanpa cloud mata-mata.</p>
          </div>

          <div className="arsenal-card">
            <div className="card-top">
              <Database size={28} className="icon-toxic" />
              <span className="card-num">02</span>
            </div>
            <h3>INSTANT BACKEND-AS-A-SERVICE</h3>
            <p>PocketBase Go + SQLite terintegrasi penuh dengan langganan data real-time, autentikasi handal, dan migrasi skema instan.</p>
          </div>

          <div className="arsenal-card">
            <div className="card-top">
              <Box size={28} className="icon-yellow" />
              <span className="card-num">03</span>
            </div>
            <h3>CONTAINERIZED ORCHESTRATION</h3>
            <p>Infrastruktur Docker Compose siap pakai untuk menjalankan microservice, background queue, dan cache pendukung dalam satu perintah.</p>
          </div>

          <div className="arsenal-card">
            <div className="card-top">
              <CloudLightning size={28} className="icon-neon" />
              <span className="card-num">04</span>
            </div>
            <h3>TURBO BUN EXECUTION</h3>
            <p>Dibangun sepenuhnya di atas runtime Bun. Waktu instalasi kilat, test runner secepat kilat, dan monorepo scripting mulus.</p>
          </div>

          <div className="arsenal-card">
            <div className="card-top">
              <Lock size={28} className="icon-toxic" />
              <span className="card-num">05</span>
            </div>
            <h3>AIRGAPPED SECRETS &amp; PATs</h3>
            <p>Hashing token berentropi tinggi dengan salt pepper. Kelola kredensial API dan token akses pribadi tanpa kebocoran ke SaaS pihak ketiga.</p>
          </div>

          <div className="arsenal-card">
            <div className="card-top">
              <Gauge size={28} className="icon-yellow" />
              <span className="card-num">06</span>
            </div>
            <h3>NEOBRUTALIST DEV DASHBOARD</h3>
            <p>Cockpit cyber-grunge ergonomis untuk menghilangkan beban kognitif. Inspeksi repo instan, telemetri sistem, dan navigasi kilat.</p>
          </div>
        </div>
      </section>

      {/* MANIFESTO / PHILOSOPHY */}
      <section id="manifesto" className="quickstart-section" style={{ background: "#050505" }}>
        <div className="quickstart-card" style={{ borderColor: "var(--acid-yellow)", boxShadow: "16px 16px 0 var(--toxic)" }}>
          <div className="qs-header">
            <span className="sec-tag">/// MANIFESTO DEVELOPER // ALLAH #1</span>
            <h2>KITA HANYA BERTEKUK LUTUT KEPADA SANG PENCIPTA</h2>
            <p style={{ color: "#fff", fontSize: "16px", lineHeight: "1.6", marginTop: "16px" }}>
              Perkakas developer modern menuntut kepatuhan buta pada ekosistem berbayar, telemetry pengintai, dan monopoli cloud. 
              Sebagai hamba Allah, kita menolak memperhambakan diri pada ilusi dan tirani teknologi buatan manusia.
              <br /><br />
              <strong>ALLAH TETAP NOMOR SATU (A-L-L-A-H.COM)</strong>. Melalui ketenangan observasi <strong>MoonWitness</strong>, 
              kita bangun alat kerja kita sendiri dengan mesin berdaulat <strong>DX Platform</strong>—rendah hati di hadapan Sang Maha Kuasa, 
              tanpa kompromi terhadap tirani digital.
            </p>
          </div>
        </div>
      </section>

      {/* QUICKSTART / GET STARTED */}
      <section id="quickstart" className="quickstart-section">
        <div className="quickstart-card">
          <div className="qs-header">
            <h2>BANGKITKAN CLUSTER LOKAL ANDA</h2>
            <p>Tiga baris terminal untuk mencapai kedaulatan developer sejati.</p>
          </div>
          <div className="qs-codebox">
            <div className="qs-row">
              <span className="qs-comment"># 1. Boot up backend PocketBase &amp; Git Engine</span>
              <code>bun infra:up</code>
            </div>
            <div className="qs-row">
              <span className="qs-comment"># 2. Nyalakan cockpit dev &amp; services</span>
              <code>bun run dev</code>
            </div>
            <div className="qs-row">
              <span className="qs-comment"># 3. Masuk ke ruang kendali operasional</span>
              <code>http://127.0.0.1:3000</code>
            </div>
          </div>
          <div className="qs-cta">
            <Link href="/app" className="button primary riot-btn wide" onClick={playClickSfx}>
              MASUK KE COCKPIT OPERATOR SEKARANG ⚡
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-left">
          <b>{defaultBrandingConfig.trinity.supremeOrigin.arabic} {defaultBrandingConfig.trinity.supremeOrigin.domain}</b> · <b>{defaultBrandingConfig.trinity.creativePresence.entity}</b> · <b>{defaultBrandingConfig.trinity.flagshipProduct.name}</b>
        </div>
        <div className="footer-right">
          <span>{defaultBrandingConfig.labels.footerNotice}</span>
        </div>
      </footer>
    </div>
  );
}
