"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LupaSandi() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState("");
  const [proses, setProses] = useState(false);

  async function kirim(e: React.FormEvent) {
    e.preventDefault();
    setPesan(""); setProses(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-sandi",
    });
    setProses(false);
    if (error) { setPesan("Gagal: " + error.message); return; }
    setPesan("✅ Tautan pemulihan telah dikirim ke email Anda. Cek kotak masuk (dan folder spam).");
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px", fontFamily: "var(--fb)" }}>
      <Link href="/" className="site-brand" style={{ display: "inline-block", marginBottom: 24, background: "none", color: "var(--ink)" }}>
        Media<em style={{ color: "var(--acc)" }}>Baca</em>
      </Link>
      <div className="kicker"><span className="idx">?</span> PEMULIHAN AKUN <span className="krule"></span></div>
      <h1 style={{ fontSize: 28, margin: "12px 0 6px" }}>Lupa kata sandi?</h1>
      <p style={{ color: "var(--mut)", fontStyle: "italic", marginBottom: 24 }}>
        Masukkan email akun Anda — kami kirimkan tautan pembuatan sandi baru.
      </p>
      {pesan && <p style={{ border: "1px solid var(--acc)", background: "var(--paper2)", color: "var(--ink2)", padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 14 }}>{pesan}</p>}
      <form onSubmit={kirim} style={{ display: "grid", gap: 16 }}>
        <div className="field">
          <label htmlFor="email">Email terdaftar</label>
          <input id="email" type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={proses} className="btn btn-acc" style={{ justifyContent: "center", padding: 14 }}>
          {proses ? "Mengirim…" : "Kirim Tautan Pemulihan"}
        </button>
      </form>
      <p style={{ marginTop: 20 }} className="meta">
        <Link href="/masuk" style={{ color: "var(--acc)", textTransform: "none", fontSize: 13 }}>← Kembali ke halaman masuk</Link>
      </p>
    </main>
  );
}
