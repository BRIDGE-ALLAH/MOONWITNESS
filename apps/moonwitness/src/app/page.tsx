"use client";

import { useState } from "react";
import { Moon, Orbit, Send, Radio, Compass, Sparkles } from "lucide-react";
import { Card, Button, Badge, Input, ProceduralLogo, ProceduralGlyph } from "@local-git/ui";

interface Transmission {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  coordinates: string;
}

export default function MoonWitnessPage() {
  const [moonData] = useState({
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

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const decDeg = 10 + (Date.now() % 21);
    const newTx: Transmission = {
      id: `mw-${Date.now()}`,
      author: authorName.trim() ? `@${authorName.trim()}` : "@anonymous-witness",
      text: message.trim(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC",
      coordinates: `RA 05h 12m / Dec +${decDeg}° 15'`,
    };
    setTransmissions([newTx, ...transmissions]);
    setMessage("");
  };

  return (
    <div className="relative min-h-screen text-cyan-100 flex flex-col items-center px-4 py-12 md:py-16 select-none font-mono">
      {/* Astral Observatory HUD Header */}
      <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-700" />
          <ProceduralLogo dna="moonwitness" size={88} className="relative transition-transform duration-700 hover:scale-110" />
        </div>

        <div>
          <Badge variant="cyan" className="tracking-widest uppercase text-xs px-3 py-1">
            <Sparkles size={12} className="inline mr-1" /> CELESTIAL ARCHIVE & OBSERVATORY
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-cyan-300 to-sky-600 mt-2">
            MOONWITNESS // ASTRONOMY COCKPIT
          </h1>
          <p className="text-xs md:text-sm text-cyan-200/60 max-w-lg mx-auto mt-1">
            Live Telemetry, Lunar Chronometry, and Decentralized Celestial Transmissions.
          </p>
        </div>
      </div>

      {/* Lunar Phase & Horizon Telemetry Bar */}
      <div className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 z-10">
        <Card variant="cyan" className="bg-sky-950/40 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider">LUNAR PHASE</div>
          <div className="text-lg font-bold text-cyan-200 mt-1 flex items-center gap-2">
            <Moon size={18} className="text-cyan-400" /> {moonData.phase}
          </div>
          <div className="text-[10px] text-cyan-400/50 mt-1">{moonData.illumination} Illumination</div>
        </Card>

        <Card variant="cyan" className="bg-sky-950/40 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider">ALTITUDE & AZIMUTH</div>
          <div className="text-lg font-bold text-cyan-200 mt-1">{moonData.altitude}</div>
          <div className="text-[10px] text-cyan-400/50 mt-1">Azimuth {moonData.azimuth}</div>
        </Card>

        <Card variant="cyan" className="bg-sky-950/40 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider">LUNAR AGE</div>
          <div className="text-lg font-bold text-cyan-200 mt-1">{moonData.ageDays} Days</div>
          <div className="text-[10px] text-cyan-400/50 mt-1">Synodic Cycle 29.53d</div>
        </Card>

        <Card variant="cyan" className="bg-sky-950/40 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider">NEXT FULL MOON</div>
          <div className="text-lg font-bold text-cyan-300 mt-1">{moonData.nextFullMoon}</div>
          <div className="text-[10px] text-cyan-400/50 mt-1">Astronomical Epoch</div>
        </Card>
      </div>

      {/* Main Observatory Split View: Broadcast Form & Feed */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 z-10">
        {/* Transmission Input Console */}
        <div className="md:col-span-1">
          <Card variant="cyan" className="bg-sky-950/50 border-cyan-500/30 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-3">
                <Radio size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-cyan-200 tracking-wider">DISPATCH SIGNAL</h3>
              </div>
              <form onSubmit={handleTransmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-cyan-400/70 uppercase">Observer Call-Sign</label>
                  <Input
                    placeholder="e.g. stargazer_07"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="bg-black/50 border-cyan-500/30 text-cyan-100 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-cyan-400/70 uppercase">Witness Observation Log</label>
                  <textarea
                    rows={4}
                    placeholder="Log celestial coordinates, atmospheric clarity..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded-sm text-cyan-100 text-xs p-2 mt-1 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <Button type="submit" variant="cyan" size="sm" soundDna="moonwitness" className="w-full">
                  <Send size={14} className="mr-1.5" /> BROADCAST BEACON
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Live Feed List */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 px-1">
            <span className="text-xs text-cyan-400/80 font-bold flex items-center gap-2">
              <ProceduralGlyph dna="moonwitness" index={1} size={14} /> LIVE WITNESS RADAR FEED ({transmissions.length})
            </span>
            <span className="text-[10px] text-cyan-400/50">ENCRYPTED SSE SYNC</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {transmissions.map((t) => (
              <div
                key={t.id}
                className="p-4 bg-sky-950/30 border border-cyan-500/20 rounded-sm hover:border-cyan-400/50 transition-colors"
              >
                <div className="flex justify-between items-start text-[10px] text-cyan-400/60 pb-2 mb-2 border-b border-cyan-500/10">
                  <span className="text-cyan-300 font-bold">{t.author}</span>
                  <span>{t.coordinates} · {t.timestamp}</span>
                </div>
                <p className="text-xs text-cyan-100 leading-relaxed font-sans">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
