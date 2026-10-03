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

export default function HalamanMasuk() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState("");
  const [proses, setProses] = useState(false);

  async function masuk(e: React.FormEvent) {
    e.preventDefault();
    setGalat("");
    setProses(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: sandi });
    if (error) { setGalat("Email atau kata sandi salah."); setProses(false); return; }
    router.push("/dasbor");
  }

  return (
    <main style={{ maxWidth: 460, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: 34 }}>Media<span style={{ color: "#0B7A3E" }}>Baca</span></h1>
      <p style={{ color: "#555", fontStyle: "italic" }}>Selamat datang kembali.</p>
      {galat && <p style={{ color: "#B3261E", background: "#FBEAEA", padding: 10, borderRadius: 4 }}>{galat}</p>}
      <form onSubmit={masuk} style={{ display: "grid", gap: 14, marginTop: 20 }}>
        <div>
          <label htmlFor="email" style={gayaLabel}>Email</label>
          <input id="email" type="email" style={gayaInput} value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="sandi" style={gayaLabel}>Kata sandi</label>
          <input id="sandi" type="password" style={gayaInput} value={sandi} onChange={e => setSandi(e.target.value)} />
        </div>
        <button type="submit" disabled={proses}
          style={{ padding: 14, background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, cursor: "pointer" }}>
          {proses ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
      <p style={{ marginTop: 20, color: "#555" }}>
        Belum punya akun? <Link href="/daftar" style={{ color: "#0B7A3E" }}>Daftar</Link>
      </p>
    </main>
  );
}
