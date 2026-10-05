"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Komentar = {
  id: string; content: string; created_at: string; parent_id: string | null;
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
  const [balasUntuk, setBalasUntuk] = useState<string | null>(null);
  const [isiBalas, setIsiBalas] = useState("");

  async function ambilNama(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "Seseorang";
    const { data: pr } = await supabase
      .from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    return pr?.full_name ?? "Seseorang";
  }

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
      .select("id, content, created_at, parent_id, profiles(full_name, username)")
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
        message: (await ambilNama()) + " menyukai karya Anda",
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
        message: (await ambilNama()) + " mulai mengikuti Anda",
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
      message: (await ambilNama()) + " mengomentari karya Anda",
      reference_id: workId,
    });
    setIsi(""); setPesan("");
    await muat();
    setSibuk(false);
  }

  async function kirimBalasan(parentId: string) {
    if (!masuk) return void (window.location.href = "/masuk");
    if (!isiBalas.trim()) return;
    setSibuk(true);
    await supabase.from("comments").insert({ work_id: workId, user_id: userId!, content: isiBalas.trim(), parent_id: parentId });
    await supabase.from("notifications").insert({
      user_id: authorId, type: "comment",
      message: (await ambilNama()) + " membalas diskusi di karya Anda",
      reference_id: workId,
    });
    setIsiBalas(""); setBalasUntuk(null);
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
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                <Link href={`/penulis/${k.profiles?.username ?? ""}`} style={{ fontFamily: "var(--fd)", fontWeight: 600 }}>
                  {k.profiles?.full_name ?? "Pembaca"}
                </Link>
                <span className="meta" style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                  {new Date(k.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  {userId && (
                    <button onClick={() => hapusKomentar(k.id)} style={{ background: "none", border: "none", color: "var(--mut)", cursor: "pointer", fontSize: 10, fontFamily: "var(--fm)", textTransform: "uppercase" }}>Hapus</button>
                  )}
                  <TombolLaporKecil targetId={k.id} />
                </span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 16 }}>{k.content}</p>

              {masuk && !k.parent_id && (
                <button onClick={() => setBalasUntuk(balasUntuk === k.id ? null : k.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: balasUntuk === k.id ? "var(--acc)" : "var(--mut)", fontFamily: "var(--fm)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", marginTop: 8, padding: 0 }}>
                  ↩ Balas
                </button>
              )}

              {balasUntuk === k.id && (
                <div style={{ marginTop: 10 }}>
                  <textarea className="input" style={{ minHeight: 60 }} value={isiBalas}
                    onChange={e => setIsiBalas(e.target.value)} placeholder={"Balas " + (k.profiles?.full_name ?? "komentar ini") + "…"} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => kirimBalasan(k.id)} disabled={sibuk} className="btn btn-acc" style={{ padding: "8px 14px", fontSize: 10 }}>Kirim Balasan</button>
                    <button onClick={() => { setBalasUntuk(null); setIsiBalas(""); }} className="btn" style={{ padding: "8px 14px", fontSize: 10 }}>Batal</button>
                  </div>
                </div>
              )}

              {komen.filter(x => x.parent_id === k.id).length > 0 && (
                <div style={{ marginTop: 12, borderLeft: "2px solid var(--rule)", paddingLeft: 16 }}>
                  {komen.filter(x => x.parent_id === k.id).map(r => (
                    <div key={r.id} style={{ padding: "8px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <Link href={`/penulis/${r.profiles?.username ?? ""}`} style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 15 }}>
                          {r.profiles?.full_name ?? "Pembaca"}
                        </Link>
                        <span className="meta">{new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: 15 }}>{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TombolLaporKecil({ targetId }: { targetId: string }) {
  const supabase = getSupabaseBrowserClient();
  const [ok, setOk] = useState(false);
  async function lapor() {
    if (!confirm("Laporkan komentar ini ke moderator?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return void (window.location.href = "/masuk");
    await supabase.from("reports").insert({
      reporter_id: user.id, target_type: "comment", target_id: targetId, reason: "Lainnya",
    });
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  }
  return (
    <button onClick={lapor} style={{ background: "none", border: "none", cursor: "pointer", color: ok ? "var(--acc)" : "var(--mut)", fontFamily: "var(--fm)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase" }}>
      {ok ? "✓ Terlapor" : "🚩 Lapor"}
    </button>
  );
}
