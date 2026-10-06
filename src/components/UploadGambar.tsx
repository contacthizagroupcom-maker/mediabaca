"use client";

import { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function UploadGambar({ nilai, onChange, bentuk, rasio, label }: {
  nilai: string;
  onChange: (url: string) => void;
  bentuk: "bulat" | "lebar";
  rasio: string;
  label: string;
}) {
  const supabase = getSupabaseBrowserClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [proses, setProses] = useState(false);
  const [galat, setGalat] = useState("");

  async function pilihFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalat("");

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setGalat("Hanya PNG, JPG, atau WebP yang diizinkan.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setGalat("Ukuran maksimal 2 MB — kompres dulu gambarnya ya.");
      return;
    }

    setProses(true);
    try {
      const folder = bentuk === "bulat" ? "avatars" : "covers";
      const nama = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from("covers").upload(nama, file, { cacheControl: "3600" });
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
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {nilai ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nilai} alt={label} style={
            bentuk === "bulat"
              ? { width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--rule)" }
              : { width: 200, height: Math.round(200 / (parseInt(rasio) || 3)), objectFit: "cover", borderRadius: 6, border: "1px solid var(--rule)" }
          } />
        ) : (
          <div style={
            bentuk === "bulat"
              ? { width: 88, height: 88, borderRadius: "50%", background: "var(--paper3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, border: "1px dashed var(--rule2)" }
              : { width: 200, height: Math.round(200 / (parseInt(rasio) || 3)), background: "var(--paper3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mut)", fontSize: 12, borderRadius: 6, border: "1px dashed var(--rule2)" }
          }>
            {bentuk === "bulat" ? "👤" : "Belum ada sampul"}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button type="button" className="btn" disabled={proses} onClick={() => inputRef.current?.click()}>
            {proses ? "Mengunggah…" : "⬆ Unggah " + label}
          </button>
          {nilai && (
            <button type="button" className="btn" onClick={() => onChange("")} style={{ padding: "8px 14px", fontSize: 10 }}>
              × Hapus
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pilihFile} />
      {galat && <p style={{ color: "var(--err)", fontSize: 13, marginTop: 6 }}>{galat}</p>}
      <small className="meta" style={{ textTransform: "none", fontSize: 11 }}>PNG/JPG/WebP · maks 2 MB</small>
    </div>
  );
}
