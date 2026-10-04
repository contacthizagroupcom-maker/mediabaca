"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TemaToggle } from "@/components/TemaToggle";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function Lonceng() {
  const supabase = getSupabaseBrowserClient();
  const [jumlah, setJumlah] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from("notifications").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).eq("is_read", false);
      setJumlah(count ?? 0);
    })();
  }, [supabase]);

  return (
    <Link href="/notifikasi" aria-label="Notifikasi" style={{
      position: "relative", display: "inline-flex", alignItems: "center",
      color: "rgba(255,255,255,.85)", textDecoration: "none", fontSize: 17,
    }}>
      🔔
      {jumlah > 0 && (
        <span style={{
          position: "absolute", top: -6, right: -10,
          background: "#2FB35C", color: "#fff", fontSize: 10,
          minWidth: 16, height: 16, borderRadius: 99,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--fm)", padding: "0 4px",
        }}>{jumlah > 9 ? "9+" : jumlah}</span>
      )}
    </Link>
  );
}

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
            <Lonceng />
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
