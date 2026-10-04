"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Karya = { id: string; title: string; slug: string; status: string; content_type: string; updated_at: string };

const LABEL_JENIS: Record<string, string> = { NONFICTION: "Nonfiksi", FICTION: "Fiksi", ACADEMIC: "Akademik", OPINION: "Opini", JOURNALISM: "Jurnalistik" };
const LABEL_STATUS: Record<string, string> = { DRAFT: "Draft", SUBMITTED: "Menunggu Review", IN_REVIEW: "Sedang Ditinjau", REVISION_REQUIRED: "Perlu Revisi", APPROVED: "Disetujui", PUBLISHED: "Terbit", REJECTED: "Ditolak" };
const WARNA: Record<string, string> = { DRAFT: "#6E7C6E", SUBMITTED: "#8A6A1F", IN_REVIEW: "#2F5E8A", REVISION_REQUIRED: "#B3261E", APPROVED: "#1E7A46", PUBLISHED: "#0B7A3E", REJECTED: "#B3261E" };

export default function KaryaSaya() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [karya, setKarya] = useState<Karya[]>([]);
  const [revisi, setRevisi] = useState<{ id: string; work_id: string; note: string; created_at: string }[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);

  async function muatUlang() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/masuk"); return; }
    const { data } = await supabase
      .from("works").select("id, title, slug, status, content_type, updated_at")
      .eq("author_id", user.id).order("updated_at", { ascending: false });
    setKarya(data ?? []);
    const { data: rev } = await supabase
      .from("revisions").select("id, work_id, note, created_at")
      .in("work_id", (data ?? []).map((k: any) => k.id));
    setRevisi(rev ?? []);
    setMemuat(false);
  }

  useEffect(() => { muatUlang(); }, []);

  async function kirimReview(id: string) {
    setSibuk(true);
    await supabase.from("works").update({ status: "SUBMITTED" }).eq("id", id);
    await muatUlang(); setSibuk(false);
  }

  async function hapus(id: string) {
    if (!window.confirm("Hapus karya ini permanen?")) return;
    setSibuk(true);
    await supabase.from("works").delete().eq("id", id);
    await muatUlang(); setSibuk(false);
  }

  if (memuat) {
    return <main style={{ maxWidth: 640, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}><p>Memuat…</p></main>;
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <Link href="/dasbor" style={{ color: "#0B7A3E", textDecoration: "none" }}>← Dasbor</Link>
      <h1 style={{ fontSize: 30, margin: "10px 0 20px" }}>Karya Saya ({karya.length})</h1>
      {karya.length === 0 ? (
        <p style={{ color: "#888" }}>Belum ada karya. <Link href="/dasbor/tulis" style={{ color: "#0B7A3E" }}>Tulis karya pertamamu →</Link></p>
      ) : (
        <div>
          {karya.map(k => {
            const catatan = revisi.find(r => r.work_id === k.id && k.status === "REVISION_REQUIRED");
            return (
              <div key={k.id} style={{ borderTop: "1px solid #DDE4DD", padding: "16px 0" }}>
                <b style={{ fontSize: 18 }}>{k.title}</b>
                <span style={{ marginLeft: 10, color: WARNA[k.status], fontSize: 13 }}>● {LABEL_STATUS[k.status] || k.status}</span>
                <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
                  {LABEL_JENIS[k.content_type] || k.content_type} · diperbarui {new Date(k.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                {catatan && (
                  <div style={{ border: "1px solid #B3261E", background: "#FDF3F2", padding: "12px 16px", borderRadius: 4, marginTop: 10 }}>
                    <b style={{ color: "#B3261E", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Catatan Editor</b>
                    <p style={{ margin: "6px 0 0", fontStyle: "italic" }}>&ldquo;{catatan.note}&rdquo;</p>
                  </div>
                )}
                {k.status === "DRAFT" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => kirimReview(k.id)} disabled={sibuk} style={{ padding: "8px 14px", background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Kirim untuk Review</button>
                    <button onClick={() => hapus(k.id)} disabled={sibuk} style={{ padding: "8px 14px", border: "1px solid #B3261E", color: "#B3261E", background: "#fff", borderRadius: 4, cursor: "pointer" }}>Hapus</button>
                  </div>
                )}
                {k.status === "REVISION_REQUIRED" && (
                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => kirimReview(k.id)} disabled={sibuk} style={{ padding: "8px 14px", background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>↺ Perbaiki & Kirim Ulang</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
