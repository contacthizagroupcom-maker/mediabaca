import Link from "next/link";
import { HeaderPublik } from "@/components/HeaderPublik";

export default function Tentang() {
  return (
    <>
      <HeaderPublik aktif="tentang" />

      <main className="container-mb narrow" style={{ padding: "48px 24px 80px", fontFamily: "var(--fb)" }}>
        <div className="kicker"><span className="idx">✦</span> TENTANG MEDIABACA <span className="krule"></span></div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.9rem, 4vw, 3rem)", margin: "18px 0 16px", lineHeight: 1.15 }}>
          Ruang untuk Membaca, Menulis, dan Berbagi Gagasan.
        </h1>
        <p style={{ fontSize: 18, color: "var(--ink2)", lineHeight: 1.8, marginBottom: 28 }}>
          MediaBaca adalah jurnal digital multi-penulis untuk karya akademik, fiksi, nonfiksi, opini, dan jurnalistik.
          Kami percaya setiap orang punya cerita, setiap gagasan punya ruang, dan setiap penulis punya rumah.
        </p>

        <div className="kicker"><span className="idx">01</span> ALUR EDITORIAL <span className="krule"></span></div>
        <p style={{ color: "var(--ink2)", marginTop: 12, marginBottom: 20 }}>
          Setiap karya melewati meja editor sebelum terbit. Penulis menyimpan draft, mengirimkannya untuk review,
          lalu editor memutuskan: <b>menyetujui</b>, <b>meminta revisi</b> (beserta catatan), atau <b>menolak</b>.
          Hanya karya berstatus Terbit yang dapat dibaca publik. Ini bukan penyaringan gagasan — melainkan penjagaan
          kerapian bahasa dan ketelitian argumen.
        </p>

        <div className="kicker"><span className="idx">02</span> HAK CIPTA <span className="krule"></span></div>
        <p style={{ color: "var(--ink2)", marginTop: 12, marginBottom: 20 }}>
          Setiap karya adalah milik penulisnya. MediaBaca hanyalah rumah penerbitannya — kami tidak pernah
          mengklaim kepemilikan atas karya siapa pun. Setiap halaman karya mencantumkan © atas nama penulisnya.
        </p>

        <div className="kicker"><span className="idx">03</span> MODERASI <span className="krule"></span></div>
        <p style={{ color: "var(--ink2)", marginTop: 12, marginBottom: 20 }}>
          Pembaca dapat melaporkan karya, komentar, atau profil yang melanggar — spam, pelecehan, pelanggaran hak
          cipta, konten menyesatkan, atau konten tidak pantas. Tim moderator meninjau setiap laporan dan dapat
          menyembunyikan atau menghapus konten yang melanggar.
        </p>

        <div className="kicker"><span className="idx">04</span> PILAR KARYA <span className="krule"></span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginTop: 14, marginBottom: 28 }}>
          {[
            { label: "Akademik", desc: "Makalah, kajian, penelitian" },
            { label: "Fiksi", desc: "Cerpen, novel, puisi" },
            { label: "Esai & Nonfiksi", desc: "Refleksi, memoar" },
            { label: "Opini", desc: "Gagasan & pandangan" },
            { label: "Jurnalistik", desc: "Feature, reportase" },
          ].map(p => (
            <div key={p.label} style={{ border: "1px solid var(--rule)", borderRadius: 8, padding: "14px 12px", background: "var(--paper2)" }}>
              <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 600 }}>{p.label}</div>
              <div style={{ fontSize: 12.5, color: "var(--mut)", marginTop: 4 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: 8, padding: "clamp(24px, 4vw, 36px)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", lineHeight: 1.5, marginBottom: 18 }}>
            Setiap orang punya cerita.<br />
            <em style={{ color: "#4CC97B" }}>Setiap gagasan punya ruang.</em><br />
            Setiap penulis punya rumah.
          </p>
          <Link href="/daftar" className="btn btn-acc" style={{ padding: "13px 22px" }}>✍️ Mulai Menulis di MediaBaca</Link>
        </div>
      </main>
    </>
  );
}
