import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HalamanKarya({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: karya } = await supabase
    .from("works")
    .select("id, title, slug, excerpt, content, content_type, status, views_count, reading_time, published_at, author_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!karya || karya.status !== "PUBLISHED") {
    return (
      <main style={{ maxWidth: 640, margin: "0 auto", padding: 60, fontFamily: "Georgia, serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 26 }}>Karya tidak ditemukan</h1>
        <p style={{ color: "#888" }}>Mungkin belum diterbitkan, atau tautannya salah.</p>
        <Link href="/" style={{ color: "#0B7A3E" }}>← Kembali ke beranda</Link>
      </main>
    );
  }

  const { data: penulis } = await supabase
    .from("profiles").select("full_name, username, bio")
    .eq("id", karya.author_id).maybeSingle();

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px", fontFamily: "Georgia, serif" }}>
      <Link href="/" style={{ color: "#0B7A3E", textDecoration: "none" }}>← MediaBaca</Link>
      <h1 style={{ fontSize: 38, lineHeight: 1.2, margin: "20px 0 10px" }}>{karya.title}</h1>
      <p style={{ fontStyle: "italic", color: "#555", fontSize: 18 }}>{karya.excerpt}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0", flexWrap: "wrap" }}>
        <b>{penulis?.full_name ?? "Penulis MediaBaca"}</b>
        <span style={{ color: "#888", fontSize: 13 }}>
          {karya.published_at
            ? new Date(karya.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
            : "—"}
          {" · "}{karya.reading_time} menit baca{" · "}{karya.views_count} pembaca
        </span>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #0D120D", margin: "20px 0" }} />
      <article style={{ fontSize: 18, lineHeight: 1.9, color: "#1a1a1a" }} dangerouslySetInnerHTML={{ __html: karya.content }} />
      <hr style={{ border: "none", borderTop: "1px solid #0D120D", margin: "36px 0 16px" }} />
      <p style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>
        © {new Date().getFullYear()} {penulis?.full_name ?? "Penulis"}. All rights reserved.
      </p>
    </main>
  );
}
