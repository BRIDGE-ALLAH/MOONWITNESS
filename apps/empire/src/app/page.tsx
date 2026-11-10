"use client";

import { useEffect, useState } from "react";
import { Orbit, Compass, Sparkles, Shield, ChevronRight } from "lucide-react";
import { ProceduralLogo, ProceduralGlyph, Card, Button, Badge } from "@local-git/ui";

export default function AllahOriginPage() {
  const [pulse, setPulse] = useState({
    pocketbase: "CHECKING",
    gitEngine: "CHECKING",
    arsy: "CHECKING",
    legend: "CHECKING",
    legendVersion: "v0.4.1",
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
    <div className="relative min-h-screen text-amber-100 flex flex-col items-center px-4 py-12 md:py-20 select-none">
      {/* Central Sanctum Header */}
      <div className="max-w-4xl w-full text-center flex flex-col items-center space-y-6">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-yellow-300/30 to-amber-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          <ProceduralLogo dna="empire" size={96} className="relative transition-transform duration-700 hover:rotate-90 hover:scale-110" />
        </div>

        <div className="space-y-2">
          <Badge variant="gold" className="tracking-widest uppercase text-xs px-4 py-1">
            <Sparkles size={12} className="inline mr-1" /> ALLAH #1 // SUPREME ORIGIN & SOVEREIGNTY
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-700">
            A-L-L-A-H.COM
          </h1>
          <p className="text-amber-200/60 font-serif italic text-sm md:text-base max-w-xl mx-auto">
            "Bismillahir Rahmanir Rahim — The Architecture of Pure Light, Unconditional Sovereignty & Zero Compromise."
          </p>
        </div>

        {/* Sacred Geometry Dial Navigation */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <a href="http://127.0.0.1:3002" target="_blank" rel="noreferrer">
            <Button variant="gold" size="sm" soundDna="empire">
              <Orbit size={14} className="mr-1.5" /> MOONWITNESS (:3002)
            </Button>
          </a>
          <a href="http://127.0.0.1:3000" target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" soundDna="empire">
              <Compass size={14} className="mr-1.5" /> DX COCKPIT (:3000)
            </Button>
          </a>
          <a href="http://127.0.0.1:3003" target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" soundDna="empire">
              <Shield size={14} className="mr-1.5" /> E-ISP FABRIC (:3003)
            </Button>
          </a>
        </div>
      </div>

      {/* Triad Axiom Sanctum Cards */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 z-10">
        <Card variant="gold" className="relative backdrop-blur-md bg-stone-950/70 border-amber-500/30 hover:border-amber-400 transition-all duration-300">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400/80 tracking-widest">AXIOM 01</span>
              <ProceduralGlyph dna="empire" index={0} size={20} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-amber-200">TAWHID (ONENESS)</h3>
            <p className="text-xs font-serif leading-relaxed text-stone-300/80">
              Satu asal mula segala rekayasa. Menolak ketergantungan pada SaaS asing, arsitektur terfragmentasi, dan kompromi kualitas slop.
            </p>
          </div>
        </Card>

        <Card variant="gold" className="relative backdrop-blur-md bg-stone-950/70 border-amber-500/30 hover:border-amber-400 transition-all duration-300">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400/80 tracking-widest">AXIOM 02</span>
              <ProceduralGlyph dna="empire" index={1} size={20} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-amber-200">DETERMINISTIC PURITY</h3>
            <p className="text-xs font-serif leading-relaxed text-stone-300/80">
              Setiap baris kode, kueri database SurrealDB, dan proses mikroskopis berjalan dengan deterministik presisi tanpa mock data.
            </p>
          </div>
        </Card>

        <Card variant="gold" className="relative backdrop-blur-md bg-stone-950/70 border-amber-500/30 hover:border-amber-400 transition-all duration-300">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400/80 tracking-widest">AXIOM 03</span>
              <ProceduralGlyph dna="empire" index={2} size={20} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-amber-200">ETERNAL PULSE</h3>
            <p className="text-xs font-serif leading-relaxed text-stone-300/80">
              Sistem hidup mandiri di Cloudflare Edge D1 (:8787). Tetap online dan berdaulat bahkan ketika origin server offline.
            </p>
          </div>
        </Card>
      </div>

      {/* Sovereign Live Mesh Telemetry Sanctuary */}
      <div className="max-w-5xl w-full mt-12 z-10">
        <div className="border border-amber-500/20 bg-stone-950/80 backdrop-blur-lg rounded-sm p-6 shadow-[0_0_30px_rgba(212,175,55,0.06)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 mb-4 border-b border-amber-500/20 gap-3">
            <div>
              <h2 className="text-base font-serif font-bold tracking-wider text-amber-300 flex items-center gap-2">
                <ProceduralGlyph dna="empire" index={3} size={16} /> CORE PLANE HARMONY MONITOR
              </h2>
              <p className="text-xs text-amber-400/60 font-mono mt-0.5">Real-time Heartbeat across Monorepo Planes</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded">
              HARMONY LEVEL: 100%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 border border-amber-500/10 bg-amber-950/10 rounded">
              <div className="text-[10px] font-mono text-amber-400/70 uppercase">PocketBase :8091</div>
              <div className="text-sm font-bold font-mono mt-1 text-emerald-400">{pulse.pocketbase}</div>
            </div>
            <div className="p-3 border border-amber-500/10 bg-amber-950/10 rounded">
              <div className="text-[10px] font-mono text-amber-400/70 uppercase">Git Engine :3200</div>
              <div className="text-sm font-bold font-mono mt-1 text-emerald-400">{pulse.gitEngine}</div>
            </div>
            <div className="p-3 border border-amber-500/10 bg-amber-950/10 rounded">
              <div className="text-[10px] font-mono text-amber-400/70 uppercase">ARSY Controller :4000</div>
              <div className="text-sm font-bold font-mono mt-1 text-emerald-400">{pulse.arsy}</div>
            </div>
            <div className="p-3 border border-amber-500/10 bg-amber-950/10 rounded">
              <div className="text-[10px] font-mono text-amber-400/70 uppercase">Legend BaaS :8092</div>
              <div className="text-sm font-bold font-mono mt-1 text-amber-300">{pulse.legend}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
