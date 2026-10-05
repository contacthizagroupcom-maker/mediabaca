"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function TombolBookmark({ workId }: { workId: string }) {
  const supabase = getSupabaseBrowserClient();
  const [tersimpan, setTersimpan] = useState(false);
  const [masuk, setMasuk] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMasuk(true);
      const { data } = await supabase
        .from("bookmarks").select("id")
        .eq("work_id", workId).eq("user_id", user.id).maybeSingle();
      setTersimpan(!!data);
    })();
  }, [workId, supabase]);

  async function toggle() {
    if (!masuk) return void (window.location.href = "/masuk");
    setSibuk(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (tersimpan) {
      await supabase.from("bookmarks").delete().eq("work_id", workId).eq("user_id", user.id);
      setTersimpan(false);
    } else {
      await supabase.from("bookmarks").insert({ work_id: workId, user_id: user.id });
      setTersimpan(true);
    }
    setSibuk(false);
  }

  return (
    <button onClick={toggle} disabled={sibuk} className={`btn ${tersimpan ? "btn-acc" : ""}`} style={{ padding: "10px 16px" }}>
      {tersimpan ? "🔖 Tersimpan" : "🔖 Simpan Bacaan"}
    </button>
  );
}
