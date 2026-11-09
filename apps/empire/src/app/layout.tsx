import type { Metadata } from "next";
import { EcosystemShell } from "@local-git/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "A-L-L-A-H.COM // EMPIRE OF THE LIGHT",
  description: "Supreme Origin. Tawhid. Zero False Idols.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <EcosystemShell dna="empire">{children}</EcosystemShell>
      </body>
    </html>
  );
}
