import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOONWITNESS // WHEN THE MOON IS HIGH WE SHARE MESSAGE AND KNOWLEDGE",
  description: "Living Celestial Observatory, Lunar Chronicles, Astronomical Science & Sacred Knowledge Sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

