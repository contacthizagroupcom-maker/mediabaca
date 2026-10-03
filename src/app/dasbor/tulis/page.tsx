"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const JENIS = [
  { id: "NONFICTION", label: "Nonfiksi" },
  { id: "FICTION", label: "Fiksi" },
  { id: "ACADEMIC", label: "Akademik" },
  { id: "OPINION", label: "Opini & Gagasan" },
  { id: "JOURNALISM", label: "Jurnalistik" },
];

const FIKSI = [
  { id: "short", label: "Cerpen / pendek" },
  { id: "novel", label: "Novel" },
  { id: "poetry", label: "Puisi" },
  { id: "prose", label: "Prosa" },
];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").replace(/^-|-$/g, "");
}

const inGaya = { width: "100%", padding: 12, border: "1px solid #C7D2C7", borderRadius: 4, fontSize: 16, background: "#fff", color: "#0D120D", boxSizing: "border-box" } as const;
const labGaya = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: "bold", color: "#2C372C" } as const;

type Kategori = { id: string; name: string; parent_id: string | null };

export default function HalamanTulis() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [judul, setJudul] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [isi, setIsi] = useState("");
  const [jenis, setJenis] = useState("NONFICTION");
  const [kategori, setKategori] = useState("");
  const [formatFiksi, setFormatFiksi] = useState("short");
  const [tagStr, setTagStr] = useState("");
  const [sampul, setSampul] = useState("");
  const [abstrak, setAbstrak] = useState("");
  const [kataKunci, setKataKunci] = useState("");
  const [daftarKategori, setDaftarKategori] = useState<Kategori[]>([]);
  const [galat, setGalat] = useState("");
  const [proses, setProses] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      const { data } = await supabase.from("categories").select("id, name, parent_id");
      setDaftarKategori(data ?? []);
    })();
  }, [router, supabase]);

  const induk = daftarKategori.filter(k => !k.parent_id);
  const jumlahKata = isi.trim() ? isi.trim().split(/\s+/).length : 0;

  async function slugUnik(dasar: string) {
    let s = dasar || "karya";
    let n = 2;
    while (true) {
      const { data } = await supabase.from("works").select("id").eq("slug", s).maybeSingle();
      if (!data) return s;
      s = dasar + "-" + n; n++;
    }
  }

  async function simpan(kirim: boolean) {
    setGalat("");
    if (!judul.trim()) { setGalat("Judul wajib diisi."); return; }
    if (kirim && !kategori) { setGalat("Pilih kategori sebelum mengirim untuk review."); return; }
    if (kirim && jumlahKata < 20) { setGalat("Isi karya masih terlalu pendek (minimal ±20 kata)."); return; }
    if (kirim && jenis === "ACADEMIC" && (!abstrak.trim() || !kataKunci.trim())) {
      setGalat("Karya akademik wajib mengisi abstrak dan kata kunci."); return;
    }
    setProses(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/masuk"); return; }

    const slug = await slugUnik(slugify(judul));
    const ringkasanFinal = ringkasan.trim() || isi.trim().slice(0, 180);
    const waktuBaca = Math.max(1, Math.round(jumlahKata / 200));

    const { data: baru, error } = await supabase
      .from("works")
      .insert({
        author_id: user.id, title: judul.trim(), slug,
        excerpt: ringkasanFinal, content: isi,
        cover_url: sampul.trim(), content_type: jenis,
        category_id: kategori || null,
        fiction_format: jenis === "FICTION" ? formatFiksi : null,
        status: "DRAFT", reading_time: waktuBaca,
      })
      .select("id")
      .single();

    if (error || !baru) {
      setGalat("Gagal menyimpan: " + (error?.message ?? "tidak diketahui"));
      setProses(false); return;
    }

    if (jenis === "ACADEMIC") {
      await supabase.from("academic_metadata").insert({
        work_id: baru.id, abstract: abstrak.trim(), keywords: kataKunci.trim(),
      });
    }

    const tags = tagStr.split(",").map(t => t.trim()).filter(Boolean).slice(0, 8);
    for (const t of tags) {
      const idTag = slugify(t) || "tag";
      const { data: ada } = await supabase.from("tags").select("id").eq("id", idTag).maybeSingle();
      if (!ada) await supabase.from("tags").insert({ id: idTag, name: t, slug: idTag });
      await supabase.from("work_tags").insert({ work_id: baru.id, tag_id: idTag });
    }

    if (kirim) {
      const { error: eSub } = await supabase
        .from("works").update({ status: "SUBMITTED" }).eq("id", baru.id);
      if (eSub) { setGalat("Tersimpan sebagai draft, tapi gagal mengirim: " + eSub.message); setProses(false); return; }
    }

    router.push("/dasbor/karya");
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 40, fontFamily: "Georgia, serif" }}>
      <Link href="/dasbor" style={{ color: "#0B7A3E", textDecoration: "none" }}>← Dasbor</Link>
      <h1 style={{ fontSize: 30, margin: "10px 0 20px" }}>Tulis Karya</h1>
      {galat && <p style={{ color: "#B3261E", background: "#FBEAEA", padding: 10, borderRadius: 4 }}>{galat}</p>}

      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label htmlFor="judul" style={labGaya}>Judul</label>
          <input id="judul" style={inGaya} value={judul} onChange={e => setJudul(e.target.value)} placeholder="Judul karya…" />
        </div>

        <div>
          <label htmlFor="jenis" style={labGaya}>Jenis karya</label>
          <select id="jenis" style={inGaya} value={jenis} onChange={e => setJenis(e.target.value)}>
            {JENIS.map(j => <option key={j.id} value={j.id}>{j.label}</option>)}
          </select>
        </div>

        {jenis === "FICTION" && (
          <div>
            <label htmlFor="fiksi" style={labGaya}>Format fiksi</label>
            <select id="fiksi" style={inGaya} value={formatFiksi} onChange={e => setFormatFiksi(e.target.value)}>
              {FIKSI.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
            <small style={{ color: "#888" }}>Fitur bab-per-bab untuk novel menyusul di sesi berikutnya.</small>
          </div>
        )}

        <div>
          <label htmlFor="kategori" style={labGaya}>Kategori</label>
          <select id="kategori" style={inGaya} value={kategori} onChange={e => setKategori(e.target.value)}>
            <option value="">— pilih kategori —</option>
            {induk.map(p => (
              <optgroup key={p.id} label={p.name}>
                {daftarKategori.filter(k => k.parent_id === p.id).map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {jenis === "ACADEMIC" && (
          <>
            <div>
              <label htmlFor="abstrak" style={labGaya}>Abstrak</label>
              <textarea id="abstrak" style={{ ...inGaya, minHeight: 120 }} value={abstrak} onChange={e => setAbstrak(e.target.value)} />
            </div>
            <div>
              <label htmlFor="kw" style={labGaya}>Kata kunci (pisahkan koma)</label>
              <input id="kw" style={inGaya} value={kataKunci} onChange={e => setKataKunci(e.target.value)} placeholder="Filsafat, Pendidikan" />
            </div>
          </>
        )}

        <div>
          <label htmlFor="isi" style={labGaya}>Isi karya</label>
          <textarea id="isi" style={{ ...inGaya, minHeight: 320, fontFamily: "Georgia, serif", lineHeight: 1.8 }} value={isi}
            onChange={e => setIsi(e.target.value)} placeholder="Tulis di sini…" />
          <small style={{ color: "#888" }}>{jumlahKata} kata · ±{Math.max(1, Math.round(jumlahKata / 200))} menit baca</small>
        </div>

        <div>
          <label htmlFor="ringkasan" style={labGaya}>Ringkasan (opsional — otomatis dari isi bila kosong)</label>
          <textarea id="ringkasan" style={{ ...inGaya, minHeight: 80 }} value={ringkasan} onChange={e => setRingkasan(e.target.value)} />
        </div>

        <div>
          <label htmlFor="tag" style={labGaya}>Tag (pisahkan koma)</label>
          <input id="tag" style={inGaya} value={tagStr} onChange={e => setTagStr(e.target.value)} placeholder="Esai, Kota, Hujan" />
        </div>

        <div>
          <label htmlFor="sampul" style={labGaya}>URL gambar sampul (opsional)</label>
          <input id="sampul" style={inGaya} value={sampul} onChange={e => setSampul(e.target.value)} placeholder="https://…" />
          <button type="button" onClick={() => setSampul(`https://picsum.photos/seed/mb${Math.floor(Math.random() * 99999)}/1200/520`)}
            style={{ marginTop: 8, padding: 8, background: "none", border: "1px dashed #C7D2C7", borderRadius: 4, cursor: "pointer", color: "#2C372C" }}>
            ↺ Pakai sampul acak
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={() => simpan(false)} disabled={proses}
            style={{ flex: 1, padding: 14, border: "1px solid #0D120D", background: "#fff", color: "#0D120D", borderRadius: 4, fontSize: 15, cursor: "pointer" }}>
            Simpan Draft
          </button>
          <button onClick={() => simpan(true)} disabled={proses}
            style={{ flex: 1, padding: 14, background: "#0B7A3E", color: "#fff", border: "none", borderRadius: 4, fontSize: 15, cursor: "pointer" }}>
            {proses ? "Memproses…" : "Kirim untuk Review"}
          </button>
        </div>
      </div>
    </main>
  );
}
