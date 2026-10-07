"use client";

import { useState } from "react";

export function MuatLagi({ total, tampil }: { total: number; tampil: number }) {
  const [n, setN] = useState(tampil);
  return (
    <button
      onClick={() => {
        const sisa = total - n;
        setN(n + Math.min(12, sisa));
        // tampilkan kartu yang tersembunyi
        document.querySelectorAll("[data-tersembunyi]").forEach((el, i) => {
          if (i < n + Math.min(12, sisa) - tampil) {
            (el as HTMLElement).style.display = "";
            el.removeAttribute("data-tersembunyi");
          }
        });
        // sembunyikan tombol jika habis
        if (n + Math.min(12, sisa) >= total) {
          const b = document.getElementById("tombol-muat-lagi");
          if (b) b.style.display = "none";
        }
      }}
      id="tombol-muat-lagi"
      className="btn btn-primary"
      style={{ margin: "26px auto 0", display: "flex", padding: "13px 22px" }}
    >
      ⬇ Muat Lebih Banyak ({total - tampil} karya lagi)
    </button>
  );
}
