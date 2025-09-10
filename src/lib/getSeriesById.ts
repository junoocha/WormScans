// lib/getSeriesById.ts

import { createClient } from "@supabase/supabase-js";

export type Chapter = {
  id: string;
  chapter_number: string;
  title: string;
  created_at: string;
};

export type SeriesDetail = {
  id: string;
  series_name: string;
  series_desc: string | null;
  chapters: Chapter[];
  slug: string;
  cover_url: string;
};

export async function fetchSeries(seriesIdentifier: {
  id?: string;
  slug?: string;
}): Promise<{ data: SeriesDetail | null; error: any }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase.from("series").select(
    `
      id,
      series_name,
      series_desc,
      slug,
      cover_url,
      chapters (
        id,
        chapter_number,
        title,
        created_at
      )
    `
  );

  if (seriesIdentifier.id) {
    query = query.eq("id", seriesIdentifier.id);
  } else if (seriesIdentifier.slug) {
    query = query.eq("slug", seriesIdentifier.slug);
  } else {
    throw new Error("Must provide either id or slug");
  }

  const { data, error } = await query.single();
  if (error) return { data: null, error };
  return { data, error: null };
}
