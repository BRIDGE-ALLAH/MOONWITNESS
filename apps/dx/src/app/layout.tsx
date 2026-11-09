import type { Metadata } from "next";
import { defaultBrandingConfig } from "@/config/branding";
import { ClientShell } from "./client-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: `${defaultBrandingConfig.name} – Private Git, your infrastructure`,
  description: defaultBrandingConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
