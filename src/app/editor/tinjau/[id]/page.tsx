"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Karya = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  status: string; content_type: string; author_id: string;
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
        .select("id, title, slug, excerpt, content, status, content_type, author_id, profiles(full_name, username)")
        .eq("id", params.id)
        .maybeSingle();
      setKarya(data ?? null);
      setMemuat(false);
    })();
  }, [params.id, router, supabase]);

  async function putuskan(aksi: "PUBLISHED" | "REVISION_REQUIRED" | "REJECTED") {
    if (!karya || !catatan.trim()) {
      setGalat("Catatan wajib diisi sebelum mengambil keputusan.");
      return;
    }
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
    return <main style={{ maxWidth: 700, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}><p>Memuat…</p></main>;
  }

  if (!karya) {
    return (
      <main style={{ maxWidth: 640, margin: "0 auto", padding: 60, fontFamily: "Georgia, serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 24 }}>Karya tidak ditemukan</h1>
        <Link href="/editor" style={{ color: "#0B7A3E" }}>← Kembali ke meja editor</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <Link href="/editor" style={{ color: "#0B7A3E", textDecoration: "none" }}>← Meja Editor</Link>
      <h1 style={{ fontSize: 32, margin: "16px 0 8px" }}>{karya.title}</h1>
      <p style={{ color: "#888" }}>oleh {karya.profiles?.full_name ?? "Penulis"} · status saat ini: <b>{karya.status}</b></p>
      <p style={{ fontStyle: "italic", color: "#555", marginTop: 12 }}>{karya.excerpt}</p>
      <hr style={{ border: "none", borderTop: "1px solid #0D120D", margin: "20px 0" }} />
      <article style={{ fontSize: 18, lineHeight: 1.9, color: "#1a1a1a", whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: karya.content }} />
      <hr style={{ border: "none", borderTop: "1px solid #0D120D", margin: "36px 0" }} />
      <h2 style={{ fontSize: 20 }}>Keputusan Editorial</h2>
      {galat && <p style={{ color: "#B3261E", background: "#FBEAEA", padding: 10, borderRadius: 4 }}>{galat}</p>}
      <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
        placeholder="Catatan untuk penulis (wajib) — spesifik dan membangun…"
        style={{ width: "100%", minHeight: 110, padding: 12, border: "1px solid #C7D2C7", borderRadius: 4, fontSize: 15, boxSizing: "border-box", background: "#fff", color: "#0D120D", marginTop: 10 }} />
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button onClick={() => putuskan("PUBLISHED")} disabled={sibuk} style={{ padding: 14, background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, cursor: "pointer" }}>✅ Setujui & Terbitkan</button>
        <button onClick={() => putuskan("REVISION_REQUIRED")} disabled={sibuk} style={{ padding: 14, background: "#8A6A1F", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, cursor: "pointer" }}>↺ Minta Revisi</button>
        <button onClick={() => putuskan("REJECTED")} disabled={sibuk} style={{ padding: 14, background: "#B3261E", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, cursor: "pointer" }}>✕ Tolak</button>
      </div>
    </main>
  );
}
