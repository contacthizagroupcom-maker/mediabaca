"use client";

import { useState } from "react";
import Link from "next/link";

type Bab = { n: number; judul: string; isi: string };

export function NavigasiBab({ slug, daftar }: { slug: string; daftar: Bab[] }) {
  const [aktif, setAktif] = useState(1);
  const bab = daftar.find(b => b.n === aktif) ?? daftar[0];

  if (!bab) return null;

  return (
    <section style={{ marginTop: 44 }}>
      <div className="kicker"><span className="idx">Ch</span> BAB {bab.n} DARI {daftar.length} — {bab.judul.toUpperCase()} <span className="krule"></span></div>

      <article className="prose-mb" style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: bab.isi }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 36, borderTop: "2px solid var(--ink)", paddingTop: 16 }}>
        {bab.n > 1 ? (
          <button onClick={() => { setAktif(bab.n - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn">
            ← Bab Sebelumnya
          </button>
        ) : <span />}
        <select value={aktif} onChange={e => { setAktif(Number(e.target.value)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="input" style={{ width: "auto", minWidth: 180, padding: "8px 30px 8px 12px", fontSize: 14 }}>
          {daftar.map(b => (
            <option key={b.n} value={b.n}>Bab {b.n}: {b.judul || "(tanpa judul)"}</option>
          ))}
        </select>
        {bab.n < daftar.length ? (
          <button onClick={() => { setAktif(bab.n + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn btn-acc">
            Bab Berikutnya →
          </button>
        ) : <span />}
      </div>

      <p style={{ marginTop: 20 }} className="meta">
        <Link href="/jelajahi" style={{ color: "var(--acc)" }}>Jelajahi karya lain →</Link>
      </p>
    </section>
  );
}
