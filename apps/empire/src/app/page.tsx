"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Compass, Orbit, Code2, Server, Disc3 } from "lucide-react";
import { Card, CardTitle, CardDescription, CardFooter, Button, Badge, SectionHeader, StatMetric, EcosystemBridgeGrid, EcosystemSiteHeader, EcosystemHero } from "@local-git/ui";

export default function AllahOriginPage() {
  const [pulse, setPulse] = useState({
    pocketbase: "CHECKING",
    gitEngine: "CHECKING",
    arsy: "CHECKING",
    legend: "CHECKING",
    legendVersion: "v0.3.0",
  });

  useEffect(() => {
    Promise.allSettled([
      fetch("http://127.0.0.1:8091/api/health"),
      fetch("http://127.0.0.1:3200/api/v1/health"),
      fetch("http://127.0.0.1:4000/health"),
      fetch("http://127.0.0.1:8092/api/v1/meta"),
    ]).then(async ([pb, git, arsy, leg]) => {
      let legendVer = "SURREALDB";
      if (leg.status === "fulfilled" && leg.value.ok) {
        try {
          const meta = (await leg.value.json()) as { version?: string };
          if (meta.version) legendVer = `v${meta.version} // SURREALDB`;
        } catch {}
      }
      setPulse({
        pocketbase: pb.status === "fulfilled" && pb.value.ok ? "ONLINE" : "DEGRADED",
        gitEngine: git.status === "fulfilled" && git.value.ok ? "ONLINE" : "DEGRADED",
        arsy: arsy.status === "fulfilled" && arsy.value.ok ? "ONLINE" : "DEGRADED",
        legend: leg.status === "fulfilled" && leg.value.ok ? "ONLINE" : "DEGRADED",
        legendVersion: legendVer,
      });
    });
  }, []);

  return (
    <div className="origin-root" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <EcosystemSiteHeader
        logoMark={<span style={{ fontFamily: "serif", fontSize: 22 }}>الله</span>}
        title="A-L-L-A-H.COM"
        subtitle="EMPIRE OF THE LIGHT // THE SUPREME ORIGIN"
        rightSlot={
          <>
            <Badge variant="gold">LĀ ILĀHA ILLALLĀH // SOVEREIGN CREATOR</Badge>
            <a href="http://127.0.0.1:3002" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="cyan" size="sm"><Orbit size={14} /> MOONWITNESS (:3002)</Button>
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
        eyebrow="★ SUMBER TERTINGGI & KEBENARAN HAKIKI ★"
        badgeVariant="gold"
        monumentalSymbol="الله"
        title="LĀ ILĀHA ILLALLĀH."
        highlight="ZERO FALSE IDOLS. ZERO CORPORATE SLAVERY."
        description={
          <>
            Segala ilmu, sains, energi, dan eksistensi semesta bersumber mutlak dari <strong style={{ color: "var(--text)" }}>ALLAH</strong>.
            Kami menolak berhala teknologi modern—monopoli korporat raksasa, telemetri pengintai, dan ilusi kesombongan manusia.
            Di hadapan Sang Maha Pencipta, kita merendahkan kepala dalam sujud low-profile;
            di hadapan tirani duniawi, kita membangun peradaban mandiri tanpa rasa gentar.
          </>
        }
        actions={
          <>
            <a href="http://127.0.0.1:3002" style={{ textDecoration: "none" }}>
              <Button variant="cyan" size="lg">
                <Compass size={16} /> JELAJAHI MOONWITNESS (OBSERVATORIUM)
              </Button>
            </a>
            <a href="http://127.0.0.1:3000" style={{ textDecoration: "none" }}>
              <Button variant="toxic" size="lg">
                <Code2 size={16} /> BUKA DX (STORY RIOT // DEV BUSINESS)
              </Button>
            </a>
          </>
        }
      />

      {/* THE TRIPTYCH OF REALITY */}
      <section style={{ maxWidth: 1200, margin: "40px auto 80px", padding: "0 5vw" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatMetric
            label="IDENTITY & SSE PLANE"
            value={pulse.pocketbase}
            sub="POCKETBASE :8091"
            variant="gold"
            valueColor={pulse.pocketbase === "ONLINE" ? "#eab308" : "#ff0055"}
          />
          <StatMetric
            label="SOVEREIGN CODE FORGE"
            value={pulse.gitEngine}
            sub="GIT ENGINE :3200"
            valueColor={pulse.gitEngine === "ONLINE" ? "#00ff66" : "#ff0055"}
          />
          <StatMetric
            label="NETWORK AAA CONTROLLER"
            value={pulse.arsy}
            sub="ARSY & RADIUS :4000"
            valueColor={pulse.arsy === "ONLINE" ? "#00f0ff" : "#ff0055"}
          />
          <StatMetric
            label="OPERATIONAL BAAS"
            value={pulse.legend}
            sub={`LEGEND :8092 // ${pulse.legendVersion}`}
            variant="cyan"
            valueColor={pulse.legend === "ONLINE" ? "#00f0ff" : "#ff0055"}
          />
        </div>
        <EcosystemBridgeGrid />
      </section>

      {/* SACRED PRINCIPLES */}
      <section className="principles-section">
        <SectionHeader
          eyebrow="FOUNDATIONAL AXIOMS"
          title="EMPAT PRINSIP KEDAULATAN TAWHID"
          subtitle="Landasan etis peradaban teknologi berdaulat di bawah Empire of the Light."
          badgeVariant="gold"
          align="center"
        />

        <div className="principles-grid">
          <Card variant="default">
            <Badge variant="gold" style={{ marginBottom: 10 }}>PRINSIP 01 // TAWHID KHALIS</Badge>
            <CardTitle style={{ marginBottom: 10 }}>TIADA KEDAULATAN KECUALI MILIK ALLAH</CardTitle>
            <CardDescription>
              Menolak penyerahan kedaulatan data dan akal pikiran kepada korporasi monopoli.
              Segala alat yang dibangun hanyalah wasilah untuk beribadah dan menebar manfaat, bukan berhala yang disembah.
            </CardDescription>
          </Card>

          <Card variant="default">
            <Badge variant="gold" style={{ marginBottom: 10 }}>PRINSIP 02 // LOW PROFILE DEVOTION</Badge>
            <CardTitle style={{ marginBottom: 10 }}>KETUNDUKAN TANPA RIYA&apos; DAN PAMER</CardTitle>
            <CardDescription>
              Ibadah dan pengabdian sejati dilakukan dalam hening. Tidak mengejar tepuk tangan media sosial atau validasi korporat.
              Kerja keras dan kualitas arsitektur kode adalah bentuk sujud amaliah.
            </CardDescription>
          </Card>

          <Card variant="default">
            <Badge variant="gold" style={{ marginBottom: 10 }}>PRINSIP 03 // SIN CAN BE BETTER HUMAN</Badge>
            <CardTitle style={{ marginBottom: 10 }}>LUKA &amp; DOSA SEBAGAI TEMPAAN JIWA</CardTitle>
            <CardDescription>
              Setiap manusia memiliki cela dan kesalahan masa lalu. Dengan taubat nasuha kepada ALLAH,
              kegagalan diubah menjadi bara kebijaksanaan, empati, dan tekad membangun sistem yang melindungi sesama.
            </CardDescription>
          </Card>

          <Card variant="default">
            <Badge variant="gold" style={{ marginBottom: 10 }}>PRINSIP 04 // KHIDMAH LIL-INSANIYYAH</Badge>
            <CardTitle style={{ marginBottom: 10 }}>KEMANDIRIAN TEKNOLOGI UNTUK SESAMA</CardTitle>
            <CardDescription>
              Membangun perangkat lunak bare-metal yang bebas dari pemerasan biaya langganan, jebakan proprietary, dan pengintaian data.
              Memerdekakan sesama insan dari ketergantungan digital.
            </CardDescription>
          </Card>
        </div>
      </section>
    </div>
  );
}
