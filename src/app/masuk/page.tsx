"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

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
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px", fontFamily: "var(--fb)" }}>
      <Link href="/" className="site-brand" style={{ display: "inline-block", marginBottom: 24, background: "none", color: "var(--ink)" }}>
        Media<em style={{ color: "var(--acc)" }}>Baca</em>
      </Link>
      <div className="kicker"><span className="idx">→</span> MASUK <span className="krule"></span></div>
      <h1 style={{ fontSize: 30, margin: "12px 0 6px" }}>Selamat datang kembali.</h1>
      <p style={{ color: "var(--mut)", marginBottom: 24, fontStyle: "italic" }}>Lanjutkan menulis, membaca, dan berdiskusi.</p>
      {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", padding: 12, borderRadius: 4, marginBottom: 16 }}>{galat}</p>}
      <form onSubmit={masuk} style={{ display: "grid", gap: 16 }}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="sandi">Kata sandi</label>
          <input id="sandi" type="password" className="input" value={sandi} onChange={e => setSandi(e.target.value)} />
        </div>
        <button type="submit" disabled={proses} className="btn btn-acc" style={{ justifyContent: "center", padding: 14 }}>
          {proses ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
      <p style={{ marginTop: 20 }} className="meta">
        Belum punya akun? <Link href="/daftar" style={{ color: "var(--acc)", textTransform: "none", fontSize: 13 }}>Daftar →</Link>
      </p>
    </main>
  );
}
