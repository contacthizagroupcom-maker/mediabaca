"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function HalamanDaftar() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [galat, setGalat] = useState("");
  const [proses, setProses] = useState(false);

  async function daftar(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    if (!nama.trim() || !username.trim() || !email.trim() || !sandi) { setGalat("Semua kolom wajib diisi."); return; }
    if (sandi.length < 8) { setGalat("Kata sandi minimal 8 karakter."); return; }
    if (sandi !== konfirmasi) { setGalat("Konfirmasi kata sandi tidak cocok."); return; }
    setProses(true);
    const { data: dipakai } = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();
    if (dipakai) { setGalat("Username sudah dipakai — coba yang lain."); setProses(false); return; }
    const { error } = await supabase.auth.signUp({
      email, password: sandi,
      options: { data: { full_name: nama.trim(), username } },
    });
    if (error) { setGalat(error.message); setProses(false); return; }
    router.push("/dasbor");
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px", fontFamily: "var(--fb)" }}>
      <Link href="/" className="site-brand" style={{ display: "inline-block", marginBottom: 24, background: "none", color: "var(--ink)" }}>
        Media<em style={{ color: "var(--acc)" }}>Baca</em>
      </Link>
      <div className="kicker"><span className="idx">✦</span> DAFTAR <span className="krule"></span></div>
      <h1 style={{ fontSize: 30, margin: "12px 0 6px" }}>Rumah untuk gagasan Anda.</h1>
      <p style={{ color: "var(--mut)", marginBottom: 24, fontStyle: "italic" }}>Satu akun untuk membaca, menulis, dan membangun portofolio.</p>
      {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", padding: 12, borderRadius: 4, marginBottom: 16 }}>{galat}</p>}
      <form onSubmit={daftar} style={{ display: "grid", gap: 16 }}>
        <div className="field">
          <label htmlFor="nama">Nama lengkap</label>
          <input id="nama" className="input" value={nama} onChange={e => setNama(e.target.value)} placeholder="Taufik Hidayat" />
        </div>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" className="input" value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="taufik-hidayat" />
          <small className="meta" style={{ textTransform: "none", fontSize: 11 }}>Huruf kecil, angka, tanda hubung — alamat profilmu nanti</small>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sandi">Kata sandi</label>
          <input id="sandi" type="password" className="input" value={sandi} onChange={e => setSandi(e.target.value)} />
          <small className="meta" style={{ textTransform: "none", fontSize: 11 }}>Minimal 8 karakter</small>
        </div>
        <div className="field">
          <label htmlFor="konfirmasi">Konfirmasi kata sandi</label>
          <input id="konfirmasi" type="password" className="input" value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)} />
        </div>
        <button type="submit" disabled={proses} className="btn btn-acc" style={{ justifyContent: "center", padding: 14 }}>
          {proses ? "Mendaftarkan…" : "Daftar sebagai Penulis"}
        </button>
      </form>
      <p style={{ marginTop: 20 }} className="meta">
        Sudah punya akun? <Link href="/masuk" style={{ color: "var(--acc)", textTransform: "none", fontSize: 13 }}>Masuk →</Link>
      </p>
    </main>
  );
}
