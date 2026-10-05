import Link from "next/link";
import { TemaToggle } from "@/components/TemaToggle";

export default function Tentang() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-in">
          <Link href="/" className="site-brand">Media<em>Baca</em></Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <nav className="site-nav"><Link href="/">Beranda</Link><Link href="/jelajahi">Jelajahi</Link></nav>
            <TemaToggle />
          </div>
        </div>
      </header>

      <main className="container-mb narrow" style={{ padding: "48px 24px 80px", fontFamily: "var(--fb)" }}>
        <div className="kicker"><span className="idx">✦</span> TENTANG <span className="krule"></span></div>
        <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", margin: "16px 0" }}>
          Ruang untuk Membaca, Menulis, dan Berbagi Gagasan.
        </h1>
        <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.8 }}>
          MediaBaca adalah jurnal digital multi-penulis untuk karya akademik, fiksi, nonfiksi, opini, dan jurnalistik.
          Kami percaya setiap orang punya cerita, setiap gagasan punya ruang, dan setiap penulis punya rumah.
        </p>

        <div className="kicker" style={{ marginTop: 40 }}><span className="idx">01</span> ALUR EDITORIAL <span className="krule"></span></div>
        <p style={{ color: "var(--ink2)", marginTop: 12 }}>
          Setiap karya melewati meja editor sebelum terbit. Penulis menyimpan draft, mengirimkannya untuk review,
          lalu editor memutuskan: <b>menyetujui</b>, <b>meminta revisi</b> (beserta catatan), atau <b>menolak</b>.
          Hanya karya berstatus Terbit yang dapat dibaca publik. Ini bukan penyaringan gagasan — melainkan penjagaan
          kerapian bahasa dan ketelitian argumen.
        </p>

        <div className="kicker" style={{ marginTop: 32 }}><span className="idx">02</span> HAK CIPTA <span className="krule"></span></div>
        <p style={{ color: "var(--ink2)", marginTop: 12 }}>
          Setiap karya adalah milik penulisnya. MediaBaca hanyalah rumah penerbitannya — kami tidak pernah
          mengklaim kepemilikan atas karya siapa pun. Setiap halaman karya mencantumkan © atas nama penulisnya.
        </p>

        <div className="kicker" style={{ marginTop: 32 }}><span className="idx">03</span> MODERASI <span className="krule"></span></div>
        <p style={{ color: "var(--ink2)", marginTop: 12 }}>
          Pembaca dapat melaporkan karya, komentar, atau profil yang melanggar — spam, pelecehan, pelanggaran hak
          cipta, konten menyesatkan, atau konten tidak pantas. Tim moderator meninjau setiap laporan dan dapat
          menyembunyikan atau menghapus konten yang melanggar.
        </p>

        <div style={{ marginTop: 44, textAlign: "center" }}>
          <Link href="/daftar" className="btn btn-acc" style={{ padding: "14px 24px" }}>✍️ Mulai Menulis di MediaBaca</Link>
        </div>
      </main>
    </>
  );
}
