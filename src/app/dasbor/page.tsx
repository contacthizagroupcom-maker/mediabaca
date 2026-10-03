"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function Dasbor() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [profil, setProfil] = useState<{ full_name: string; username: string } | null>(null);
  const [peran, setPeran] = useState("");
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }

      // profil dibuat otomatis oleh trigger — kadang perlu sesaat
      for (let coba = 0; coba < 5; coba++) {
        const { data } = await supabase
          .from("profiles").select("full_name, username").eq("id", user.id).maybeSingle();
        if (data) { setProfil(data); break; }
        await new Promise(r => setTimeout(r, 600));
      }

      const { data: ur } = await supabase
        .from("user_roles").select("role_id").eq("user_id", user.id).maybeSingle();
      setPeran(ur?.role_id || "READER");
      setMemuat(false);
    })();
  }, [router, supabase]);

  async function keluar() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (memuat) {
    return <main style={{ maxWidth: 640, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}><p>Memuat…</p></main>;
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: 30 }}>Dasbor Penulis</h1>
      <p style={{ fontSize: 18 }}>Halo, <b>{profil?.full_name ?? "Penulis"}</b> <span style={{ color: "#888" }}>(@{profil?.username})</span></p>
      <p>Peran akun: <b style={{ color: "#0B7A3E" }}>{peran}</b></p>
      <p style={{ color: "#888" }}>
        Sesi login tersimpan di server — akun ini bisa dibuka dari perangkat mana pun. 🎉
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <Link href="/" style={{ padding: 12, border: "1px solid #C7D2C7", borderRadius: 4, textDecoration: "none", color: "#0D120D" }}>← Beranda</Link>
        <button onClick={keluar} style={{ padding: 12, background: "#0D120D", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Keluar</button>
      </div>
    </main>
  );
}
