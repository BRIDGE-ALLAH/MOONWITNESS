import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A-L-L-A-H.COM // EMPIRE OF THE LIGHT",
  description: "The Sovereign Origin. Imperium Lumen. Low-profile devotion to ALLAH alone. Zero false corporate idols.",
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
