"use client";

import Link from "next/link";

export function Masthead({ tanggal }: { tanggal: string }) {
  return (
    <div className="mb-muncul" style={{ background: "var(--paper)", borderBottom: "1px solid var(--ink)" }}>
      <div className="container-mb" style={{ padding: "18px 24px 14px", textAlign: "center" }}>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: "var(--fm)", fontSize: 10.5, letterSpacing: ".1em",
          textTransform: "uppercase", color: "var(--mut)", marginBottom: 10,
        }}>
          <span>{tanggal}</span>
          <span className="mb-denot" style={{ color: "var(--acc)", fontSize: 13 }}>✦</span>
          <span aria-hidden="true">{tanggal}</span>
        </div>

        <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
          <div style={{
            fontFamily: "var(--fd)", fontWeight: 640,
            fontSize: "clamp(2.4rem, 9vw, 4.2rem)",
            letterSpacing: "-.02em", lineHeight: 1, color: "var(--ink)",
          }}>
            Media<em style={{ color: "var(--acc)", fontStyle: "italic", fontWeight: 500 }}>Baca</em>
          </div>
        </Link>

        <div style={{
          fontFamily: "var(--fm)", fontSize: "clamp(10px, 1.8vw, 12px)",
          letterSpacing: ".22em", textTransform: "uppercase", color: "var(--ink2)",
          marginTop: 8, paddingBottom: 12,
          borderBottom: "1px solid var(--rule)",
          display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap",
        }}>
          <span>Membaca</span>
          <span style={{ color: "var(--acc)" }}>•</span>
          <span>Menulis</span>
          <span style={{ color: "var(--acc)" }}>•</span>
          <span>Berbagi Gagasan</span>
        </div>
      </div>
    </div>
  );
}
