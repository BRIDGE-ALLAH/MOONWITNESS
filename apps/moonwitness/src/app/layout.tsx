import type { Metadata } from "next";
import { EcosystemShell } from "@local-git/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOONWITNESS // WHEN THE MOON IS HIGH WE SHARE MESSAGE AND KNOWLEDGE",
  description: "Living Celestial Observatory, Lunar Chronicles, Astronomical Science & Sacred Knowledge Sharing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <EcosystemShell dna="moonwitness">{children}</EcosystemShell>
      </body>
    </html>
  );
}
