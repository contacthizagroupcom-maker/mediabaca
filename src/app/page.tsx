import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { HeaderPublik } from "@/components/HeaderPublik";
import { Masthead } from "@/components/Masthead";

export const dynamic = "force-dynamic";

async function ambilSemua() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  const { data } = await supabase
    .from("works")
    .select("id, title, slug, excerpt, cover_url, published_at, reading_time, views_count, content_type, profiles(full_name, username, avatar_url)")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });
  return data ?? [];
}

const JENIS_LABEL: Record<string, string> = {
  ACADEMIC: "AKADEMIK", FICTION: "FIKSI", NONFICTION: "NONFIKSI",
  OPINION: "OPINI", JOURNALISM: "JURNALISTIK",
};

const KARTU_META = { fontFamily: "var(--fm)", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--mut)" } as const;

export default async function Home() {
  const works = await ambilSemua();
  const utama = (works[0] as any) ?? null;
  const sisanya = works.slice(1);
  const populer = [...works].sort((a: any, b: any) => (b.views_count ?? 0) - (a.views_count ?? 0)).slice(0, 5);
  const totalViews = works.reduce((s: number, w: any) => s + (w.views_count ?? 0), 0);

  const PILAR = [
    { jenis: "ACADEMIC", label: "Akademik", desc: "Makalah, kajian, penelitian" },
    { jenis: "FICTION", label: "Fiksi", desc: "Cerpen, novel, puisi" },
    { jenis: "NONFICTION", label: "Esai & Nonfiksi", desc: "Refleksi, memoar, perjalanan" },
    { jenis: "OPINION", label: "Opini", desc: "Filsafat, sosial, teknologi" },
    { jenis: "JOURNALISM", label: "Jurnalistik", desc: "Feature, reportase" },
  ];

  return (
    <>
      <HeaderPublik aktif="beranda" />

      <Masthead tanggal={new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date())} />

      {/* ===== TAB NAVIGASI ===== */}
      <div style={{ borderBottom: "1px solid var(--rule)", background: "var(--paper)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="container-mb" style={{ display: "flex", gap: 4, overflowX: "auto", padding: "0 24px", scrollbarWidth: "none", borderTop: "1px solid var(--ink)" }}>
          {[
            { label: "TERBARU", href: "/jelajahi", id: "terbaru" },
            { label: "TERPOPULER", href: "/jelajahi?urut=populer", id: "populer" },
            { label: "AKADEMIK", href: "/jelajahi?jenis=ACADEMIC", id: "ACADEMIC" },
            { label: "FIKSI", href: "/jelajahi?jenis=FICTION", id: "FICTION" },
            { label: "ESAI", href: "/jelajahi?jenis=NONFICTION", id: "NONFICTION" },
            { label: "OPINI", href: "/jelajahi?jenis=OPINION", id: "OPINION" },
          ].map(t => (
            <Link key={t.id} href={t.href}
              style={{
                fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em",
                padding: "13px 12px", whiteSpace: "nowrap", textDecoration: "none",
                color: t.id === "terbaru" ? "var(--acc)" : "var(--mut)",
                borderBottom: t.id === "terbaru" ? "2px solid var(--acc)" : "2px solid transparent",
              }}>{t.label}</Link>
          ))}
        </div>
      </div>

      {/* ===== KARTU UTAMA ===== */}
      {utama ? (
        <main className="container-mb" style={{ padding: "26px 24px 10px" }}>
          <Link href={`/karya/${utama.slug}`} style={{ display: "block", textDecoration: "none" }}>
            <div className="mb-kartu" style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--rule)" }}>
              {utama.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={utama.cover_url} alt={utama.title} style={{ width: "100%", height: "clamp(200px, 42vw, 380px)", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "clamp(200px, 42vw, 380px)", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--fd)", fontSize: 56, color: "#4CC97B", fontStyle: "italic" }}>MB</span>
                </div>
              )}
              <span style={{
                position: "absolute", top: 14, left: 14,
                background: "var(--acc)", color: "#fff",
                fontFamily: "var(--fm)", fontSize: 10, letterSpacing: ".12em",
                padding: "5px 10px", borderRadius: 3,
              }}>{JENIS_LABEL[utama.content_type] ?? "KARYA"}</span>
            </div>
            <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.4rem, 4vw, 2rem)", lineHeight: 1.2, margin: "16px 0 8px", color: "var(--ink)" }}>
              {utama.title}
            </h1>
            <p style={{ color: "var(--ink2)", margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {utama.excerpt}
            </p>
            {/* Penulis kartu utama — avatar + nama + username */}
            <Link href={`/penulis/${utama.profiles?.username ?? ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={utama.profiles?.avatar_url || "https://picsum.photos/seed/mb-anon/100/100.jpg"} alt=""
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--rule)" }} />
              <span>
                <b style={{ fontFamily: "var(--fd)", fontSize: 15, color: "var(--ink)", display: "block", lineHeight: 1.2 }}>
                  {utama.profiles?.full_name ?? "Penulis"}
                </b>
                <span style={KARTU_META}>@{utama.profiles?.username ?? "penulis"}</span>
              </span>
            </Link>
          </Link>
        </main>
      ) : (
        <main className="container-mb" style={{ padding: "60px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--mut)" }}>Belum ada karya terbit — jadilah penulis pertama!</p>
          <Link href="/daftar" className="btn btn-acc">✍️ Mulai Menulis</Link>
        </main>
      )}

      {/* ===== SEMUA KARYA ===== */}
      {sisanya.length > 0 && (
        <section className="container-mb" style={{ padding: "30px 24px 6px" }}>
          <div className="kicker">
            <span className="idx">01</span> SEMUA KARYA ({works.length}) <span className="krule mb-krule-anim"></span>
            <Link href="/jelajahi" style={{ color: "var(--acc)", fontSize: 11, letterSpacing: ".1em" }}>JELAJAHI →</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 20 }}>
            {sisanya.map((w: any, i: number) => (
              <Link key={w.id} href={`/karya/${w.slug}`}
                className={`mb-kartu mb-muncul-${Math.min(4, i % 5)}`}
                style={{ textDecoration: "none", borderRadius: 8, overflow: "hidden", border: "1px solid var(--rule)", background: "var(--paper)" }}>

                {w.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.cover_url} alt={w.title} loading="lazy"
                    style={{ width: "100%", height: 160, objectFit: "cover", display: "block", borderBottom: "1px solid var(--rule)" }} />
                ) : (
                  <div style={{ width: "100%", height: 160, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--rule)" }}>
                    <span style={{ fontFamily: "var(--fd)", fontSize: 34, color: "#4CC97B", fontStyle: "italic" }}>MB</span>
                  </div>
                )}

                <div style={{ padding: "14px 16px 16px" }}>
                  <span style={{
                    display: "inline-block", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase",
                    fontFamily: "var(--fm)", color: "var(--acc)", border: "1px solid var(--acc)",
                    borderRadius: 3, padding: "2px 7px", marginBottom: 8,
                  }}>{JENIS_LABEL[w.content_type] ?? "KARYA"}</span>

                  <h3 style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: "var(--ink)", margin: "0 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {w.title}
                  </h3>

                  {w.excerpt && (
                    <p style={{ color: "var(--ink2)", fontSize: 13.5, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {w.excerpt}
                    </p>
                  )}

                  {/* BARIS PENULIS: avatar bulat + nama + @username */}
                  <Link href={`/penulis/${w.profiles?.username ?? ""}`} style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", paddingTop: 10, borderTop: "1px solid var(--rule)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.profiles?.avatar_url || "https://picsum.photos/seed/mb-anon/100/100.jpg"} alt=""
                      loading="lazy"
                      style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1.5px solid var(--rule2)" }} />
                    <span style={{ minWidth: 0 }}>
                      <b style={{ fontFamily: "var(--fd)", fontSize: 13.5, color: "var(--ink)", display: "block", lineHeight: 1.2 }}>
                        {w.profiles?.full_name ?? "Penulis"}
                      </b>
                      <span style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--mut)" }}>@{w.profiles?.username ?? "penulis"}</span>
                    </span>
                    <span style={{ marginLeft: "auto", fontFamily: "var(--fm)", fontSize: 10, color: "var(--mut)", whiteSpace: "nowrap" }}>
                      {w.reading_time} mnt
                    </span>
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== TERPOPULER ===== */}
      {populer.length > 0 && (
        <section className="container-mb" style={{ padding: "30px 24px 6px" }}>
          <div className="kicker"><span className="idx">02</span> TERPOPULER MINGGU INI <span className="krule"></span></div>
          <div style={{ marginTop: 10 }}>
            {populer.map((w: any, i: number) => (
              <Link key={w.id} href={`/karya/${w.slug}`} style={{ display: "grid", gridTemplateColumns: "44px 44px 1fr", gap: 12, alignItems: "center", padding: "12px 0", borderTop: "1px solid var(--rule)", textDecoration: "none" }}>
                <span style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 600, color: "var(--acc)", textAlign: "center", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.profiles?.avatar_url || "https://picsum.photos/seed/mb-anon/100/100.jpg"} alt=""
                  loading="lazy" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                <span>
                  <span style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 600, color: "var(--ink)", display: "block", lineHeight: 1.25 }}>{w.title}</span>
                  <span style={KARTU_META}>{w.profiles?.full_name ?? "Penulis"} · {(w.views_count ?? 0).toLocaleString("id-ID")} pembaca</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== JELAJAHI PILAR ===== */}
      <section className="container-mb" style={{ padding: "34px 24px 10px" }}>
        <div className="kicker"><span className="idx">03</span> JELAJAHI PILAR <span className="krule"></span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginTop: 16 }}>
          {PILAR.map(p => (
            <Link key={p.jenis} href={`/jelajahi?jenis=${p.jenis}`} className="mb-kartu" style={{
              border: "1px solid var(--rule)", borderRadius: 8, padding: "16px 14px",
              textDecoration: "none", background: "var(--paper2)",
            }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{p.label}</div>
              <div style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--mut)", marginTop: 4 }}>{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== MISI ===== */}
      <section style={{ background: "var(--ink)", color: "var(--paper)", padding: "clamp(36px, 6vw, 56px) 24px", marginTop: 34 }}>
        <div className="container-mb" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.3rem, 3.5vw, 2rem)", lineHeight: 1.5, maxWidth: "22em", margin: "0 auto 20px" }}>
            Setiap orang punya cerita.<br />
            <em style={{ color: "#4CC97B" }}>Setiap gagasan punya ruang.</em><br />
            Setiap penulis punya rumah.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/daftar" className="btn btn-acc" style={{ padding: "13px 22px" }}>✍️ Mulai Menulis</Link>
            <Link href="/jelajahi" className="btn" style={{ padding: "13px 22px", color: "#fff", borderColor: "rgba(255,255,255,.4)" }}>Jelajahi Karya</Link>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--rule)", padding: "26px 24px 30px", textAlign: "center" }}>
        <nav style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <Link href="/tentang" style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink2)", textDecoration: "none" }}>Tentang</Link>
          <Link href="/privasi" style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink2)", textDecoration: "none" }}>Privasi</Link>
          <Link href="/disclaimer" style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink2)", textDecoration: "none" }}>Disclaimer</Link>
          <Link href="/kontak" style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink2)", textDecoration: "none" }}>Kontak</Link>
          <Link href="/daftar" style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--acc)", textDecoration: "none" }}>Mulai Menulis</Link>
        </nav>
        <div className="meta">
          © {new Date().getFullYear()} MediaBaca · Seluruh karya adalah milik penulisnya masing-masing
        </div>
      </footer>
    </>
  );
}
