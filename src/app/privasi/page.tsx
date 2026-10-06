import Link from "next/link";
import { HeaderPublik } from "@/components/HeaderPublik";

export const metadata = {
  title: "Kebijakan Privasi — MediaBaca",
  description: "Bagaimana MediaBaca mengumpulkan, menggunakan, dan melindungi data Anda.",
};

export default function Privasi() {
  return (
    <>
      <HeaderPublik aktif="privasi" />
      <main className="container-mb narrow" style={{ padding: "48px 24px 80px", fontFamily: "var(--fb)" }}>
        <div className="kicker"><span className="idx">🔒</span> KEBIJAKAN PRIVASI <span className="krule"></span></div>
        <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.7rem, 4vw, 2.4rem)", margin: "16px 0 8px" }}>
          Kebijakan Privasi
        </h1>
        <p className="meta" style={{ textTransform: "none", fontSize: 12, marginBottom: 28 }}>
          Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div style={{ display: "grid", gap: 24 }}>
          <section>
            <div className="kicker"><span className="idx">01</span> DATA YANG KAMI KUMPULKAN <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              MediaBaca mengumpulkan informasi minimal yang diperlukan untuk menjalankan layanan:
            </p>
            <ul style={{ color: "var(--ink2)", marginLeft: 20, lineHeight: 2, fontSize: 16 }}>
              <li><b>Data akun:</b> nama lengkap, username, dan email yang Anda berikan saat mendaftar</li>
              <li><b>Data profil:</b> biografi, foto profil, dan sampul yang Anda unggah secara sukarela</li>
              <li><b>Data aktivitas:</b> karya yang Anda tulis, komentar, suka, dan aktivitas mengikuti penulis</li>
              <li><b>Data teknis:</b> catatan kunjungan halaman (untuk statistik pembaca karya)</li>
            </ul>
          </section>

          <section>
            <div className="kicker"><span className="idx">02</span> BAGAIMANA DATA DIGUNAKAN <span className="krule"></span></div>
            <ul style={{ color: "var(--ink2)", marginLeft: 20, lineHeight: 2, fontSize: 16, marginTop: 10 }}>
              <li>Menampilkan profil dan karya Anda di platform</li>
              <li>Mengirim notifikasi terkait aktivitas karya Anda</li>
              <li>Menyediakan statistik pembaca bagi penulis</li>
              <li>Menjaga keamanan platform dan memoderasi konten</li>
            </ul>
            <p style={{ color: "var(--ink2)", fontSize: 16, lineHeight: 1.8 }}>
              Kami <b>tidak menjual</b> data Anda kepada pihak ketiga.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">03</span> HAK CIPTA KARYA <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              Seluruh karya yang diterbitkan di MediaBaca tetap menjadi milik penulisnya masing-masing.
              Kami hanya menampilkannya di platform sesuai kesepakatan penulis. Penulis berhak menghapus
              karyanya kapan pun melalui dasbor.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">04</span> COOKIE & PENYIMPANAN LOKAL <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              MediaBaca menggunakan penyimpanan lokal browser (localStorage) untuk menyimpan preferensi
              tampilan seperti mode gelap/terang, dan sesi login. Kami juga dapat menggunakan layanan
              pihak ketiga (seperti Google Analytics atau iklan) yang menggunakan cookie — kebijakan
              masing-masing berlaku.
            </p>
          </section>

          <section>
            <div className="kicker"><span className="idx">05</span> HAK ANDA <span className="krule"></span></div>
            <ul style={{ color: "var(--ink2)", marginLeft: 20, lineHeight: 2, fontSize: 16, marginTop: 10 }}>
              <li>Anda dapat mengubah atau melengkapi data profil kapan pun</li>
              <li>Anda dapat menghapus akun dan seluruh data terkait melalui Pengaturan</li>
              <li>Anda dapat meminta penjelasan lebih lanjut tentang data Anda</li>
            </ul>
          </section>

          <section>
            <div className="kicker"><span className="idx">06</span> KONTAK <span className="krule"></span></div>
            <p style={{ color: "var(--ink2)", marginTop: 10, fontSize: 16, lineHeight: 1.8 }}>
              Pertanyaan tentang kebijakan privasi ini dapat disampaikan melalui halaman Kontak kami: email mediabaca.id@gmail.com atau WhatsApp +62 819-9597-7916. Kami akan menanggapi dalam waktu yang wajar.
            </p>
          </section>
        </div>

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid var(--rule)" }}>
          <Link href="/disclaimer" style={{ color: "var(--acc)" }}>Lihat juga: Disclaimer →</Link>
        </div>
      </main>
    </>
  );
}
