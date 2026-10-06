import Link from "next/link";
import { HeaderPublik } from "@/components/HeaderPublik";

export const metadata = {
  title: "Kontak — MediaBaca",
  description: "Hubungi MediaBaca: email, WhatsApp, dan saluran resmi.",
};

export default function Kontak() {
  const kartu = [
    {
      ikon: "✉️",
      judul: "Email",
      isi: "mediabaca.id@gmail.com",
      sub: "Untuk pertanyaan, kerja sama, dan urusan editorial",
      aksi: "Kirim Email",
      href: "mailto:mediabaca.id@gmail.com?subject=Halo%20MediaBaca",
      eksternal: false,
    },
    {
      ikon: "💬",
      judul: "WhatsApp",
      isi: "+62 819-9597-7916",
      sub: "Respon cepat di jam kerja — chat langsung",
      aksi: "Chat WhatsApp",
      href: "https://wa.me/6281995977916?text=" + encodeURIComponent("Halo MediaBaca, saya mau bertanya..."),
      eksternal: true,
    },
    {
      ikon: "📣",
      judul: "Saluran WhatsApp",
      isi: "MediaBaca Official",
      sub: "Ikuti saluran untuk karya terbaru & pengumuman",
      aksi: "Ikuti Saluran",
      href: "https://whatsapp.com/channel/0029VbDgMwOBFLgNUlsJRZ32",
      eksternal: true,
    },
  ];

  return (
    <>
      <HeaderPublik aktif="kontak" />
      <main className="container-mb narrow" style={{ padding: "48px 24px 80px", fontFamily: "var(--fb)" }}>
        <div className="kicker"><span className="idx">📮</span> KONTAK <span className="krule"></span></div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.7rem, 4vw, 2.4rem)", margin: "16px 0 8px" }}>
          Hubungi MediaBaca
        </h1>
        <p style={{ color: "var(--ink2)", fontSize: 17, fontStyle: "italic", marginBottom: 32 }}>
          Ada pertanyaan, masukan, atau ingin berkolaborasi? Kami menunggu kabar Anda.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          {kartu.map(k => (
            <a
              key={k.judul}
              href={k.href}
              {...(k.eksternal ? { target: "_blank", rel: "noopener" } : {})}
              className="mb-kartu"
              style={{
                display: "flex", gap: 16, alignItems: "center",
                border: "1px solid var(--rule)", borderRadius: 8,
                padding: "18px 20px", textDecoration: "none",
                background: "var(--paper2)", flexWrap: "wrap",
              }}
            >
              <span style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "var(--ink)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>{k.ikon}</span>
              <span style={{ flex: 1, minWidth: 180 }}>
                <b style={{ fontFamily: "var(--fd)", fontSize: 18, display: "block" }}>{k.judul}</b>
                <span style={{ color: "var(--acc)", fontFamily: "var(--fm)", fontSize: 14 }}>{k.isi}</span>
                <span style={{ color: "var(--mut)", fontSize: 13, display: "block", marginTop: 2 }}>{k.sub}</span>
              </span>
              <span className="btn btn-acc" style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                {k.aksi} →
              </span>
            </a>
          ))}
        </div>

        <div style={{
          marginTop: 36, border: "1px solid var(--rule)", borderRadius: 8,
          background: "var(--paper2)", padding: "22px 24px",
        }}>
          <div className="kicker" style={{ marginBottom: 10 }}><span className="idx">✦</span> UNTUK PENULIS <span className="krule"></span></div>
          <p style={{ color: "var(--ink2)", fontSize: 15.5, lineHeight: 1.8, margin: 0 }}>
            Ingin karyamu terbit di MediaBaca? Tidak perlu menghubungi kami dulu —
            {" "}<Link href="/daftar" style={{ color: "var(--acc)" }}>daftar langsung di sini</Link>,
            tulis karya, kirim untuk review, dan tim editorial kami akan memprosesnya.
          </p>
        </div>

        <div style={{
          marginTop: 20, border: "1px solid var(--rule)", borderRadius: 8,
          background: "var(--paper2)", padding: "22px 24px",
        }}>
          <div className="kicker" style={{ marginBottom: 10 }}><span className="idx">🚩</span> LAPORAN KONTEN <span className="krule"></span></div>
          <p style={{ color: "var(--ink2)", fontSize: 15.5, lineHeight: 1.8, margin: 0 }}>
            Menemukan konten yang melanggar? Gunakan tombol <b>🚩 Laporkan</b> yang tersedia
            di setiap karya, komentar, dan profil — laporan langsung masuk ke meja moderator.
          </p>
        </div>
      </main>
    </>
  );
}
