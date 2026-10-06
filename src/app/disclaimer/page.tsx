import Link from "next/link";
import { HeaderPublik } from "@/components/HeaderPublik";

export const metadata = {
  title: "Disclaimer — MediaBaca",
  description: "Penafian tanggung jawab konten dan penggunaan platform MediaBaca.",
};

export default function Disclaimer() {
  return (
    <>
      <HeaderPublik aktif="disclaimer" />
      <main className="container-mb narrow" style={{ padding: "48px 24px 80px", fontFamily: "var(--fb)" }}>
        <div className="kicker"><span className="idx">§</span> DISCLAIMER <span className="krule"></span></div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.7rem, 4vw, 2.4rem)", margin: "16px 0 28px" }}>
          Disclaimer
        </h1>

        <div style={{ display: "grid", gap: 24 }}>
          <section>
            <div className="kicker"><span className="idx">01</span> KONTEN BERSIFAT OPINI PENULIS <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              Seluruh karya yang diterbitkan di MediaBaca — termasuk esai, opini, fiksi, dan artikel —
              merupakan pendapat dan karya penulisnya masing-masing. MediaBaca sebagai platform
              penyedia layanan <b>tidak bertanggung jawab</b> atas keakuratan, kelengkapan, atau
              kebenaran isi karya.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">02</span> PROSES EDITORIAL <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              Setiap karya melewati proses review editor sebelum diterbitkan. Review ini bertujuan
              menjaga kerapian bahasa dan kelayakan konten, <b>bukan</b> menjamin kebenaran substansi
              argumen. Kesalahan faktual tetap menjadi tanggung jawab penulis.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">03</span> HAK CIPTA <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              Hak cipta setiap karya milik penulisnya. Jika Anda meyakini ada karya di platform ini
              yang melanggar hak cipta Anda, sampaikan laporan melalui fitur 🚩 Laporkan pada karya
              bersangkutan — tim kami akan meninjaunya dan dapat menurunkan karya tersebut.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">04</span> TAUTAN EKSTERNAL <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              Karya atau komentar dapat memuat tautan ke situs luar. MediaBaca tidak bertanggung jawab
              atas isi, kebijakan, atau praktik situs pihak ketiga tersebut.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">05</span> BATASAN TANGGUNG JAWAB <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              MediaBaca disediakan "sebagaimana adanya". Kami tidak menjamin platform akan bebas dari
              gangguan atau kehilangan data, meskipun kami berupaya menjaga keandalannya. Kami menyarankan
              penulis menyimpan salinan karya masing-masing.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">06</span> PERUBAHAN KETENTUAN <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              Disclaimer ini dapat diperbarui sewaktu-waktu. Perubahan berlaku sejak dipublikasikan
              di halaman ini.
            </p>
          </section>
        </div>

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid var(--rule)" }}>
          <Link href="/privasi" style={{ color: "var(--acc)" }}>Lihat juga: Kebijakan Privasi →</Link>
        </div>
      </main>
    </>
  );
}
