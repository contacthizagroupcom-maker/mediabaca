"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const inGaya = { width: "100%", padding: 12, border: "1px solid #C7D2C7", borderRadius: 4, fontSize: 16, background: "#fff", color: "#0D120D", boxSizing: "border-box" } as const;
const labGaya = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: "bold", color: "#2C372C" } as const;

type Profil = {
  full_name: string; username: string; bio: string; focus: string;
  avatar_url: string; cover_url: string; website: string; instagram: string; twitter: string;
};

export default function EditProfil() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [p, setP] = useState<Profil | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      const { data } = await supabase
        .from("profiles").select("full_name, username, bio, focus, avatar_url, cover_url, website, instagram, twitter")
        .eq("id", user.id).maybeSingle();
      setP(data ?? null);
      setMemuat(false);
    })();
  }, [router, supabase]);

  function ubah(k: keyof Profil, v: string) {
    if (!p) return;
    setP({ ...p, [k]: v });
  }

  async function simpan() {
    if (!p) return;
    setGalat(""); setPesan("");
    if (!p.full_name.trim()) { setGalat("Nama lengkap wajib diisi."); return; }
    if (!/^[a-z0-9-]{3,24}$/.test(p.username)) {
      setGalat("Username: 3-24 karakter, hanya huruf kecil, angka, tanda hubung.");
      return;
    }
    setSibuk(true);

    if (p.username) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: bentrok } = await supabase
        .from("profiles").select("id").eq("username", p.username).neq("id", user!.id).maybeSingle();
      if (bentrok) { setGalat("Username sudah dipakai orang lain."); setSibuk(false); return; }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: p.full_name.trim(), username: p.username, bio: p.bio, focus: p.focus,
        avatar_url: p.avatar_url, cover_url: p.cover_url,
        website: p.website, instagram: p.instagram, twitter: p.twitter,
      })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);

    if (error) { setGalat("Gagal menyimpan: " + error.message); setSibuk(false); return; }
    setPesan("Profil tersimpan. ✅");
    setSibuk(false);
  }

  if (memuat) {
    return <main style={{ maxWidth: 640, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}><p>Memuat…</p></main>;
  }
  if (!p) {
    return <main style={{ maxWidth: 640, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}><p>Profil tidak ditemukan.</p></main>;
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <Link href="/dasbor" style={{ color: "#0B7A3E", textDecoration: "none" }}>← Dasbor</Link>
      <h1 style={{ fontSize: 30, margin: "10px 0 20px" }}>Edit Profil</h1>

      {pesan && <p style={{ background: "#E8F5EC", color: "#0B7A3E", padding: 12, borderRadius: 4 }}>{pesan}</p>}
      {galat && <p style={{ color: "#B3261E", background: "#FBEAEA", padding: 12, borderRadius: 4 }}>{galat}</p>}

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.avatar_url || "https://picsum.photos/seed/mb-anon/200/200.jpg"} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }} />
        <div style={{ flex: 1 }}>
          <label htmlFor="avatar" style={labGaya}>URL foto profil</label>
          <input id="avatar" style={inGaya} value={p.avatar_url} onChange={e => ubah("avatar_url", e.target.value)} placeholder="https://…" />
        </div>
      </div>
      <button type="button" onClick={() => ubah("avatar_url", `https://picsum.photos/seed/mb${Math.floor(Math.random() * 99999)}/200/200.jpg`)}
        style={{ marginBottom: 20, padding: 8, background: "none", border: "1px dashed #C7D2C7", borderRadius: 4, cursor: "pointer", color: "#2C372C" }}>
        ↺ Pakai foto acak
      </button>

      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label htmlFor="nama" style={labGaya}>Nama lengkap</label>
          <input id="nama" style={inGaya} value={p.full_name} onChange={e => ubah("full_name", e.target.value)} />
        </div>
        <div>
          <label htmlFor="username" style={labGaya}>Username (alamat profil: /penulis/username)</label>
          <input id="username" style={inGaya} value={p.username}
            onChange={e => ubah("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
        </div>
        <div>
          <label htmlFor="focus" style={labGaya}>Fokus penulisan</label>
          <input id="focus" style={inGaya} value={p.focus} onChange={e => ubah("focus", e.target.value)} placeholder="Penulis · Fiksi & Puisi" />
        </div>
        <div>
          <label htmlFor="bio" style={labGaya}>Biografi</label>
          <textarea id="bio" style={{ ...inGaya, minHeight: 120 }} value={p.bio} onChange={e => ubah("bio", e.target.value)} placeholder="Siapa Anda, dan apa yang biasa Anda tulis?" />
        </div>
        <div>
          <label htmlFor="cover" style={labGaya}>URL sampul profil</label>
          <input id="cover" style={inGaya} value={p.cover_url} onChange={e => ubah("cover_url", e.target.value)} placeholder="https://…" />
          <button type="button" onClick={() => ubah("cover_url", `https://picsum.photos/seed/mbc${Math.floor(Math.random() * 99999)}/1400/340.jpg`)}
            style={{ marginTop: 8, padding: 8, background: "none", border: "1px dashed #C7D2C7", borderRadius: 4, cursor: "pointer", color: "#2C372C" }}>
            ↺ Pakai sampul acak
          </button>
        </div>
        <div>
          <label htmlFor="web" style={labGaya}>Website</label>
          <input id="web" style={inGaya} value={p.website} onChange={e => ubah("website", e.target.value)} placeholder="https://…" />
        </div>
        <div>
          <label htmlFor="ig" style={labGaya}>Instagram</label>
          <input id="ig" style={inGaya} value={p.instagram} onChange={e => ubah("instagram", e.target.value)} placeholder="@username" />
        </div>
        <div>
          <label htmlFor="tw" style={labGaya}>Twitter / X</label>
          <input id="tw" style={inGaya} value={p.twitter} onChange={e => ubah("twitter", e.target.value)} placeholder="@username" />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={simpan} disabled={sibuk}
            style={{ flex: 1, padding: 14, background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, cursor: "pointer" }}>
            {sibuk ? "Menyimpan…" : "Simpan Profil"}
          </button>
          <Link href={`/penulis/${p.username}`} style={{ padding: 14, border: "1px solid #C7D2C7", borderRadius: 4, textDecoration: "none", color: "#0D120D" }}>
            Lihat Profil Publik →
          </Link>
        </div>
      </div>
    </main>
  );
}
