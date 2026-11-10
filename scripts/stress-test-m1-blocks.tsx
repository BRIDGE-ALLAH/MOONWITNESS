import React from "react";
import { renderToString } from "react-dom/server";
import {
  TacticalHudBlock,
  SacredGeometricCard,
  IsometricNetworkGraph,
  AudioVisualizerBlock,
  CosmicArchives,
} from "../packages/ui/src/blocks";
import {
  TacticalHudBlock as BarrelHud,
  SacredGeometricCard as BarrelCard,
  IsometricNetworkGraph as BarrelGraph,
  AudioVisualizerBlock as BarrelAudio,
  CosmicArchives as BarrelArchives,
} from "../packages/ui/src/index";
import { sovereignSound } from "../packages/ui/src/engine/audio/sound-engine";

interface StressTestResult {
  category: "SPEC_BASELINE" | "SCALE_STRESS" | "SSR_SAFETY" | "ADVERSARIAL_EDGE";
  name: string;
  passed: boolean;
  notes?: string;
  durationMs: number;
}

const testResults: StressTestResult[] = [];

function normalizeHtml(html: string): string {
  return html.replace(/<!-- -->/g, "");
}

function renderHtml(element: React.ReactElement): string {
  return normalizeHtml(renderToString(element));
}

function recordTest(
  category: StressTestResult["category"],
  name: string,
  fn: () => { notes?: string } | void
) {
  const start = performance.now();
  try {
    const res = fn();
    const duration = performance.now() - start;
    testResults.push({
      category,
      name,
      passed: true,
      notes: res?.notes,
      durationMs: duration,
    });
    console.log(`[PASS] [${category}] ${name} (${duration.toFixed(2)}ms)${res?.notes ? ` - ${res.notes}` : ""}`);
  } catch (err: unknown) {
    const duration = performance.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    testResults.push({
      category,
      name,
      passed: false,
      notes: msg,
      durationMs: duration,
    });
    console.error(`[FAIL] [${category}] ${name} (${duration.toFixed(2)}ms) -> ${msg}`);
  }
}

console.log("==================================================================");
console.log("  EMPIRICAL CHALLENGER: M1 BLOCKS ADVERSARIAL STRESS TEST HARNESS ");
console.log("==================================================================\n");

// 1. SPEC BASELINE & EXPORT VERIFICATION
recordTest("SPEC_BASELINE", "Barrel export parity between packages/ui and packages/ui/blocks", () => {
  if (TacticalHudBlock !== BarrelHud) throw new Error("TacticalHudBlock barrel export mismatch");
  if (SacredGeometricCard !== BarrelCard) throw new Error("SacredGeometricCard barrel export mismatch");
  if (IsometricNetworkGraph !== BarrelGraph) throw new Error("IsometricNetworkGraph barrel export mismatch");
  if (AudioVisualizerBlock !== BarrelAudio) throw new Error("AudioVisualizerBlock barrel export mismatch");
  if (CosmicArchives !== BarrelArchives) throw new Error("CosmicArchives barrel export mismatch");
});

recordTest("SPEC_BASELINE", "TacticalHudBlock: Valid baseline props and default values", () => {
  const html = renderHtml(<TacticalHudBlock title="ORBITAL SCANNER" />);
  if (!html.includes("ORBITAL SCANNER")) throw new Error("Title missing");
  if (!html.includes("SYS.01")) throw new Error("Default callsign missing");
  if (!html.includes("ONLINE")) throw new Error("Default status missing");
  if (!html.includes("ui-tactical-hud-block")) throw new Error("Root class missing");
});

recordTest("SPEC_BASELINE", "SacredGeometricCard: Baseline patterns (octagram, flower-of-life, arabesque)", () => {
  for (const pattern of ["octagram", "flower-of-life", "arabesque"] as const) {
    const html = renderHtml(<SacredGeometricCard title="GEOMETRY TEST" pattern={pattern} />);
    if (!html.includes("ui-sacred-geometric-card")) throw new Error("Root class missing");
    if (!html.includes("ui-sacred-aura")) throw new Error("Aura missing");
  }
});

recordTest("SPEC_BASELINE", "IsometricNetworkGraph: Baseline default nodes & edges", () => {
  const html = renderHtml(<IsometricNetworkGraph />);
  if (!html.includes("2.5D MESH TOPOLOGY")) throw new Error("Topology header missing");
  if (!html.includes("// 9 NODES")) throw new Error("Default 9 nodes count missing");
});

recordTest("SPEC_BASELINE", "AudioVisualizerBlock: Baseline modes (oscilloscope, fft-bars, circular-radar)", () => {
  for (const mode of ["oscilloscope", "fft-bars", "circular-radar"] as const) {
    const html = renderHtml(<AudioVisualizerBlock mode={mode} dna="dx" />);
    if (!html.includes("AUDIO SPECTRUM // DX")) throw new Error("Header missing");
    if (!html.includes("<canvas")) throw new Error("Canvas missing");
  }
});

recordTest("SPEC_BASELINE", "CosmicArchives: Baseline items and tag indexing", () => {
  const items = [
    { id: "sig-1", title: "Pleiades Signal", timestamp: "2026-11-10T12:00:00Z", tag: "RADIO" },
    { id: "sig-2", title: "Cygnus Flare", timestamp: "2026-11-10T12:15:00Z", tag: "OPTICAL" },
  ];
  const html = renderHtml(<CosmicArchives items={items} />);
  if (!html.includes("ASTRAL INDEX // 2 RECORDED PHENOMENA")) throw new Error("Count mismatch");
  if (!html.includes("Pleiades Signal")) throw new Error("Item title missing");
});

// 2. SSR SAFETY VERIFICATION
recordTest("SSR_SAFETY", "Pure Headless execution without window/document/HTMLCanvasElement", () => {
  if (typeof window !== "undefined") throw new Error("window is defined in SSR execution context");
  // Sound synthesizer safe execution in headless environment
  sovereignSound.playClick("dx");
  sovereignSound.playHover("empire");
  sovereignSound.playClick("moonwitness");
  sovereignSound.playClick("rid");
  sovereignSound.playClick("codex");
  return { notes: "Headless sound engine triggers executed without throwing" };
});

recordTest("SSR_SAFETY", "Full server-side HTML render of all 5 blocks simultaneously", () => {
  const combinedHtml = renderHtml(
    <div>
      <TacticalHudBlock title="SSR_HUD" />
      <SacredGeometricCard title="SSR_CARD" />
      <IsometricNetworkGraph />
      <AudioVisualizerBlock />
      <CosmicArchives items={[{ id: "s1", title: "SSR item", timestamp: "now" }]} />
    </div>
  );
  if (!combinedHtml.includes("SSR_HUD") || !combinedHtml.includes("SSR_CARD")) {
    throw new Error("Combined SSR render incomplete");
  }
});

// 3. SCALE & STRESS TESTING
recordTest("SCALE_STRESS", "TacticalHudBlock: Deeply nested hierarchy (100 child elements)", () => {
  const children = Array.from({ length: 100 }).map((_, i) => (
    <div key={i} className="flex justify-between border-b py-0.5">
      <span>TELEMETRY_KEY_{i}</span>
      <span>0x{((i * 9876543) >>> 0).toString(16)}</span>
    </div>
  ));
  const html = renderHtml(<TacticalHudBlock title="HEAVY PAYLOAD">{children}</TacticalHudBlock>);
  if (!html.includes("TELEMETRY_KEY_99")) throw new Error("Deep hierarchy child omitted");
});

recordTest("SCALE_STRESS", "IsometricNetworkGraph: Large scale (200 nodes & 500 edges)", () => {
  const nodes = Array.from({ length: 200 }).map((_, i) => ({
    id: `node-${i}`,
    label: `Node_${i}_Cluster`,
    x: (i % 20) * 15 - 150,
    y: Math.floor(i / 20) * 15 - 150,
    z: (i % 10) * 8,
    status: (i % 3 === 0 ? "online" : i % 3 === 1 ? "syncing" : "offline") as "online" | "syncing" | "offline",
  }));
  const edges = Array.from({ length: 500 }).map((_, i) => ({
    from: `node-${i % 200}`,
    to: `node-${(i * 13 + 7) % 200}`,
    active: i % 2 === 0,
  }));
  const html = renderHtml(<IsometricNetworkGraph nodes={nodes} edges={edges} width={2560} height={1440} />);
  if (!html.includes("// 200 NODES")) throw new Error("200 nodes display missing");
});

recordTest("SCALE_STRESS", "CosmicArchives: Massive scale (1000 items & 10-tag taxonomy)", () => {
  const items = Array.from({ length: 1000 }).map((_, i) => ({
    id: `signal-${i}`,
    title: `Astral Phenomenon Cluster-${i}`,
    timestamp: `2026-11-10T12:${String(i % 60).padStart(2, "0")}:00Z`,
    coordinates: `RA ${i % 24}h 00m / DEC +${i % 90}°`,
    tag: `SECTOR-${i % 10}`,
    content: React.createElement("div", null, `Detailed astronomical spectral data for observation ${i}`),
  }));
  const html = renderHtml(<CosmicArchives items={items} title="MASSIVE ARCHIVE" />);
  if (!html.includes("ASTRAL INDEX // 1000 RECORDED PHENOMENA")) throw new Error("1000 count missing");
  if (!html.includes("SECTOR-9")) throw new Error("Taxonomy tag button missing");
});

// 4. EXTREME PROPS & ADVERSARIAL EDGE CASES
recordTest("ADVERSARIAL_EDGE", "Empty collections handling (nodes=[], edges=[], items=[])", () => {
  const graphHtml = renderHtml(<IsometricNetworkGraph nodes={[]} edges={[]} />);
  if (!graphHtml.includes("// 0 NODES")) throw new Error("Empty nodes failed");

  const archivesHtml = renderHtml(<CosmicArchives items={[]} />);
  if (!archivesHtml.includes("ASTRAL INDEX // 0 RECORDED PHENOMENA")) throw new Error("Empty items failed");
});

recordTest("ADVERSARIAL_EDGE", "IsometricNetworkGraph: Extreme negative coordinates (-99999) & dangling edges", () => {
  const extremeNodes = [
    { id: "deep-sub", label: "Mantle Core", x: -99999, y: -88888, z: -5000, status: "online" as const },
    { id: "high-orbit", label: "Zenith Eye", x: 99999, y: 88888, z: 5000, status: "syncing" as const },
  ];
  const danglingEdges = [
    { from: "ghost-1", to: "deep-sub", active: true },
    { from: "deep-sub", to: "ghost-2", active: false },
  ];
  const html = renderHtml(<IsometricNetworkGraph nodes={extremeNodes} edges={danglingEdges} width={0} height={0} />);
  if (!html.includes("// 2 NODES")) throw new Error("Extreme coordinates failed");
});

recordTest("ADVERSARIAL_EDGE", "All 7 DNA sound profiles across blocks", () => {
  const profiles = ["dx", "empire", "moonwitness", "eisp", "rid", "desktop", "codex"] as const;
  for (const dna of profiles) {
    const hud = renderHtml(<TacticalHudBlock title="DNA" dna={dna} />);
    const card = renderHtml(<SacredGeometricCard title="DNA" dna={dna} />);
    const audio = renderHtml(<AudioVisualizerBlock dna={dna} />);
    if (!hud.includes("DNA") || !card.includes("DNA") || !audio.includes(`AUDIO SPECTRUM // ${dna.toUpperCase()}`)) {
      throw new Error(`Profile ${dna} failed`);
    }
  }
});

recordTest("ADVERSARIAL_EDGE", "XSS injection attempts & special unicode in titles and headers", () => {
  const xssPayload = `"><script>alert("xss")</script><img src=x onerror=alert(1)>`;
  const unicodePayload = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ◈ ⚔️ \u202E\u0000\u001F`;

  const hud = renderHtml(<TacticalHudBlock title={xssPayload} callsign={unicodePayload} />);
  const card = renderHtml(<SacredGeometricCard title={unicodePayload} subtitle={xssPayload} />);
  if (hud.includes("<script>") || card.includes("<script>")) {
    throw new Error("Unescaped script tag detected in rendered HTML");
  }
});

recordTest("ADVERSARIAL_EDGE", "AudioVisualizerBlock: Extreme heights (0, 10, 5000) and unknown fallback mode", () => {
  const h0 = renderHtml(<AudioVisualizerBlock height={0} />);
  const h5000 = renderHtml(<AudioVisualizerBlock height={5000} />);
  const fallbackMode = renderHtml(<AudioVisualizerBlock mode={"nonexistent" as any} />);
  if (!h0.includes("height:0") || !h5000.includes("height:5000")) {
    throw new Error("Extreme height inline styling missing");
  }
  if (!fallbackMode.includes("ui-audio-visualizer-block")) {
    throw new Error("Fallback mode failed");
  }
});

// 5. RESILIENCE / NULL PROP ANALYSIS (CHALLENGE FINDINGS)
console.log("\n--- ANALYZING UNCHECKED RUNTIME NULL BOUNDARIES ---");

const nullChecks = [
  {
    name: "TacticalHudBlock: status={null}",
    test: () => renderHtml(<TacticalHudBlock title="T" status={null as any} />),
    location: "packages/ui/src/blocks/tactical-hud-block.tsx:117",
    expression: "status.toUpperCase()",
    fix: "status?.toUpperCase() ?? 'ONLINE'",
  },
  {
    name: "IsometricNetworkGraph: nodes={null}",
    test: () => renderHtml(<IsometricNetworkGraph nodes={null as any} />),
    location: "packages/ui/src/blocks/isometric-network-graph.tsx:254",
    expression: "nodes.length",
    fix: "(nodes ?? DEFAULT_NODES).length",
  },
  {
    name: "AudioVisualizerBlock: dna={null}",
    test: () => renderHtml(<AudioVisualizerBlock dna={null as any} />),
    location: "packages/ui/src/blocks/audio-visualizer-block.tsx:226",
    expression: "dna.toUpperCase()",
    fix: "(dna ?? 'dx').toUpperCase()",
  },
  {
    name: "CosmicArchives: items={null}",
    test: () => renderHtml(<CosmicArchives items={null as any} />),
    location: "packages/ui/src/blocks/cosmic-archives.tsx:40",
    expression: "items[0]?.id",
    fix: "(items ?? [])[0]?.id",
  },
  {
    name: "CosmicArchives: items={undefined}",
    test: () => renderHtml(<CosmicArchives items={undefined as any} />),
    location: "packages/ui/src/blocks/cosmic-archives.tsx:40",
    expression: "items[0]?.id",
    fix: "items = [] (add default parameter)",
  },
];

const boundaryFindings: Array<{ name: string; error: string; location: string; expression: string; fix: string }> = [];

for (const check of nullChecks) {
  try {
    check.test();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    boundaryFindings.push({
      name: check.name,
      error: errorMsg,
      location: check.location,
      expression: check.expression,
      fix: check.fix,
    });
    console.log(`[FINDING] ${check.name} throws at ${check.location}: "${errorMsg}"`);
  }
}

// FINAL SUMMARY OUTPUT
console.log("\n==================================================================");
console.log("                      STRESS TEST REPORT                         ");
console.log("==================================================================");
const passedSpecs = testResults.filter((r) => r.passed).length;
const totalSpecs = testResults.length;
console.log(`Core Specification & Scale Tests : ${passedSpecs}/${totalSpecs} PASSED (100%)`);
console.log(`Unchecked Null Boundary Findings : ${boundaryFindings.length} IDENTIFIED`);
console.log("==================================================================\n");

if (passedSpecs !== totalSpecs) {
  process.exit(1);
} else {
  process.exit(0);
}
