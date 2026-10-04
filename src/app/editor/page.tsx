"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Karya = {
  id: string; title: string; slug: string; status: string;
  content_type: string; updated_at: string;
  profiles: { full_name: string; username: string } | null;
};

const LABEL_STATUS: Record<string, string> = {
  SUBMITTED: "Menunggu Review", IN_REVIEW: "Sedang Ditinjau",
  REVISION_REQUIRED: "Perlu Revisi", APPROVED: "Disetujui",
  PUBLISHED: "Terbit", REJECTED: "Ditolak", DRAFT: "Draft",
};
const WARNA: Record<string, string> = {
  SUBMITTED: "#8A6A1F", IN_REVIEW: "#2F5E8A", REVISION_REQUIRED: "#B3261E",
  APPROVED: "#1E7A46", PUBLISHED: "#0B7A3E", REJECTED: "#B3261E", DRAFT: "#6E7C6E",
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
    return <main style={{ maxWidth: 700, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}><p>Memuat…</p></main>;
  }

  if (bukanEditor) {
    return (
      <main style={{ maxWidth: 640, margin: "0 auto", padding: 60, fontFamily: "Georgia, serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 26 }}>Meja editor</h1>
        <p style={{ color: "#888" }}>Halaman ini khusus Editor dan Admin.</p>
        <Link href="/" style={{ color: "#0B7A3E" }}>← Kembali ke beranda</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <Link href="/" style={{ color: "#0B7A3E", textDecoration: "none" }}>← MediaBaca</Link>
      <h1 style={{ fontSize: 30, margin: "10px 0 4px" }}>Meja Editor</h1>
      <p style={{ color: "#888" }}>Karya menunggu keputusan editorial ({karya.length})</p>
      {karya.length === 0 ? (
        <p style={{ color: "#888", padding: "30px 0", border: "1px dashed #C7D2C7", textAlign: "center", borderRadius: 4, marginTop: 20 }}>
          Meja bersih — tidak ada karya yang menunggu. 🎉
        </p>
      ) : (
        <div>
          {karya.map(k => (
            <div key={k.id} style={{ borderTop: "1px solid #DDE4DD", padding: "18px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div>
                <b style={{ fontSize: 19 }}>{k.title}</b>
                <span style={{ marginLeft: 10, color: WARNA[k.status], fontSize: 13 }}>● {LABEL_STATUS[k.status] || k.status}</span>
                <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
                  oleh {k.profiles?.full_name ?? "Penulis"} · dikirim {new Date(k.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <Link href={`/editor/tinjau/${k.id}`} style={{ padding: "10px 16px", background: "#0D120D", color: "#fff", borderRadius: 4, textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" }}>
                Tinjau →
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
