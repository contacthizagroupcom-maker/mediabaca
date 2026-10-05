import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { HeaderPublik } from "@/components/HeaderPublik";

export const dynamic = "force-dynamic";

async function ambilData() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  const { data } = await supabase
    .from("works")
    .select("id, title, slug, excerpt, cover_url, published_at, reading_time, views_count, profiles(full_name, username)")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });
  return data ?? [];
}

export default async function Home() {
  const works = await ambilData();
  const totalViews = works.reduce((s: number, w: any) => s + (w.views_count ?? 0), 0);

  return (
    <>
      <HeaderPublik aktif="beranda" />

      {/* ===== HERO ===== */}
      <section style={{
        background: "var(--ink)",
        color: "var(--paper)",
        padding: "clamp(40px, 7vw, 80px) 24px",
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(24px, 5vw, 56px)", alignItems: "center" }}>
          <div>
            <div className="kicker" style={{ color: "rgba(255,255,255,.6)" }}>
              <span className="idx" style={{ color: "#4CC97B" }}>✦</span> JURNAL DIGITAL MULTI-PENULIS
            </div>
            <h1 style={{
              fontFamily: "var(--fd)", fontWeight: 600,
              fontSize: "clamp(2rem, 5.5vw, 3.6rem)",
              lineHeight: 1.08, margin: "18px 0 16px", letterSpacing: "-.02em",
            }}>
              Ruang untuk <em style={{ color: "#4CC97B", fontStyle: "italic", fontWeight: 500 }}>Membaca</em>,
              Menulis, dan Berbagi Gagasan.
            </h1>
            <p style={{
              fontSize: "clamp(15px, 2vw, 18px)", fontStyle: "italic",
              color: "rgba(255,255,255,.75)", maxWidth: "34em", marginBottom: 26,
            }}>
              Dari makalah akademik sampai puisi tengah malam — setiap gagasan punya ruang di sini.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/daftar" className="btn btn-acc" style={{ padding: "14px 24px" }}>✍️ Mulai Menulis</Link>
              {works.length > 0 && <Link href="#karya" className="btn" style={{ padding: "14px 24px", color: "#fff", borderColor: "rgba(255,255,255,.4)" }}>Jelajahi Karya ↓</Link>}
            </div>
          </div>

          <div style={{
            border: "1px solid rgba(255,255,255,.2)", borderRadius: 6,
            padding: "clamp(20px, 3vw, 32px)", background: "rgba(255,255,255,.04)",
          }}>
            <div className="kicker" style={{ color: "rgba(255,255,255,.6)", marginBottom: 16 }}>
              <span className="idx" style={{ color: "#4CC97B" }}>MB</span> MEDIABACA HARI INI
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 600, color: "#4CC97B" }}>{works.length}</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>Karya Terbit</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 600, color: "#4CC97B" }}>{totalViews.toLocaleString("id-ID")}</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>Total Pembaca</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 600, color: "#4CC97B" }}>{new Set(works.map((w: any) => w.profiles?.username)).size}</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>Penulis Aktif</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 600, color: "#4CC97B" }}>∞</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(255,255,255,.6)" }}>Ruang Gagasan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== KARYA TERBIT ===== */}
      <main className="container-mb" style={{ padding: "clamp(36px, 5vw, 56px) 24px 80px" }} id="karya">
        <div className="kicker">
          <span className="idx">01</span> KARYA TERBIT ({works.length}) <span className="krule"></span>
          <Link href="/jelajahi" style={{ color: "var(--acc)", fontSize: 11, letterSpacing: ".1em" }}>LIHAT SEMUA →</Link>
        </div>

        {works.length === 0 ? (
          <p style={{ color: "var(--mut)", padding: "28px 0" }}>Belum ada karya terbit — jadilah penulis pertama!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22, marginTop: 22 }}>
            {works.map((w: any) => (
              <Link key={w.id} href={`/karya/${w.slug}`} style={{
                display: "block", borderRadius: 6, overflow: "hidden",
                border: "1px solid var(--rule)", background: "var(--paper)",
                textDecoration: "none", transition: "border-color .15s",
              }}>
                {w.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.cover_url} alt={w.title} loading="lazy"
                    style={{ width: "100%", height: 170, objectFit: "cover", display: "block", borderBottom: "1px solid var(--rule)" }} />
                ) : (
                  <div style={{ width: "100%", height: 170, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--rule)" }}>
                    <span style={{ fontFamily: "var(--fd)", fontSize: 40, color: "#4CC97B", fontStyle: "italic" }}>MB</span>
                  </div>
                )}
                <div style={{ padding: "14px 16px 16px" }}>
                  <h3 style={{ fontFamily: "var(--fd)", fontSize: 19, fontWeight: 600, lineHeight: 1.3, color: "var(--ink)", margin: 0 }}>
                    {w.title}
                  </h3>
                  {w.excerpt && (
                    <p style={{ color: "var(--ink2)", fontSize: 14, margin: "8px 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {w.excerpt}
                    </p>
                  )}
                  <div className="meta">
                    {w.profiles?.full_name ?? "Penulis"} · {w.reading_time} mnt
                    {w.published_at && " · " + new Date(w.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ===== MISION STRIP ===== */}
        <section style={{
          marginTop: "clamp(48px, 7vw, 72px)", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)",
          background: "var(--paper2)", padding: "clamp(36px, 6vw, 56px) 24px", textAlign: "center",
        }}>
          <p style={{
            fontFamily: "var(--fd)", fontSize: "clamp(1.3rem, 3vw, 1.9rem)", fontWeight: 560,
            lineHeight: 1.5, maxWidth: "22em", margin: "0 auto 26px",
          }}>
            Setiap orang punya cerita.<br />
            <em style={{ color: "var(--acc)" }}>Setiap gagasan punya ruang.</em><br />
            Setiap penulis punya rumah.
          </p>
          <Link href="/daftar" className="btn btn-acc" style={{ padding: "14px 24px" }}>
            ✍️ Mulai Menulis Sekarang
          </Link>
        </section>

        <footer style={{ marginTop: 48, borderTop: "1px solid var(--rule)", paddingTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }} className="meta">
          <span>© {new Date().getFullYear()} MediaBaca · Seluruh karya adalah milik penulisnya masing-masing.</span>
          <span>Dibangun untuk pembaca yang lama dan penulis yang tekun.</span>
        </footer>
      </main>
    </>
  );
}
