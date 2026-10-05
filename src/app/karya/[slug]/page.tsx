import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { SukaDanKomentar } from "@/components/KomentarSuka";
import { TombolBagikan } from "@/components/TombolBagikan";
import { TombolLaporkan } from "@/components/Laporkan";
import { CatatView } from "@/components/CatatView";
import { TombolBookmark } from "@/components/TombolBookmark";

export const dynamic = "force-dynamic";

async function ambilKarya(slug: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  const { data } = await supabase
    .from("works")
    .select("id, title, slug, excerpt, content, cover_url, status, views_count, reading_time, published_at, author_id, profiles(full_name, username)")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const karya = await ambilKarya(slug);
  if (!karya || karya.status !== "PUBLISHED") {
    return { title: "Karya tidak ditemukan — MediaBaca" };
  }
  const penulis = karya.profiles as any;
  const deskripsi = (karya.excerpt || "Baca karya ini di MediaBaca.").slice(0, 155);
  return {
    title: `${karya.title} — ${penulis?.full_name ?? "MediaBaca"}`,
    description: deskripsi,
    authors: [{ name: penulis?.full_name ?? "Penulis MediaBaca" }],
    openGraph: {
      title: karya.title,
      description: deskripsi,
      type: "article",
      siteName: "MediaBaca",
      images: karya.cover_url ? [{ url: karya.cover_url, width: 1200, height: 520, alt: karya.title }] : undefined,
      publishedTime: karya.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: karya.title,
      description: deskripsi,
      images: karya.cover_url ? [karya.cover_url] : undefined,
    },
  };
}

export default async function HalamanKarya({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const karya = await ambilKarya(slug);

  if (!karya || karya.status !== "PUBLISHED") {
    return (
      <main className="container-mb narrow" style={{ padding: "80px 24px", textAlign: "center" }}>
        <div className="kicker" style={{ justifyContent: "center" }}><span className="idx">404</span> TIDAK DITEMUKAN <span className="krule"></span></div>
        <h1 style={{ fontSize: 28, margin: "16px 0" }}>Karya tidak ditemukan</h1>
        <p style={{ color: "var(--mut)", marginBottom: 24 }}>Mungkin belum diterbitkan, atau tautannya salah.</p>
        <Link href="/" className="btn btn-primary">← Kembali ke Beranda</Link>
      </main>
    );
  }

  const penulis = karya.profiles as any;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: karya.title,
    description: karya.excerpt ?? "",
    image: karya.cover_url ?? undefined,
    datePublished: karya.published_at ?? undefined,
    author: { "@type": "Person", name: penulis?.full_name ?? "Penulis MediaBaca" },
    publisher: { "@type": "Organization", name: "MediaBaca" },
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header-in">
          <Link href="/" className="site-brand">Media<em>Baca</em></Link>
        </div>
      </header>

      <main className="container-mb narrow" style={{ padding: "44px 24px 80px" }}>
        <div className="kicker"><span className="idx">§</span> KARYA <span className="krule"></span></div>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", margin: "16px 0 10px", lineHeight: 1.15 }}>{karya.title}</h1>
        {karya.excerpt && <p style={{ fontStyle: "italic", color: "var(--ink2)", fontSize: 19 }}>{karya.excerpt}</p>}

        {karya.cover_url && (
          <figure style={{ margin: "26px 0 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={karya.cover_url} alt={"Sampul " + karya.title}
              style={{ width: "100%", maxHeight: 340, objectFit: "cover", borderRadius: 2, border: "1px solid var(--rule)" }} />
          </figure>
        )}

        <div style={{ borderTop: "2px solid var(--ink)", borderBottom: "1px solid var(--rule)", padding: "12px 0", margin: "22px 0 12px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Link href={`/penulis/${penulis?.username ?? ""}`} style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 17 }}>
            {penulis?.full_name ?? "Penulis MediaBaca"}
          </Link>
          <span className="meta">
            {karya.published_at
              ? new Date(karya.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
              : "—"}
            {" · "}{karya.reading_time} menit baca{" · "}{karya.views_count} pembaca
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <TombolBagikan judul={karya.title} ringkasan={karya.excerpt ?? undefined} />
          <TombolBookmark workId={karya.id} />
        </div>
        <div style={{ marginTop: 10 }}>
          <TombolLaporkan targetType="work" targetId={karya.id} />
        </div>

        <article className="prose-mb" style={{ marginTop: 26 }} dangerouslySetInnerHTML={{ __html: karya.content }} />

        <div style={{ marginTop: 44, borderTop: "1px solid var(--ink)", paddingTop: 14 }} className="meta">
          © {new Date().getFullYear()} {penulis?.full_name ?? "Penulis"}. All rights reserved. · Diterbitkan melalui MediaBaca
        </div>

        <SukaDanKomentar
          workId={karya.id}
          authorId={karya.author_id}
          authorName={penulis?.full_name ?? "Penulis"}
          authorUsername={penulis?.username ?? ""}
        />
      </main>

      <CatatView workId={karya.id} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
