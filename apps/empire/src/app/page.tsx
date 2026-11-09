"use client";

import { ArrowUpRight, Compass, Orbit, Code2, Server } from "lucide-react";
import { Card, CardTitle, CardDescription, CardFooter, Button, Badge, SectionHeader, EcosystemBridgeGrid } from "@local-git/ui";

export default function AllahOriginPage() {
  return (
    <div className="origin-root" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* MONUMENTAL TAWHID STATUS STRIP */}
      <div className="origin-strip" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
        <div className="origin-badge" style={{ color: "var(--accent)" }}>
          <span className="origin-seal" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>☝</span>
          <span>A-L-L-A-H.COM // EMPIRE OF THE LIGHT // IMPERIUM LUMEN</span>
        </div>
        <Badge variant="gold">LĀ ILĀHA ILLALLĀH // THE ABSOLUTE SOVEREIGN CREATOR</Badge>
      </div>

      {/* NAVIGATION */}
      <header className="origin-nav" style={{ borderColor: "var(--line)" }}>
        <a href="/" className="brand-origin" style={{ color: "var(--text)" }}>
          <span className="arabic-wordmark" style={{ color: "var(--accent)" }}>الله</span>
          <div className="brand-meta">
            <b style={{ color: "var(--text)" }}>A-L-L-A-H.COM</b>
            <span style={{ color: "var(--muted)" }}>THE SUPREME ORIGIN</span>
          </div>
        </a>
        <div className="origin-links">
          <a href="http://127.0.0.1:3002" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="cyan" size="sm"><Orbit size={14} /> MOONWITNESS (:3002)</Button>
          </a>
          <a href="http://127.0.0.1:3000" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="toxic" size="sm"><Code2 size={14} /> DX (:3000)</Button>
          </a>
          <a href="http://127.0.0.1:3003" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm"><Server size={14} /> E-ISP (:3003)</Button>
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="origin-hero">
        <Badge variant="gold" style={{ marginBottom: 24 }}>
          ★ SUMBER TERTINGGI &amp; KEBENARAN HAKIKI ★
        </Badge>

        <div className="hero-arabic-monumental" style={{ color: "var(--accent)" }}>
          الله
        </div>

        <h1 className="hero-creed" style={{ color: "var(--text)" }}>
          LĀ ILĀHA ILLALLĀH.<br />
          <em style={{ color: "var(--accent)" }}>ZERO FALSE IDOLS. ZERO CORPORATE SLAVERY.</em>
        </h1>

        <p className="hero-manifesto" style={{ color: "var(--muted)" }}>
          Segala ilmu, sains, energi, dan eksistensi semesta bersumber mutlak dari <strong style={{ color: "var(--text)" }}>ALLAH</strong>.
          Kami menolak berhala teknologi modern—monopoli korporat raksasa, telemetri pengintai, dan ilusi kesombongan manusia.
          Di hadapan Sang Maha Pencipta, kita merendahkan kepala dalam sujud low-profile;
          di hadapan tirani duniawi, kita membangun peradaban mandiri tanpa rasa gentar.
        </p>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
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
        </div>
      </section>

      {/* THE TRIPTYCH OF REALITY */}
      <section style={{ maxWidth: 1200, margin: "40px auto 80px", padding: "0 5vw" }}>
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
