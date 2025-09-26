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

  const seriesIds = recentSeries.map((s) => s.series_id);

  // fetch top 3 chapters per series
  const { data: chapters, error: chError } = await supabase
    .from("chapters")
    .select("id, chapter_number, created_at, series_id")
    .in("series_id", seriesIds)
    .order("chapter_number", { ascending: false });

  if (chError || !chapters) return { data: [], error: chError };

  // group chapters by series_id
  const chaptersBySeries: Record<string, ChapterRow[]> = {};
  for (const ch of chapters) {
    const sid = ch.series_id.toString();
    if (!chaptersBySeries[sid]) chaptersBySeries[sid] = [];
    chaptersBySeries[sid].push(ch);
  }

  // assemble final payload
  const result: SeriesWithChapters[] = recentSeries.map((s) => ({
    series_id: s.series_id.toString(),
    series_name: s.series_name,
    slug: s.slug,
    cover_url: s.cover_url || undefined,
    latest_upload_date: s.latest_upload_date,
    chapters: (chaptersBySeries[s.series_id] || []).slice(0, 3).map((c) => ({
      id: c.id.toString(),
      chapter_number: c.chapter_number?.toString() || "",
      created_at: c.created_at,
    })),
  }));

  return { data: result, error: null };
}
