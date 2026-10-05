"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";

type Item = {
  id: string; created_at: string;
  works: { id: string; title: string; slug: string; excerpt: string; reading_time: number; profiles: { full_name: string } | null } | null;
};

export default function Simpanan() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [items, setItems] = useState<Item[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      const { data } = await supabase
        .from("bookmarks")
        .select("id, created_at, works(id, title, slug, excerpt, reading_time, profiles(full_name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data as any) ?? []);
      setMemuat(false);
    })();
  }, [router, supabase]);

  async function lepas(id: string) {
    setSibuk(true);
    await supabase.from("bookmarks").delete().eq("id", id);
    setItems(items.filter(x => x.id !== id));
    setSibuk(false);
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  return (
    <>
      <HeaderDalam judul="Simpanan Bacaan" aksi={<Link href="/jelajahi" className="btn">🔍 Jelajahi Karya</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        <div className="kicker"><span className="idx">🔖</span> BACAAN TERSIMPAN ({items.length}) <span className="krule"></span></div>

        {items.length === 0 ? (
          <div style={{ border: "1px dashed var(--rule2)", padding: "40px 20px", textAlign: "center", borderRadius: 4, marginTop: 16 }}>
            <p style={{ color: "var(--mut)", marginBottom: 16 }}>Belum ada bacaan tersimpan. Temukan karya menarik dan tekan 🔖 Simpan Bacaan.</p>
            <Link href="/jelajahi" className="btn btn-acc">Jelajahi Sekarang</Link>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            {items.map(x => x.works && (
              <div key={x.id} style={{ borderTop: "1px solid var(--rule)", padding: "16px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <Link href={`/karya/${x.works.slug}`} style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 600 }}>
                    {x.works.title}
                  </Link>
                  <button onClick={() => lepas(x.id)} disabled={sibuk} className="btn" style={{ padding: "6px 12px", fontSize: 10, borderColor: "var(--err)", color: "var(--err)" }}>
                    × Lepas
                  </button>
                </div>
                {x.works.excerpt && <p className="work-excerpt">{x.works.excerpt}</p>}
                <div className="work-meta">
                  {x.works.profiles?.full_name ?? "Penulis"} · {x.works.reading_time} mnt baca · disimpan {new Date(x.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
