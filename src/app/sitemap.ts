import type { MetadataRoute } from "next";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mediabaca.vercel.app";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: karya } = await supabase
    .from("works").select("slug, updated_at").eq("status", "PUBLISHED");
  const { data: penulis } = await supabase
    .from("profiles").select("username");

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: baseUrl + "/jelajahi", lastModified: new Date(), priority: 0.8 },
    { url: baseUrl + "/privasi", lastModified: new Date(), priority: 0.3 },
    { url: baseUrl + "/disclaimer", lastModified: new Date(), priority: 0.3 },
    ...(karya ?? []).map((k: any) => ({
      url: `${baseUrl}/karya/${k.slug}`,
      lastModified: k.updated_at ? new Date(k.updated_at) : new Date(),
      priority: 0.9,
    })),
    ...(penulis ?? []).map((p: any) => ({
      url: `${baseUrl}/penulis/${p.username}`,
      lastModified: new Date(),
      priority: 0.5,
    })),
  ];
}
