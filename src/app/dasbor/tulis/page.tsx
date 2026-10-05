"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";
import { UploadSampul } from "@/components/UploadSampul";
import { EditorTeks } from "@/components/EditorTeks";

const JENIS = [
  { id: "NONFICTION", label: "Nonfiksi" },
  { id: "FICTION", label: "Fiksi" },
  { id: "ACADEMIC", label: "Akademik" },
  { id: "OPINION", label: "Opini" },
  { id: "JOURNALISM", label: "Jurnalistik" },
];

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-").replace(/^-|-$/g, "");
}

function hitungKata(html: string) {
  const teks = html.replace(/<[^>]+>/g, " ");
  return teks.trim() ? teks.trim().split(/\s+/).length : 0;
}

type Kategori = { id: string; name: string; parent_id: string | null };

function IsiTulis() {
  const router = useRouter();
  const cari = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const editId = cari.get("edit");

  const [judul, setJudul] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [isi, setIsi] = useState("");
  const [jenis, setJenis] = useState("NONFICTION");
  const [kategori, setKategori] = useState("");
  const [tagStr, setTagStr] = useState("");
  const [sampul, setSampul] = useState("");
  const [abstrak, setAbstrak] = useState("");
  const [kataKunci, setKataKunci] = useState("");
  const [babs, setBabs] = useState<{ judul: string; isi: string }[]>([]);
  const [daftarKategori, setDaftarKategori] = useState<Kategori[]>([]);
  const [status, setStatus] = useState("DRAFT");
  const [galat, setGalat] = useState("");
  const [proses, setProses] = useState(false);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/masuk"); return; }
      const { data } = await supabase.from("categories").select("id, name, parent_id");
      setDaftarKategori(data ?? []);

      if (editId) {
        const { data: k } = await supabase
          .from("works").select("title, excerpt, content, content_type, category_id, cover_url, status")
          .eq("id", editId).maybeSingle();
        if (k) {
          setJudul(k.title ?? ""); setRingkasan(k.excerpt ?? ""); setIsi(k.content ?? "");
          setJenis(k.content_type ?? "NONFICTION"); setKategori(k.category_id ?? "");
          setSampul(k.cover_url ?? ""); setStatus(k.status ?? "DRAFT");
          const { data: am } = await supabase
            .from("academic_metadata").select("abstract, keywords").eq("work_id", editId).maybeSingle();
          if (am) { setAbstrak(am.abstract ?? ""); setKataKunci(am.keywords ?? ""); }
          const { data: chs } = await supabase
            .from("chapters").select("chapter_number, title, content").eq("work_id", editId)
            .order("chapter_number", { ascending: true });
          if (chs) setBabs(chs.map((c: any) => ({ judul: c.title ?? "", isi: c.content ?? "" })));
          const { data: wt } = await supabase
            .from("work_tags").select("tags(name)").eq("work_id", editId);
          if (wt) setTagStr(wt.map((x: any) => x.tags?.name).filter(Boolean).join(", "));
        }
      }
      setMemuat(false);
    })();
  }, [editId, router, supabase]);

  const induk = daftarKategori.filter(k => !k.parent_id);
  const jumlahKata = hitungKata(isi);

  async function simpan(kirim: boolean) {
    setGalat("");
    if (!judul.trim()) { setGalat("Judul wajib diisi."); return; }
    if (kirim && !kategori) { setGalat("Pilih kategori."); return; }
    if (kirim && jumlahKata < 20) { setGalat("Isi masih terlalu pendek."); return; }
    if (kirim && jenis === "ACADEMIC" && (!abstrak.trim() || !kataKunci.trim())) {
      setGalat("Karya akademik wajib abstrak + kata kunci."); return;
    }
    setProses(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/masuk"); return; }

    const dataKarya = {
      title: judul.trim(),
      excerpt: ringkasan.trim() || isi.replace(/<[^>]+>/g, " ").trim().slice(0, 180),
      content: isi,
      cover_url: sampul.trim(),
      content_type: jenis,
      category_id: kategori || null,
      reading_time: Math.max(1, Math.round(jumlahKata / 200)),
      ...(editId ? {} : { author_id: user.id, status: "DRAFT" as const }),
    };

    let idKarya = editId;
    if (editId) {
      const { error } = await supabase.from("works").update(dataKarya).eq("id", editId);
      if (error) { setGalat("Gagal menyimpan: " + error.message); setProses(false); return; }
    } else {
      let slug = slugify(judul) || "karya";
      let n = 2;
      while (true) {
        const { data } = await supabase.from("works").select("id").eq("slug", slug).maybeSingle();
        if (!data) break;
        slug = slugify(judul) + "-" + n; n++;
      }
      const { data: baru, error } = await supabase
        .from("works").insert({ ...dataKarya, slug, fiction_format: jenis === "FICTION" ? "short" : null })
        .select("id").single();
      if (error || !baru) { setGalat("Gagal menyimpan: " + error.message); setProses(false); return; }
      idKarya = baru.id;
    }

    if (jenis === "ACADEMIC") {
      const { data: ada } = await supabase
        .from("academic_metadata").select("id").eq("work_id", idKarya).maybeSingle();
      if (ada) {
        await supabase.from("academic_metadata")
          .update({ abstract: abstrak.trim(), keywords: kataKunci.trim() }).eq("work_id", idKarya);
      } else {
        await supabase.from("academic_metadata")
          .insert({ work_id: idKarya, abstract: abstrak.trim(), keywords: kataKunci.trim() });
      }
    }

    if (jenis === "FICTION" && babs.length > 0) {
      await supabase.from("chapters").delete().eq("work_id", idKarya);
      for (let i = 0; i < babs.length; i++) {
        const b = babs[i];
        if (!b.judul.trim() && !b.isi.replace(/<[^>]+>/g, " ").trim()) continue;
        await supabase.from("chapters").insert({
          work_id: idKarya, chapter_number: i + 1,
          title: b.judul.trim() || ("Bab " + (i + 1)),
          content: b.isi,
        });
      }
    }

    if (kirim && !sampul.trim()) {
      const lanjut = window.confirm(
        "Karya ini belum punya sampul.\\n\\n" +
        "Karya bersampul tampil jauh lebih menarik di beranda dan saat dibagikan ke WhatsApp/media sosial.\\n\\n" +
        "OK = kirim tanpa sampul (bisa ditambah nanti lewat ✏️ Edit)\\n" +
        "Batal = kembali menambahkan sampul dulu"
      );
      if (!lanjut) { setProses(false); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    }

    if (kirim) {
      const { error: eSub } = await supabase.from("works").update({ status: "SUBMITTED" }).eq("id", idKarya);
      if (eSub) { setGalat("Tersimpan, tapi gagal mengirim: " + eSub.message); setProses(false); return; }
    }
    router.push("/dasbor/karya");
  }

  if (memuat) {
    return <main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>;
  }

  return (
    <>
      <HeaderDalam judul={editId ? "Edit Karya" : "Tulis Karya"} aksi={<Link href="/dasbor/karya" className="btn">← Karya Saya</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", background: "var(--paper2)", padding: "12px 16px", borderRadius: 4, marginBottom: 16 }}>{galat}</p>}
        {editId && status !== "DRAFT" && (
          <p style={{ background: "var(--paper2)", border: "1px solid var(--warn)", color: "var(--warn)", padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 14 }}>
            Status karya ini: {status}. Perubahan yang disimpan akan mengembalikan status ke kondisi semula — gunakan tombol kirim ulang jika sudah layak.
          </p>
        )}

        <details style={{ border: "1px solid var(--rule2)", borderRadius: 6, background: "var(--paper2)", padding: "12px 16px", marginBottom: 18 }}>
          <summary style={{ cursor: "pointer", fontFamily: "var(--fm)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--acc)" }}>
            ✍️ Panduan Menulis di MediaBaca
          </summary>
          <div style={{ fontSize: 14, color: "var(--ink2)", marginTop: 10, display: "grid", gap: 8 }}>
            <p style={{ margin: 0 }}><b>1. Pilih jenis &amp; kategori</b> — dari makalah akademik sampai puisi; kategori membantu pembaca menemukan karyamu.</p>
            <p style={{ margin: 0 }}><b>2. Format dengan toolbar</b> — blok teks lalu klik <b>B</b> tebal, <i>I</i> miring, H2 untuk judul bagian, ❝ untuk kutipan. Ctrl+B / Ctrl+I juga bisa.</p>
            <p style={{ margin: 0 }}><b>3. Tambahkan sampul</b> — unggah foto atau pakai acak; karya bersampul tampil lebih menarik di beranda dan saat dibagikan.</p>
            <p style={{ margin: 0 }}><b>4. Simpan Draft</b> kapan pun — lanjutkan di hari lain lewat tombol ✏️ Edit di Karya Saya.</p>
            <p style={{ margin: 0 }}><b>5. Kirim untuk Review</b> — editor akan memeriksa: disetujui (terbit!), diminta revisi (baca catatannya), atau ditolak. Hanya karya terbit yang tampil publik.</p>
          </div>
        </details>

        <input
          value={judul}
          onChange={e => setJudul(e.target.value)}
          placeholder="Judul karya…"
          style={{ width: "100%", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontFamily: "var(--fd)", fontWeight: 600, padding: "8px 0", border: "none", borderBottom: "2px solid var(--rule2)", background: "transparent", color: "var(--ink)", outline: "none" }}
        />
        <p className="meta" style={{ margin: "8px 0 20px" }}>/karya/{slugify(judul) || "otomatis-dari-judul"}</p>

        <div style={{ display: "grid", gap: 16 }}>
          <div className="field">
            <label>Jenis Karya</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {JENIS.map(j => (
                <button key={j.id} type="button" onClick={() => setJenis(j.id)}
                  className={`btn ${jenis === j.id ? "btn-primary" : ""}`} style={{ padding: "9px 14px", fontSize: 10 }}>
                  {j.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="kategori">Kategori</label>
            <select id="kategori" className="input" value={kategori} onChange={e => setKategori(e.target.value)}>
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
              <div className="field">
                <label htmlFor="abstrak">Abstrak</label>
                <textarea id="abstrak" className="input" style={{ minHeight: 110 }} value={abstrak} onChange={e => setAbstrak(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="kw">Kata kunci (koma)</label>
                <input id="kw" className="input" value={kataKunci} onChange={e => setKataKunci(e.target.value)} placeholder="Filsafat, Pendidikan" />
              </div>
            </>
          )}

          <div className="field">
            <label>Isi Karya</label>
            <EditorTeks nilai={isi} onChange={setIsi} />
            <p className="meta" style={{ textAlign: "right", marginTop: 6 }}>
              {jumlahKata} kata · ±{Math.max(1, Math.round(jumlahKata / 200))} menit baca
            </p>
          </div>

          {jenis === "FICTION" && (
            <div className="field">
              <label>Bab-Bab (untuk Novel / Cerita Bersambung)</label>
              <div style={{ display: "grid", gap: 14 }}>
                {babs.map((b, i) => (
                  <div key={i} style={{ border: "1px solid var(--rule2)", borderRadius: 4, padding: 14, background: "var(--paper2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <b className="meta" style={{ color: "var(--acc)" }}>BAB {i + 1}</b>
                      <button type="button" onClick={() => setBabs(babs.filter((_, x) => x !== i))}
                        style={{ background: "none", border: "1px solid var(--rule2)", borderRadius: 3, cursor: "pointer", color: "var(--err)", padding: "4px 10px", fontFamily: "var(--fm)", fontSize: 10 }}>HAPUS</button>
                    </div>
                    <input className="input" placeholder="Judul bab…" value={b.judul}
                      onChange={e => setBabs(babs.map((x, ix) => ix === i ? { ...x, judul: e.target.value } : x))}
                      style={{ marginBottom: 8 }} />
                    <EditorTeks nilai={b.isi} onChange={(html) => setBabs(babs.map((x, ix) => ix === i ? { ...x, isi: html } : x))} />
                  </div>
                ))}
                <button type="button" onClick={() => setBabs([...babs, { judul: "", isi: "" }])}
                  className="btn" style={{ justifyContent: "center" }}>+ Tambah Bab</button>
                <small className="meta" style={{ textTransform: "none", fontSize: 11 }}>
                  Isi utama di atas berfungsi sebagai sinopsis/prakata; setiap bab ditulis di sini.
                </small>
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="ringkasan">Ringkasan (opsional)</label>
            <textarea id="ringkasan" className="input" style={{ minHeight: 70 }} value={ringkasan} onChange={e => setRingkasan(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="tag">Tag (koma)</label>
            <input id="tag" className="input" value={tagStr} onChange={e => setTagStr(e.target.value)} placeholder="Esai, Kota, Hujan" />
          </div>

          <div className="field">
            <label>Sampul Karya</label>
            <UploadSampul nilai={sampul} onChange={setSampul} label="sampul" />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={() => simpan(false)} disabled={proses} className="btn" style={{ flex: 1, justifyContent: "center", minWidth: 140 }}>
              {editId ? "Simpan Perubahan" : "Simpan Draft"}
            </button>
            <button onClick={() => simpan(true)} disabled={proses} className="btn btn-acc" style={{ flex: 1, justifyContent: "center", minWidth: 140 }}>
              {proses ? "Memproses…" : editId && status !== "PUBLISHED" ? "Kirim / Kirim Ulang" : "Kirim untuk Review"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default function HalamanTulisLuar() {
  return (
    <Suspense fallback={<main className="container-mb"><p style={{ padding: 60, color: "var(--mut)" }}>Memuat…</p></main>}>
      <IsiTulis />
    </Suspense>
  );
}
