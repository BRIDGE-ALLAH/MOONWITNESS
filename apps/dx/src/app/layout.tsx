import type { Metadata } from "next";
import { defaultBrandingConfig } from "@/config/branding";
import { EcosystemShell } from "@local-git/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: `${defaultBrandingConfig.name} – Story Riot // Creative Chaos // Developer Business`,
  description: defaultBrandingConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <EcosystemShell dna="dx">{children}</EcosystemShell>
      </body>
    </html>
  );
}
