import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

const AVATAR_FALLBACK = "https://picsum.photos/seed/mb-anon/200/200.jpg";
const COVER_FALLBACK = "https://picsum.photos/seed/mb-cover/1400/340.jpg";

export default async function ProfilPenulis({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: penulis } = await supabase
    .from("profiles")
    .select("id, full_name, username, bio, focus, avatar_url, cover_url, website, instagram, twitter, joined_at")
    .eq("username", decodeURIComponent(username))
    .maybeSingle();

  if (!penulis) {
    return (
      <main style={{ maxWidth: 640, margin: "0 auto", padding: 60, fontFamily: "Georgia, serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 26 }}>Penulis tidak ditemukan</h1>
        <p style={{ color: "#888" }}>Username @{username} tidak terdaftar di MediaBaca.</p>
        <Link href="/" style={{ color: "#0B7A3E" }}>← Kembali ke beranda</Link>
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
  const populer = [...semua].sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0));

  const { count: pengikut } = await supabase
    .from("follows").select("id", { count: "exact", head: true })
    .eq("following_id", penulis.id);

  const { count: suka } = await supabase
    .from("likes").select("id", { count: "exact", head: true })
    .in("work_id", semua.map(k => k.id));

  const totalViews = semua.reduce((s, k) => s + (k.views_count ?? 0), 0);

  const statistik = [
    { label: "Karya", nilai: semua.length },
    { label: "Pembaca", nilai: totalViews.toLocaleString("id-ID") },
    { label: "Suka", nilai: (suka ?? 0).toLocaleString("id-ID") },
    { label: "Pengikut", nilai: (pengikut ?? 0).toLocaleString("id-ID") },
  ];

  const formatTanggal = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main style={{ fontFamily: "Georgia, serif" }}>
      {penulis.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={penulis.cover_url} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={COVER_FALLBACK} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />
      )}

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -48, flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={penulis.avatar_url || AVATAR_FALLBACK}
            alt={penulis.full_name}
            style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", background: "#fff" }}
          />
          <div style={{ paddingBottom: 6 }}>
            <h1 style={{ fontSize: 32, lineHeight: 1.1 }}>{penulis.full_name}</h1>
            <p style={{ color: "#0B7A3E", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, margin: "4px 0 0" }}>
              {penulis.focus || "Penulis MediaBaca"} · @{penulis.username}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, borderTop: "1px solid #0D120D", borderBottom: "1px solid #0D120D", margin: "22px 0", flexWrap: "wrap" }}>
          {statistik.map(s => (
            <div key={s.label} style={{ flex: 1, minWidth: 120, padding: "14px 16px", borderLeft: "1px solid #DDE4DD" }}>
              <div style={{ fontSize: 24, fontWeight: "bold" }}>{s.nilai}</div>
              <div style={{ fontSize: 11, color: "#6E7C6E", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {penulis.bio && <p style={{ fontSize: 17, color: "#2C372C", lineHeight: 1.7 }}>{penulis.bio}</p>}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {penulis.website && (
            <a href={penulis.website} target="_blank" rel="noopener" style={{ fontSize: 12, color: "#2C372C", border: "1px solid #C7D2C7", borderRadius: 99, padding: "4px 12px", textDecoration: "none" }}>Website</a>
          )}
          {penulis.instagram && (
            <span style={{ fontSize: 12, color: "#2C372C", border: "1px solid #C7D2C7", borderRadius: 99, padding: "4px 12px" }}>{penulis.instagram}</span>
          )}
          {penulis.twitter && (
            <span style={{ fontSize: 12, color: "#2C372C", border: "1px solid #C7D2C7", borderRadius: 99, padding: "4px 12px" }}>{penulis.twitter}</span>
          )}
          <span style={{ fontSize: 12, color: "#6E7C6E", border: "1px solid #C7D2C7", borderRadius: 99, padding: "4px 12px" }}>
            Bergabung {penulis.joined_at ? formatTanggal(penulis.joined_at) : "—"}
          </span>
        </div>

        <h2 style={{ fontSize: 20, margin: "36px 0 4px", paddingBottom: 8, borderBottom: "2px solid #0D120D" }}>
          Karya Terbit ({semua.length})
        </h2>

        {semua.length === 0 ? (
          <p style={{ color: "#888", padding: "24px 0" }}>Belum ada karya terbit — karya penulis ini masih menunggu keputusan editorial.</p>
        ) : (
          <div>
            {semua.map((k, i) => (
              <div key={k.id} style={{ borderTop: "1px solid #DDE4DD", padding: "18px 0" }}>
                <Link href={`/karya/${k.slug}`} style={{ textDecoration: "none" }}>
                  <b style={{ fontSize: 20, color: "#0D120D" }}>{k.title}</b>
                </Link>
                <p style={{ color: "#2C372C", margin: "4px 0" }}>{k.excerpt}</p>
                <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                  {k.published_at ? formatTanggal(k.published_at) : "—"} · {k.reading_time} menit baca · {(k.views_count ?? 0).toLocaleString("id-ID")} pembaca
                  {populer[0] && k.id === populer[0].id && (
                    <span style={{ color: "#0B7A3E", fontWeight: "bold" }}> · 🔥 Terpopuler</span>
                  )}
                  {i === 0 && k.id !== populer[0]?.id && (
                    <span style={{ color: "#0B7A3E" }}> · Terbaru</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: 40 }}>
          <Link href="/" style={{ color: "#0B7A3E" }}>← Kembali ke beranda</Link>
        </p>
      </div>
    </main>
  );
}
