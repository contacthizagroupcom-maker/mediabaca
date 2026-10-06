"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderPublik } from "@/components/HeaderPublik";

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
    <>
      <HeaderPublik />
      <main style={{ maxWidth: 440, margin: "0 auto", padding: "48px 24px 80px", fontFamily: "var(--fb)" }}>
        <div className="kicker"><span className="idx">→</span> MASUK <span className="krule"></span></div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: 30, margin: "12px 0 6px" }}>Selamat datang kembali.</h1>
        <p style={{ color: "var(--mut)", fontStyle: "italic", marginBottom: 24 }}>Lanjutkan menulis, membaca, dan berdiskusi.</p>
        {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", background: "var(--paper2)", padding: 12, borderRadius: 4, marginBottom: 16 }}>{galat}</p>}
        <form onSubmit={masuk} style={{ display: "grid", gap: 16 }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="sandi">Kata sandi</label>
            <input id="sandi" type="password" className="input" value={sandi} onChange={e => setSandi(e.target.value)} required />
          </div>
          <button type="submit" disabled={proses} className="btn btn-acc" style={{ justifyContent: "center", padding: 14 }}>
            {proses ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
        <p style={{ marginTop: 20, display: "grid", gap: 6 }} className="meta">
          <span>
            Lupa kata sandi? <Link href="/lupa-sandi" style={{ color: "var(--acc)", textTransform: "none", fontSize: 13 }}>Kirim pemulihan →</Link>
          </span>
          <span>
            Belum punya akun? <Link href="/daftar" style={{ color: "var(--acc)", textTransform: "none", fontSize: 13 }}>Daftar →</Link>
          </span>
        </p>
      </main>
    </>
  );
}
