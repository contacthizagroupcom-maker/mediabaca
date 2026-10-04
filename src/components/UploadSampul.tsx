"use client";

import { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function UploadSampul({ nilai, onChange, label }: {
  nilai: string; onChange: (url: string) => void; label: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState("");

  async function pilihFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalat("");

    // Validasi: hanya gambar, maksimal 2 MB (sesuai semangat validasi storage kita)
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setGalat("Hanya PNG, JPG, atau WebP yang diizinkan."); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setGalat("Ukuran maksimal 2 MB — kompres dulu fotonya ya."); return;
    }

    setProses(true);
    try {
      const nama = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage
        .from("covers")
        .upload(nama, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from("covers").getPublicUrl(nama);
      onChange(data.publicUrl);
    } catch (err: any) {
      setGalat("Gagal mengunggah: " + (err?.message ?? "coba lagi"));
    }
    setProses(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input className="input" style={{ flex: 1, minWidth: 180 }} value={nilai}
          onChange={e => onChange(e.target.value)} placeholder="URL gambar — atau unggah →" />
        <button type="button" className="btn" disabled={proses} onClick={() => inputRef.current?.click()}>
          {proses ? "Mengunggah…" : "⬆ Unggah Foto"}
        </button>
        <button type="button" className="btn" onClick={() => onChange(`https://picsum.photos/seed/mb${Math.floor(Math.random() * 99999)}/1200/520`)}>
          ↺ Acak
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pilihFile} />
      {galat && <p style={{ color: "var(--err)", fontSize: 13, marginTop: 4 }}>{galat}</p>}
      {nilai && (
        <div style={{ marginTop: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={nilai} alt="Pratinjau sampul" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 2, border: "1px solid var(--rule)" }} />
          <p className="meta" style={{ marginTop: 4 }}>✓ Pratinjau sampul</p>
        </div>
      )}
    </div>
  );
}
