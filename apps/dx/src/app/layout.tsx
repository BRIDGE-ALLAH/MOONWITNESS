import type { Metadata } from "next";
import { defaultBrandingConfig } from "@/config/branding";
import { ThemeProvider, ThemeCustomizer } from "@local-git/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: `${defaultBrandingConfig.name} – Private Git, your infrastructure`,
  description: defaultBrandingConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
          <ThemeCustomizer />
        </ThemeProvider>
      </body>
    </html>
  );
}
