import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { HeaderPublik } from "@/components/HeaderPublik";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mulai Menulis — MediaBaca",
  description: "Publikasikan esai, cerpen, puisi, dan karya akademikmu. Profil penulis sendiri, statistik pembaca, gratis.",
};

async function ambilStat() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  const { count: karya } = await supabase.from("works").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED");
  const { count: penulis } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  const { data: vw } = await supabase.from("works").select("views_count").eq("status", "PUBLISHED");
  const total = (vw ?? []).reduce((s: number, v: any) => s + (v.views_count ?? 0), 0);
  return { karya: karya ?? 0, penulis: penulis ?? 0, total };
}

export default async function Menulis() {
  const { karya, penulis, total } = await ambilStat();

  const keunggulan = [
    { ikon: "👤", judul: "Profil Penulis Sendiri", isi: "Alamat pribadi mediabaca-id.vercel.app/penulis/namamu — bio, foto, dan seluruh portofolio karyamu dalam satu halaman yang bisa dibagikan." },
    { ikon: "📊", judul: "Statistik Pembaca", isi: "Lihat berapa orang membaca karyamu, kapan mereka membaca, dan karya mana yang paling digemari — data lengkap di dasbor." },
    { ikon: "🗂️", judul: "Direview Editor", isi: "Setiap karya melewati meja editor — bukan penyaring gagasan, tapi penjaga kualitas bahasa. Karyamu tampil bersama karya terkurasi." },
    { ikon: "📤", judul: "Dibagikan Luas", isi: "Satu klik: karyamu berbagi ke WhatsApp, Facebook, X, dan Telegram — lengkap dengan kartu judul dan sampul menarik." },
    { ikon: "📱", judul: "Tulis dari HP", isi: "Editor lengkap dengan format teks, unggah sampul, simpan draft — semuanya nyaman dari ponsel, kapan pun ide datang." },
    { ikon: "©️", judul: "Karyamu Tetap Milikmu", isi: "Hak cipta sepenuhnya milik penulis. Hapus kapan pun kamu mau. Kami hanya rumahnya, bukan pemiliknya." },
  ];

  return (
    <>
      <HeaderPublik />
      <main style={{ fontFamily: "var(--fb)" }}>
        {/* HERO */}
        <section style={{ background: "var(--ink)", color: "var(--paper)", padding: "clamp(40px, 7vw, 72px) 24px", textAlign: "center" }}>
          <div className="kicker" style={{ justifyContent: "center", color: "rgba(255,255,255,.6)" }}>
            <span className="idx" style={{ color: "#4CC97B" }}>✍️</span> UNTUK PENULIS
          </div>
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.9rem, 5vw, 3.2rem)", lineHeight: 1.15, margin: "18px auto 14px", maxWidth: "15em" }}>
            Tulisanmu layak <em style={{ color: "#4CC97B", fontStyle: "italic" }}>dibaca</em>, bukan menganggur di catatan ponsel.
          </h1>
          <p style={{ color: "rgba(255,255,255,.75)", fontStyle: "italic", fontSize: 17, maxWidth: "34em", margin: "0 auto 28px" }}>
            Esai, cerpen, puisi, makalah, opini — apa pun bentuknya, di MediaBaca dia mendapat rumah.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/daftar" className="btn btn-acc" style={{ padding: "15px 26px", fontSize: 12 }}>✍️ Daftar Gratis — 2 Menit</Link>
            <Link href="/jelajahi" className="btn" style={{ padding: "15px 26px", color: "#fff", borderColor: "rgba(255,255,255,.4)" }}>Lihat Contoh Karya</Link>
          </div>
          <p style={{ fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginTop: 22 }}>
            {karya} karya · {penulis} penulis · {total.toLocaleString("id-ID")} kali dibaca
          </p>
        </section>

        {/* KEUNGGULAN */}
        <section className="container-mb" style={{ padding: "clamp(36px, 5vw, 56px) 24px" }}>
          <div className="kicker"><span className="idx">01</span> KENAPA MENULIS DI MEDIABACA <span className="krule"></span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18, marginTop: 22 }}>
            {keunggulan.map(k => (
              <div key={k.judul} style={{ border: "1px solid var(--rule)", borderRadius: 8, padding: "20px 18px", background: "var(--paper)" }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{k.ikon}</div>
                <h3 style={{ fontFamily: "var(--fd)", fontSize: 18, margin: "0 0 6px" }}>{k.judul}</h3>
                <p style={{ color: "var(--ink2)", fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>{k.isi}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ALUR */}
        <section className="container-mb narrow" style={{ padding: "0 24px 40px" }}>
          <div className="kicker"><span className="idx">02</span> MULAINYA SEMUDAH INI <span className="krule"></span></div>
          <div style={{ marginTop: 22, display: "grid", gap: 0 }}>
            {[
              { n: "1", t: "Daftar", d: "Nama, username, email — dua menit, langsung jadi penulis." },
              { n: "2", t: "Tulis", d: "Dari HP atau laptop. Format teks, unggah sampul, simpan draft kapan pun." },
              { n: "3", t: "Kirim Review", d: "Editor memeriksa kerapian — biasanya selesai dalam hitungan jam." },
              { n: "4", t: "Terbit & Dibaca", d: "Karyamu tampil di beranda, masuk pencarian Google, dibagikan ke seluruh Indonesia." },
            ].map(l => (
              <div key={l.n} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, padding: "14px 0", borderTop: "1px solid var(--rule)" }}>
                <span style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 600, color: "var(--acc)", textAlign: "center", lineHeight: 1 }}>{l.n}</span>
                <span>
                  <b style={{ fontFamily: "var(--fd)", fontSize: 18 }}>{l.t}</b>
                  <p style={{ color: "var(--ink2)", fontSize: 15, margin: "2px 0 0" }}>{l.d}</p>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA PENUTUP */}
        <section style={{ background: "var(--paper2)", borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)", padding: "clamp(36px, 6vw, 52px) 24px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.3rem, 3vw, 1.8rem)", maxWidth: "20em", margin: "0 auto 22px", lineHeight: 1.45 }}>
            Gagasan yang tidak ditulis akan ikut <em style={{ color: "var(--acc)" }}>terkubur</em> bersama waktunya.
          </p>
          <Link href="/daftar" className="btn btn-acc" style={{ padding: "15px 26px", fontSize: 12 }}>✍️ Tulis Karya Pertamamu Sekarang</Link>
        </section>
      </main>
    </>
  );
}
