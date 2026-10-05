"use client";

import { useRef, useState, useEffect } from "react";

type TombolDef = {
  label: string; judul: string;
  cmd?: string; arg?: string; blok?: string;
  aksi?: "tautan" | "gambar" | "bersih" | "undo" | "redo" | "kode";
};

const TOMBOL: TombolDef[] = [
  { label: "↶", judul: "Urungkan (undo)", cmd: "undo" },
  { label: "↷", judul: "Ulangi (redo)", cmd: "redo" },
  { label: "│", judul: "Pemisah", cmd: "insertHorizontalRule" },
  { label: "B", judul: "Tebal", cmd: "bold" },
  { label: "I", judul: "Miring", cmd: "italic" },
  { label: "U", judul: "Garis bawah", cmd: "underline" },
  { label: "S", judul: "Coret", cmd: "strikeThrough" },
  { label: "H2", judul: "Judul bagian", blok: "h2" },
  { label: "H3", judul: "Sub-judul", blok: "h3" },
  { label: "¶", judul: "Paragraf", blok: "p" },
  { label: "❝", judul: "Kutipan", blok: "blockquote" },
  { label: "•", judul: "Daftar poin", cmd: "insertUnorderedList" },
  { label: "1.", judul: "Daftar bernomor", cmd: "insertOrderedList" },
  { label: "◧", judul: "Rata kiri", cmd: "justifyLeft" },
  { label: "▣", judul: "Rata tengah", cmd: "justifyCenter" },
  { label: "◨", judul: "Rata kanan", cmd: "justifyRight" },
  { label: "▤", judul: "Rata kiri-kanan (justify)", cmd: "justifyFull" },
  { label: "🔗", judul: "Sisipkan tautan", aksi: "tautan" },
  { label: "🖼", judul: "Sisipkan gambar + keterangan", aksi: "gambar" },
  { label: "⌨", judul: "Kode / monospace", aksi: "kode" },
  { label: "✕̲", judul: "Bersihkan format", aksi: "bersih" },
];

export function EditorTeks({ nilai, onChange }: { nilai: string; onChange: (html: string) => void }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const nilaiRef = useRef(nilai);
  const terpasang = useRef(false);
  const [fokus, setFokus] = useState(false);

  // Sinkron masuk HANYA sekali (dan saat nilai diganti dari luar, mis. mode edit memuat data)
  useEffect(() => {
    if (terpasang.current && nilai === nilaiRef.current) return; // ketikan sendiri — abaikan!
    if (areaRef.current && nilai !== nilaiRef.current) {
      areaRef.current.innerHTML = nilai ?? "";
      nilaiRef.current = nilai;
    }
    if (!terpasang.current) terpasang.current = true;
  }, [nilai]);

  function simpanIsi() {
    if (areaRef.current) {
      nilaiRef.current = areaRef.current.innerHTML;
      onChange(nilaiRef.current);
    }
  }

  function jalankan(t: TombolDef) {
    areaRef.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    if (t.cmd) {
      document.execCommand(t.cmd, false, t.arg);
    } else if (t.blok) {
      document.execCommand("formatBlock", false, "<" + t.blok + ">");
    } else if (t.aksi === "tautan") {
      const url = window.prompt("URL tautan (tempel di sini):", "https://");
      if (url && url !== "https://") document.execCommand("createLink", false, url);
    } else if (t.aksi === "gambar") {
      const url = window.prompt("URL gambar (kosongkan = gambar acak):", "");
      const akhir = url && url.trim() !== ""
        ? url.trim()
        : `https://picsum.photos/seed/g${Math.floor(Math.random() * 99999)}/900/560.jpg`;
      document.execCommand("insertHTML", false,
        `<figure><img src="${akhir}" alt="Gambar ilustrasi"><figcaption>Keterangan gambar…</figcaption></figure><p><br></p>`);
    } else if (t.aksi === "kode") {
      document.execCommand("insertHTML", false,
        `<code style="background:var(--paper3);padding:2px 6px;border-radius:3px;font-family:var(--fm);font-size:.9em">${window.getSelection()?.toString() || "kode"}</code>&nbsp;`);
    } else if (t.aksi === "bersih") {
      document.execCommand("removeFormat");
      document.execCommand("formatBlock", false, "<p>");
    }
    simpanIsi();
  }

  // Shortcut keyboard: Ctrl+B / I / U tetap alami dari browser
  return (
    <div>
      <div style={{
        display: "flex", gap: 2, flexWrap: "wrap",
        borderRadius: "4px 4px 0 0", padding: 6, background: "var(--paper2)",
        border: "1px solid var(--rule2)", borderBottom: "none",
        position: "sticky", top: 0, zIndex: 5,
      }}>
        {TOMBOL.map((t, i) => (
          <button key={i} type="button" title={t.judul}
            onMouseDown={e => e.preventDefault()}
            onClick={() => jalankan(t)}
            style={{
              minWidth: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", borderRadius: 3, cursor: "pointer",
              fontFamily: t.label === "B" || t.label === "I" || t.label === "U" ? "var(--fd)" : "var(--fm)",
              fontStyle: t.label === "I" ? "italic" : "normal",
              textDecoration: t.label === "U" ? "underline" : t.label === "✕̲" ? "line-through" : "none",
              fontWeight: t.label === "B" ? 700 : 500,
              fontSize: t.label === "1." ? 12 : 14, color: "var(--ink2)",
            }}>
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={areaRef}
        contentEditable
        suppressContentEditableWarning
        onInput={simpanIsi}
        onBlur={simpanIsi}
        onFocus={() => setFokus(true)}
        onBlurCapture={() => setFokus(false)}
        data-placeholder="Tulis di sini… (Ctrl+B tebal, Ctrl+I miring — semua tombol di toolbar juga bisa)"
        style={{
          minHeight: 360, padding: "18px 20px",
          border: "1px solid var(--rule2)", borderRadius: fokus ? "0 0 4px 4px" : "0 0 4px 4px",
          borderColor: fokus ? "var(--acc)" : "var(--rule2)",
          background: "var(--paper)", color: "var(--ink)",
          fontSize: 17, lineHeight: 1.85, fontFamily: "var(--fb)",
          outline: "none", overflowWrap: "break-word",
        }}
      />
      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: var(--mut); pointer-events: none; display: block;
        }
      `}</style>
    </div>
  );
}
