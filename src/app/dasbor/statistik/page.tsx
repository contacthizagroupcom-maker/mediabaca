"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";
import { EmptyState } from "@/components/Skeleton";

type Karya = { id: string; title: string; slug: string; views_count: number; status: string };

export default function StatistikPenulis() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [karya, setKarya] = useState<Karya[]>([]);
  const [harian, setHarian] = useState<{ tgl: string; jumlah: number }[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }

      // Semua karya milik penulis
      const { data: k } = await supabase
        .from("works").select("id, title, slug, views_count, status")
        .eq("author_id", user.id)
        .order("views_count", { ascending: false });
      const semua = (k ?? []) as Karya[];
      setKarya(semua);

      // Views 14 hari terakhir untuk karya-karya penulis ini saja
      const ids = semua.map(x => x.id);
      if (ids.length > 0) {
        const { data: vws } = await supabase
          .from("views").select("work_id, created_at")
          .in("work_id", ids)
          .gte("created_at", new Date(Date.now() - 14 * 864e5).toISOString());
        const peta = new Map<string, number>();
        (vws ?? []).forEach((v: any) => {
          const tgl = new Date(v.created_at).toISOString().slice(0, 10);
          peta.set(tgl, (peta.get(tgl) ?? 0) + 1);
        });
        setHarian([...peta.entries()].map(([tgl, jumlah]) => ({ tgl, jumlah })).sort((a, b) => a.tgl.localeCompare(b.tgl)));
      }

      setMemuat(false);
    })();
  }, [router, supabase]);

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  const terbit = karya.filter(x => x.status === "PUBLISHED");
  const totalViews = terbit.reduce((s, x) => s + (x.views_count ?? 0), 0);
  const totalMinggu = harian.reduce((s, h) => s + h.jumlah, 0);
  const maks = Math.max(1, ...harian.map(h => h.jumlah));
  const karyaTerbaik = terbit[0];

  return (
    <>
      <HeaderDalam judul="Statistik" aksi={<Link href="/dasbor" className="btn">← Dasbor</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>

        {terbit.length === 0 ? (
          <EmptyState
            ikon="📊"
            judul="Statistik menunggu karya pertamamu"
            sub="Terbitkan karya, dan di sini kamu bisa melihat jumlah pembaca, tren harian, dan karya terpopuler-mu."
            cta="✍️ Tulis Karya Pertama"
            href="/dasbor/tulis"
          />
        ) : (
          <>
            <div className="kicker"><span className="idx">01</span> RINGKASAN <span className="krule"></span></div>
            <div className="stat-strip" style={{ marginTop: 14 }}>
              <div className="stat-box"><div className="stat-n">{terbit.length}</div><div className="stat-l">Karya Terbit</div></div>
              <div className="stat-box"><div className="stat-n">{totalViews.toLocaleString("id-ID")}</div><div className="stat-l">Total Pembaca</div></div>
              <div className="stat-box"><div className="stat-n">{totalMinggu}</div><div className="stat-l">Dibaca 14 Hari</div></div>
              {karyaTerbaik && (
                <div className="stat-box">
                  <div className="stat-n" style={{ fontSize: 16, lineHeight: 1.3, marginTop: 4 }}>{karyaTerbaik.title.length > 28 ? karyaTerbaik.title.slice(0, 28) + "…" : karyaTerbaik.title}</div>
                  <div className="stat-l">Terpopuler</div>
                </div>
              )}
            </div>

            <div className="kicker" style={{ marginTop: 36 }}><span className="idx">02</span> PEMBACA 14 HARI TERAKHIR <span className="krule"></span></div>
            {harian.length === 0 ? (
              <p style={{ color: "var(--mut)", padding: "14px 0", fontSize: 15 }}>
                Belum ada kunjungan tercatat dalam 14 hari terakhir — bagikan karyamu lewat tombol 📤 di halaman karya!
              </p>
            ) : (
              <div style={{ marginTop: 14 }}>
                {harian.map(h => (
                  <div key={h.tgl} style={{ display: "grid", gridTemplateColumns: "86px 1fr 36px", gap: 12, alignItems: "center", padding: "5px 0" }}>
                    <span className="meta" style={{ textTransform: "none" }}>
                      {new Date(h.tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                    <div style={{ height: 10, background: "var(--paper3)", borderRadius: 2, position: "relative" }}>
                      <div style={{ position: "absolute", inset: "0 auto 0 0", width: Math.round(h.jumlah / maks * 100) + "%", background: "var(--acc)", borderRadius: 2 }} />
                    </div>
                    <span className="meta" style={{ textAlign: "right" }}>{h.jumlah}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="kicker" style={{ marginTop: 36 }}><span className="idx">03</span> SEMUA KARYA ({karya.length}) <span className="krule"></span></div>
            <div style={{ marginTop: 14 }}>
              {karya.map((k, i) => (
                <div key={k.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 12, alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--rule)" }}>
                  <span style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 600, color: "var(--acc)", textAlign: "center" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    {k.status === "PUBLISHED" ? (
                      <Link href={`/karya/${k.slug}`} style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 600, textDecoration: "none" }}>{k.title}</Link>
                    ) : (
                      <span style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 600, color: "var(--mut)" }}>{k.title}</span>
                    )}
                    <div className="meta" style={{ textTransform: "none", fontSize: 10.5, marginTop: 2 }}>
                      {k.status === "PUBLISHED" ? "Terbit" : k.status === "DRAFT" ? "Draft" : "Dalam proses editorial"}
                    </div>
                  </span>
                  <span className="meta" style={{ textAlign: "right" }}>{(k.views_count ?? 0).toLocaleString("id-ID")} pembaca</span>
                </div>
              ))}
            </div>

            <p style={{ marginTop: 28, color: "var(--mut)", fontSize: 13.5, fontStyle: "italic" }}>
              💡 Tips: karya dengan sampul dan ringkasan yang menarik mendapat 2–3x lebih banyak pembaca. Bagikan lewat WhatsApp dengan tombol 📤 di halaman karya.
            </p>
          </>
        )}
      </main>
    </>
  );
}
