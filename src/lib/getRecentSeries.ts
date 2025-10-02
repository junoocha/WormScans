// lib/getRecentSeries.ts
import { createClient } from "@supabase/supabase-js";

export type ChapterRow = {
  id: number;
  chapter_number: number | null;
  created_at: string;
  series_id: number;
};

export type SeriesWithChapters = {
  series_id: string;
  series_name: string;
  slug: string;
  cover_url?: string;
  latest_upload_date: string;
  chapters: {
    id: string;
    chapter_number: string;
    created_at: string;
  }[];
};

export async function fetchRecentSeries({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}): Promise<{ data: SeriesWithChapters[]; error: any }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // fetch recent series from the view
  const { data: recentSeries, error } = await supabase
    .from("recent_series")
    .select("*")
    .order("latest_upload_date", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error || !recentSeries) return { data: [], error };

  // map the arrays from the view into structured chapters
  const result: SeriesWithChapters[] = recentSeries.map((s: any) => {
    const ids: number[] = s.latest_chapter_ids || [];
    const numbers: (number | null)[] = s.latest_chapter_numbers || [];
    const dates: string[] = s.latest_chapter_dates || [];

    const chapters = ids.map((id, i) => ({
      id: id.toString(),
      chapter_number: (numbers[i] ?? "").toString(),
      created_at: dates[i] ?? "",
    }));

    return {
      series_id: s.series_id.toString(),
      series_name: s.series_name,
      slug: s.slug,
      cover_url: s.cover_url || undefined,
      latest_upload_date: s.latest_upload_date,
      chapters,
    };
  });

  return { data: result, error: null };
}
