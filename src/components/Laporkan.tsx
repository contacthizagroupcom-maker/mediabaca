"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const ALASAN = [
  "Spam", "Pelecehan", "Pelanggaran Hak Cipta",
  "Konten Menyesatkan", "Konten Tidak Pantas", "Lainnya",
];

export function TombolLaporkan({ targetType, targetId }: { targetType: "work" | "comment" | "profile"; targetId: string }) {
  const supabase = getSupabaseBrowserClient();
  const [terbuka, setTerbuka] = useState(false);
  const [alasan, setAlasan] = useState(ALASAN[0]);
  const [sibuk, setSibuk] = useState(false);
  const [selesai, setSelesai] = useState(false);
  const [galat, setGalat] = useState("");

  async function kirim() {
    setSibuk(true); setGalat("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/masuk"; return; }
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id, target_type: targetType, target_id: targetId, reason: alasan,
    });
    if (error) { setGalat("Gagal mengirim: " + error.message); setSibuk(false); return; }
    setSelesai(true); setSibuk(false);
    setTimeout(() => { setTerbuka(false); setSelesai(false); }, 2500);
  }

  return (
    <>
      <button onClick={() => setTerbuka(true)} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "var(--mut)", fontFamily: "var(--fm)", fontSize: 10,
        letterSpacing: ".1em", textTransform: "uppercase",
      }}>
        🚩 Laporkan
      </button>

      {terbuka && (
        <div onClick={e => { if (e.target === e.currentTarget) setTerbuka(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(13,18,13,.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--paper)", border: "1px solid var(--ink)", borderRadius: 4, padding: 28, maxWidth: 420, width: "100%", fontFamily: "var(--fb)" }}>
            {selesai ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: 40 }}>✅</div>
                <h3 style={{ fontFamily: "var(--fd)", margin: "12px 0 6px" }}>Laporan terkirim</h3>
                <p style={{ color: "var(--mut)", fontSize: 14 }}>Terima kasih — tim moderator akan meninjaunya.</p>
              </div>
            ) : (
              <>
                <div className="kicker"><span className="idx">🚩</span> LAPORKAN {targetType === "work" ? "KARYA" : targetType === "comment" ? "KOMENTAR" : "PROFIL"} <span className="krule"></span></div>
                <h3 style={{ fontFamily: "var(--fd)", fontSize: 22, margin: "10px 0 14px" }}>Apa masalahnya?</h3>
                <div className="field">
                  <label htmlFor="alasan">Alasan laporan</label>
                  <select id="alasan" className="input" value={alasan} onChange={e => setAlasan(e.target.value)}>
                    {ALASAN.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
                {galat && <p style={{ color: "var(--err)", fontSize: 13 }}>{galat}</p>}
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button onClick={() => setTerbuka(false)} className="btn" style={{ flex: 1, justifyContent: "center" }}>Batal</button>
                  <button onClick={kirim} disabled={sibuk} className="btn btn-acc" style={{ flex: 1, justifyContent: "center" }}>
                    {sibuk ? "Mengirim…" : "Kirim Laporan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
