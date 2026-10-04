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
    .select("id, title, slug, excerpt, status, published_at")
    .eq("status", "PUBLISHED");
  return data ?? [];
}

export default async function Home() {
  const works = await ambilData();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: 42 }}>
        Media<span style={{ color: "#0B7A3E" }}>Baca</span>
      </h1>
      <p style={{ fontStyle: "italic", color: "#555" }}>
        Ruang untuk Membaca, Menulis, dan Berbagi Gagasan.
      </p>
      <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid #ddd" }} />
      <h2 style={{ fontSize: 20 }}>Karya Terbit ({works.length})</h2>
      {works.length === 0 ? (
        <p style={{ color: "#888" }}>Belum ada karya terbit.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {works.map((w: any) => (
            <li key={w.id} style={{ borderBottom: "1px solid #eee", padding: "14px 0" }}>
              <Link href={`/karya/${w.slug}`} style={{ textDecoration: "none" }}>
                <b style={{ fontSize: 19, color: "#0D120D" }}>{w.title}</b>
              </Link>
              <p style={{ color: "#666", margin: "4px 0" }}>{w.excerpt}</p>
              <small style={{ color: "#999" }}>/karya/{w.slug}</small>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: 30, fontSize: 14 }}>
        <Link href="/daftar" style={{ color: "#0B7A3E", marginRight: 16 }}>Daftar</Link>
        <Link href="/masuk" style={{ color: "#0B7A3E" }}>Masuk</Link>
      </p>
    </main>
  );
}
