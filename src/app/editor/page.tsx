"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";

type Karya = {
  id: string; title: string; slug: string; status: string;
  content_type: string; updated_at: string;
  profiles: { full_name: string; username: string } | null;
};

const LABEL_STATUS: Record<string, string> = {
  SUBMITTED: "Menunggu Review", IN_REVIEW: "Sedang Ditinjau",
  REVISION_REQUIRED: "Perlu Revisi", APPROVED: "Disetujui",
  PUBLISHED: "Terbit", REJECTED: "Ditolak",
};
const KELAS: Record<string, string> = {
  SUBMITTED: "badge-submitted", IN_REVIEW: "badge-submitted",
  REVISION_REQUIRED: "badge-revision", APPROVED: "badge-published",
  PUBLISHED: "badge-published", REJECTED: "badge-revision",
};

export default function MejaEditor() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [karya, setKarya] = useState<Karya[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [bukanEditor, setBukanEditor] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      const { data: saya } = await supabase
        .from("user_roles").select("role_id").eq("user_id", user.id);
      const peran = (saya ?? []).map((r: any) => r.role_id);
      if (!peran.includes("EDITOR") && !peran.includes("ADMIN")) {
        setBukanEditor(true); setMemuat(false); return;
      }
      const { data } = await supabase
        .from("works")
        .select("id, title, slug, status, content_type, updated_at, profiles(full_name, username)")
        .in("status", ["SUBMITTED", "IN_REVIEW", "REVISION_REQUIRED", "APPROVED", "REJECTED"])
        .order("updated_at", { ascending: true });
      setKarya(data ?? []);
      setMemuat(false);
    })();
  }, [router, supabase]);

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  if (bukanEditor) {
    return (
      <>
        <HeaderDalam judul="Meja Editor" />
        <main className="container-mb narrow" style={{ padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>Akses terbatas</h1>
          <p style={{ color: "var(--mut)", marginBottom: 24 }}>Halaman ini khusus Editor dan Admin.</p>
          <Link href="/" className="btn btn-primary">← Kembali ke Beranda</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <HeaderDalam judul="Meja Editor" aksi={<Link href="/dasbor" className="btn">← Dasbor</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        <div className="kicker" style={{ marginBottom: 16 }}>
          <span className="idx">🗂️</span> ANTREAN REVIEW ({karya.length}) <span className="krule"></span>
        </div>

        {karya.length === 0 ? (
          <div style={{ border: "1px dashed var(--rule2)", padding: "40px 20px", textAlign: "center", borderRadius: 4 }}>
            <p style={{ color: "var(--mut)" }}>Meja bersih — tidak ada karya yang menunggu. 🎉</p>
          </div>
        ) : (
          <div>
            {karya.map(k => (
              <div key={k.id} style={{ borderTop: "1px solid var(--rule)", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                    <b style={{ fontFamily: "var(--fd)", fontSize: 20 }}>{k.title}</b>
                    <span className={`badge ${KELAS[k.status] ?? "badge-draft"}`}>{LABEL_STATUS[k.status] || k.status}</span>
                  </div>
                  <div className="meta" style={{ marginTop: 4 }}>
                    oleh {k.profiles?.full_name ?? "Penulis"} · {new Date(k.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <Link href={`/editor/tinjau/${k.id}`} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
                  Tinjau →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
