"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { HeaderDalam } from "@/components/AppShell";

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

type Kategori = { id: string; name: string; parent_id: string | null };

export default function HalamanTulis() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [judul, setJudul] = useState("");
  const [ringkasan, setRingkasan] = useState("");
  const [isi, setIsi] = useState("");
  const [jenis, setJenis] = useState("NONFICTION");
  const [kategori, setKategori] = useState("");
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
    const { data: baru, error } = await supabase
      .from("works")
      .insert({
        author_id: user.id, title: judul.trim(), slug,
        excerpt: ringkasan.trim() || isi.trim().slice(0, 180),
        content: isi, cover_url: sampul.trim(), content_type: jenis,
        category_id: kategori || null,
        fiction_format: jenis === "FICTION" ? "short" : null,
        status: "DRAFT", reading_time: Math.max(1, Math.round(jumlahKata / 200)),
      })
      .select("id").single();

    if (error || !baru) { setGalat("Gagal menyimpan: " + (error?.message ?? "??")); setProses(false); return; }

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
      const { error: eSub } = await supabase.from("works").update({ status: "SUBMITTED" }).eq("id", baru.id);
      if (eSub) { setGalat("Tersimpan sebagai draft, tapi gagal mengirim: " + eSub.message); setProses(false); return; }
    }
    router.push("/dasbor/karya");
  }

  return (
    <>
      <HeaderDalam judul="Tulis Karya" aksi={<Link href="/dasbor" className="btn">← Dasbor</Link>} />
      <main className="container-mb narrow" style={{ padding: "24px 24px 80px" }}>
        {galat && <p style={{ color: "var(--err)", border: "1px solid var(--err)", background: "var(--paper2)", padding: "12px 16px", borderRadius: 4, marginBottom: 16 }}>{galat}</p>}

        <input
          value={judul}
          onChange={e => setJudul(e.target.value)}
          placeholder="Judul karya…"
          style={{ width: "100%", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontFamily: "var(--fd)", fontWeight: 600, padding: "8px 0", border: "none", borderBottom: "2px solid var(--rule2)", background: "transparent", color: "var(--ink)", outline: "none" }}
        />
        <p className="meta" style={{ margin: "8px 0 20px" }}>
          /karya/{slugify(judul) || "otomatis-dari-judul"}
        </p>

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
            <label htmlFor="isi">Isi Karya</label>
            <textarea id="isi" className="input" style={{ minHeight: 340, fontSize: 17, lineHeight: 1.85, fontFamily: "var(--fb)" }} value={isi}
              onChange={e => setIsi(e.target.value)} placeholder="Tulis di sini… (mendukung HTML sederhana: <p>, <h2>, <blockquote>, <em>)" />
            <p className="meta" style={{ textAlign: "right", marginTop: 6 }}>
              {jumlahKata} kata · ±{Math.max(1, Math.round(jumlahKata / 200))} menit baca
            </p>
          </div>

          <div className="field">
            <label htmlFor="ringkasan">Ringkasan (opsional)</label>
            <textarea id="ringkasan" className="input" style={{ minHeight: 70 }} value={ringkasan} onChange={e => setRingkasan(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="tag">Tag (koma)</label>
            <input id="tag" className="input" value={tagStr} onChange={e => setTagStr(e.target.value)} placeholder="Esai, Kota, Hujan" />
          </div>

          <div className="field">
            <label htmlFor="sampul">URL Sampul (opsional)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input id="sampul" className="input" value={sampul} onChange={e => setSampul(e.target.value)} placeholder="https://…" />
              <button type="button" onClick={() => setSampul(`https://picsum.photos/seed/mb${Math.floor(Math.random() * 99999)}/1200/520`)}
                className="btn" style={{ whiteSpace: "nowrap" }}>↺ Acak</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => simpan(false)} disabled={proses} className="btn" style={{ flex: 1, justifyContent: "center" }}>
              Simpan Draft
            </button>
            <button onClick={() => simpan(true)} disabled={proses} className="btn btn-acc" style={{ flex: 1, justifyContent: "center" }}>
              {proses ? "Memproses…" : "Kirim untuk Review"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
