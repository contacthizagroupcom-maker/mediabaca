"use client";

import { useEffect, useState } from "react";

export function TemaToggle() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    const tersimpan = localStorage.getItem("mb-tema");
    const aktif = tersimpan === "gelap";
    setGelap(aktif);
    document.documentElement.dataset.theme = aktif ? "dark" : "";
  }, []);

  function toggle() {
    const baru = !gelap;
    setGelap(baru);
    localStorage.setItem("mb-tema", baru ? "gelap" : "terang");
    document.documentElement.dataset.theme = baru ? "dark" : "";
  }

  return (
    <button onClick={toggle} aria-label="Ganti mode terang/gelap"
      style={{
        background: "none", border: "1px solid rgba(255,255,255,.3)", borderRadius: 4,
        color: "inherit", cursor: "pointer", padding: "6px 10px", fontSize: 14,
        fontFamily: "var(--fm)", lineHeight: 1,
      }}>
      {gelap ? "☀ Terang" : "🌙 Gelap"}
    </button>
  );
}
