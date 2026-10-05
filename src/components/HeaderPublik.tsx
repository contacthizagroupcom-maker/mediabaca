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

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setMasuk(!!user);
    })();
  }, [supabase]);

  function cari(e: React.FormEvent) {
    e.preventDefault();
    if (kata.trim().length >= 2) router.push("/search?q=" + encodeURIComponent(kata.trim()));
  }

  const tautan = [
    { href: "/", label: "Beranda", id: "beranda" },
    { href: "/jelajahi", label: "Jelajahi", id: "jelajahi" },
    { href: "/tentang", label: "Tentang", id: "tentang" },
  ];

  return (
    <header className="site-header">
      <div className="site-header-in">
        <Link href="/" className="site-brand">Media<em>Baca</em></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", flex: 1, justifyContent: "flex-end" }}>
          <nav className="site-nav">
            {tautan.map(t => (
              <Link key={t.id} href={t.href}
                style={{ color: aktif === t.id ? "#4CC97B" : undefined }}>{t.label}</Link>
            ))}
            {masuk && <Link href="/dasbor">Dasbor</Link>}
          </nav>
          <form onSubmit={cari} style={{ display: "flex", flex: 1, maxWidth: 200 }}>
            <input
              value={kata}
              onChange={e => setKata(e.target.value)}
              placeholder="Cari…"
              aria-label="Cari di MediaBaca"
              style={{
                width: "100%", padding: "6px 10px", fontSize: 13,
                border: "1px solid rgba(255,255,255,.25)", borderRadius: 4,
                background: "rgba(255,255,255,.08)", color: "#fff", outline: "none",
                fontFamily: "var(--fb)",
              }}
            />
          </form>
          <TemaToggle />
        </div>
      </div>
    </header>
  );
}
