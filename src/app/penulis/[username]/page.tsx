import Link from "next/link";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

const AVATAR_FALLBACK = "https://picsum.photos/seed/mb-anon/200/200.jpg";

export default async function ProfilPenulis({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: penulis } = await supabase
    .from("profiles")
    .select("id, full_name, username, bio, focus, avatar_url, cover_url, joined_at")
    .eq("username", decodeURIComponent(username))
    .maybeSingle();

  if (!penulis) {
    return (
      <main className="container-mb narrow" style={{ padding: "80px 24px", textAlign: "center" }}>
        <div className="kicker" style={{ justifyContent: "center" }}><span className="idx">404</span> TIDAK DITEMUKAN <span className="krule"></span></div>
        <h1 style={{ fontSize: 28, margin: "16px 0" }}>Penulis tidak ditemukan</h1>
        <p style={{ color: "var(--mut)", marginBottom: 24 }}>@{decodeURIComponent(username)} tidak terdaftar di MediaBaca.</p>
        <Link href="/" className="btn btn-primary">← Kembali ke Beranda</Link>
      </main>
    );
  }

  const { data: karya } = await supabase
    .from("works")
    .select("id, title, slug, excerpt, reading_time, views_count, published_at")
    .eq("author_id", penulis.id)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  const semua = karya ?? [];
  const { count: pengikut } = await supabase
    .from("follows").select("id", { count: "exact", head: true })
    .eq("following_id", penulis.id);
  const { count: suka } = await supabase
    .from("likes").select("id", { count: "exact", head: true })
    .in("work_id", semua.map((k: any) => k.id));
  const totalViews = semua.reduce((s: number, k: any) => s + (k.views_count ?? 0), 0);

  return (
    <>
      <header className="site-header">
        <div className="site-header-in">
          <Link href="/" className="site-brand">Media<em>Baca</em></Link>
        </div>
      </header>

      <main style={{ fontFamily: "var(--fb)" }}>
        {penulis.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={penulis.cover_url} alt="" style={{ width: "100%", height: 180, objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: 120, background: "var(--ink)" }} />
        )}

        <div className="container-mb narrow" style={{ padding: "0 24px 80px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -44, flexWrap: "wrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={penulis.avatar_url || AVATAR_FALLBACK} alt={penulis.full_name}
              style={{ width: 92, height: 92, borderRadius: "50%", objectFit: "cover", border: "4px solid var(--paper)", background: "var(--paper)" }} />
            <div style={{ paddingBottom: 4 }}>
              <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>{penulis.full_name}</h1>
              <p className="meta" style={{ color: "var(--acc)", margin: "5px 0 0" }}>
                {penulis.focus || "Penulis MediaBaca"} · @{penulis.username}
              </p>
            </div>
          </div>

          <div className="stat-strip">
            <div className="stat-box"><div className="stat-n">{semua.length}</div><div className="stat-l">Karya</div></div>
            <div className="stat-box"><div className="stat-n">{totalViews.toLocaleString("id-ID")}</div><div className="stat-l">Pembaca</div></div>
            <div className="stat-box"><div className="stat-n">{(suka ?? 0).toLocaleString("id-ID")}</div><div className="stat-l">Suka</div></div>
            <div className="stat-box"><div className="stat-n">{(pengikut ?? 0).toLocaleString("id-ID")}</div><div className="stat-l">Pengikut</div></div>
          </div>

          {penulis.bio && <p style={{ fontSize: 17, color: "var(--ink2)", lineHeight: 1.7, marginBottom: 8 }}>{penulis.bio}</p>}
          {penulis.joined_at && (
            <p className="meta" style={{ marginBottom: 28 }}>
              Bergabung {new Date(penulis.joined_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          <div className="kicker"><span className="idx">01</span> KARYA TERBIT ({semua.length}) <span className="krule"></span></div>

          {semua.length === 0 ? (
            <p style={{ color: "var(--mut)", padding: "24px 0" }}>Belum ada karya terbit.</p>
          ) : (
            <ul className="work-list" style={{ marginTop: 16 }}>
              {semua.map((k: any) => (
                <li key={k.id}>
                  <Link href={`/karya/${k.slug}`} className="work-item">
                    <div className="work-title">{k.title}</div>
                    {k.excerpt && <p className="work-excerpt">{k.excerpt}</p>}
                    <div className="work-meta">
                      {k.published_at ? new Date(k.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                      {" · "}{k.reading_time} mnt baca{" · "}{(k.views_count ?? 0).toLocaleString("id-ID")} pembaca
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
