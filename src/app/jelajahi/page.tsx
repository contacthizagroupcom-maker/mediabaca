import Link from "next/link";
import { HeaderPublik } from "@/components/HeaderPublik";
import { createServerClient } from "@supabase/ssr";
import { TemaToggle } from "@/components/TemaToggle";

export const dynamic = "force-dynamic";

const JENIS_LABEL: Record<string, string> = {
  ACADEMIC: "Akademik", FICTION: "Fiksi", NONFICTION: "Nonfiksi",
  OPINION: "Opini", JOURNALISM: "Jurnalistik",
};

export default async function Jelajahi({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const jenis = sp.jenis ?? "";
  const kategori = sp.kategori ?? "";
  const urut = sp.urut ?? "baru";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: kategoriList } = await supabase
    .from("categories").select("id, name, slug, parent_id").order("name");

  let q = supabase
    .from("works")
    .select("id, title, slug, excerpt, reading_time, views_count, published_at, content_type, category_id, profiles(full_name, username)")
    .eq("status", "PUBLISHED");

  if (jenis) q = q.eq("content_type", jenis);
  if (kategori) q = q.eq("category_id", kategori);
  q = urut === "populer"
    ? q.order("views_count", { ascending: false })
    : q.order("published_at", { ascending: false });

  const { data: works } = await q;
  const daftar = works ?? [];
  const semua = kategoriList ?? [];
  const induk = semua.filter(k => !k.parent_id);

  const url = (over: Record<string, string>) => {
    const p = new URLSearchParams({ jenis, kategori, urut, ...over });
    [...p.entries()].forEach(([k, v]) => { if (!v) p.delete(k); });
    const s = p.toString();
    return "/jelajahi" + (s ? "?" + s : "");
  };

  return (
    <>
      <HeaderPublik aktif="jelajahi" />

      <main className="container-mb narrow" style={{ padding: "36px 24px 80px" }}>
        <div className="kicker"><span className="idx">◇</span> JELAJAHI KARYA <span className="krule"></span></div>
        <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", margin: "14px 0 6px" }}>Jelajahi Karya</h1>
        <p className="meta" style={{ textTransform: "none", fontSize: 13, marginBottom: 24 }}>{daftar.length} karya ditemukan</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <Link href={url({ urut: "baru" })} className={`btn ${urut === "baru" ? "btn-primary" : ""}`} style={{ padding: "8px 14px", fontSize: 10 }}>Terbaru</Link>
          <Link href={url({ urut: "populer" })} className={`btn ${urut === "populer" ? "btn-primary" : ""}`} style={{ padding: "8px 14px", fontSize: 10 }}>Terpopuler</Link>
          {jenis && <Link href={url({ jenis: "" })} className="btn" style={{ padding: "8px 14px", fontSize: 10 }}>× {JENIS_LABEL[jenis] ?? jenis}</Link>}
          {kategori && <Link href={url({ kategori: "" })} className="btn" style={{ padding: "8px 14px", fontSize: 10 }}>× Kategori</Link>}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
          {Object.entries(JENIS_LABEL).map(([id, label]) => (
            <Link key={id} href={url({ jenis: jenis === id ? "" : id })}
              className={`btn ${jenis === id ? "btn-acc" : ""}`} style={{ padding: "8px 14px", fontSize: 10 }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 30 }}>
          {induk.map(p => (
            <span key={p.id} style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
              <span className="meta" style={{ marginRight: 2 }}>{p.name}:</span>
              {semua.filter(k => k.parent_id === p.id).map(k => (
                <Link key={k.id} href={url({ kategori: kategori === k.id ? "" : k.id })}
                  className="btn" style={{ padding: "6px 12px", fontSize: 10, borderColor: kategori === k.id ? "var(--acc)" : "var(--rule2)", color: kategori === k.id ? "var(--acc)" : "var(--mut)" }}>
                  {k.name}
                </Link>
              ))}
            </span>
          ))}
        </div>

        {daftar.length === 0 ? (
          <div style={{ border: "1px dashed var(--rule2)", padding: "40px 20px", textAlign: "center", borderRadius: 4 }}>
            <p style={{ color: "var(--mut)", marginBottom: 16 }}>Tidak ada karya yang cocok dengan filter ini.</p>
            <Link href="/jelajahi" className="btn btn-primary">× Reset Semua Filter</Link>
          </div>
        ) : (
          <ul className="work-list">
            {daftar.map((w: any) => (
              <li key={w.id}>
                <Link href={`/karya/${w.slug}`} className="work-item">
                  <div className="meta" style={{ marginBottom: 4 }}>
                    {JENIS_LABEL[w.content_type] ?? w.content_type}
                    {w.category_id && " · " + (semua.find(k => k.id === w.category_id)?.name ?? "")}
                  </div>
                  <div className="work-title">{w.title}</div>
                  {w.excerpt && <p className="work-excerpt">{w.excerpt}</p>}
                  <div className="work-meta">
                    {w.profiles?.full_name ?? "Penulis"} · {w.reading_time} mnt baca · {(w.views_count ?? 0).toLocaleString("id-ID")} pembaca
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
