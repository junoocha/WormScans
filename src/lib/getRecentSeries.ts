// lib/getRecentSeries.ts
import { createClient } from "@supabase/supabase-js";

// ---- Types ----
export type ChapterRow = {
  id: number;
  chapter_number: number | null;
  created_at: string;
  series: {
    id: number;
    series_name: string;
    slug: string;
    cover_url?: string;
  } | null;
};

export type SeriesWithChapters = {
  series_id: string;
  series_name: string;
  slug: string;
  cover_url?: string;
  chapters: {
    id: string;
    chapter_number: string;
    created_at: string;
  }[];
};

// ---- Main Fetch Function ----
export async function fetchRecentSeries({
  page = 1,
  limit = 10, // number of series per page
}: {
  page?: number;
  limit?: number;
}): Promise<{ data: SeriesWithChapters[]; error: any }> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Calculate how many chapters to fetch at once. We need more than the page limit to ensure we can fill the page after grouping by series
  const fetchLimit = 50; // fetch 50 chapters at a time

  const { data, error } = (await supabase
    .from("chapters")
    .select(
      `
      id,
      chapter_number,
      created_at,
      series:series_id ( id, series_name, slug, cover_url )
    `
    )
    .order("created_at", { ascending: false })
    .limit(fetchLimit)) as { data: ChapterRow[] | null; error: any };

  if (error) return { data: [], error };
  if (!data) return { data: [], error: null };

  // ---- Group by series ----
  const seriesMap: Record<string, SeriesWithChapters> = {};

  for (const ch of data) {
    const s = ch.series;
    if (!s) continue;

    if (!seriesMap[s.id]) {
      seriesMap[s.id] = {
        series_id: s.id.toString(),
        series_name: s.series_name,
        slug: s.slug,
        cover_url: s.cover_url || undefined,
        chapters: [],
      };
    }

    seriesMap[s.id].chapters.push({
      id: ch.id.toString(),
      chapter_number: ch.chapter_number?.toString() || "",
      created_at: ch.created_at,
    });
  }

  // sort chapters (newest first) and slice last 3
  const groupedSeries: SeriesWithChapters[] = Object.values(seriesMap).map(
    (series) => {
      const sortedByNumber = [...series.chapters].sort(
        (a, b) => Number(b.chapter_number) - Number(a.chapter_number)
      );
      return { ...series, chapters: sortedByNumber.slice(0, 3) };
    }
  );

  // sort series by newest updated chapter
  groupedSeries.sort((a, b) => {
    const aLatest = a.chapters[0]?.created_at || "";
    const bLatest = b.chapters[0]?.created_at || "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });

  // ---- Pagination ----
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedSeries = groupedSeries.slice(start, end);

  return { data: paginatedSeries, error: null };
}
