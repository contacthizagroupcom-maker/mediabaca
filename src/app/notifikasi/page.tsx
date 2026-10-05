"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";

type Notif = {
  id: string; type: string; message: string;
  is_read: boolean; created_at: string; reference_id: string | null;
};

const IKON: Record<string, string> = {
  like: "♥", comment: "💬", follow: "👤", approved: "✅",
  revision: "↺", rejected: "✕", submit: "📤",
};

export default function HalamanNotifikasi() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [memuat, setMemuat] = useState(true);
  let saluran: any = null;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      const { data } = await supabase
        .from("notifications")
        .select("id, type, message, is_read, created_at, reference_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifs((data as any) ?? []);
      setMemuat(false);

      // Realtime: daftar ikut bertambah saat ada notifikasi baru
      saluran = supabase
        .channel("halaman-notif")
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications" },
          async (payload: any) => {
            if (payload?.new?.user_id !== user.id) return;
            const { data: baru } = await supabase
              .from("notifications")
              .select("id, type, message, is_read, created_at, reference_id")
              .eq("id", payload.new.id).maybeSingle();
            if (baru) setNotifs(n => [baru as any, ...n]);
          })
        .subscribe();
    })();

    return () => { if (saluran) supabase.removeChannel(saluran); };
  }, [router, supabase]);

  async function tandaiSemua() {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
  }

  const belumDibaca = notifs.filter(n => !n.is_read).length;

  function waktu(d: string) {
    const selisih = (Date.now() - new Date(d).getTime()) / 1000;
    if (selisih < 60) return "baru saja";
    if (selisih < 3600) return Math.floor(selisih / 60) + " menit lalu";
    if (selisih < 86400) return Math.floor(selisih / 3600) + " jam lalu";
    if (selisih < 604800) return Math.floor(selisih / 86400) + " hari lalu";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  return (
    <>
      <HeaderDalam judul="Notifikasi" aksi={
        belumDibaca > 0 ? <button onClick={tandaiSemua} className="btn">✓ Tandai dibaca</button> : undefined
      } />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        <div className="kicker"><span className="idx">🔔</span> APA YANG TERBARU ({notifs.length}) <span className="krule"></span></div>

        {notifs.length === 0 ? (
          <div style={{ border: "1px dashed var(--rule2)", padding: "40px 20px", textAlign: "center", borderRadius: 4, marginTop: 16 }}>
            <p style={{ color: "var(--mut)" }}>Belum ada notifikasi. Ikuti penulis, sukai karya, atau kirim komentar — kabar terbarunya muncul di sini.</p>
          </div>
        ) : (
          <div style={{ marginTop: 16 }}>
            {notifs.map(n => (
              <div key={n.id} style={{
                borderTop: "1px solid var(--rule)", padding: "16px 0",
                display: "flex", gap: 14, alignItems: "flex-start",
                opacity: n.is_read ? 0.65 : 1,
                background: n.is_read ? "transparent" : "var(--paper2)",
                marginLeft: -12, marginRight: -12, paddingLeft: 12, paddingRight: 12,
              }}>
                <span style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid var(--rule2)", fontSize: 15,
                  color: n.type === "approved" || n.type === "like" ? "var(--acc)" :
                         n.type === "revision" || n.type === "rejected" ? "var(--err)" : "var(--ink2)",
                }}>{IKON[n.type] ?? "•"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5 }}>{n.message}</p>
                  <span className="meta" style={{ textTransform: "none", fontSize: 11 }}>{waktu(n.created_at)}</span>
                </div>
                {n.reference_id && (
                  <Link href={`/dasbor/karya`} className="btn" style={{ padding: "6px 12px", fontSize: 10, whiteSpace: "nowrap" }}>
                    Lihat →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
