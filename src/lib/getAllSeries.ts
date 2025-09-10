// lib/getAllSeries.ts
import { createClient } from "@supabase/supabase-js";

export type Series = {
  id: string;
  series_name: string;
  slug: string;
  cover_url?: string;
};

export async function fetchAllSeries({
  page = 1,
  limit = 18,
}: {
  page?: number;
  limit?: number;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("series")
    .select("id, series_name, slug, cover_url")
    .order("series_name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Supabase fetchAllSeries error:", error);
    return { data: [], error };
  }

  return { data: data as Series[], error: null };
}
