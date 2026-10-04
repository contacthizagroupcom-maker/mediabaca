"use client";

import Link from "next/link";
import { TemaToggle } from "@/components/TemaToggle";

export function HeaderDalam({ judul, aksi }: { judul?: string; aksi?: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="site-header-in">
          <Link href="/" className="site-brand">Media<em>Baca</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <nav className="site-nav">
              <Link href="/dasbor">Dasbor</Link>
              <Link href="/dasbor/tulis">Tulis</Link>
              <Link href="/dasbor/karya">Karya</Link>
            </nav>
            <TemaToggle />
          </div>
        </div>
      </header>
      {(judul || aksi) && (
        <div className="container-mb" style={{ padding: "28px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
          <div>
            {judul && <div className="kicker"><span className="idx">MB</span> {judul.toUpperCase()} <span className="krule"></span></div>}
          </div>
          {aksi}
        </div>
      )}
    </>
  );
}

export function BadgePeran({ peran }: { peran: string }) {
  const daftar = peran.split(" · ").filter(Boolean);
  return (
    <span style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
      {daftar.map(p => (
        <span key={p} className={`badge ${p === "ADMIN" ? "badge-published" : p === "EDITOR" ? "badge-submitted" : "badge-draft"}`}>{p}</span>
      ))}
    </span>
  );
}
