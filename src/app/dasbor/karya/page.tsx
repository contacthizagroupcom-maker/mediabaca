"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";

type Karya = { id: string; title: string; slug: string; status: string; content_type: string; updated_at: string };

const LABEL_JENIS: Record<string, string> = { NONFICTION: "Nonfiksi", FICTION: "Fiksi", ACADEMIC: "Akademik", OPINION: "Opini", JOURNALISM: "Jurnalistik" };
const LABEL_STATUS: Record<string, string> = { DRAFT: "Draft", SUBMITTED: "Menunggu Review", IN_REVIEW: "Sedang Ditinjau", REVISION_REQUIRED: "Perlu Revisi", APPROVED: "Disetujui", PUBLISHED: "Terbit", REJECTED: "Ditolak" };
const KELAS: Record<string, string> = { DRAFT: "badge-draft", SUBMITTED: "badge-submitted", IN_REVIEW: "badge-submitted", REVISION_REQUIRED: "badge-revision", APPROVED: "badge-published", PUBLISHED: "badge-published", REJECTED: "badge-revision" };

export default function KaryaSaya() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [karya, setKarya] = useState<Karya[]>([]);
  const [revisi, setRevisi] = useState<{ id: string; work_id: string; note: string }[]>([]);
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
      .from("revisions").select("id, work_id, note")
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
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  return (
    <>
      <HeaderDalam judul="Karya Saya" aksi={<Link href="/dasbor/tulis" className="btn btn-acc">✍️ Tulis Baru</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        <div className="kicker" style={{ marginBottom: 16 }}><span className="idx">01</span> SEMUA KARYA ({karya.length}) <span className="krule"></span></div>

        {karya.length === 0 ? (
          <div style={{ border: "1px dashed var(--rule2)", padding: "40px 20px", textAlign: "center", borderRadius: 4 }}>
            <p style={{ color: "var(--mut)", marginBottom: 16 }}>Belum ada karya. Setiap penulis besar pernah menulis kalimat pertama.</p>
            <Link href="/dasbor/tulis" className="btn btn-acc">✍️ Tulis Karya Pertama</Link>
          </div>
        ) : (
          <div>
            {karya.map(k => {
              const catatan = revisi.find(r => r.work_id === k.id && k.status === "REVISION_REQUIRED");
              return (
                <div key={k.id} style={{ borderTop: "1px solid var(--rule)", padding: "18px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                    {k.status === "PUBLISHED" ? (
                      <Link href={`/karya/${k.slug}`} style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 600 }}>{k.title}</Link>
                    ) : (
                      <b style={{ fontFamily: "var(--fd)", fontSize: 20 }}>{k.title}</b>
                    )}
                    <span className={`badge ${KELAS[k.status] ?? "badge-draft"}`}>{LABEL_STATUS[k.status] || k.status}</span>
                  </div>
                  <div className="meta" style={{ marginTop: 4 }}>
                    {LABEL_JENIS[k.content_type] || k.content_type} · diperbarui {new Date(k.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  {catatan && (
                    <div style={{ border: "1px solid var(--err)", background: "var(--paper2)", padding: "12px 16px", borderRadius: 4, marginTop: 12 }}>
                      <b style={{ color: "var(--err)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, fontFamily: "var(--fm)" }}>Catatan Editor</b>
                      <p style={{ margin: "6px 0 0", fontStyle: "italic" }}>&ldquo;{catatan.note}&rdquo;</p>
                    </div>
                  )}

                  {k.status === "DRAFT" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => kirimReview(k.id)} disabled={sibuk} className="btn btn-acc" style={{ padding: "8px 14px", fontSize: 10 }}>Kirim untuk Review</button>
                      <button onClick={() => hapus(k.id)} disabled={sibuk} className="btn" style={{ padding: "8px 14px", fontSize: 10, borderColor: "var(--err)", color: "var(--err)" }}>Hapus</button>
                    </div>
                  )}
                  {k.status === "REVISION_REQUIRED" && (
                    <div style={{ marginTop: 12 }}>
                      <button onClick={() => kirimReview(k.id)} disabled={sibuk} className="btn btn-acc" style={{ padding: "8px 14px", fontSize: 10 }}>↺ Perbaiki & Kirim Ulang</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
