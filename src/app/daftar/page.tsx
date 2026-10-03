"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const gayaInput = {
  width: "100%", padding: 12, border: "1px solid #C7D2C7", borderRadius: 4,
  fontSize: 16, background: "#fff", color: "#0D120D", boxSizing: "border-box",
} as const;

const gayaLabel = {
  display: "block", marginBottom: 6, fontSize: 13, fontWeight: "bold", color: "#2C372C",
} as const;

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
    if (!nama.trim() || !username.trim() || !email.trim() || !sandi) {
      setGalat("Semua kolom wajib diisi."); return;
    }
    if (sandi.length < 8) { setGalat("Kata sandi minimal 8 karakter."); return; }
    if (sandi !== konfirmasi) { setGalat("Konfirmasi kata sandi tidak cocok."); return; }
    setProses(true);

    const { data: dipakai } = await supabase
      .from("profiles").select("id").eq("username", username).maybeSingle();
    if (dipakai) {
      setGalat("Username sudah dipakai — coba yang lain.");
      setProses(false); return;
    }

    const { error } = await supabase.auth.signUp({
      email, password: sandi,
      options: { data: { full_name: nama.trim(), username } },
    });

    if (error) { setGalat(error.message); setProses(false); return; }
    router.push("/dasbor");
  }

  return (
    <main style={{ maxWidth: 460, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: 34 }}>Media<span style={{ color: "#0B7A3E" }}>Baca</span></h1>
      <p style={{ color: "#555", fontStyle: "italic" }}>Buat akun penulis baru.</p>
      {galat && <p style={{ color: "#B3261E", background: "#FBEAEA", padding: 10, borderRadius: 4 }}>{galat}</p>}
      <form onSubmit={daftar} style={{ display: "grid", gap: 14, marginTop: 20 }}>
        <div>
          <label htmlFor="nama" style={gayaLabel}>Nama lengkap</label>
          <input id="nama" style={gayaInput} value={nama} onChange={e => setNama(e.target.value)} placeholder="Taufik Hidayat" />
        </div>
        <div>
          <label htmlFor="username" style={gayaLabel}>Username</label>
          <input id="username" style={gayaInput} value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="taufik-hidayat" />
          <small style={{ color: "#888" }}>Huruf kecil, angka, tanda hubung — akan jadi /penulis/username</small>
        </div>
        <div>
          <label htmlFor="email" style={gayaLabel}>Email</label>
          <input id="email" type="email" style={gayaInput} value={email} onChange={e => setEmail(e.target.value)} placeholder="kamu@email.com" />
        </div>
        <div>
          <label htmlFor="sandi" style={gayaLabel}>Kata sandi</label>
          <input id="sandi" type="password" style={gayaInput} value={sandi} onChange={e => setSandi(e.target.value)} />
          <small style={{ color: "#888" }}>Minimal 8 karakter</small>
        </div>
        <div>
          <label htmlFor="konfirmasi" style={gayaLabel}>Konfirmasi kata sandi</label>
          <input id="konfirmasi" type="password" style={gayaInput} value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)} />
        </div>
        <button type="submit" disabled={proses}
          style={{ padding: 14, background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, cursor: "pointer" }}>
          {proses ? "Mendaftarkan…" : "Daftar sebagai Penulis"}
        </button>
      </form>
      <p style={{ marginTop: 20, color: "#555" }}>
        Sudah punya akun? <Link href="/masuk" style={{ color: "#0B7A3E" }}>Masuk</Link>
      </p>
    </main>
  );
}
