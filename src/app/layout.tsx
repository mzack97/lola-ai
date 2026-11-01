import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://lola-ai.uz"),
  title: { default: "LOLA AI — kelajak kasblari uchun imkoniyat", template: "%s · LOLA AI" },
  description: "Qizlar va xotin-qizlarni zamonaviy kasblarga o‘qitish platformasi: onlayn kurslar, ustozlar, amaliyot.",
  openGraph: { images: ["/logo.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
