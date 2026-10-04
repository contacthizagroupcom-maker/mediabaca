"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";

export default function Pengaturan() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [pesan, setPesan] = useState("");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      setEmail(user.email ?? "");
      setGelap(localStorage.getItem("mb-tema") === "gelap");
      setMemuat(false);
    })();
  }, [router, supabase]);

  function toggleTema() {
    const baru = !gelap;
    setGelap(baru);
    localStorage.setItem("mb-tema", baru ? "gelap" : "terang");
    document.documentElement.dataset.theme = baru ? "dark" : "";
  }

  async function gantiSandi(e: React.FormEvent) {
    e.preventDefault();
    setGalat(""); setPesan("");
    if (sandiBaru.length < 8) { setGalat("Kata sandi baru minimal 8 karakter."); return; }
    if (sandiBaru !== konfirmasi) { setGalat("Konfirmasi tidak cocok."); return; }
    setSibuk(true);
    const { error } = await supabase.auth.updateUser({ password: sandiBaru });
    if (error) { setGalat("Gagal: " + error.message + " — pastikan kata sandi lama benar."); setSibuk(false); return; }
    setPesan("Kata sandi berhasil diperbarui. ✅");
    setSandiLama(""); setSandiBaru(""); setKonfirmasi("");
    setSibuk(false);
  }

  async function hapusAkun() {
    if (!confirm("PERINGATAN: Menghapus akun akan menghilangkan seluruh karya, komentar, dan data Anda secara permanen. Lanjutkan?")) return;
    if (!confirm("Yakin 100%? Tindakan ini TIDAK BISA dibatalkan.")) return;
    setSibuk(true);
    const { error } = await supabase.rpc("hapus_akun_sendiri");
    if (error) { setGalat("Gagal menghapus: " + error.message); setSibuk(false); return; }
    await supabase.auth.signOut();
    router.push("/");
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  return (
    <>
      <HeaderDalam judul="Pengaturan" aksi={<Link href="/dasbor" className="btn">← Dasbor</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>

        {pesan && <p style={{ background: "var(--paper2)", color: "var(--acc)", border: "1px solid var(--acc)", padding: 12, borderRadius: 4, marginBottom: 20 }}>{pesan}</p>}
        {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", background: "var(--paper2)", padding: 12, borderRadius: 4, marginBottom: 20 }}>{galat}</p>}

        <div className="kicker"><span className="idx">01</span> AKUN <span className="krule"></span></div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Email (tidak dapat diubah)</label>
          <input className="input" value={email} disabled style={{ opacity: 0.6 }} />
        </div>

        <div className="kicker" style={{ marginTop: 28 }}><span className="idx">02</span> TAMPILAN <span className="krule"></span></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 12, flexWrap: "wrap" }}>
          <div>
            <b style={{ fontFamily: "var(--fd)", fontSize: 17 }}>Mode Gelap</b>
            <p className="meta" style={{ textTransform: "none", fontSize: 12, marginTop: 2 }}>
              Preferensi tersimpan di perangkat ini.
            </p>
          </div>
          <button onClick={toggleTema} className={`btn ${gelap ? "" : "btn-primary"}`}>
            {gelap ? "🌙 Gelap (aktif)" : "☀ Terang (aktif)"}
          </button>
        </div>

        <div className="kicker" style={{ marginTop: 36 }}><span className="idx">03</span> GANTI KATA SANDI <span className="krule"></span></div>
        <form onSubmit={gantiSandi} style={{ display: "grid", gap: 16, marginTop: 12 }}>
          <div className="field">
            <label htmlFor="lama">Kata sandi baru</label>
            <input id="lama" type="password" className="input" value={sandiBaru} onChange={e => setSandiBaru(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="baru">Konfirmasi kata sandi baru</label>
            <input id="baru" type="password" className="input" value={konfirmasi} onChange={e => setKonfirmasi(e.target.value)} autoComplete="new-password" />
            <small className="meta" style={{ textTransform: "none", fontSize: 11 }}>Minimal 8 karakter</small>
          </div>
          <button type="submit" disabled={sibuk} className="btn btn-acc" style={{ justifyContent: "center" }}>
            {sibuk ? "Menyimpan…" : "Perbarui Kata Sandi"}
          </button>
        </form>

        <div className="kicker" style={{ marginTop: 40, color: "var(--err)" }}><span className="idx" style={{ color: "var(--err)" }}>!</span> ZONA BAHAYA <span className="krule"></span></div>
        <div style={{ border: "1px solid var(--err)", borderRadius: 4, padding: 20, marginTop: 12 }}>
          <b style={{ fontFamily: "var(--fd)", fontSize: 17, color: "var(--err)" }}>Hapus Akun Permanen</b>
          <p style={{ color: "var(--mut)", fontSize: 14, margin: "6px 0 14px" }}>
            Seluruh karya, komentar, dan data Anda akan dihapus dari MediaBaca. Tindakan ini tidak bisa dibatalkan.
          </p>
          <button onClick={hapusAkun} disabled={sibuk} className="btn" style={{ borderColor: "var(--err)", color: "var(--err)" }}>
            🗑 Hapus Akun Saya
          </button>
        </div>

      </main>
    </>
  );
}
