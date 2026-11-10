"use client";

import { useState, useEffect } from "react";
import { Moon, Sparkles, Send, Code2, Server, Disc3 } from "lucide-react";
import { Card, CardTitle, CardDescription, CardFooter, Button, Badge, Input, SectionHeader, StatMetric, EcosystemSiteHeader, EcosystemHero, EcosystemBridgeGrid, useAuthSafe } from "@local-git/ui";

interface Transmission {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  coordinates: string;
}

export default function MoonWitnessPage() {
  const auth = useAuthSafe();
  const [moonData, setMoonData] = useState({
    phase: "Waxing Gibbous",
    illumination: "87%",
    ageDays: "10.4",
    altitude: "+54°22'18\"",
    azimuth: "138°12'04\"",
    nextFullMoon: "In 4.2 Days",
  });

  const [message, setMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [transmissions, setTransmissions] = useState<Transmission[]>([
    {
      id: "mw-01",
      author: "@lunar-observer-1",
      text: "When the moon reaches its zenith, clarity descends upon the seeker. Knowledge is light gifted by the Supreme Creator.",
      timestamp: "2026-11-10 03:42 UTC",
      coordinates: "RA 04h 35m / Dec +16° 30'",
    },
    {
      id: "mw-02",
      author: "@sovereign-scribe",
      text: "We record history not for corporate analytics, but for the moral elevation of humankind beneath the celestial canopy.",
      timestamp: "2026-11-09 22:15 UTC",
      coordinates: "RA 03h 12m / Dec +12° 05'",
    },
    {
      id: "mw-03",
      author: "@astronomer-tauhid",
      text: "Calculations confirm: every orbital period follows immutable mathematical constants. Nothing exists in chaos; all is by design.",
      timestamp: "2026-11-09 18:00 UTC",
      coordinates: "RA 02h 55m / Dec +09° 44'",
    },
  ]);

  useEffect(() => {
    if (!auth?.pb) return;
    // Load initial from PocketBase
    auth.pb.collection("transmissions").getList<Transmission>(1, 30, { sort: "-created" })
      .then((res) => {
        if (res.items.length > 0) {
          setTransmissions(res.items);
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem("moonwitness-transmissions");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setTransmissions(parsed);
          }
        } catch {}
      });

    // Realtime SSE sync
    let active = true;
    auth.pb.collection("transmissions").subscribe<Transmission>("*", (e) => {
      if (!active) return;
      if (e.action === "create" && e.record) {
        setTransmissions((prev) => [e.record, ...prev.filter((t) => t.id !== e.record.id)].slice(0, 30));
      }
    }).catch(() => {});

    return () => {
      active = false;
      auth.pb.collection("transmissions").unsubscribe("*").catch(() => {});
    };
  }, [auth?.pb]);

  useEffect(() => {
    const now = new Date();
    const cycle = 29.53058867;
    const baseDate = new Date("2000-01-06T18:14:00Z");
    const diffDays = (now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
    const phaseValue = ((diffDays % cycle) + cycle) % cycle;
    const illuminationPercent = Math.round(((1 - Math.cos((phaseValue / cycle) * 2 * Math.PI)) / 2) * 100);

    let phaseName = "New Moon";
    if (phaseValue > 1 && phaseValue < 7) phaseName = "Waxing Crescent";
    else if (phaseValue >= 7 && phaseValue < 8) phaseName = "First Quarter";
    else if (phaseValue >= 8 && phaseValue < 14) phaseName = "Waxing Gibbous";
    else if (phaseValue >= 14 && phaseValue < 16) phaseName = "Full Moon";
    else if (phaseValue >= 16 && phaseValue < 22) phaseName = "Waning Gibbous";
    else if (phaseValue >= 22 && phaseValue < 23) phaseName = "Last Quarter";
    else if (phaseValue >= 23 && phaseValue < 29) phaseName = "Waning Crescent";

    setMoonData({
      phase: phaseName,
      illumination: `${illuminationPercent}%`,
      ageDays: phaseValue.toFixed(1),
      altitude: "+58°14'32\"",
      azimuth: "142°09'11\"",
      nextFullMoon:
        phaseValue < 15
          ? `In ${(14.8 - phaseValue).toFixed(1)} Days`
          : `In ${(cycle - phaseValue + 14.8).toFixed(1)} Days`,
    });
  }, []);

  const dispatchKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const authorTag = auth?.user?.name || auth?.user?.username || (authorName.trim() ? authorName.trim() : "anonymous-witness");
    const formattedTag = authorTag.startsWith("@") ? authorTag : `@${authorTag}`;
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const coordinates = `RA 05h ${(Math.random() * 50).toFixed(0).padStart(2, "0")}m / Dec +${(Math.random() * 20).toFixed(0)}°`;

    if (auth?.pb) {
      try {
        await auth.pb.collection("transmissions").create({
          author: formattedTag,
          text: message.trim(),
          timestamp,
          coordinates,
          user: auth.user?.id || null,
        });
        setMessage("");
        return;
      } catch {}
    }

    const newTx: Transmission = {
      id: `mw-${Date.now().toString().slice(-4)}`,
      author: formattedTag,
      text: message.trim(),
      timestamp,
      coordinates,
    };
    setTransmissions((prev) => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem("moonwitness-transmissions", JSON.stringify(updated.slice(0, 30)));
      } catch { }
      return updated;
    });
    setMessage("");
  };

  return (
    <div className="lunar-root" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <EcosystemSiteHeader
        logoMark={<Moon size={20} />}
        title="MOONWITNESS"
        subtitle="THE LIVING OBSERVATORY & ARCHIVE"
        rightSlot={
          <>
            <Badge variant="cyan">PHASE: {moonData.phase.toUpperCase()} ({moonData.illumination})</Badge>
            <a href="http://127.0.0.1:3001" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="gold" size="sm"><Sparkles size={14} /> EMPIRE (:3001)</Button>
            </a>
            <a href="http://127.0.0.1:3000" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="toxic" size="sm"><Code2 size={14} /> DX (:3000)</Button>
            </a>
            <a href="http://127.0.0.1:3003" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="sm"><Server size={14} /> E-ISP (:3003)</Button>
            </a>
            <a href="http://127.0.0.1:3004" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm"><Disc3 size={14} /> RID (:3004)</Button>
            </a>
          </>
        }
      />

      {/* HERO SECTION */}
      <EcosystemHero
        eyebrow="★ WHEN THE MOON IS HIGH WE SHARE MESSAGE AND KNOWLEDGE ★"
        badgeVariant="cyan"
        title="THE CELESTIAL WITNESS."
        highlight="PRESERVING SACRED KNOWLEDGE."
        description="MoonWitness adalah observatorium hidup dan penjaga arsip ilmu pengetahuan semesta. Ketika malam tiba dan rembulan meninggi, kami mengumpulkan hikmah, sains astronomis, dan refleksi hakiki untuk dibagikan kepada umat manusia secara bebas tanpa sensor korporat."
        bottomSlot={
          <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, textAlign: "left" }}>
            <StatMetric label="CURRENT LUNAR PHASE" value={moonData.phase} variant="cyan" valueColor="var(--accent)" />
            <StatMetric label="SURFACE ILLUMINATION" value={moonData.illumination} sub="albedo reflection" />
            <StatMetric label="SYNODIC AGE" value={`${moonData.ageDays} DAYS`} sub="orbital cycle" />
            <StatMetric label="ESTIMATED FULL MOON" value={moonData.nextFullMoon} sub="ephemeris lock" />
          </div>
        }
      />

      {/* KNOWLEDGE SCROLLS & ARTICLES */}
      <section className="archive-section">
        <SectionHeader
          eyebrow="CELESTIAL REPOSITORY"
          title="LUNAR CHRONICLES & SACRED SCROLLS"
          subtitle="Arsip riset, kartografi kosmik, dan transmisi pengetahuan pilihan."
          badgeVariant="cyan"
          rightSlot={<Badge variant="outline">/// TOTAL SCROLLS INDEXED: 03</Badge>}
        />

        <div className="knowledge-grid">
          <Card variant="default" style={{ display: "flex", flexDirection: "column" }}>
            <Badge variant="cyan" style={{ alignSelf: "flex-start", marginBottom: 12 }}>ASTRONOMY &amp; TAWHID // 01</Badge>
            <CardTitle style={{ marginBottom: 10 }}>Matahari dan Bulan Beredar Menurut Perhitungan</CardTitle>
            <CardDescription style={{ flex: 1 }}>
              Hukum gravitasi dan keharmonisan orbit tata surya membuktikan ketertiban absolut yang mustahil lahir dari kebetulan buta.
            </CardDescription>
            <CardFooter>
              <span>KURATOR: @moon-archive</span>
              <Badge variant="lime">EPHEMERIS VERIFIED</Badge>
            </CardFooter>
          </Card>

          <Card variant="default" style={{ display: "flex", flexDirection: "column" }}>
            <Badge variant="cyan" style={{ alignSelf: "flex-start", marginBottom: 12 }}>EPISTEMIC SOVEREIGNTY // 02</Badge>
            <CardTitle style={{ marginBottom: 10 }}>Kemandirian Arsip Pengetahuan di Era Digital</CardTitle>
            <CardDescription style={{ flex: 1 }}>
              Mengapa ilmu pengetahuan tidak boleh dipagari oleh paywall jurnal predator dan algoritma rekomendasi beracun.
            </CardDescription>
            <CardFooter>
              <span>KURATOR: @scribe-omega</span>
              <Badge variant="cyan">FREE ACCESS</Badge>
            </CardFooter>
          </Card>

          <Card variant="default" style={{ display: "flex", flexDirection: "column" }}>
            <Badge variant="gold" style={{ alignSelf: "flex-start", marginBottom: 12 }}>MORAL PHILOSOPHY // 03</Badge>
            <CardTitle style={{ marginBottom: 10 }}>Sin Can Be Better Human: Doktrin Pertobatan &amp; Aksi</CardTitle>
            <CardDescription style={{ flex: 1 }}>
              Bagaimana luka dan kesalahan masa lalu dapat ditempa menjadi sumber kebaikan terbesar ketika bersujud kembali kepada Sang Pencipta.
            </CardDescription>
            <CardFooter>
              <span>KURATOR: @witness-xi</span>
              <Badge variant="gold">CANONICAL</Badge>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* INTERACTIVE MESSAGE DISPATCHER */}
      <section style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 5vw" }}>
        <Card variant="cyan" style={{ padding: 28 }}>
          <CardTitle style={{ fontSize: 22, marginBottom: 6 }}>TRANSMIT MESSAGE BENEATH THE MOON</CardTitle>
          <CardDescription style={{ marginBottom: 20 }}>
            Bagikan pesan, wawasan riset, atau hikmah pengetahuan kepada sesama pencari kebenaran.
          </CardDescription>

          <form onSubmit={dispatchKnowledge}>
            <div style={{ marginBottom: 12, maxWidth: 320 }}>
              <Input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Operator alias (e.g. stargazer_07)"
              />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik pesan atau wawasan pengetahuan (maks 200 karakter) untuk disiarkan..."
                required
              />
              <Button type="submit" variant="primary">
                <Send size={15} /> TRANSMIT
              </Button>
            </div>
          </form>

          <div className="transmission-stream">
            {transmissions.map((tx) => (
              <Card key={tx.id} variant="default" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <b style={{ color: "var(--accent)", marginRight: "10px" }}>{tx.author}:</b>
                  <span>{tx.text}</span>
                </div>
                <Badge variant="outline">{tx.timestamp} // {tx.coordinates}</Badge>
              </Card>
            ))}
          </div>
        </Card>
      </section>

      {/* CROSS-ECOSYSTEM BRIDGE */}
      <section style={{ maxWidth: 1200, margin: "0 auto 80px", padding: "0 5vw" }}>
        <SectionHeader
          eyebrow="SOVEREIGN CONSTELLATION"
          title="ECOSYSTEM SATELLITE NODES"
          subtitle="Jelajahi node-node berdaulat lainnya di bawah naungan Empire of the Light."
          badgeVariant="cyan"
        />
        <EcosystemBridgeGrid excludeDna="moonwitness" />
      </section>
    </div>
  );
}
