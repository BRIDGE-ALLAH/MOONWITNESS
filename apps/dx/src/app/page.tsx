"use client";

import { useState, useEffect, useRef } from "react";
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
import { Card, CardTitle, CardDescription, CardFooter, Button, Badge, Input, SectionHeader, TerminalWindow, EcosystemBridgeGrid, EcosystemSiteHeader } from "@local-git/ui";

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
  const [nukeCountdown, setNukeCountdown] = useState(10);
  const [nuked, setNuked] = useState(false);
  const [bountyState, setBountyState] = useState("Escrow Ready: $150.00 locked");
  const [keystrokeLog, setKeystrokeLog] = useState<string[]>([]);
  const [keystrokeBars, setKeystrokeBars] = useState<number[]>([42, 58, 39, 71, 48, 63, 52, 44]);
  const [keystrokeText, setKeystrokeText] = useState("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const savedMesh = localStorage.getItem("dx-mesh-nodes");
    if (savedMesh) setMeshNodes(Number(savedMesh) || 3);
  }, []);

  useEffect(() => {
    if (!nukeArmed || nuked) return;
    setNukeCountdown(10);
    const timer = setInterval(() => {
      setNukeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setNuked(true);
          setTimeout(() => {
            setNuked(false);
            setNukeArmed(false);
          }, 2500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [nukeArmed, nuked]);

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
      setMeshNodes((prev) => {
        const next = prev + 1;
        localStorage.setItem("dx-mesh-nodes", String(next));
        return next;
      });
    }, 500);
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
      const now = performance.now();
      const delta = lastKeyTimeRef.current > 0 ? Math.min(220, Math.max(18, Math.round(now - lastKeyTimeRef.current))) : 54;
      lastKeyTimeRef.current = now;
      const cadence = `Flight: ${delta}ms | Entropy: ${(delta * 1.37).toFixed(1)} bits | Human Verified`;
      setKeystrokeLog((prev) => [cadence, ...prev].slice(0, 3));
      setKeystrokeBars((prev) => [...prev.slice(1), delta]);
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
      <EcosystemSiteHeader
        logoMark={<span>#1</span>}
        title={`${defaultBrandingConfig.prefix}${defaultBrandingConfig.suffix}`}
        subtitle="STORY RIOT // CREATIVE CHAOS // DEVELOPER BUSINESS"
        rightSlot={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSfx(!sfx)}>
              {sfx ? <Volume2 size={14} /> : <VolumeX size={14} />} SFX: {sfx ? "ON" : "OFF"}
            </Button>
            <a href="#trinity" style={{ textDecoration: "none" }} onClick={playClickSfx}><Button variant="ghost" size="sm">TRINITY</Button></a>
            <a href="#philosophy" style={{ textDecoration: "none" }} onClick={playClickSfx}><Button variant="ghost" size="sm">★ BETTER HUMAN</Button></a>
            <a href="#lab" style={{ textDecoration: "none" }} onClick={playClickSfx}><Button variant="ghost" size="sm">WEAPONS LAB</Button></a>
            <a href="#suite" style={{ textDecoration: "none" }} onClick={playClickSfx}><Button variant="ghost" size="sm">DEV SUITE</Button></a>
            <Link href="/app" style={{ textDecoration: "none" }} onClick={playClickSfx}>
              <Button variant="primary" size="sm">ENTER COCKPIT <ArrowUpRight size={15} /></Button>
            </Link>
          </>
        }
      />

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
            dan membangun senjata kode mandiri dengan performa buas <strong>DX — Story Riot // Creative Chaos // Developer Business</strong>.
          </p>

          <div className="hero-ctas" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/app" style={{ textDecoration: "none" }} onClick={playClickSfx}>
              <Button variant="primary" size="lg">
                <Skull size={20} /> BUKA COCKPIT OPERATOR
              </Button>
            </Link>
            <a href="#trinity" style={{ textDecoration: "none" }} onClick={playClickSfx}>
              <Button variant="secondary" size="lg">
                <Compass size={20} /> HIERARKI KESATUAN
              </Button>
            </a>
          </div>

          <div className="hero-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 28 }}>
            <Card variant="gold" style={{ padding: 14 }}>
              <b style={{ display: "block", fontSize: 13 }}>SUPREME #1</b>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>ALLAH (A-L-L-A-H.COM)</span>
            </Card>
            <Card variant="cyan" style={{ padding: 14 }}>
              <b style={{ display: "block", fontSize: 13 }}>CREATIVE</b>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>MOONWITNESS (:3002)</span>
            </Card>
            <Card variant="toxic" style={{ padding: 14 }}>
              <b style={{ display: "block", fontSize: 13 }}>STORY RIOT</b>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>DX (:3000)</span>
            </Card>
            <Card variant="neon" style={{ padding: 14 }}>
              <b style={{ display: "block", fontSize: 13 }}>INFRA MESH</b>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>E-ISP (:3003)</span>
            </Card>
            <Card variant="gold" style={{ padding: 14 }}>
              <b style={{ display: "block", fontSize: 13 }}>ROOT ID</b>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>RID (:3004)</span>
            </Card>
          </div>
        </div>

        <div className="hero-art-box">
          <TerminalWindow title="SOVEREIGN-KERNEL // ALLAH #1 > MOONWITNESS > DX" variant="toxic">
            <p className="term-line"><span className="term-prompt">empire &gt;</span> probe-creed</p>
            <p className="term-success">[☝️] SUPREME CREATOR: ALLAH // EMPIRE OF THE LIGHT [ABSOLUTE]</p>
            <p className="term-log">[☾] CREATIVE WITNESS: MoonWitness Celestial Observatory [ONLINE]</p>
            <p className="term-log">[⚡] HARDCORE WEAPON: DX Bare-Metal Engine [READY ON :3200]</p>
            <p className="term-line"><span className="term-prompt">empire &gt;</span> ship --submission-to-creator=only</p>
            <p className="term-success">✓ ZERO VENDOR SLAVERY. CODE SHIPPED IN PURITY &amp; VELOCITY.</p>
            <p className="term-line blink"><span className="term-prompt">empire &gt;</span> <span className="cursor">█</span></p>
          </TerminalWindow>
          <div className="floating-stamp">
            <span>ALLAH #1<br />EMPIRE OF LIGHT<br /><b>#SOVEREIGN</b></span>
          </div>
        </div>
      </section>

      {/* THE UNIFIED TRINITY SECTION */}
      <section id="trinity" className="trinity-section">
        <SectionHeader
          eyebrow="/// SACRED HIERARCHY & UNIFIED ARCHITECTURE"
          title="ALLAH NUMBER ONE // SATU KESATUAN UTUH"
          subtitle="Kombinasi low-profile ketauhidan mendalam dengan kebebasan developer tanpa belas kasihan korporat."
          badgeVariant="gold"
          align="center"
        />
        <EcosystemBridgeGrid />
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
        <SectionHeader
          eyebrow="/// CLASSIFIED R&D EXPERIMENTS"
          title="ANARCHY WEAPONS LAB"
          subtitle="Empat terobosan anti-slop yang mendobrak pemerasan vendor dan mengembalikan kedaulatan developer."
          badgeVariant="toxic"
          align="center"
        />

        <div className="lab-grid">
          {/* WEAPON 1: P2P MESH */}
          <Card variant="cyan" className="lab-card">
            <div className="lab-header">
              <Badge variant="cyan">INNOVATION 01 // AIRDROP GIT</Badge>
              <Wifi size={24} style={{ color: "var(--cyan)" }} />
            </div>
            <CardTitle style={{ marginBottom: 8 }}>ZERO-PORT P2P MESH COMMITS</CardTitle>
            <CardDescription style={{ marginBottom: 16 }}>
              Push dan sinkronisasi repo git langsung antar-laptop via broadcast mDNS &amp; WebRTC data channel lokal tanpa internet, router kantor, atau IP statis.
            </CardDescription>
            <div className="lab-interactive">
              <div className="mesh-status-node">
                <span>LOCAL MESH NODES DETECTED:</span>
                <b>{meshNodes} MACHINES ONLINE</b>
              </div>
              <Button variant="cyan" className="w-full" style={{ width: "100%", marginTop: 10 }} onClick={triggerMeshSync}>
                {meshSyncing ? "BROADCASTING mDNS PACKETS..." : "SIMULATE 'git push mesh'"}
              </Button>
            </div>
          </Card>

          {/* WEAPON 2: DEAD MAN'S NUKE */}
          <Card variant="toxic" className="lab-card">
            <div className="lab-header">
              <Badge variant="toxic">INNOVATION 02 // PANIC PROTOCOL</Badge>
              <Bomb size={24} style={{ color: "var(--toxic)" }} />
            </div>
            <CardTitle style={{ marginBottom: 8 }}>DEAD MAN’S SWITCH &amp; ZERO-WIPE</CardTitle>
            <CardDescription style={{ marginBottom: 16 }}>
              Menghadapi audit paksa atau penyitaan fisik? Satu pemicu menulis ulang database SQLite lokal dan kunci rahasia menjadi zero-filled cryptographic white noise.
            </CardDescription>
            <div className="lab-interactive">
              <div className="mesh-status-node">
                <span>FAILSAFE STATUS:</span>
                <b style={{ color: nuked ? "var(--toxic)" : nukeArmed ? "var(--acid-yellow)" : "var(--neon-lime)" }}>
                  {nuked ? "💥 MEMORY & KEYS DESTROYED!" : nukeArmed ? `⚠️ AUTO-WIPE IN ${nukeCountdown}s (OR CLICK NOW)` : "IDLE & SECURE"}
                </b>
              </div>
              <Button
                variant={nukeArmed ? "toxic" : "secondary"}
                style={{ width: "100%", marginTop: 10 }}
                onClick={triggerNuke}
              >
                {nukeArmed ? `CONFIRM ZERO-WIPE (${nukeCountdown}s)` : "ARM BARREL NUKE HOOK"}
              </Button>
            </div>
          </Card>

          {/* WEAPON 3: MICRO-BOUNTY ESCROW */}
          <Card variant="gold" className="lab-card">
            <div className="lab-header">
              <Badge variant="gold">INNOVATION 03 // GIT ESCROW</Badge>
              <Coins size={24} style={{ color: "var(--acid-yellow)" }} />
            </div>
            <CardTitle style={{ marginBottom: 8 }}>COMMIT STREAM MICRO-BOUNTY</CardTitle>
            <CardDescription style={{ marginBottom: 16 }}>
              Sematkan dana bounty langsung di git trailer (`[bounty: $150 to @operator]`). Hook post-receive otomatis memverifikasi merge dan mencairkan saldo kontributor.
            </CardDescription>
            <div className="lab-interactive">
              <div className="mesh-status-node">
                <span>SMART CONTRACT STATUS:</span>
                <b style={{ color: "var(--acid-yellow)" }}>{bountyState}</b>
              </div>
              <Button variant="gold" style={{ width: "100%", marginTop: 10 }} onClick={triggerBountyClaim}>
                SIMULATE MERGE &amp; UNLOCK ESCROW
              </Button>
            </div>
          </Card>

          {/* WEAPON 4: KEYSTROKE BIOMETRICS */}
          <Card variant="neon" className="lab-card">
            <div className="lab-header">
              <Badge variant="lime">INNOVATION 04 // BOT FILTER</Badge>
              <Fingerprint size={24} style={{ color: "var(--neon-lime)" }} />
            </div>
            <CardTitle style={{ marginBottom: 8 }}>KEYSTROKE BIOMETRIC CADENCE</CardTitle>
            <CardDescription style={{ marginBottom: 16 }}>
              Analisis flight-time dan ritme ketikan jari manusia saat menulis commit. Memastikan kode ditulis manusia asli dan memblokir spam scraping AI bot.
            </CardDescription>
            <div className="lab-interactive">
              <Input
                type="text"
                value={keystrokeText}
                onChange={handleKeystroke}
                placeholder="Ketik di sini untuk menguji dinamika flight-time jari..."
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 34, marginBottom: 8, padding: "4px 6px", background: "var(--panel2)", border: "1px solid var(--line)" }}>
                {keystrokeBars.map((ms, idx) => (
                  <div
                    key={idx}
                    title={`${ms}ms`}
                    style={{
                      flex: 1,
                      height: `${Math.min(100, Math.max(18, Math.round((ms / 180) * 100)))}%`,
                      background: ms > 120 ? "var(--toxic)" : "var(--neon-lime)",
                      transition: "height 0.12s ease",
                    }}
                  />
                ))}
              </div>
              <div style={{ font: "10px var(--mono)", color: "var(--muted)", fontWeight: 700 }}>
                {keystrokeLog.length === 0 ? "Menunggu irama ketikan..." : keystrokeLog.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </Card>
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
        <SectionHeader
          eyebrow="/// DEVELOPER SUITE MATRIX"
          title="ARSENAL FULL-STACK DEVELOPER"
          subtitle="Bukan cuma source control—seluruh kerajaan dev berada di bawah kendali mandiri Anda."
          badgeVariant="lime"
          align="center"
        />

        <div className="arsenal-grid">
          <Card variant="neon" className="arsenal-card">
            <div className="card-top">
              <GitBranch size={28} className="icon-neon" />
              <Badge variant="lime">01</Badge>
            </div>
            <CardTitle style={{ marginBottom: 8 }}>BARE-METAL GIT ENGINE</CardTitle>
            <CardDescription>Daemon Git Smart HTTP native berbasis subprocess `git-http-backend`. Bare repository disimpan langsung di disk lokal tanpa cloud mata-mata.</CardDescription>
          </Card>

          <Card variant="toxic" className="arsenal-card">
            <div className="card-top">
              <Database size={28} className="icon-toxic" />
              <Badge variant="toxic">02</Badge>
            </div>
            <CardTitle style={{ marginBottom: 8 }}>INSTANT BACKEND-AS-A-SERVICE</CardTitle>
            <CardDescription>PocketBase Go + SQLite terintegrasi penuh dengan langganan data real-time, autentikasi handal, dan migrasi skema instan.</CardDescription>
          </Card>

          <Card variant="gold" className="arsenal-card">
            <div className="card-top">
              <Box size={28} className="icon-yellow" />
              <Badge variant="gold">03</Badge>
            </div>
            <CardTitle style={{ marginBottom: 8 }}>CONTAINERIZED ORCHESTRATION</CardTitle>
            <CardDescription>Infrastruktur Docker Compose siap pakai untuk menjalankan microservice, background queue, dan cache pendukung dalam satu perintah.</CardDescription>
          </Card>

          <Card variant="neon" className="arsenal-card">
            <div className="card-top">
              <CloudLightning size={28} className="icon-neon" />
              <Badge variant="lime">04</Badge>
            </div>
            <CardTitle style={{ marginBottom: 8 }}>TURBO BUN EXECUTION</CardTitle>
            <CardDescription>Dibangun sepenuhnya di atas runtime Bun. Waktu instalasi kilat, test runner secepat kilat, dan monorepo scripting mulus.</CardDescription>
          </Card>

          <Card variant="toxic" className="arsenal-card">
            <div className="card-top">
              <Lock size={28} className="icon-toxic" />
              <Badge variant="toxic">05</Badge>
            </div>
            <CardTitle style={{ marginBottom: 8 }}>AIRGAPPED SECRETS &amp; PATs</CardTitle>
            <CardDescription>Hashing token berentropi tinggi dengan salt pepper. Kelola kredensial API dan token akses pribadi tanpa kebocoran ke SaaS pihak ketiga.</CardDescription>
          </Card>

          <Card variant="gold" className="arsenal-card">
            <div className="card-top">
              <Gauge size={28} className="icon-yellow" />
              <Badge variant="gold">06</Badge>
            </div>
            <CardTitle style={{ marginBottom: 8 }}>NEOBRUTALIST DEV DASHBOARD</CardTitle>
            <CardDescription>Cockpit cyber-grunge ergonomis untuk menghilangkan beban kognitif. Inspeksi repo instan, telemetri sistem, dan navigasi kilat.</CardDescription>
          </Card>
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
    </div>
  );
}
