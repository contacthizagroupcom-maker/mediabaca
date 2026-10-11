import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fd" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-fb" });
const plexmono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fm" });

export const metadata: Metadata = {
  title: "MediaBaca — Jurnal Digital Kaum Cendekia Organik",
  description: "Rumah gagasan kaum cendekia organik: esai, kajian, fiksi, puisi, dan catatan perjuangan dalam enam rubrik — Tafakur, Lensa, Kajian, Cipta, Jejak, Akar Rumput.",
  verification: { google: "gzYq32MDXvFEXkiys7IhtInbzr92nD8ziZiejnptwbo" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${fraunces.variable} ${newsreader.variable} ${plexmono.variable}`}>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
