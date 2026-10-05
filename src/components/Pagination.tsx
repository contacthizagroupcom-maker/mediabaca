"use client";

import Link from "next/link";

export function Pagination({ halaman, total, perHalaman, buatHref }: {
  halaman: number; total: number; perHalaman: number; buatHref: (n: number) => string;
}) {
  const totalHalaman = Math.ceil(total / perHalaman);
  if (totalHalaman <= 1) return null;

  const tombol: (number | "...")[] = [];
  for (let i = 1; i <= totalHalaman; i++) {
    if (i === 1 || i === totalHalaman || Math.abs(i - halaman) <= 1) tombol.push(i);
    else if (tombol[tombol.length - 1] !== "...") tombol.push("...");
  }

  return (
    <nav style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 30 }} aria-label="Navigasi halaman">
      {halaman > 1 && (
        <Link href={buatHref(halaman - 1)} style={{
          minWidth: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--rule2)", borderRadius: 4, textDecoration: "none",
          color: "var(--ink2)", fontSize: 14,
        }}>←</Link>
      )}
      {tombol.map((t, i) =>
        t === "..." ? (
          <span key={i} style={{ color: "var(--mut)", padding: "0 4px", fontSize: 14 }}>…</span>
        ) : (
          <Link key={i} href={buatHref(t)} aria-current={t === halaman ? "page" : undefined} style={{
            minWidth: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center",
            border: t === halaman ? "1px solid var(--ink)" : "1px solid var(--rule2)",
            background: t === halaman ? "var(--ink)" : "transparent",
            color: t === halaman ? "var(--paper)" : "var(--ink2)",
            borderRadius: 4, textDecoration: "none", fontSize: 13, fontFamily: "var(--fm)",
          }}>{t}</Link>
        )
      )}
      {halaman < totalHalaman && (
        <Link href={buatHref(halaman + 1)} style={{
          minWidth: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center",
          border: "1px solid var(--rule2)", borderRadius: 4, textDecoration: "none",
          color: "var(--ink2)", fontSize: 14,
        }}>→</Link>
      )}
    </nav>
  );
}
