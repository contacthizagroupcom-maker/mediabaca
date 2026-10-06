"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";
import { UploadGambar } from "@/components/UploadGambar";

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
      setGalat("Username: 3–24 karakter, hanya huruf kecil, angka, tanda hubung.");
      return;
    }
    setSibuk(true);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: bentrok } = await supabase
      .from("profiles").select("id").eq("username", p.username).neq("id", user!.id).maybeSingle();
    if (bentrok) { setGalat("Username sudah dipakai orang lain."); setSibuk(false); return; }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: p.full_name.trim(), username: p.username, bio: p.bio, focus: p.focus,
        avatar_url: p.avatar_url, cover_url: p.cover_url,
        website: p.website, instagram: p.instagram, twitter: p.twitter,
      })
      .eq("id", user!.id);

    if (error) { setGalat("Gagal menyimpan: " + error.message); setSibuk(false); return; }
    setPesan("Profil tersimpan. ✅");
    setSibuk(false);
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }
  if (!p) {
    return <main className="container-mb"><p style={{ padding: 60 }}>Profil tidak ditemukan.</p></main>;
  }

  return (
    <>
      <HeaderDalam judul="Edit Profil" aksi={<Link href="/dasbor" className="btn">← Dasbor</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        {pesan && <p style={{ background: "var(--paper2)", color: "var(--acc)", border: "1px solid var(--acc)", padding: 12, borderRadius: 4, marginBottom: 16 }}>{pesan}</p>}
        {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", background: "var(--paper2)", padding: 12, borderRadius: 4, marginBottom: 16 }}>{galat}</p>}

        <div className="kicker"><span className="idx">01</span> FOTO PROFIL <span className="krule"></span></div>
        <div className="field" style={{ marginTop: 12 }}>
          <UploadGambar nilai={p.avatar_url} onChange={v => ubah("avatar_url", v)} bentuk="bulat" rasio="1" label="Foto Profil" />
        </div>

        <div className="kicker" style={{ marginTop: 28 }}><span className="idx">02</span> SAMPUL PROFIL <span className="krule"></span></div>
        <div className="field" style={{ marginTop: 12 }}>
          <UploadGambar nilai={p.cover_url} onChange={v => ubah("cover_url", v)} bentuk="lebar" rasio="4" label="Sampul" />
        </div>

        <div className="kicker" style={{ marginTop: 28 }}><span className="idx">03</span> IDENTITAS <span className="krule"></span></div>
        <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
          <div className="field">
            <label htmlFor="nama">Nama lengkap</label>
            <input id="nama" className="input" value={p.full_name} onChange={e => ubah("full_name", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="username">Username (alamat profil: /penulis/username)</label>
            <input id="username" className="input" value={p.username}
              onChange={e => ubah("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} />
          </div>
          <div className="field">
            <label htmlFor="focus">Fokus penulisan</label>
            <input id="focus" className="input" value={p.focus} onChange={e => ubah("focus", e.target.value)} placeholder="Penulis · Fiksi & Puisi" />
          </div>
          <div className="field">
            <label htmlFor="bio">Biografi</label>
            <textarea id="bio" className="input" style={{ minHeight: 120 }} value={p.bio} onChange={e => ubah("bio", e.target.value)} placeholder="Siapa Anda, dan apa yang biasa Anda tulis?" />
          </div>
        </div>

        <div className="kicker" style={{ marginTop: 28 }}><span className="idx">04</span> TAUTAN <span className="krule"></span></div>
        <div style={{ display: "grid", gap: 16, marginTop: 12 }}>
          <div className="field">
            <label htmlFor="web">Website</label>
            <input id="web" className="input" value={p.website} onChange={e => ubah("website", e.target.value)} placeholder="https://…" />
          </div>
          <div className="field">
            <label htmlFor="ig">Instagram</label>
            <input id="ig" className="input" value={p.instagram} onChange={e => ubah("instagram", e.target.value)} placeholder="@username" />
          </div>
          <div className="field">
            <label htmlFor="tw">Twitter / X</label>
            <input id="tw" className="input" value={p.twitter} onChange={e => ubah("twitter", e.target.value)} placeholder="@username" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          <button onClick={simpan} disabled={sibuk} className="btn btn-acc" style={{ flex: 1, justifyContent: "center", minWidth: 160 }}>
            {sibuk ? "Menyimpan…" : "Simpan Profil"}
          </button>
          <Link href={`/penulis/${p.username}`} className="btn" style={{ padding: "12px 18px" }}>
            Lihat Profil Publik →
          </Link>
        </div>
      </main>
    </>
  );
}
