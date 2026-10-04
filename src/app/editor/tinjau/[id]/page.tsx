"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";

type Karya = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  status: string; author_id: string;
  profiles: { full_name: string; username: string } | null;
};

export default function TinjauKarya() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const supabase = getSupabaseBrowserClient();
  const [karya, setKarya] = useState<Karya | null>(null);
  const [catatan, setCatatan] = useState("");
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      const { data } = await supabase
        .from("works")
        .select("id, title, slug, excerpt, content, status, author_id, profiles(full_name, username)")
        .eq("id", params.id).maybeSingle();
      setKarya(data ?? null);
      setMemuat(false);
    })();
  }, [params.id, router, supabase]);

  async function putuskan(aksi: "PUBLISHED" | "REVISION_REQUIRED" | "REJECTED") {
    if (!karya || !catatan.trim()) { setGalat("Catatan wajib diisi sebelum mengambil keputusan."); return; }
    setSibuk(true); setGalat("");
    if (aksi !== "PUBLISHED") {
      await supabase.from("revisions").insert({
        work_id: karya.id,
        editor_id: (await supabase.auth.getUser()).data.user!.id,
        note: catatan.trim(),
      });
    }
    const { error } = await supabase.from("works").update({ status: aksi }).eq("id", karya.id);
    if (error) { setGalat("Gagal: " + error.message); setSibuk(false); return; }
    await supabase.from("notifications").insert({
      user_id: karya.author_id,
      type: aksi === "PUBLISHED" ? "approved" : aksi === "REVISION_REQUIRED" ? "revision" : "rejected",
      message:
        aksi === "PUBLISHED" ? `"${karya.title}" telah disetujui dan diterbitkan!`
        : aksi === "REVISION_REQUIRED" ? `"${karya.title}" meminta revisi. Baca catatan editor di dasbor.`
        : `"${karya.title}" ditolak. Baca catatan editor di dasbor.`,
      reference_id: karya.id,
    });
    router.push("/editor");
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  if (!karya) {
    return (
      <>
        <HeaderDalam judul="Tinjau Karya" />
        <main className="container-mb narrow" style={{ padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, marginBottom: 20 }}>Karya tidak ditemukan</h1>
          <Link href="/editor" className="btn btn-primary">← Meja Editor</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <HeaderDalam judul="Tinjau Karya" aksi={<Link href="/editor" className="btn">← Meja Editor</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        <div className="kicker"><span className="idx">§</span> {karya.profiles?.full_name?.toUpperCase() ?? "PENULIS"} <span className="krule"></span></div>
        <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.5rem)", margin: "12px 0 8px", lineHeight: 1.15 }}>{karya.title}</h1>
        <p className="meta" style={{ marginBottom: 20 }}>oleh {karya.profiles?.full_name ?? "Penulis"} · status: {karya.status}</p>
        {karya.excerpt && <p style={{ fontStyle: "italic", color: "var(--ink2)", fontSize: 18, marginBottom: 20 }}>{karya.excerpt}</p>}

        <div style={{ borderTop: "2px solid var(--ink)", margin: "12px 0 24px" }} />
        <article className="prose-mb" dangerouslySetInnerHTML={{ __html: karya.content }} />
        <div style={{ borderTop: "1px solid var(--ink)", margin: "32px 0 24px" }} />

        <div className="kicker" style={{ marginBottom: 14 }}><span className="idx">!</span> KEPUTUSAN EDITORIAL <span className="krule"></span></div>
        {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", padding: 12, borderRadius: 4, marginBottom: 14 }}>{galat}</p>}

        <div className="field">
          <label htmlFor="catatan">Catatan untuk penulis (wajib)</label>
          <textarea id="catatan" className="input" style={{ minHeight: 110 }} value={catatan}
            onChange={e => setCatatan(e.target.value)} placeholder="Spesifik dan membangun…" />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={() => putuskan("PUBLISHED")} disabled={sibuk} className="btn btn-acc">✅ Setujui & Terbitkan</button>
          <button onClick={() => putuskan("REVISION_REQUIRED")} disabled={sibuk} className="btn" style={{ borderColor: "var(--warn)", color: "var(--warn)" }}>↺ Minta Revisi</button>
          <button onClick={() => putuskan("REJECTED")} disabled={sibuk} className="btn" style={{ borderColor: "var(--err)", color: "var(--err)" }}>✕ Tolak</button>
        </div>
      </main>
    </>
  );
}
