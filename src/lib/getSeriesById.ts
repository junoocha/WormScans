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
};

export async function fetchSeriesById(seriesId: string): Promise<{
  data: SeriesDetail | null;
  error: any;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("series")
    .select(
      `
      id,
      series_name,
      series_desc,
      chapters (
        id,
        chapter_number,
        title,
        created_at
      )
    `
    )
    .eq("id", seriesId)
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
}
