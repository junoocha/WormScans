// lib/getAllSeries.ts
import { createClient } from "@supabase/supabase-js";

export type Series = {
  id: string;
  series_name: string;
  slug: string;
  cover_url?: string;
  series_status: string;
  country_origin: string;
};

export async function fetchAllSeries({
  page = 1,
  limit = 18,
  series_status, // optional filter
  countryOrigin, // optional filter
}: {
  page?: number;
  limit?: number;
  series_status?: string;
  countryOrigin?: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("series")
    .select("id, series_name, slug, cover_url, series_status, country_origin")
    .order("series_name", { ascending: true })
    .range(from, to);

  if (series_status) query = query.eq("series_status", series_status);
  if (countryOrigin) query = query.eq("country_origin", countryOrigin);

  const { data, error } = await query;

  if (error) {
    console.error("Supabase fetchAllSeries error:", error);
    return { data: [], error };
  }

  return { data: data as Series[], error: null };
}
