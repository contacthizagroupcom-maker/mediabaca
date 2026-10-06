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
    .select("id, title, slug, excerpt, cover_url, published_at, reading_time, views_count, content_type, category_id, profiles(full_name, username), categories(name)")
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
  const utama = works[0] as any;
  const sisanya = works.slice(1, 5);
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

      <Masthead
        tanggal={new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
        edisi={"Edisi No. " + (works.length + 40)}
      />

      {/* ===== TAB NAVIGASI ===== */}
      <div style={{ borderBottom: "1px solid var(--rule)", background: "var(--paper)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="container-mb" style={{ display: "flex", gap: 4, overflowX: "auto", padding: "0 24px", scrollbarWidth: "none" }}>
          {["TERBARU", ...Object.values(JENIS_LABEL)].map((t, i) => (
            <Link key={t} href={i === 0 ? "/jelajahi" : `/jelajahi?jenis=${Object.keys(JENIS_LABEL).find(k => JENIS_LABEL[k] === t)}`}
              style={{
                fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em",
                padding: "13px 14px", whiteSpace: "nowrap", textDecoration: "none",
                color: i === 0 ? "var(--acc)" : "var(--mut)",
                borderBottom: i === 0 ? "2px solid var(--acc)" : "2px solid transparent",
              }}>{t}</Link>
          ))}
        </div>
      </div>

      {/* ===== KARTU UTAMA ===== */}
      {utama ? (
        <main className="container-mb" style={{ padding: "26px 24px 10px" }}>
          <Link href={`/karya/${utama.slug}`} style={{ display: "block", textDecoration: "none" }}>
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--rule)" }} className="mb-muncul mb-kartu">
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
            <div style={KARTU_META}>
              {utama.profiles?.full_name ?? "Penulis"} · {utama.reading_time} mnt · {new Date(utama.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </Link>
        </main>
      ) : (
        <main className="container-mb" style={{ padding: "60px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--mut)" }}>Belum ada karya terbit — jadilah penulis pertama!</p>
          <Link href="/daftar" className="btn btn-acc">✍️ Mulai Menulis</Link>
        </main>
      )}

      {/* ===== TERBARU DI MEDIABACA ===== */}
      {sisanya.length > 0 && (
        <section className="container-mb" style={{ padding: "30px 24px 6px" }}>
          <div className="kicker"><span className="idx">01</span> TERBARU DI MEDIABACA <span className="krule mb-krule-anim"></span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginTop: 16 }}>
            {sisanya.map((w: any, i: number) => (
              <Link key={w.id} href={`/karya/${w.slug}`} style={{ textDecoration: "none", borderRadius: 6, overflow: "hidden", border: "1px solid var(--rule)" }} className={`mb-kartu mb-muncul-${Math.min(4, i % 5)}`}> 
                {w.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.cover_url} alt={w.title} loading="lazy" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 6, border: "1px solid var(--rule)", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: 110, background: "var(--ink)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "var(--fd)", fontSize: 26, color: "#4CC97B", fontStyle: "italic" }}>MB</span>
                  </div>
                )}
                <h3 style={{ fontFamily: "var(--fd)", fontSize: 15, fontWeight: 600, lineHeight: 1.3, margin: "8px 0 4px", color: "var(--ink)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{w.title}</h3>
                <div style={KARTU_META}>{JENIS_LABEL[w.content_type] ?? ""} · {w.reading_time} mnt</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== TERPOPULER MINGGU INI ===== */}
      {populer.length > 0 && (
        <section className="container-mb" style={{ padding: "30px 24px 6px" }}>
          <div className="kicker"><span className="idx">02</span> TERPOPULER MINGGU INI <span className="krule mb-krule-anim"></span></div>
          <div style={{ marginTop: 10 }}>
            {populer.map((w: any, i: number) => (
              <Link key={w.id} href={`/karya/${w.slug}`} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, alignItems: "center", padding: "14px 0", borderTop: "1px solid var(--rule)", textDecoration: "none" }}>
                <span style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 600, color: "var(--acc)", textAlign: "center", lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 600, color: "var(--ink)", display: "block", lineHeight: 1.3 }}>{w.title}</span>
                  <span style={KARTU_META}>{w.profiles?.full_name ?? "Penulis"} · {(w.views_count ?? 0).toLocaleString("id-ID")} pembaca</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== JELAJAHI PILAR ===== */}
      <section className="container-mb" style={{ padding: "34px 24px 10px" }}>
        <div className="kicker"><span className="idx">03</span> JELAJAHI PILAR <span className="krule mb-krule-anim"></span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginTop: 16 }}>
          {PILAR.map(p => (
            <Link key={p.jenis} href={`/jelajahi?jenis=${p.jenis}`} style={{
              border: "1px solid var(--rule)", borderRadius: 8, padding: "16px 14px",
              textDecoration: "none", background: "var(--paper2)",
            }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{p.label}</div>
              <div style={{ fontFamily: "var(--fb)", fontSize: 13, color: "var(--mut)", marginTop: 4 }}>{p.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== HERO RINGKAS + MISI ===== */}
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
          <Link href="/jelajahi" style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink2)", textDecoration: "none" }}>Jelajahi</Link>
          <Link href="/daftar" style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--acc)", textDecoration: "none" }}>Mulai Menulis</Link>
        </nav>
        <div className="meta">
          © {new Date().getFullYear()} MediaBaca · Seluruh karya adalah milik penulisnya masing-masing
        </div>
      </footer>
    </>
  );
}
