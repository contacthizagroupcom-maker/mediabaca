"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function CatatView({ workId }: { workId: string }) {
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const kunci = "mbv_" + workId;
    try {
      if (sessionStorage.getItem(kunci)) return; // 1x per sesi
      sessionStorage.setItem(kunci, "1");
    } catch { /* incognito — lanjut saja */ }

    (async () => {
      await supabase.rpc("record_view", { p_work: workId });
    })();
  }, [workId, supabase]);

  return null;
}
