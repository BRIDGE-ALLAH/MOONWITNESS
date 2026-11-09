import type { Metadata } from "next";
import { ClientShell } from "./client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-ISP // EDGE-INFRA SCALE PLATFORM",
  description: "Sovereign Tri-Cloud Fabric. Edge Shield × Bare-Metal Compute × Distributed Storage Mesh. Zero vendor lock-in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
