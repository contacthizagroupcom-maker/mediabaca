"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Komentar = {
  id: string; content: string; created_at: string;
  profiles: { full_name: string; username: string } | null;
};

export function SukaDanKomentar({ workId, authorId, authorName, authorUsername }: {
  workId: string; authorId: string; authorName: string; authorUsername: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const [suka, setSuka] = useState<number>(0);
  const [sayaSuka, setSayaSuka] = useState(false);
  const [ikut, setIkut] = useState(false);
  const [pengikut, setPengikut] = useState<number>(0);
  const [komen, setKomen] = useState<Komentar[]>([]);
  const [isi, setIsi] = useState("");
  const [masuk, setMasuk] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");

  async function muat() {
    const { data: { user } } = await supabase.auth.getUser();
    setMasuk(!!user);
    setUserId(user?.id ?? null);

    const { count } = await supabase
      .from("likes").select("id", { count: "exact", head: true })
      .eq("work_id", workId);
    setSuka(count ?? 0);

    const { count: pf } = await supabase
      .from("follows").select("id", { count: "exact", head: true })
      .eq("following_id", authorId);
    setPengikut(pf ?? 0);

    if (user) {
      const { data: l } = await supabase
        .from("likes").select("id").eq("work_id", workId).eq("user_id", user.id).maybeSingle();
      setSayaSuka(!!l);
      const { data: f } = await supabase
        .from("follows").select("id").eq("following_id", authorId).eq("follower_id", user.id).maybeSingle();
      setIkut(!!f);
    }

    const { data: k } = await supabase
      .from("comments")
      .select("id, content, created_at, profiles(full_name, username)")
      .eq("work_id", workId).eq("status", "VISIBLE")
      .order("created_at", { ascending: true });
    setKomen((k as any) ?? []);
  }

  useEffect(() => { muat(); }, [workId]);

  async function toggleSuka() {
    if (!masuk) return void (window.location.href = "/masuk");
    setSibuk(true);
    if (sayaSuka) {
      await supabase.from("likes").delete().eq("work_id", workId).eq("user_id", userId!);
      setSuka(s => s - 1); setSayaSuka(false);
    } else {
      await supabase.from("likes").insert({ work_id: workId, user_id: userId! });
      setSuka(s => s + 1); setSayaSuka(true);
      await supabase.from("notifications").insert({
        user_id: authorId, type: "like",
        message: "Seseorang menyukai karya Anda",
        reference_id: workId,
      });
    }
    setSibuk(false);
  }

  async function toggleIkut() {
    if (!masuk) return void (window.location.href = "/masuk");
    setSibuk(true);
    if (ikut) {
      await supabase.from("follows").delete().eq("following_id", authorId).eq("follower_id", userId!);
      setPengikut(p => p - 1); setIkut(false);
    } else {
      await supabase.from("follows").insert({ follower_id: userId!, following_id: authorId });
      setPengikut(p => p + 1); setIkut(true);
      await supabase.from("notifications").insert({
        user_id: authorId, type: "follow",
        message: "Seseorang mulai mengikuti Anda",
        reference_id: null,
      });
    }
    setSibuk(false);
  }

  async function kirimKomentar(e: React.FormEvent) {
    e.preventDefault();
    if (!masuk) return void (window.location.href = "/masuk");
    if (!isi.trim() || isi.length > 2000) { setPesan("Komentar 2–2000 karakter."); return; }
    setSibuk(true);
    await supabase.from("comments").insert({ work_id: workId, user_id: userId!, content: isi.trim() });
    await supabase.from("notifications").insert({
      user_id: authorId, type: "comment",
      message: "Seseorang mengomentari karya Anda",
      reference_id: workId,
    });
    setIsi(""); setPesan("");
    await muat();
    setSibuk(false);
  }

  async function hapusKomentar(id: string) {
    if (!confirm("Hapus komentar Anda?")) return;
    setSibuk(true);
    await supabase.from("comments").update({ status: "DELETED" }).eq("id", id);
    await muat();
    setSibuk(false);
  }

  return (
    <section style={{ marginTop: 56 }}>
      <div className="kicker"><span className="idx">§</span> APRESIASI & DISKUSI <span className="krule"></span></div>

      <div style={{ display: "flex", gap: 10, margin: "18px 0 30px", flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={toggleSuka} disabled={sibuk} className={`btn ${sayaSuka ? "btn-acc" : ""}`}>
          {sayaSuka ? "♥" : "♡"} Suka ({suka})
        </button>
        {userId !== authorId && (
          <button onClick={toggleIkut} disabled={sibuk} className={`btn ${ikut ? "" : "btn-primary"}`}>
            {ikut ? "✓ Mengikuti" : "+ Ikuti " + authorName}
          </button>
        )}
        <span className="meta">{pengikut} pengikut</span>
      </div>

      <div className="kicker"><span className="idx">02</span> KOMENTAR ({komen.length}) <span className="krule"></span></div>

      {masuk ? (
        <form onSubmit={kirimKomentar} className="field" style={{ margin: "16px 0" }}>
          <textarea className="input" style={{ minHeight: 80 }} value={isi}
            onChange={e => setIsi(e.target.value)} placeholder="Tulis komentar yang membangun…" />
          {pesan && <p style={{ color: "var(--err)", fontSize: 13, marginTop: 4 }}>{pesan}</p>}
          <button type="submit" disabled={sibuk} className="btn btn-acc" style={{ marginTop: 10 }}>
            {sibuk ? "Mengirim…" : "Kirim Komentar"}
          </button>
        </form>
      ) : (
        <p className="meta" style={{ margin: "16px 0", textTransform: "none", fontSize: 13 }}>
          <Link href="/masuk" style={{ color: "var(--acc)" }}>Masuk</Link> untuk ikut berdiskusi.
        </p>
      )}

      <div>
        {komen.length === 0 ? (
          <p style={{ color: "var(--mut)", padding: "12px 0" }}>Belum ada komentar — jadilah yang pertama berdiskusi.</p>
        ) : (
          komen.map(k => (
            <div key={k.id} style={{ borderTop: "1px solid var(--rule)", padding: "16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <Link href={`/penulis/${k.profiles?.username ?? ""}`} style={{ fontFamily: "var(--fd)", fontWeight: 600 }}>
                  {k.profiles?.full_name ?? "Pembaca"}
                </Link>
                <span className="meta">
                  {new Date(k.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  {k.profiles?.username === undefined && ""}
                  {userId && k.profiles?.username && (
                    <button onClick={() => hapusKomentar(k.id)} style={{ marginLeft: 10, background: "none", border: "none", color: "var(--mut)", cursor: "pointer", fontSize: 10, fontFamily: "var(--fm)", textTransform: "uppercase" }}>Hapus</button>
                  )}
                </span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 16 }}>{k.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
