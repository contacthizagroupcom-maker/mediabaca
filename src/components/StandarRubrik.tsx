const STANDAR: Record<string, {
  ikon: string; judul: string; nada: string;
  standar: string[]; tips: string;
}> = {
  "rb-renungan": {
    ikon: "🌙",
    judul: "Tafakur",
    nada: "Nada: personal, hangat, jujur. Bukan ceramah — tapi percakapan jiwa dengan pembaca.",
    standar: [
      "Berangkat dari pengalaman nyata atau perenungan mendalam — bukan kutipan tanpa napas",
      "Rujukan Al-Qur'an, hadis, atau pemikir ditulis dengan rapi (dan diperiksa kebenarannya)",
      "Panjang ideal 600–1.500 kata — cukup untuk menyelam, tidak bertele-tele",
      "Satu tema per tulisan; kejelasan lebih berharga dari keluasan",
    ],
    tips: "Tulis seperti menulis untuk sahabat yang sedang mencari ketenangan — bukan untuk menunjukkan ilmu.",
  },
  "rb-sudut": {
    ikon: "⚖️",
    judul: "Lensa",
    nada: "Nada: tajam tapi santun, kritis tapi adil. Membaca persoalan dengan sudut yang belum dipakai orang.",
    standar: [
      "Punya tesis jelas sejak paragraf pertama — pembaca tahu posisimu",
      "Data, fakta, atau contoh konkret menopang setiap klaim penting",
      "Menyebut lawan argumen secara jujur sebelum membantahnya — bukan membuat scarecrow",
      "Panjang ideal 800–2.000 kata",
      "Bahasa Indonesia yang baik tanpa harus akademis kaku",
    ],
    tips: "Uji tulisanmu dengan satu pertanyaan: 'orang yang tidak setuju denganku, apakah ia diperlakukan adil di sini?'",
  },
  "rb-kajian": {
    ikon: "📖",
    judul: "Kajian",
    nada: "Nada: akademik yang hidup — teliti seperti jurnal, enak dibaca seperti esai.",
    standar: [
      "Wajib: abstrak (150–250 kata) dan kata kunci — sudah tersedia di form",
      "Struktur jelas: pendahuluan, pembahasan, penutup (dan metodologi bila penelitian)",
      "Kutipan dan rujukan mencantumkan sumber lengkap — gunakan kolom Daftar Pustaka",
      "Klaim data mencantumkan tahun dan sumbernya",
      "Panjang ideal 1.500–5.000 kata",
      "Ditulis dengan bahasa yang bisa diikuti pembaca awam cerdas — hindari jargon tanpa penjelasan",
    ],
    tips: "Kajian terbaik bukan yang paling banyak istilah teknis — tapi yang membuat orang awam mengerti hal rumit.",
  },
  "rb-kreasi": {
    ikon: "✒️",
    judul: "Cipta",
    nada: "Nada: bebas bereksperimen, tapi disiplin pada kekuatan bahasa dan kejujuran emosi.",
    standar: [
      "Fiksi: miliki konflik atau tensi — cerita tanpa masalah adalah laporan perjalanan",
      "Puisi: perhatikan irama baris walau tidak berima — baca keras-keras untuk mengujinya",
      "Hindari klise dan melodrama berlebihan; detail kecil yang tepat lebih kuat dari ungkapan besar",
      "Novel/cerita bersambung: tulis 1 bab per posting, beri judul bab yang bermakna",
      "Bebas panjang — tapi setiap bagian harus layak dibaca sampai habis",
    ],
    tips: "Tunjukkan, jangan ceritakan (show, don't tell). Alih-alih 'ia sedih' — apa yang dilihat, dipegang, dihindari matanya?",
  },
  "rb-jejak": {
    ikon: "🥾",
    judul: "Jejak",
    nada: "Nada: mata yang terbuka, kaki yang berjalan. Ceritakan apa yang dilihat dan didengar — bukan opini dari jauh.",
    standar: [
      "Berangkat dari pengalaman/perjalanan/pengamatan langsung — tulis apa yang ada di lapangan",
      "Sertakan detail sensorik: suara, bau, cuaca, percakapan yang diingat",
      "Menyebut nama orang/tempat seperlunya — hormati izin dan privasi narasumber",
      "Reportase: jawab apa, di mana, kapan, siapa, mengapa — dengan verifikasi",
      "Panjang ideal 800–2.500 kata",
    ],
    tips: "Catat di HP-mu saat kejadian: detail kecil yang tampak tidak penting justru jadi nyawa tulisan.",
  },
  "rb-generasi": {
    ikon: "🌱",
    judul: "Akar Rumput",
    nada: "Nada: dari bawah, untuk bawah. Suara pengalaman dan gagasan yang tumbuh dari tanah nyata.",
    standar: [
      "Berangkat dari praktik atau pengalaman langsung di pendidikan/komunitas/kepemimpinan",
      "Tawarkan gagasan yang bisa dipraktikkan — bukan keluhan tanpa jalan keluar",
      "Hormati tokoh yang diceritakan; biografi berdasarkan sumber yang bisa dipertanggungjawabkan",
      "Hindari nada menggurui — berbagi pengalaman lebih meyakinkan dari nasihat",
      "Panjang ideal 800–2.000 kata",
    ],
    tips: "Tulis apa yang kamu alami sendiri. Kejujuran pengalaman adalah kekuatan rubrik ini.",
  },
};

export function StandarRubrik({ kategoriId }: { kategoriId: string }) {
  // temukan rubrik induk dari sub-rubrik (rb-kreasi-puisi → rb-kreasi)
  const induk = kategoriId.startsWith("rb-")
    ? kategoriId.split("-").slice(0, 2).join("-")
    : kategoriId;
  const st = STANDAR[induk];
  if (!st) return null;

  return (
    <div style={{
      border: "1px solid var(--rule2)", borderRadius: 8,
      background: "var(--paper2)", padding: "16px 18px", marginBottom: 16,
    }}>
      <div className="kicker" style={{ marginBottom: 10 }}>
        <span className="idx">{st.ikon}</span> STANDAR KEPENULISAN — {st.judul.toUpperCase()} <span className="krule"></span>
      </div>
      <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--ink2)", margin: "0 0 10px" }}>{st.nada}</p>
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
        {st.standar.map((x, i) => (
          <li key={i} style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.6 }}>{x}</li>
        ))}
      </ul>
      <p style={{
        margin: "12px 0 0", padding: "10px 12px", borderRadius: 6,
        background: "var(--paper)", border: "1px dashed var(--rule2)",
        fontSize: 13.5, color: "var(--ink2)",
      }}>
        💡 <b>Tips editor:</b> {st.tips}
      </p>
    </div>
  );
}
