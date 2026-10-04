"use client";

import { useRef, useState } from "react";

const TOMBOL: { label: string; judul: string; cmd?: string; blok?: string; sisip?: "tautan" | "gambar" }[] = [
  { label: "B", judul: "Tebal", cmd: "bold" },
  { label: "I", judul: "Miring", cmd: "italic" },
  { label: "U", judul: "Garis bawah", cmd: "underline" },
  { label: "H2", judul: "Judul bagian", blok: "h2" },
  { label: "H3", judul: "Sub-judul", blok: "h3" },
  { label: "¶", judul: "Paragraf", blok: "p" },
  { label: "❝", judul: "Kutipan", blok: "blockquote" },
  { label: "•", judul: "Daftar poin", cmd: "insertUnorderedList" },
  { label: "1.", judul: "Daftar bernomor", cmd: "insertOrderedList" },
  { label: "—", judul: "Garis pemisah", cmd: "insertHorizontalRule" },
  { label: "🔗", judul: "Sisipkan tautan", sisip: "tautan" },
  { label: "🖼", judul: "Sisipkan gambar", sisip: "gambar" },
];

export function EditorTeks({ nilai, onChange }: { nilai: string; onChange: (html: string) => void }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [fokus, setFokus] = useState(false);

  function jalankan(t: typeof TOMBOL[number]) {
    areaRef.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    if (t.cmd) {
      document.execCommand(t.cmd, false, undefined);
    } else if (t.blok) {
      document.execCommand("formatBlock", false, "<" + t.blok + ">");
    } else if (t.sisip === "tautan") {
      const url = window.prompt("URL tautan:", "https://");
      if (url && url !== "https://") document.execCommand("createLink", false, url);
    } else if (t.sisip === "gambar") {
      const url = window.prompt("URL gambar (atau kosongkan untuk acak):", "");
      const akhir = url && url.trim() !== ""
        ? url.trim()
        : `https://picsum.photos/seed/g${Math.floor(Math.random() * 99999)}/900/560.jpg`;
      document.execCommand("insertHTML", false,
        `<figure><img src="${akhir}" alt="Gambar ilustrasi"><figcaption>Keterangan gambar…</figcaption></figure><p><br></p>`);
    }
    if (areaRef.current) onChange(areaRef.current.innerHTML);
  }

  return (
    <div>
      <div style={{
        display: "flex", gap: 2, flexWrap: "wrap",
        border: "1px solid var(--rule2)", borderBottom: fokus ? "1px solid var(--rule2)" : "none",
        borderRadius: "4px 4px 0 0", padding: 6, background: "var(--paper2)",
      }}>
        {TOMBOL.map((t, i) => (
          <button key={i} type="button" title={t.judul}
            onMouseDown={e => e.preventDefault()}
            onClick={() => jalankan(t)}
            style={{
              minWidth: 34, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", borderRadius: 3, cursor: "pointer",
              fontFamily: "var(--fd)", fontSize: 15, color: "var(--ink2)",
            }}>
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={areaRef}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange((e.target as HTMLDivElement).innerHTML)}
        onFocus={() => setFokus(true)}
        onBlur={() => setFokus(false)}
        data-placeholder="Tulis di sini… gunakan toolbar di atas untuk format."
        dangerouslySetInnerHTML={{ __html: nilai }}
        style={{
          minHeight: 340, padding: "18px 20px",
          border: "1px solid var(--rule2)", borderRadius: fokus ? "0 0 4px 4px" : "4px",
          background: "var(--paper)", color: "var(--ink)",
          fontSize: 17, lineHeight: 1.85, fontFamily: "var(--fb)",
          outline: "none", overflowWrap: "break-word",
        }}
      />
      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: var(--mut); pointer-events: none;
        }
      `}</style>
    </div>
  );
}
