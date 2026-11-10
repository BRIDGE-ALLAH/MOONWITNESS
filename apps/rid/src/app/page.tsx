"use client";

import { useEffect, useState } from "react";
import { Music, Flame, Zap, Disc3, Plus } from "lucide-react";
import { Card, Button, Badge, Input, ProceduralLogo, ProceduralGlyph } from "@local-git/ui";

interface SoulPatch {
  id: string;
  title: string;
  chord: string;
  motto: string;
  variant?: "toxic" | "cyan" | "gold";
}

export default function RootIdPage() {
  const [tempo] = useState<number>(142);
  const [patchTitle, setPatchTitle] = useState("");
  const [patchMotto, setPatchMotto] = useState("");
  const [saving, setSaving] = useState(false);
  const [patches, setPatches] = useState<SoulPatch[]>([
    {
      id: "sp-01",
      title: "ROOTS // NOT ROCK BUT SOUL",
      chord: "A-Minor 2-Tone",
      motto: "Pure ska syncopation on the 2nd and 4th beats. Zero electronic pretense.",
      variant: "gold",
    },
    {
      id: "sp-02",
      title: "SKANG ATTACK // BRASS RIOT",
      chord: "D-Minor Kingston",
      motto: "Fast staccato rhythm through a 1968 analog tube amp. Raw and uncompressed.",
      variant: "toxic",
    },
    {
      id: "sp-03",
      title: "DUB CONSCIENCE // SURREAL ECHO",
      chord: "G-Minor Tape Delay",
      motto: "Low-frequency space echo recorded beneath celestial moonwitness observation.",
      variant: "cyan",
    },
  ]);

  const loadPatchesFromSurreal = async () => {
    try {
      const res = await fetch("/api/legend/patches");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPatches(data);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadPatchesFromSurreal();
  }, []);

  const playSkangChord = (frequency = 440) => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // 3-note ska organ/guitar staccato stab
      [frequency, frequency * 1.25, frequency * 1.5].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);

        // Instant attack, fast decay to emulate vintage chop
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      });
    } catch {}
  };

  const handleCreatePatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patchTitle.trim()) return;
    setSaving(true);
    const newTitle = patchTitle.trim().toUpperCase();
    const newMotto = patchMotto.trim() || "Analog frequency stitched into the sovereign identity tapestry.";

    try {
      const res = await fetch("/api/legend/patches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          chord: "C-Major Skang Chop",
          motto: newMotto,
          variant: "toxic",
          status: "stitched",
        }),
      });

      if (res.ok) {
        await loadPatchesFromSurreal();
      } else {
        // Optimistic fallback
        setPatches((prev) => [
          {
            id: `sp-${Date.now()}`,
            title: newTitle,
            chord: "C-Major Skang Chop",
            motto: newMotto,
            variant: "toxic",
          },
          ...prev,
        ]);
      }
    } catch {
      setPatches((prev) => [
        {
          id: `sp-${Date.now()}`,
          title: newTitle,
          chord: "C-Major Skang Chop",
          motto: newMotto,
          variant: "toxic",
        },
        ...prev,
      ]);
    } finally {
      setSaving(false);
      setPatchTitle("");
      setPatchMotto("");
      playSkangChord(523.25);
    }
  };

  return (
    <div className="relative min-h-screen text-amber-100 flex flex-col items-center px-4 py-12 md:py-16 select-none font-mono">
      {/* Root ID Psychedelic Skang Header */}
      <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-4">
        <div className="relative group cursor-pointer" onClick={() => playSkangChord(440)}>
          <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-700" />
          <ProceduralLogo dna="rid" size={96} className="relative transition-transform duration-500 hover:rotate-180 hover:scale-110" />
        </div>

        <div>
          <Badge variant="gold" className="tracking-widest uppercase text-xs px-3 py-1 bg-orange-500/10 text-orange-400 border-orange-500/40">
            <Flame size={12} className="inline mr-1 text-orange-400" /> ROOT ID // NOT ROCK BUT SOUL
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-b from-orange-200 via-amber-400 to-rose-600 mt-2">
            RID // SOUL NOT ROCK FORGE
          </h1>
          <p className="text-xs md:text-sm text-orange-200/60 max-w-lg mx-auto mt-1 font-sans">
            Analog Web Audio Skang Synth, Identity Sound Patches & Decentralized Soul Tapestry.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="toxic"
            size="sm"
            soundDna="rid"
            onClick={() => playSkangChord(440)}
          >
            <Zap size={14} className="mr-1.5" /> TRIGGER A-MIN CHOP
          </Button>
          <Button
            variant="gold"
            size="sm"
            soundDna="rid"
            onClick={() => playSkangChord(587.33)}
          >
            <Music size={14} className="mr-1.5" /> TRIGGER D-MIN CHOP
          </Button>
        </div>
      </div>

      {/* Rhythm Dial & Soundboard Telemetry */}
      <div className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 z-10">
        <Card variant="gold" className="bg-stone-950/70 border-orange-500/30">
          <div className="text-[10px] text-orange-400/70 tracking-wider">SKANK TEMPO</div>
          <div className="text-xl font-bold text-orange-200 mt-1 flex items-center gap-2">
            <Disc3 size={18} className="text-orange-400 animate-spin" /> {tempo} BPM
          </div>
          <div className="text-[10px] text-orange-400/50 mt-1">2-Tone Upstroke Sync</div>
        </Card>

        <Card variant="gold" className="bg-stone-950/70 border-orange-500/30">
          <div className="text-[10px] text-orange-400/70 tracking-wider">HARMONIC SCALE</div>
          <div className="text-lg font-bold text-orange-200 mt-1">Pentatonic Minor</div>
          <div className="text-[10px] text-orange-400/50 mt-1">Roots Reggae Mode</div>
        </Card>

        <Card variant="gold" className="bg-stone-950/70 border-orange-500/30">
          <div className="text-[10px] text-orange-400/70 tracking-wider">AUDIO SYNTH ENGINE</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">Web Audio API</div>
          <div className="text-[10px] text-orange-400/50 mt-1">0 External MP3 Files</div>
        </Card>

        <Card variant="gold" className="bg-stone-950/70 border-orange-500/30">
          <div className="text-[10px] text-orange-400/70 tracking-wider">PERSISTED PATCHES</div>
          <div className="text-lg font-bold text-orange-300 mt-1">{patches.length} STITCHED</div>
          <div className="text-[10px] text-orange-400/50 mt-1">SurrealDB Soul DB</div>
        </Card>
      </div>

      {/* Soul Patch Sticher Console & Grid */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 z-10">
        {/* Creator Input */}
        <div className="md:col-span-1">
          <Card variant="toxic" className="bg-stone-950/80 border-orange-500/30 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-orange-500/20 pb-3">
                <Flame size={16} className="text-orange-400" />
                <h3 className="text-sm font-bold text-orange-200 tracking-wider uppercase">STITCH SOUL PATCH</h3>
              </div>
              <form onSubmit={handleCreatePatch} className="space-y-3">
                <div>
                  <label className="text-[10px] text-orange-400/70 uppercase">Patch Anthem / Title</label>
                  <Input
                    placeholder="e.g. TRENCHTOWN PRESSURE"
                    value={patchTitle}
                    onChange={(e) => setPatchTitle(e.target.value)}
                    className="bg-black/50 border-orange-500/30 text-orange-100 text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-orange-400/70 uppercase">Moral Manifesto / Creed</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the sonic intention..."
                    value={patchMotto}
                    onChange={(e) => setPatchMotto(e.target.value)}
                    className="w-full bg-black/50 border border-orange-500/30 rounded-sm text-orange-100 text-xs p-2 mt-1 focus:outline-none focus:border-orange-400"
                  />
                </div>
                <Button type="submit" variant="toxic" size="sm" soundDna="rid" className="w-full" disabled={saving}>
                  <Plus size={14} className="mr-1.5" /> {saving ? "STITCHING TO SURREALDB..." : "STITCH INTO SURREALDB"}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Patch List */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-orange-500/20 pb-2 px-1">
            <span className="text-xs text-orange-300 font-bold flex items-center gap-2">
              <ProceduralGlyph dna="rid" index={1} size={14} /> ACTIVE SOUL PATCH TAPESTRY ({patches.length})
            </span>
            <span className="text-[10px] text-orange-400/60 font-sans">Click card to hear acoustic signature</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {patches.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => playSkangChord(440 + idx * 60)}
                className="p-4 bg-stone-950/60 border border-orange-500/20 rounded-sm hover:border-orange-400/70 hover:shadow-[0_0_15px_rgba(255,85,0,0.15)] transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start pb-2 mb-2 border-b border-orange-500/10">
                  <span className="text-xs font-bold text-orange-300 group-hover:text-orange-200">{p.title}</span>
                  <span className="text-[10px] text-orange-400/60">{p.chord}</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed font-sans">{p.motto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
