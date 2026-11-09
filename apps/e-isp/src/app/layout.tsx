import type { Metadata } from "next";
import { EcosystemShell } from "@local-git/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-ISP // EDGE-INFRA SCALE PLATFORM",
  description: "Sovereign Tri-Cloud Fabric. Edge Shield × Bare-Metal Compute × Distributed Storage Mesh. Zero vendor lock-in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EcosystemShell dna="eisp">{children}</EcosystemShell>
      </body>
    </html>
  );
}
