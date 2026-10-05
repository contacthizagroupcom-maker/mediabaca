"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TemaToggle } from "@/components/TemaToggle";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function HeaderPublik({ aktif }: { aktif?: string }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [kata, setKata] = useState("");
  const [masuk, setMasuk] = useState(false);
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [mencari, setMencari] = useState(false);
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMasuk(!!user);
      setGelap(localStorage.getItem("mb-tema") === "gelap");
    })();
  }, [supabase]);

  function cari(e: React.FormEvent) {
    e.preventDefault();
    if (kata.trim().length >= 2) {
      router.push("/search?q=" + encodeURIComponent(kata.trim()));
      setMencari(false);
    }
  }

  return (
    <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <div className="site-header-in" style={{ padding: "10px 16px" }}>
        <Link href="/" className="site-brand" style={{ fontSize: 21 }}>Media<em>Baca</em></Link>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* PENA — tulis + panduan */}
          <Link href="/dasbor/tulis" aria-label="Tulis Karya" title="Tulis Karya & Panduan"
            style={{
              background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.25)",
              borderRadius: 4, padding: "6px 8px", textDecoration: "none", fontSize: 15,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
            <span style={{ fontSize: 14 }}>✍️</span>
            <span style={{ fontFamily: "var(--fm)", fontSize: 9, letterSpacing: ".08em", color: "rgba(255,255,255,.85)" }}>TULIS</span>
          </Link>

          {/* CARI */}
          {mencari ? (
            <form onSubmit={cari} style={{ display: "flex", gap: 6 }}>
              <input autoFocus value={kata} onChange={e => setKata(e.target.value)}
                onBlur={() => { if (!kata) setMencari(false); }}
                placeholder="Cari karya / penulis…"
                style={{
                  padding: "8px 12px", fontSize: 14, width: "min(50vw, 200px)",
                  border: "1px solid rgba(255,255,255,.3)", borderRadius: 4,
                  background: "rgba(255,255,255,.08)", color: "#fff", outline: "none",
                  fontFamily: "var(--fb)",
                }} />
              <button type="submit" style={{ background: "none", border: "none", color: "#4CC97B", cursor: "pointer", fontSize: 16 }}>➜</button>
            </form>
          ) : (
            <button onClick={() => setMencari(true)} aria-label="Cari"
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 17, padding: 6 }}>
              🔍
            </button>
          )}

          {/* MENU ☰ */}
          <button onClick={() => setMenuTerbuka(!menuTerbuka)} aria-label="Menu" aria-expanded={menuTerbuka}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 17, padding: 6 }}>
            ☰
          </button>
        </div>
      </div>

      {/* MENU TARIK TURUN — beranda/dasbor/jelajih/gelap/pengaturan */}
      {menuTerbuka && (
        <div style={{ background: "var(--ink)", borderTop: "1px solid rgba(255,255,255,.15)" }}>
          <div className="container-mb" style={{ padding: "12px 16px", display: "grid", gap: 2 }}>
            {[
              { href: "/", label: "🏠 Beranda" },
              { href: "/jelajahi", label: "🧭 Jelajahi Karya" },
              ...(masuk
                ? [
                    { href: "/dasbor", label: "📊 Dasbor Penulis" },
                    { href: "/dasbor/karya", label: "📚 Karya Saya" },
                    { href: "/dasbor/simpanan", label: "🔖 Simpanan Bacaan" },
                    { href: "/dasbor/profil", label: "👤 Profil" },
                    { href: "/dasbor/pengaturan", label: "⚙️ Pengaturan" },
                  ]
                : [{ href: "/daftar", label: "✍️ Daftar / Mulai Menulis" }, { href: "/masuk", label: "→ Masuk" }]),
            ].map(m => (
              <Link key={m.href} href={m.href} onClick={() => setMenuTerbuka(false)}
                style={{
                  color: "rgba(255,255,255,.9)", textDecoration: "none",
                  fontFamily: "var(--fm)", fontSize: 13, letterSpacing: ".06em",
                  padding: "11px 8px", borderBottom: "1px solid rgba(255,255,255,.08)",
                }}>{m.label}</Link>
            ))}

            {/* GELAP — toggle di dalam menu */}
            <button
              onClick={() => {
                const baru = !gelap;
                setGelap(baru);
                localStorage.setItem("mb-tema", baru ? "gelap" : "terang");
                document.documentElement.dataset.theme = baru ? "dark" : "";
              }}
              style={{
                textAlign: "left", background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,.9)", fontFamily: "var(--fm)", fontSize: 13,
                letterSpacing: ".06em", padding: "11px 8px",
                borderBottom: "1px solid rgba(255,255,255,.08)",
              }}>
              {gelap ? "☀️ Gelap: AKTIF — ketuk ke Terang" : "🌙 Gelap: MATI — ketuk aktifkan"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
