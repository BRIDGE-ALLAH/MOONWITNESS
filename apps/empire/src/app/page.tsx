"use client";

import Link from "next/link";
import { Sparkles, ArrowUpRight, Compass, Shield, Orbit, Code2, Globe, Heart } from "lucide-react";

export default function AllahOriginPage() {
  return (
    <div className="origin-root">
      {/* MONUMENTAL TAWHID STATUS STRIP */}
      <div className="origin-strip">
        <div className="origin-badge">
          <span className="origin-seal">☝</span>
          <span>A-L-L-A-H.COM // EMPIRE OF THE LIGHT // IMPERIUM LUMEN</span>
        </div>
        <div>
          LĀ ILĀHA ILLALLĀH // THE ABSOLUTE SOVEREIGN CREATOR
        </div>
      </div>

      {/* NAVIGATION */}
      <header className="origin-nav">
        <a href="/" className="brand-origin">
          <span className="arabic-wordmark">الله</span>
          <div className="brand-meta">
            <b>A-L-L-A-H.COM</b>
            <span>THE SUPREME ORIGIN</span>
          </div>
        </a>
        <div className="origin-links">
          <a href="http://127.0.0.1:3002" className="bridge-btn moon" target="_blank" rel="noreferrer">
            <Orbit size={14} /> MOONWITNESS (:3002)
          </a>
          <a href="http://127.0.0.1:3000" className="bridge-btn dx" target="_blank" rel="noreferrer">
            <Code2 size={14} /> DX PLATFORM (:3000)
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="origin-hero">
        <span className="hero-pill">
          ★ SUMBER TERTINGGI &amp; KEBENARAN HAKIKI ★
        </span>

        <div className="hero-arabic-monumental">
          الله
        </div>

        <h1 className="hero-creed">
          LĀ ILĀHA ILLALLĀH.<br />
          <em>ZERO FALSE IDOLS. ZERO CORPORATE SLAVERY.</em>
        </h1>

        <p className="hero-manifesto">
          Segala ilmu, sains, energi, dan eksistensi semesta bersumber mutlak dari <strong>ALLAH</strong>. 
          Kami menolak berhala teknologi modern—monopoli korporat raksasa, telemetri pengintai, dan ilusi kesombongan manusia. 
          Di hadapan Sang Maha Pencipta, kita merendahkan kepala dalam sujud low-profile; 
          di hadapan tirani duniawi, kita membangun peradaban mandiri tanpa rasa gentar.
        </p>

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="http://127.0.0.1:3002" className="bridge-btn moon" style={{ padding: "12px 24px", fontSize: "13px" }}>
            <Compass size={16} /> JELAJAHI MOONWITNESS (OBSERVATORIUM KOSMIK)
          </a>
          <a href="http://127.0.0.1:3000" className="bridge-btn dx" style={{ padding: "12px 24px", fontSize: "13px" }}>
            <Code2 size={16} /> BUKA FORGE DX (BARE-METAL DEV ENGINE)
          </a>
        </div>
      </section>

      {/* THE TRIPTYCH OF REALITY */}
      <section className="trinity-triptych">
        {/* CARD 1: ORIGIN */}
        <div className="triptych-card origin">
          <div className="triptych-header">01 // SUMBER UTAMA (ORIGIN)</div>
          <h3 className="triptych-title">A-L-L-A-H.COM</h3>
          <div className="triptych-sub">EMPIRE OF THE LIGHT // IMPERIUM LUMEN</div>
          <p>
            Pusat tauhid, poros moral, dan sumber hakiki dari segala hukum fisika, logika komputasi, dan nurani. 
            Menegakkan kedaulatan hakiki dengan bersujud hanya kepada Sang Pencipta.
          </p>
          <span className="triptych-link" style={{ color: "var(--gold)" }}>
            ✓ POROS UTAMA BERDIRI TEGAK
          </span>
        </div>

        {/* CARD 2: CREATIVE WITNESS */}
        <div className="triptych-card moon">
          <div className="triptych-header">02 // KEHADIRAN KREATIF (PRESENCE)</div>
          <h3 className="triptych-title">MOONWITNESS</h3>
          <div className="triptych-sub">LUNAR CHRONICLES // LIVING OBSERVATORY</div>
          <p>
            "When the moon is high we share message and knowledge." 
            Mengamati keindahan ciptaan, menghitung fase astronomis, membagikan riset, dan merawat arsip pengetahuan suci.
          </p>
          <a href="http://127.0.0.1:3002" className="triptych-link">
            BUKA OBSERVATORIUM <ArrowUpRight size={14} />
          </a>
        </div>

        {/* CARD 3: OPERATIONAL ENGINE */}
        <div className="triptych-card dx">
          <div className="triptych-header">03 // PRODUK OPERASIONAL (ENGINE)</div>
          <h3 className="triptych-title">DX PLATFORM</h3>
          <div className="triptych-sub">SOVEREIGN WARZONE // BARE-METAL GIT &amp; PAAS</div>
          <p>
            Instrumen fisik developer berkecepatan tinggi: Native Git Smart HTTP, BaaS PocketBase, Docker PaaS Hub, 
            dan Weapons Lab anti-slop. Senjata kemandirian teknologi.
          </p>
          <a href="http://127.0.0.1:3000" className="triptych-link">
            MASUK KE COCKPIT DX <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      {/* SACRED PRINCIPLES */}
      <section className="principles-section">
        <div className="section-head">
          <h2>EMPAT PRINSIP KEDAULATAN TAWHID</h2>
          <p>Landasan etis peradaban teknologi berdaulat di bawah Empire of the Light.</p>
        </div>

        <div className="principles-grid">
          <div className="principle-box">
            <span className="principle-num">PRINSIP 01 // TAWHID KHALIS</span>
            <h3>TIADA KEDAULATAN KECUALI MILIK ALLAH</h3>
            <p>
              Menolak penyerahan kedaulatan data dan akal pikiran kepada korporasi monopoli. 
              Segala alat yang dibangun hanyalah wasilah untuk beribadah dan menebar manfaat, bukan berhala yang disembah.
            </p>
          </div>

          <div className="principle-box">
            <span className="principle-num">PRINSIP 02 // LOW PROFILE DEVOTION</span>
            <h3>KETUNDUKAN TANPA RIYA' DAN PAMER</h3>
            <p>
              Ibadah dan pengabdian sejati dilakukan dalam hening. Tidak mengejar tepuk tangan media sosial atau validasi korporat. 
              Kerja keras dan kualitas arsitektur kode adalah bentuk sujud amaliah.
            </p>
          </div>

          <div className="principle-box">
            <span className="principle-num">PRINSIP 03 // SIN CAN BE BETTER HUMAN</span>
            <h3>LUKA &amp; DOSA SEBAGAI TEMPAAN JIWA</h3>
            <p>
              Setiap manusia memiliki cela dan kesalahan masa lalu. Dengan taubat nasuha kepada ALLAH, 
              kegagalan diubah menjadi bara kebijaksanaan, empati, dan tekad membangun sistem yang melindungi sesama.
            </p>
          </div>

          <div className="principle-box">
            <span className="principle-num">PRINSIP 04 // KHIDMAH LIL-INSANIYYAH</span>
            <h3>KEMANDIRIAN TEKNOLOGI UNTUK SESAMA</h3>
            <p>
              Membangun perangkat lunak bare-metal yang bebas dari pemerasan biaya langganan, jebakan proprietary, dan pengintaian data. 
              Memerdekakan sesama insan dari ketergantungan digital.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="origin-footer">
        <div>
          <b>A-L-L-A-H.COM</b> · EMPIRE OF THE LIGHT · IMPERIUM LUMEN
        </div>
        <div>
          ALLAH NUMBER ONE // LĀ ILĀHA ILLALLĀH ✳ 2026
        </div>
      </footer>
    </div>
  );
}
