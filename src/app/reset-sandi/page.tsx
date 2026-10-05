"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function IsiReset() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");
  const [siap, setSiap] = useState(false);
  const [proses, setProses] = useState(false);

  useEffect(() => {
    // Supabase menyelesaikan login via token di URL terlebih dulu
    supabase.auth.onAuthStateChange(() => setSiap(true));
    const t = setTimeout(() => setSiap(true), 1500);
    return () => clearTimeout(t);
  }, [supabase]);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setGalat(""); setPesan("");
    if (sandi.length < 8) { setGalat("Kata sandi minimal 8 karakter."); return; }
    if (sandi !== konfirmasi) { setGalat("Konfirmasi tidak cocok."); return; }
    setProses(true);
    const { error } = await supabase.auth.updateUser({ password: sandi });
    setProses(false);
    if (error) { setGalat("Gagal: " + error.message); return; }
    setPesan("✅ Kata sandi berhasil diperbarui!");
    setTimeout(() => router.push("/dasbor"), 1500);
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px", fontFamily: "var(--fb)" }}>
      <div className="kicker"><span className="idx">⟲</span> KATA SANDI BARU <span className="krule"></span></div>
      <h1 style={{ fontSize: 28, margin: "12px 0 20px" }}>Atur ulang kata sandi</h1>
      {pesan && <p style={{ border: "1px solid var(--acc)", background: "var(--paper2)", padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 14 }}>{pesan}</p>}
      {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 14 }}>{galat}</p>}
      {!siap ? (
        <p style={{ color: "var(--mut)" }}>Memeriksa tautan pemulihan…</p>
      ) : (
        <form onSubmit={simpan} style={{ display: "grid", gap: 16 }}>
          <div className="field">
            <label htmlFor="s1">Kata sandi baru</label>
            <input id="s1" type="password" className="input" value={sandi} onChange={e => setSandi(e.target.value)} required />
            <small className="meta" style={{ textTransform: "none", fontSize: 11 }}>Minimal 8 karakter</small>
          </div>
          <div className="field">
            <label htmlFor="s2">Konfirmasi</label>
            <input id="s2" type="password" className="input" value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)} required />
          </div>
          <button type="submit" disabled={proses} className="btn btn-acc" style={{ justifyContent: "center", padding: 14 }}>
            {proses ? "Menyimpan…" : "Simpan Kata Sandi Baru"}
          </button>
        </form>
      )}
      <p style={{ marginTop: 20 }} className="meta">
        <Link href="/masuk" style={{ color: "var(--acc)", textTransform: "none", fontSize: 13 }}>← Ke halaman masuk</Link>
      </p>
    </main>
  );
}

export default function ResetSandi() {
  return (
    <Suspense fallback={<main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>}>
      <IsiReset />
    </Suspense>
  );
}
