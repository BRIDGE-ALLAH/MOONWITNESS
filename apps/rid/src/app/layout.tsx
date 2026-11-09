import type { Metadata } from "next";
import "./globals.css";
import { EcosystemShell } from "@local-git/ui";

export const metadata: Metadata = {
  title: "RID // ROOT ID — Ur Identity Its Not Rock But Soul - Skang And Roll - Patch It",
  description:
    "RID (Root ID): Identitas hakiki bukan batu keras yang beku, tapi jiwa (soul) yang bergetar. Skang and Roll rhythm, stitched with sovereign patches under ALLAH #1.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-dna="rid" data-theme="acid" data-mode="dark">
      <body>
        <EcosystemShell dna="rid">
          {children}
        </EcosystemShell>
      </body>
    </html>
  );
}
