"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Orbit, Compass, Sparkles, Send, ShieldCheck, ArrowUpRight, BookOpen, Radio, Code2, Sun } from "lucide-react";

interface Transmission {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  coordinates: string;
}

export default function MoonWitnessPage() {
  const [moonData, setMoonData] = useState({
    phase: "Waxing Gibbous",
    illumination: "87%",
    ageDays: "10.4",
    altitude: "+54°22'18\"",
    azimuth: "138°12'04\"",
    nextFullMoon: "In 4.2 Days"
  });

  const [message, setMessage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [transmissions, setTransmissions] = useState<Transmission[]>([
    {
      id: "mw-01",
      author: "@lunar-observer-1",
      text: "When the moon reaches its zenith, clarity descends upon the seeker. Knowledge is light gifted by the Supreme Creator.",
      timestamp: "2026-11-10 03:42 UTC",
      coordinates: "RA 04h 35m / Dec +16° 30'"
    },
    {
      id: "mw-02",
      author: "@sovereign-scribe",
      text: "We record history not for corporate analytics, but for the moral elevation of humankind beneath the celestial canopy.",
      timestamp: "2026-11-09 22:15 UTC",
      coordinates: "RA 03h 12m / Dec +12° 05'"
    },
    {
      id: "mw-03",
      author: "@astronomer-tauhid",
      text: "Calculations confirm: every orbital period follows immutable mathematical constants. Nothing exists in chaos; all is by design.",
      timestamp: "2026-11-09 18:00 UTC",
      coordinates: "RA 02h 55m / Dec +09° 44'"
    }
  ]);

  useEffect(() => {
    // Astronomical lunar phase calculation approximation for current date
    const now = new Date();
    const cycle = 29.53058867; // Synodic month days
    const baseDate = new Date("2000-01-06T18:14:00Z"); // Known new moon
    const diffDays = (now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
    const phaseValue = (diffDays % cycle + cycle) % cycle;
    const illuminationPercent = Math.round((1 - Math.cos((phaseValue / cycle) * 2 * Math.PI)) / 2 * 100);

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
      nextFullMoon: phaseValue < 15 ? `In ${(14.8 - phaseValue).toFixed(1)} Days` : `In ${(cycle - phaseValue + 14.8).toFixed(1)} Days`
    });
  }, []);

  const dispatchKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newTx: Transmission = {
      id: `mw-${Date.now().toString().slice(-4)}`,
      author: authorName.trim() ? `@${authorName.trim()}` : "@anonymous-witness",
      text: message.trim(),
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC",
      coordinates: `RA 05h ${(Math.random() * 50).toFixed(0).padStart(2, "0")}m / Dec +${(Math.random() * 20).toFixed(0)}°`
    };
    setTransmissions((prev) => [newTx, ...prev]);
    setMessage("");
  };

  return (
    <div className="lunar-root">
      {/* STATUS STRIP */}
      <div className="lunar-strip">
        <div className="lunar-phase-pill">
          <Moon size={13} />
          <span>CELESTIAL OBSERVATORY // LUNAR PHASE: {moonData.phase.toUpperCase()} ({moonData.illumination})</span>
        </div>
        <div>
          ARCHIVE NODE ACTIVE // REAL-TIME EPHEMERIS SYNCED
        </div>
      </div>

      {/* TOP NAVIGATION */}
      <header className="lunar-nav">
        <a href="/" className="brand-lunar">
          <div className="lunar-crest">
            <Moon size={20} />
          </div>
          <div className="brand-meta">
            <b>MOONWITNESS</b>
            <span>THE LIVING OBSERVATORY &amp; ARCHIVE</span>
          </div>
        </a>

        <div className="lunar-nav-links">
          <a href="http://127.0.0.1:3001" className="bridge-link gold" target="_blank" rel="noreferrer">
            <Sparkles size={14} /> EMPIRE (A-L-L-A-H.COM :3001)
          </a>
          <a href="http://127.0.0.1:3000" className="bridge-link toxic" target="_blank" rel="noreferrer">
            <Code2 size={14} /> DX FORGE (:3000)
          </a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="lunar-hero">
        <div className="motto-banner">
          ★ WHEN THE MOON IS HIGH WE SHARE MESSAGE AND KNOWLEDGE ★
        </div>

        <h1>
          THE CELESTIAL WITNESS.<br />
          <span>PRESERVING SACRED KNOWLEDGE.</span>
        </h1>

        <p>
          MoonWitness adalah observatorium hidup dan penjaga arsip ilmu pengetahuan semesta. 
          Ketika malam tiba dan rembulan meninggi, kami mengumpulkan hikmah, sains astronomis, 
          dan refleksi hakiki untuk dibagikan kepada umat manusia secara bebas tanpa sensor korporat.
        </p>

        {/* LUNAR TELEMETRY PANEL */}
        <div className="lunar-telemetry-panel">
          <div className="telemetry-item">
            <span>CURRENT LUNAR PHASE</span>
            <b className="active">{moonData.phase}</b>
          </div>
          <div className="telemetry-item">
            <span>SURFACE ILLUMINATION</span>
            <b>{moonData.illumination}</b>
          </div>
          <div className="telemetry-item">
            <span>SYNODIC AGE</span>
            <b>{moonData.ageDays} DAYS</b>
          </div>
          <div className="telemetry-item">
            <span>ESTIMATED FULL MOON</span>
            <b>{moonData.nextFullMoon}</b>
          </div>
        </div>
      </section>

      {/* KNOWLEDGE SCROLLS & ARTICLES */}
      <section className="archive-section">
        <div className="archive-head">
          <div>
            <h2>LUNAR CHRONICLES &amp; SACRED SCROLLS</h2>
            <p>Arsip riset, kartografi kosmik, dan transmisi pengetahuan pilihan.</p>
          </div>
          <div style={{ color: "var(--cyan)", font: "11px var(--mono)", fontWeight: 700 }}>
            /// TOTAL SCROLLS INDEXED: 03
          </div>
        </div>

        <div className="knowledge-grid">
          <div className="scroll-card">
            <span className="scroll-tag">ASTRONOMY &amp; TAWHID // 01</span>
            <h3>Matahari dan Bulan Beredar Menurut Perhitungan</h3>
            <p>
              Hukum gravitasi dan keharmonisan orbit tata surya membuktikan ketertiban absolut yang mustahil lahir dari kebetulan buta.
            </p>
            <div className="scroll-author">
              <span>KURATOR: @moon-archive</span>
              <span>EPHEMERIS VERIFIED</span>
            </div>
          </div>

          <div className="scroll-card">
            <span className="scroll-tag">EPISTEMIC SOVEREIGNTY // 02</span>
            <h3>Kemandirian Arsip Pengetahuan di Era Digital</h3>
            <p>
              Mengapa ilmu pengetahuan tidak boleh dipagari oleh paywall jurnal predator dan algoritma rekomendasi beracun.
            </p>
            <div className="scroll-author">
              <span>KURATOR: @scribe-omega</span>
              <span>FREE ACCESS</span>
            </div>
          </div>

          <div className="scroll-card">
            <span className="scroll-tag">MORAL PHILOSOPHY // 03</span>
            <h3>Sin Can Be Better Human: Doktrin Pertobatan &amp; Aksi</h3>
            <p>
              Bagaimana luka dan kesalahan masa lalu dapat ditempa menjadi sumber kebaikan terbesar ketika bersujud kembali kepada Sang Pencipta.
            </p>
            <div className="scroll-author">
              <span>KURATOR: @witness-xi</span>
              <span>CANONICAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE MESSAGE DISPATCHER */}
      <section className="message-dispatcher">
        <div className="dispatcher-title">TRANSMIT MESSAGE BENEATH THE MOON</div>
        <div className="dispatcher-sub">
          Bagikan pesan, wawasan riset, atau hikmah pengetahuan kepada sesama pencari kebenaran.
        </div>

        <form onSubmit={dispatchKnowledge}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Operator alias (e.g. stargazer_07)"
              className="dispatcher-input"
              style={{ maxWidth: "280px" }}
            />
          </div>
          <div className="dispatcher-input-box">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan atau wawasan pengetahuan untuk disiarkan..."
              className="dispatcher-input"
              required
            />
            <button type="submit" className="dispatcher-btn">
              <Send size={15} style={{ display: "inline", marginRight: "6px" }} /> TRANSMIT
            </button>
          </div>
        </form>

        <div className="transmission-stream">
          {transmissions.map((tx) => (
            <div key={tx.id} className="transmission-row">
              <div>
                <b style={{ color: "var(--cyan)", marginRight: "10px" }}>{tx.author}:</b>
                <span>{tx.text}</span>
              </div>
              <div style={{ textAlign: "right", whiteSpace: "nowrap", marginLeft: "14px" }}>
                <small>{tx.timestamp} // {tx.coordinates}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lunar-footer">
        <div>
          <b>MOONWITNESS</b> · WHEN THE MOON IS HIGH WE SHARE MESSAGE AND KNOWLEDGE · 2026
        </div>
        <div>
          CELESTIAL ARCHIVE · SATELLITE CARTOGRAPHY · LIVING OBSERVATORY
        </div>
      </footer>
    </div>
  );
}

