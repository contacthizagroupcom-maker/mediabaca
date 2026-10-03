import { createBrowserClient } from "@supabase/ssr";
let klien: ReturnType<typeof createBrowserClient> | null = null;
export function getSupabaseBrowserClient() {
  if (!klien) {
    klien = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return klien;
}
