"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam, BadgePeran } from "@/components/AppShell";

type Profil = { id: string; full_name: string; username: string; created_at: string };
type Karya = { id: string; title: string; status: string; content_type: string; views_count: number; updated_at: string; profiles: { full_name: string } | null };
type Laporan = { id: string; target_type: string; reason: string; status: string; created_at: string };

const LABEL_STATUS: Record<string, string> = {
  DRAFT: "Draft", SUBMITTED: "Menunggu Review", IN_REVIEW: "Sedang Ditinjau",
  REVISION_REQUIRED: "Perlu Revisi", APPROVED: "Disetujui", PUBLISHED: "Terbit", REJECTED: "Ditolak",
};
const KELAS: Record<string, string> = {
  DRAFT: "badge-draft", SUBMITTED: "badge-submitted", IN_REVIEW: "badge-submitted",
  REVISION_REQUIRED: "badge-revision", APPROVED: "badge-published", PUBLISHED: "badge-published", REJECTED: "badge-revision",
};

export default function Admin() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [tab, setTab] = useState<"ringkasan" | "pengguna" | "karya" | "laporan" | "komentar">("ringkasan");
  const [bukanAdmin, setBukanAdmin] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);

  const [stat, setStat] = useState({ pengguna: 0, karya: 0, terbit: 0, review: 0, komentar: 0, pembaca: 0 });
  const [pengguna, setPengguna] = useState<(Profil & { peran: string })[]>([]);
  const [karya, setKarya] = useState<Karya[]>([]);
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [komentarModerasi, setKomentarModerasi] = useState<{ id: string; content: string; status: string; profiles: { full_name: string } | null }[]>([]);

  async function muatSemua() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/masuk"); return; }
    const { data: ur } = await supabase.from("user_roles").select("role_id").eq("user_id", user.id);
    const peran = (ur ?? []).map((r: any) => r.role_id);
    if (!peran.includes("ADMIN")) { setBukanAdmin(true); setMemuat(false); return; }

    const { count: cp } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const { data: semuaKarya } = await supabase
      .from("works").select("id, title, status, content_type, views_count, updated_at, profiles(full_name)");
    const k = semuaKarya ?? [];
    const { count: ckm } = await supabase.from("comments").select("id", { count: "exact", head: true }).eq("status", "VISIBLE");

    setStat({
      pengguna: cp ?? 0,
      karya: k.length,
      terbit: k.filter((x: any) => x.status === "PUBLISHED").length,
      review: k.filter((x: any) => ["SUBMITTED", "IN_REVIEW", "REVISION_REQUIRED"].includes(x.status)).length,
      komentar: ckm ?? 0,
      pembaca: k.reduce((s: any, x: any) => Number(s) + (x.views_count ?? 0), 0),
    });
    setKarya(k.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));

    const { data: pp } = await supabase
      .from("profiles").select("id, full_name, username, created_at").order("created_at", { ascending: false });
    const daftarP = pp ?? [];
    const { data: roles } = await supabase.from("user_roles").select("user_id, role_id");
    const peta = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      peta.set(r.user_id, [...(peta.get(r.user_id) ?? []), r.role_id]);
    });
    setPengguna(daftarP.map((p: any) => ({ ...p, peran: (peta.get(p.id) ?? ["READER"]).join(" · ") })));

    const { data: lr } = await supabase
      .from("reports").select("id, target_type, reason, status, created_at").order("created_at", { ascending: false });
    setLaporan((lr as any) ?? []);

    const { data: km } = await supabase
      .from("comments")
      .select("id, content, status, profiles(full_name)")
      .neq("status", "DELETED")
      .order("created_at", { ascending: false })
      .limit(30);
    setKomentarModerasi((km as any) ?? []);

    setMemuat(false);
  }

  useEffect(() => { muatSemua(); }, []);

  async function ubahPeran(userId: string, peranBaru: string) {
    if (!confirm("Ubah peran pengguna ini menjadi " + peranBaru + "?")) return;
    setSibuk(true);
    await supabase.from("user_roles").delete().eq("user_id", userId).neq("role_id", "READER");
    await supabase.from("user_roles").insert({ user_id: userId, role_id: peranBaru });
    await muatSemua();
    setSibuk(false);
  }

  async function hapusKarya(id: string) {
    if (!confirm("Hapus karya ini permanen?")) return;
    setSibuk(true);
    await supabase.from("works").delete().eq("id", id);
    await muatSemua();
    setSibuk(false);
  }

  async function sembunyikanKomentar(id: string) {
    if (!confirm("Sembunyikan komentar ini dari publik?")) return;
    setSibuk(true);
    await supabase.from("comments").update({ status: "HIDDEN" }).eq("id", id);
    await muatSemua();
    setSibuk(false);
  }

  async function tampilkanKomentar(id: string) {
    setSibuk(true);
    await supabase.from("comments").update({ status: "VISIBLE" }).eq("id", id);
    await muatSemua();
    setSibuk(false);
  }

  async function selesaikanLaporan(id: string) {
    setSibuk(true);
    await supabase.from("reports").update({ status: "RESOLVED" }).eq("id", id);
    await muatSemua();
    setSibuk(false);
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  if (bukanAdmin) {
    return (
      <>
        <HeaderDalam judul="Administrasi" />
        <main className="container-mb narrow" style={{ padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>Akses terbatas</h1>
          <p style={{ color: "var(--mut)", marginBottom: 24 }}>Halaman ini khusus Administrator.</p>
          <Link href="/" className="btn btn-primary">← Kembali ke Beranda</Link>
        </main>
      </>
    );
  }

  const TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "pengguna", label: "Pengguna" },
    { id: "karya", label: "Karya" },
    { id: "laporan", label: "Laporan" },
    { id: "komentar", label: "Komentar" },
  ] as const;

  return (
    <>
      <HeaderDalam judul="Administrasi" aksi={<Link href="/dasbor" className="btn">← Dasbor</Link>} />
      <main className="container-mb" style={{ padding: "24px 24px 80px" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24, borderBottom: "2px solid var(--ink)", paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: "10px 18px", cursor: "pointer", fontFamily: "var(--fm)", fontSize: 11,
                letterSpacing: ".1em", textTransform: "uppercase",
                background: "none", border: "none", borderBottom: tab === t.id ? "3px solid var(--acc)" : "3px solid transparent",
                color: tab === t.id ? "var(--acc)" : "var(--mut)", marginBottom: -2,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "ringkasan" && (
          <>
            <div className="stat-strip">
              <div className="stat-box"><div className="stat-n">{stat.pengguna}</div><div className="stat-l">Pengguna</div></div>
              <div className="stat-box"><div className="stat-n">{stat.karya}</div><div className="stat-l">Total Karya</div></div>
              <div className="stat-box"><div className="stat-n">{stat.terbit}</div><div className="stat-l">Terbit</div></div>
              <div className="stat-box"><div className="stat-n">{stat.review}</div><div className="stat-l">Dalam Review</div></div>
              <div className="stat-box"><div className="stat-n">{stat.komentar}</div><div className="stat-l">Komentar</div></div>
              <div className="stat-box"><div className="stat-n">{stat.pembaca.toLocaleString("id-ID")}</div><div className="stat-l">Total Pembaca</div></div>
            </div>

            <div className="kicker" style={{ marginTop: 32 }}><span className="idx">01</span> KARYA TERBARU <span className="krule"></span></div>
            <div style={{ marginTop: 12 }}>
              {karya.slice(0, 5).map(k => (
                <div key={k.id} style={{ borderTop: "1px solid var(--rule)", padding: "12px 0", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <b style={{ fontFamily: "var(--fd)" }}>{k.title}</b>
                  <span className={`badge ${KELAS[k.status] ?? "badge-draft"}`}>{LABEL_STATUS[k.status]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "pengguna" && (
          <>
            <div className="kicker"><span className="idx">01</span> SEMUA PENGGUNA ({pengguna.length}) <span className="krule"></span></div>
            <div style={{ marginTop: 12 }}>
              {pengguna.map(p => (
                <div key={p.id} style={{ borderTop: "1px solid var(--rule)", padding: "14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <Link href={`/penulis/${p.username}`} style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 17 }}>{p.full_name}</Link>
                      <div className="meta" style={{ marginTop: 2 }}>
                        @{p.username} · bergabung {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <BadgePeran peran={p.peran} />
                      <select value={p.peran.split(" · ").includes("ADMIN") ? "ADMIN" : p.peran.split(" · ").includes("EDITOR") ? "EDITOR" : p.peran.split(" · ").includes("WRITER") ? "WRITER" : "READER"}
                        onChange={e => ubahPeran(p.id, e.target.value)} disabled={sibuk}
                        style={{ padding: "6px 10px", fontSize: 12, border: "1px solid var(--rule2)", borderRadius: 4, background: "var(--paper)", color: "var(--ink)" }}>
                        <option value="READER">READER</option>
                        <option value="WRITER">WRITER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "karya" && (
          <>
            <div className="kicker"><span className="idx">01</span> SEMUA KARYA ({karya.length}) <span className="krule"></span></div>
            <div style={{ marginTop: 12 }}>
              {karya.map(k => (
                <div key={k.id} style={{ borderTop: "1px solid var(--rule)", padding: "14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <b style={{ fontFamily: "var(--fd)", fontSize: 17 }}>{k.title}</b>
                      <div className="meta" style={{ marginTop: 2 }}>
                        {k.profiles?.full_name ?? "—"} · {(k.views_count ?? 0).toLocaleString("id-ID")} pembaca
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={`badge ${KELAS[k.status] ?? "badge-draft"}`}>{LABEL_STATUS[k.status]}</span>
                      <button onClick={() => hapusKarya(k.id)} disabled={sibuk} className="btn" style={{ padding: "6px 12px", fontSize: 10, borderColor: "var(--err)", color: "var(--err)" }}>Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "laporan" && (
          <>
            <div className="kicker"><span className="idx">01</span> LAPORAN MODERASI ({laporan.filter(l => l.status === "OPEN").length} TERBUKA) <span className="krule"></span></div>
            {laporan.length === 0 ? (
              <div style={{ border: "1px dashed var(--rule2)", padding: "40px 20px", textAlign: "center", borderRadius: 4, marginTop: 16 }}>
                <p style={{ color: "var(--mut)" }}>Tidak ada laporan — platform bersih. 🎉</p>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                {laporan.map(l => (
                  <div key={l.id} style={{ borderTop: "1px solid var(--rule)", padding: "14px 0", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <b style={{ fontFamily: "var(--fd)" }}>{l.target_type === "work" ? "Karya" : l.target_type === "comment" ? "Komentar" : "Profil"}</b>
                      <span className="meta" style={{ marginLeft: 8 }}>{l.reason}</span>
                      <div className="meta" style={{ marginTop: 2 }}>
                        {new Date(l.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    {l.status === "OPEN" ? (
                      <button onClick={() => selesaikanLaporan(l.id)} disabled={sibuk} className="btn btn-acc" style={{ padding: "8px 14px", fontSize: 10 }}>✓ Tandai Selesai</button>
                    ) : (
                      <span className="badge badge-published">Selesai</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "komentar" && (
          <>
            <div className="kicker"><span className="idx">02</span> MODERASI KOMENTAR ({komentarModerasi.length}) <span className="krule"></span></div>
            <p className="meta" style={{ textTransform: "none", fontSize: 12, margin: "8px 0 16px" }}>
              Sembunyikan komentar yang melanggar — penulisnya tetap bisa melihat miliknya, publik tidak.
            </p>
            {komentarModerasi.length === 0 ? (
              <div style={{ border: "1px dashed var(--rule2)", padding: "40px 20px", textAlign: "center", borderRadius: 4 }}>
                <p style={{ color: "var(--mut)" }}>Tidak ada komentar aktif. 🎉</p>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                {komentarModerasi.map(k => (
                  <div key={k.id} style={{ borderTop: "1px solid var(--rule)", padding: "14px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                      <b style={{ fontFamily: "var(--fd)", fontSize: 15 }}>{k.profiles?.full_name ?? "Pengguna"}</b>
                      <span className={`badge ${k.status === "HIDDEN" ? "badge-revision" : "badge-draft"}`}>
                        {k.status === "HIDDEN" ? "Disembunyikan" : "Tampil"}
                      </span>
                    </div>
                    <p style={{ margin: "6px 0", fontSize: 15, color: "var(--ink2)" }}>{k.content}</p>
                    {k.status === "VISIBLE" ? (
                      <button onClick={() => sembunyikanKomentar(k.id)} disabled={sibuk} className="btn" style={{ padding: "6px 12px", fontSize: 10, borderColor: "var(--err)", color: "var(--err)" }}>
                        🚫 Sembunyikan
                      </button>
                    ) : (
                      <button onClick={() => tampilkanKomentar(k.id)} disabled={sibuk} className="btn btn-acc" style={{ padding: "6px 12px", fontSize: 10 }}>
                        ✓ Tampilkan Ulang
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
