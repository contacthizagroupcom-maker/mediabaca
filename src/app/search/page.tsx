import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { TemaToggle } from "@/components/TemaToggle";

export const dynamic = "force-dynamic";

const JENIS_LABEL: Record<string, string> = {
  ACADEMIC: "Akademik", FICTION: "Fiksi", NONFICTION: "Nonfiksi",
  OPINION: "Opini", JOURNALISM: "Jurnalistik",
};

export default async function HalamanCari({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const kata = (q ?? "").trim();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  let hasilKarya: any[] = [];
  let hasilPenulis: any[] = [];

  if (kata.length >= 2) {
    const { data: k } = await supabase
      .from("works")
      .select("id, title, slug, excerpt, cover_url, reading_time, views_count, content_type, profiles(full_name, username)")
      .eq("status", "PUBLISHED")
      .or(`title.ilike.%${kata}%,excerpt.ilike.%${kata}%,content.ilike.%${kata}%`)
      .order("views_count", { ascending: false })
      .limit(20);
    hasilKarya = k ?? [];

    const { data: p } = await supabase
      .from("profiles")
      .select("id, full_name, username, bio, focus, avatar_url")
      .or(`full_name.ilike.%${kata}%,username.ilike.%${kata}%,focus.ilike.%${kata}%`)
      .limit(10);
    hasilPenulis = p ?? [];
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header-in">
          <Link href="/" className="site-brand">Media<em>Baca</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <nav className="site-nav"><Link href="/">Beranda</Link><Link href="/jelajahi">Jelajahi</Link></nav>
            <TemaToggle />
          </div>
        </div>
      </header>

      <main className="container-mb narrow" style={{ padding: "36px 24px 80px" }}>
        <div className="kicker"><span className="idx">🔍</span> PENCARIAN <span className="krule"></span></div>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", margin: "14px 0 18px" }}>Cari di MediaBaca</h1>

        <form action="/search" method="get" style={{ display: "flex", gap: 8, marginBottom: 30, flexWrap: "wrap" }}>
          <input name="q" defaultValue={kata} placeholder="Judul karya, isi, nama penulis, username…"
            className="input" style={{ flex: 1, minWidth: 200 }} autoFocus />
          <button type="submit" className="btn btn-acc" style={{ padding: "12px 20px" }}>Cari</button>
        </form>

        {kata.length < 2 ? (
          <p style={{ color: "var(--mut)" }}>Ketik minimal 2 huruf untuk mulai mencari — judul, isi karya, nama penulis.</p>
        ) : (
          <>
            <div className="kicker"><span className="idx">01</span> KARYA ({hasilKarya.length}) <span className="krule"></span></div>
            {hasilKarya.length === 0 ? (
              <p style={{ color: "var(--mut)", padding: "10px 0 24px" }}>Tidak ada karya yang cocok.</p>
            ) : (
              <ul className="work-list" style={{ margin: "14px 0 34px" }}>
                {hasilKarya.map((w: any) => (
                  <li key={w.id}>
                    <Link href={`/karya/${w.slug}`} className="work-item" style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                      {w.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={w.cover_url} alt="" loading="lazy" style={{ width: 120, height: 84, objectFit: "cover", borderRadius: 2, border: "1px solid var(--rule)", flexShrink: 0 }} />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div className="work-title">{w.title}</div>
                        {w.excerpt && <p className="work-excerpt">{w.excerpt}</p>}
                        <div className="work-meta">
                          {w.profiles?.full_name ?? "Penulis"} · {JENIS_LABEL[w.content_type] ?? ""} · {w.reading_time} mnt baca
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="kicker"><span className="idx">02</span> PENULIS ({hasilPenulis.length}) <span className="krule"></span></div>
            {hasilPenulis.length === 0 ? (
              <p style={{ color: "var(--mut)", padding: "10px 0" }}>Tidak ada penulis yang cocok.</p>
            ) : (
              <div style={{ marginTop: 14 }}>
                {hasilPenulis.map((p: any) => (
                  <Link key={p.id} href={`/penulis/${p.username}`} className="work-item" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.avatar_url || "https://picsum.photos/seed/mb-anon/200/200.jpg"} alt=""
                      style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                    <div>
                      <div className="work-title" style={{ fontSize: 18 }}>{p.full_name}</div>
                      <div className="work-meta">@{p.username}{p.focus ? " · " + p.focus : ""}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
