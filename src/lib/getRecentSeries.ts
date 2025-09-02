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
  } | null;
};

export type SeriesWithChapters = {
  series_id: string;
  series_name: string;
  slug: string;
  chapters: {
    id: string;
    chapter_number: string;
    created_at: string;
  }[];
};

// ---- Main Fetch Function ----
export async function fetchRecentSeries(): Promise<{
  data: SeriesWithChapters[];
  error: any;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for joins
  );

  const { data, error } = (await supabase
    .from("chapters")
    .select(
      `
      id,
      chapter_number,
      created_at,
      series:series_id ( id, series_name, slug )
    `
    )
    .order("created_at", { ascending: false })
    .limit(50)) as { data: ChapterRow[] | null; error: any };

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
        chapters: [],
      };
    }

    seriesMap[s.id].chapters.push({
      id: ch.id.toString(),
      chapter_number: ch.chapter_number?.toString() || "",
      created_at: ch.created_at,
    });
  }

  // sort chapters chronologically (oldest → newest) and slice last 3
  const groupedSeries: SeriesWithChapters[] = Object.values(seriesMap).map(
    (series) => ({
      ...series,
      chapters: series.chapters
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        .slice(-3),
    })
  );

  //  sort series so the one with the newest chapter appears first
  groupedSeries.sort((a, b) => {
    const aLatest = a.chapters[a.chapters.length - 1]?.created_at || "";
    const bLatest = b.chapters[b.chapters.length - 1]?.created_at || "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });

  return { data: groupedSeries, error: null };
}
