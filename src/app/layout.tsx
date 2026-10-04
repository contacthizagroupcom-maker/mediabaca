import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fd" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-fb" });
const plexmono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fm" });

export const metadata: Metadata = {
  title: "MediaBaca — Ruang untuk Membaca, Menulis, dan Berbagi Gagasan.",
  description: "Jurnal digital multi-penulis untuk karya akademik, fiksi, nonfiksi, opini, dan jurnalistik.",
  verification: { google: "gzYq32MDXvFEXkiys7IhtInbzr92nD8ziZiejnptwbo" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${fraunces.variable} ${newsreader.variable} ${plexmono.variable}`}>
        {children}
      </body>
    </html>
  );
}
