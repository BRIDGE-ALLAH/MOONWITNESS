"use client";

import { useState } from "react";
import {
  Music, Flame, Shield, Sparkles, HeartHandshake,
  Layers, Terminal, ArrowUpRight, Zap, Radio, Stamp,
  Fingerprint, Compass, Disc3, Scissors
} from "lucide-react";
import {
  Card, CardTitle, CardDescription, CardFooter,
  Button, Badge, Input, Textarea, StatMetric,
  SectionHeader, TerminalWindow, EcosystemBridgeGrid,
  EcosystemSiteHeader, EcosystemHero, useAuthSafe
} from "@local-git/ui";

interface SoulPatch {
  id: string;
  title: string;
  chord: string;
  motto: string;
  variant: "gold" | "toxic" | "cyan" | "neon";
  status: "stitched" | "active" | "rolling";
}

export default function RootIdPage() {
  const auth = useAuthSafe();
  const [activeTempo, setActiveTempo] = useState<number>(142);
  const [patchName, setPatchName] = useState("");
  const [patchChord, setPatchChord] = useState("A minor // 2-Tone");
  const [patches, setPatches] = useState<SoulPatch[]>([
    {
      id: "patch-01",
      title: "TAWHID_HEARTBEAT",
      chord: "D minor 9th (Sufi Cadence)",
      motto: "Soul Bows Only To ALLAH — Unshakable Core",
      variant: "gold",
      status: "stitched",
    },
    {
      id: "patch-02",
      title: "SKANG_AND_ROLL_TEMPO",
      chord: "Offbeat Skank in E (2-Tone Rudeboy)",
      motto: "Bounce Against The Corporate Grain",
      variant: "toxic",
      status: "rolling",
    },
    {
      id: "patch-03",
      title: "PATCH_IT_DONT_SELL_IT",
      chord: "G Blues Pentatonic (Sovereign Thread)",
      motto: "Stitch Your Own Scars — No Vendor Idols",
      variant: "cyan",
      status: "active",
    },
    {
      id: "patch-04",
      title: "SOVEREIGN_ROOT_CALLSIGN",
      chord: "C Major 7th (Pure Resonance)",
      motto: "Identity Is Not Rock That Withers — It Is Living Soul",
      variant: "neon",
      status: "stitched",
    },
  ]);

  const handleStitchPatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patchName.trim()) return;
    const newPatch: SoulPatch = {
      id: `patch-${Date.now().toString().slice(-4)}`,
      title: patchName.trim().toUpperCase().replace(/\s+/g, "_"),
      chord: patchChord,
      motto: "Live Rhythm, Stitched Under ALLAH #1",
      variant: patches.length % 2 === 0 ? "gold" : "toxic",
      status: "stitched",
    };
    setPatches([newPatch, ...patches]);
    setPatchName("");
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      {/* HEADER */}
      <EcosystemSiteHeader
        logoMark={<Disc3 size={22} />}
        title="ROOT ID // RID"
        subtitle="UR IDENTITY ITS NOT ROCK BUT SOUL // SKANG AND ROLL // PATCH IT"
        rightSlot={
          <>
            <Badge variant="gold">
              ♫ SKANG RHYTHM: {activeTempo} BPM
            </Badge>
            <a href="#soul-manifesto" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="sm">THE SOUL AXIOM</Button>
            </a>
            <a href="#patch-forge" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm">PATCH FORGE</Button>
            </a>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTempo((t) => (t >= 180 ? 120 : t + 8))}
            >
              UP-TEMPO +8 ⚡
            </Button>
          </>
        }
      />

      <main>
        {/* HERO SECTION */}
        <EcosystemHero
          eyebrow="★ ROOT ID // SACRED IDENTITY ENGINE ★"
          badgeVariant="gold"
          monumentalSymbol="♫"
          title="UR IDENTITY: NOT ROCK BUT SOUL."
          highlight="SKANG AND ROLL. PATCH IT."
          description={
            <>
              Batu (rock) itu beku, kaku, dan mudah pecah oleh cuaca dunia. 
              <strong> Jiwa (soul) itu hidup, mengalir, dan bernafas</strong> dengan getaran Tauhid yang mutlak kepada <strong>ALLAH #1</strong>. 
              Jangan serahkan identitasmu pada database korporat yang kaku. 
              Mainkan ritme <em>Skang and Roll</em>—rajut, tambal, dan pertahankan kedaulatan jiwamu dengan jahitan patch kebebasan.
            </>
          }
          actions={
            <>
              <a href="#patch-forge" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="lg">
                  <Scissors size={18} /> STITCH NEW SOUL PATCH
                </Button>
              </a>
              <a href="#patches" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="lg">
                  <Disc3 size={18} /> EXPLORE PATCH ROSTER
                </Button>
              </a>
            </>
          }
          bottomSlot={
            <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, textAlign: "left" }}>
              <StatMetric
                label="SOUL CADENCE"
                value={`${activeTempo} BPM`}
                sub="2-Tone Skank Heartbeat"
                variant="gold"
                valueColor="var(--accent)"
              />
              <StatMetric
                label="OPERATOR SOUL"
                value={auth?.user?.name || auth?.user?.username || "SOVEREIGN WITNESS"}
                sub={auth?.user?.email || "Decentralized Living ID"}
              />
              <StatMetric
                label="STITCHED PATCHES"
                value={patches.length}
                sub="Active Identity Seals"
              />
              <StatMetric
                label="ANCHOR AXIS"
                value="ALLAH #1"
                sub="Zero False Idols"
                variant="gold"
                valueColor="#eab308"
              />
            </div>
          }
        />

        {/* NARRATIVE SECTION: THE SOUL MANIFESTO */}
        <section id="soul-manifesto" style={{ marginBottom: 48 }}>
          <SectionHeader
            eyebrow="/// THE NARRATIVE MANIFESTO"
            title="KENAPA SOUL? BUKAN ROCK?"
            subtitle="Filosofi di balik Root ID (RID): Kedaulatan eksistensi di atas berhala modern."
            badgeVariant="gold"
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <Card variant="gold" style={{ padding: 22 }}>
              <Badge variant="gold" style={{ marginBottom: 12 }}>01 // BUKAN BATU (NOT ROCK)</Badge>
              <CardTitle style={{ fontSize: 18, marginBottom: 8 }}>BATU ITU BEKU & RAPUH</CardTitle>
              <CardDescription style={{ lineHeight: 1.7 }}>
                Batu tampak keras tapi tak bernyawa. Bila dijatuhkan dari tebing, ia pecah berhamburan. 
                Sistem profil korporat mencoba membatukan manusia menjadi deretan angka kredit dan ID kaku 
                untuk diperjualbelikan. Kami menolak dibatukan.
              </CardDescription>
            </Card>

            <Card variant="toxic" style={{ padding: 22 }}>
              <Badge variant="toxic" style={{ marginBottom: 12 }}>02 // MELAINKAN JIWA (BUT SOUL)</Badge>
              <CardTitle style={{ fontSize: 18, marginBottom: 8 }}>JIWA ITU BERGETAR & TULUS</CardTitle>
              <CardDescription style={{ lineHeight: 1.7 }}>
                Jiwa adalah hembusan nurani dari Sang Pencipta (ALLAH). Ia lentur, memiliki kedalaman cinta, 
                rasa adil, dan kerendahan hati. Jiwa tak bisa dibeli oleh saham korporat maupun dibelenggu 
                oleh algoritma pengawas.
              </CardDescription>
            </Card>

            <Card variant="cyan" style={{ padding: 22 }}>
              <Badge variant="cyan" style={{ marginBottom: 12 }}>03 // SKANG AND ROLL</Badge>
              <CardTitle style={{ fontSize: 18, marginBottom: 8 }}>RITME OFFBEAT MELAWAN KEMAPANAN</CardTitle>
              <CardDescription style={{ lineHeight: 1.7 }}>
                Skang and Roll adalah akselerasi sinkopasi offbeat: upbeat reggae/ska yang memantul ceria 
                berpadu distorsi roll yang tangguh. Melompat bersama di lumpur realitas tanpa kehilangan arah sujud.
              </CardDescription>
            </Card>

            <Card variant="neon" style={{ padding: 22 }}>
              <Badge variant="lime" style={{ marginBottom: 12 }}>04 // PATCH IT</Badge>
              <CardTitle style={{ fontSize: 18, marginBottom: 8 }}>TAMBAL LUKAMU SENDIRI</CardTitle>
              <CardDescription style={{ lineHeight: 1.7 }}>
                Jaket tempur sejati tidak dibeli mulus dari butik glamor; ia ditambal (patch it) dengan benang-benang 
                pengalaman, luka pertempuran, kode mandiri, dan prinsip kejujuran. Setiap patch adalah komitmen moral.
              </CardDescription>
            </Card>
          </div>
        </section>

        {/* PATCH FORGE & ACTIVE ROSTER */}
        <section id="patch-forge" style={{ marginBottom: 48 }}>
          <SectionHeader
            eyebrow="/// SOVEREIGN PATCH FABRIC"
            title="STITCH YOUR IDENTITY PATCH"
            subtitle="Bikin patch identitas baru dan sematkan pada jaket kedaulatanmu."
            badgeVariant="toxic"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, alignItems: "flex-start" }}>
            {/* Forge Form */}
            <Card variant="grunge" style={{ padding: 24 }}>
              <form onSubmit={handleStitchPatch} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Scissors size={18} style={{ color: "var(--accent)" }} />
                  <b style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>JAHIT PATCH BARU</b>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" }}>
                    Patch Call-Sign / Title
                  </label>
                  <Input
                    placeholder="e.g. RUDEBOY_TAWHID_SHIELD"
                    value={patchName}
                    onChange={(e) => setPatchName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase" }}>
                    Harmonic Cadence / Chord
                  </label>
                  <Input
                    placeholder="e.g. F# minor Ska Offbeat"
                    value={patchChord}
                    onChange={(e) => setPatchChord(e.target.value)}
                  />
                </div>

                <Button type="submit" variant="primary" size="md">
                  <Stamp size={16} /> STITCH TO SOUL ↗
                </Button>
              </form>
            </Card>

            {/* Roster Grid */}
            <div id="patches" className="patch-grid">
              {patches.map((p) => (
                <Card key={p.id} variant={p.variant} style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span className="skang-tape">{p.status.toUpperCase()}</span>
                    <Badge variant="outline">{p.id}</Badge>
                  </div>
                  <CardTitle style={{ fontSize: 16, marginBottom: 6 }}>{p.title}</CardTitle>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", marginBottom: 8 }}>
                    ♫ {p.chord}
                  </div>
                  <CardDescription style={{ fontSize: 12, lineHeight: 1.5 }}>
                    {p.motto}
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* TERMINAL SOUND ENGINE */}
        <section style={{ marginBottom: 48 }}>
          <TerminalWindow title="RID-AUDIO-DAW // SKANG-AND-ROLL-SOUL-ENGINE" variant="gold">
            <p className="term-line"><span style={{ color: "var(--accent)" }}>rid &gt;</span> probe-soul-frequency --anchor=allah-number-one</p>
            <p style={{ color: "#00ff66" }}>[✓] CORE HARMONIC FOUND: Frequency 432Hz resonating with divine law.</p>
            <p style={{ color: "#eab308" }}>[♫] RHYTHM DETECTED: Skang offbeat guitar chops synced at {activeTempo} BPM.</p>
            <p style={{ color: "#00f0ff" }}>[⚓] IDENTITY STATE: Soul fluid and sovereign. Zero vendor lock-in detected.</p>
            <p className="term-line"><span style={{ color: "var(--accent)" }}>rid &gt;</span> stitch --patch="TAWHID_SOUL_NOT_ROCK" --owner="{auth?.user?.name || "SOVEREIGN_OPERATOR"}"</p>
            <p style={{ color: "#00ff66" }}>[★] PATCH SEWN INTO MONOREPO FABRIC. PERPETUAL RESISTANCE ACTIVE.</p>
          </TerminalWindow>
        </section>

        {/* 5-NODE ECOSYSTEM BRIDGE */}
        <SectionHeader
          eyebrow="/// UNIFIED MONOREPO REVOLUTION"
          title="THE 5 SOVEREIGN NODES"
          subtitle="Jaringan ekosistem independen: dari pusat spiritual tertinggi hingga instrumen bare-metal."
          badgeVariant="gold"
        />
        <div style={{ marginBottom: 40 }}>
          <EcosystemBridgeGrid excludeDna="rid" />
        </div>
      </main>
    </div>
  );
}

