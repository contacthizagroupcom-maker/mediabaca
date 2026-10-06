"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";
import { EmptyState } from "@/components/Skeleton";

type Item = {
  id: string;
  created_at: string;
  works: {
    id: string; title: string; slug: string; excerpt: string;
    cover_url: string; reading_time: number;
    profiles: { full_name: string } | null;
  } | null;
};

export default function RiwayatBacaan() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [items, setItems] = useState<Item[]>([]);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }

      const { data } = await supabase
        .from("views")
        .select("id, created_at, works(id, title, slug, excerpt, cover_url, reading_time, profiles(full_name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      // Hanya yang karyanya masih terbit, dan dedup per karya (ambil yang terbaru)
      const terlihat = new Set<string>();
      const bersih: Item[] = [];
      for (const v of (data ?? []) as any[]) {
        if (v.works && !terlihat.has(v.works.id)) {
          terlihat.add(v.works.id);
          bersih.push(v as Item);
        }
      }
      setItems(bersih);
      setMemuat(false);
    })();
  }, [router, supabase]);

  function waktuLalu(d: string) {
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 3600) return Math.max(1, Math.floor(s / 60)) + " menit lalu";
    if (s < 86400) return Math.floor(s / 3600) + " jam lalu";
    if (s < 604800) return Math.floor(s / 86400) + " hari lalu";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  return (
    <>
      <HeaderDalam judul="Riwayat Bacaan" aksi={<Link href="/jelajahi" className="btn">🧭 Jelajahi</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        <div className="kicker"><span className="idx">📖</span> LANJUTKAN MEMBACA ({items.length}) <span className="krule"></span></div>

        {items.length === 0 ? (
          <div style={{ marginTop: 16 }}>
            <EmptyState
              ikon="📚"
              judul="Belum ada riwayat bacaan"
              sub="Setiap karya yang kamu baca otomatis tercatat di sini — mulai dari Jelajahi, dan kembali kapan pun untuk melanjutkan."
              cta="Jelajahi Karya Sekarang"
              href="/jelajahi"
            />
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            {items.map(v => v.works && (
              <Link key={v.id} href={`/karya/${v.works.slug}`} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderTop: "1px solid var(--rule)", textDecoration: "none" }}>
                {v.works.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.works.cover_url} alt="" loading="lazy" style={{ width: 96, height: 68, objectFit: "cover", borderRadius: 4, border: "1px solid var(--rule)", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 96, height: 68, background: "var(--ink)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--fd)", fontSize: 20, color: "#4CC97B", fontStyle: "italic" }}>MB</span>
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontFamily: "var(--fd)", fontSize: 18, color: "var(--ink)", display: "block", lineHeight: 1.3 }}>
                    {v.works.title}
                  </b>
                  {v.works.excerpt && (
                    <p style={{ color: "var(--ink2)", fontSize: 13.5, margin: "4px 0", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {v.works.excerpt}
                    </p>
                  )}
                  <div className="meta" style={{ textTransform: "none", fontSize: 11 }}>
                    {v.works.profiles?.full_name ?? "Penulis"} · {v.works.reading_time} mnt · dibaca {waktuLalu(v.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
