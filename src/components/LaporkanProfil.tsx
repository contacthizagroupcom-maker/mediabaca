"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function LaporkanProfil({ targetId }: { targetId: string }) {
  const supabase = getSupabaseBrowserClient();
  const [ok, setOk] = useState(false);

  async function lapor() {
    if (!confirm("Laporkan profil ini ke moderator?")) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return void (window.location.href = "/masuk");
    const alasan = window.prompt("Tuliskan alasan laporan singkat:")?.trim();
    if (!alasan) return;
    await supabase.from("reports").insert({
      reporter_id: user.id, target_type: "profile", target_id: targetId, reason: alasan,
    });
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  }

  return (
    <button onClick={lapor} style={{
      background: "none", border: "none", cursor: "pointer",
      color: ok ? "var(--acc)" : "var(--mut)",
      fontFamily: "var(--fm)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase",
    }}>
      {ok ? "✓ Laporan terkirim" : "🚩 Laporkan profil ini"}
    </button>
  );
}
