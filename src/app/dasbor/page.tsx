"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam, BadgePeran } from "@/components/AppShell";

export default function Dasbor() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [profil, setProfil] = useState<{ full_name: string; username: string } | null>(null);
  const [peran, setPeran] = useState("");
  const [stat, setStat] = useState({ total: 0, draft: 0, terbit: 0, review: 0 });
  const [memuat, setMemuat] = useState(true);

  const [baru, setBaru] = useState(false);

  useEffect(() => {
    try { setBaru(!localStorage.getItem("mb-sambutan")); } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      for (let coba = 0; coba < 5; coba++) {
        const { data } = await supabase
          .from("profiles").select("full_name, username").eq("id", user.id).maybeSingle();
        if (data) { setProfil(data); break; }
        await new Promise(r => setTimeout(r, 600));
      }
      const { data: ur } = await supabase
        .from("user_roles").select("role_id").eq("user_id", user.id);
      setPeran((ur ?? []).map((r: any) => r.role_id).join(" · ") || "READER");

      const { data: k } = await supabase
        .from("works").select("status").eq("author_id", user.id);
      const semua = k ?? [];
      setStat({
        total: semua.length,
        draft: semua.filter((x: any) => x.status === "DRAFT").length,
        terbit: semua.filter((x: any) => x.status === "PUBLISHED").length,
        review: semua.filter((x: any) => ["SUBMITTED", "IN_REVIEW", "REVISION_REQUIRED"].includes(x.status)).length,
      });
      setMemuat(false);
    })();
  }, [router, supabase]);

  async function keluar() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  const kartu = [
    { label: "Total Karya", nilai: stat.total },
    { label: "Draft", nilai: stat.draft },
    { label: "Dalam Review", nilai: stat.review },
    { label: "Terbit", nilai: stat.terbit },
  ];

  return (
    <>
      <HeaderDalam judul="Dasbor Penulis" aksi={<button onClick={keluar} className="btn">Keluar</button>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", margin: "8px 0 6px" }}>
          Halo, {profil?.full_name ?? "Penulis"} 👋
        </h1>
          {baru && (
            <div style={{ border: "1px solid var(--acc)", background: "var(--paper2)", borderRadius: 8, padding: "20px 22px", marginBottom: 18 }}>
              <div className="kicker" style={{ marginBottom: 10 }}><span className="idx">✦</span> SELAMAT DATANG DI MEDIABACA <span className="krule"></span></div>
              <p style={{ margin: "0 0 6px", fontSize: 15.5, color: "var(--ink2)" }}>
                Tiga langkah pertamamu:
              </p>
              <ol style={{ margin: "0 0 14px 18px", color: "var(--ink2)", fontSize: 14.5, lineHeight: 1.9 }}>
                <li><b>Lengkapi profil</b> — foto, bio, fokus penulisan <Link href="/dasbor/profil" style={{ color: "var(--acc)" }}>di sini →</Link></li>
                <li><b>Tulis karya pertama</b> — dari HP pun nyaman <Link href="/dasbor/tulis" style={{ color: "var(--acc)" }}>mulai menulis →</Link></li>
                <li><b>Kirim untuk review</b> — editor kami akan membalas dengan catatan</li>
              </ol>
              <button onClick={() => { setBaru(false); try { localStorage.setItem("mb-sambutan", "1"); } catch {} }}
                className="btn btn-acc" style={{ padding: "9px 16px" }}>✓ Mengerti, Mulai!</button>
            </div>
          )}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <span className="meta">@{profil?.username}</span>
          <BadgePeran peran={peran} />
        </div>

        <div className="stat-strip">
          {kartu.map(k => (
            <div key={k.label} className="stat-box">
              <div className="stat-n">{k.nilai}</div>
              <div className="stat-l">{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          <Link href="/dasbor/tulis" className="btn btn-acc">✍️ Tulis Karya</Link>
          <Link href="/dasbor/karya" className="btn">📚 Karya Saya</Link>
          <Link href="/dasbor/profil" className="btn">👤 Profil</Link>
          <Link href="/dasbor/pengaturan" className="btn">⚙️ Pengaturan</Link>
          <Link href="/dasbor/simpanan" className="btn">🔖 Simpanan</Link>
          <Link href="/dasbor/riwayat" className="btn">📖 Riwayat</Link>
          <Link href="/dasbor/statistik" className="btn">📊 Statistik</Link>
          <Link href={`/penulis/${profil?.username ?? ""}`} className="btn">🌍 Profil Publik</Link>
          {(peran.includes("EDITOR") || peran.includes("ADMIN")) && (
            <Link href="/editor" className="btn btn-primary">🗂️ Meja Editor</Link>
          )}
          {peran.includes("ADMIN") && (
            <Link href="/admin" className="btn btn-primary">🛡️ Admin</Link>
          )}
        </div>
      </main>
    </>
  );
}
