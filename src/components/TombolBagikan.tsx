"use client";

import { useState } from "react";

export function TombolBagikan({ judul, ringkasan }: { judul: string; ringkasan?: string }) {
  const [tersalin, setTersalin] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  async function shareNative() {
    if (navigator.share) {
      try {
        await navigator.share({ title: judul, text: ringkasan || judul, url });
      } catch {
        // dibatalkan pengguna
      }
    } else {
      salin();
    }
  }

  async function salin() {
    try {
      await navigator.clipboard.writeText(url);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      window.prompt("Salin tautan ini:", url);
    }
  }

  const wa = "https://wa.me/?text=" + encodeURIComponent((ringkasan ? ringkasan + "\n\n" : "") + judul + "\n" + url);
  const fb = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
  const x = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(judul + "\n") + "&url=" + encodeURIComponent(url);

  const gayaTombol: React.CSSProperties = {
    padding: "10px 16px", borderRadius: 4, border: "1px solid var(--rule2)",
    background: "var(--paper)", color: "var(--ink)", cursor: "pointer",
    fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".08em",
    textTransform: "uppercase", textDecoration: "none",
    display: "inline-flex", alignItems: "center", gap: 6,
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <button onClick={shareNative} className="btn btn-acc" style={{ padding: "10px 16px" }}>
        📤 Bagikan
      </button>
      <a href={wa} target="_blank" rel="noopener" style={gayaTombol}>WhatsApp</a>
      <a href={fb} target="_blank" rel="noopener" style={gayaTombol}>Facebook</a>
      <a href={x} target="_blank" rel="noopener" style={gayaTombol}>X</a>
      <button onClick={salin} style={{ ...gayaTombol, border: tersalin ? "1px solid var(--acc)" : "1px solid var(--rule2)", color: tersalin ? "var(--acc)" : "var(--ink)" }}>
        {tersalin ? "✓ Tersalin!" : "🔗 Salin Tautan"}
      </button>
    </div>
  );
}
