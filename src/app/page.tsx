import Link from "next/link";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

async function ambilData() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  const { data } = await supabase
    .from("works")
    .select("id, title, slug, excerpt, status, published_at, reading_time, profiles(full_name, username)")
    .eq("status", "PUBLISHED");
  return data ?? [];
}

export default async function Home() {
  const works = await ambilData();

  return (
    <>
      <header className="site-header">
        <div className="site-header-in">
          <span className="site-brand">Media<em>Baca</em></span>
          <nav className="site-nav">
            <Link href="/daftar">Daftar</Link>
            <Link href="/masuk">Masuk</Link>
          </nav>
        </div>
      </header>

      <main className="container-mb narrow" style={{ padding: "48px 24px 80px" }}>
        <div className="kicker"><span className="idx">MB</span> JURNAL DIGITAL MULTI-PENULIS <span className="krule"></span></div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", margin: "18px 0 14px", lineHeight: 1.1 }}>
          Ruang untuk <span style={{ color: "var(--acc)" }}>Membaca</span>, Menulis, dan Berbagi Gagasan.
        </h1>
        <p style={{ fontStyle: "italic", color: "var(--ink2)", fontSize: 19, marginBottom: 28 }}>
          Dari makalah akademik sampai puisi tengah malam — setiap gagasan punya ruang di sini.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
          <Link href="/daftar" className="btn btn-acc">✍️ Mulai Menulis</Link>
          {works.length > 0 && <Link href="#karya" className="btn">Jelajahi Karya ↓</Link>}
        </div>

        <div className="kicker" id="karya"><span className="idx">01</span> KARYA TERBIT ({works.length}) <span className="krule"></span></div>

        {works.length === 0 ? (
          <p style={{ color: "var(--mut)", padding: "28px 0" }}>
            Belum ada karya terbit — jadilah penulis pertama!
          </p>
        ) : (
          <ul className="work-list" style={{ marginTop: 20 }}>
            {works.map((w: any) => (
              <li key={w.id}>
                <Link href={`/karya/${w.slug}`} className="work-item">
                  <div className="work-title">{w.title}</div>
                  {w.excerpt && <p className="work-excerpt">{w.excerpt}</p>}
                  <div className="work-meta">
                    {w.profiles?.full_name ?? "Penulis"} · {w.reading_time} mnt baca
                    {w.published_at && " · " + new Date(w.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <footer style={{ marginTop: 60, borderTop: "1px solid var(--ink)", paddingTop: 16 }} className="meta">
          © {new Date().getFullYear()} MediaBaca · Seluruh karya adalah milik penulisnya masing-masing.
        </footer>
      </main>
    </>
  );
}
