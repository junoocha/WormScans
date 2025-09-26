// lib/getRecentChapters.ts
import { createClient } from "@supabase/supabase-js";

export interface RecentChapter {
  id: string;
  chapter_number: string;
  title: string;
  created_at: string;
  series_name: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fetchRecentChapters(): Promise<{
  data: RecentChapter[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("chapters")
    .select("id, chapter_number, title, created_at, series(series_name)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return { data: [], error: error.message };
  }

  const chapters: RecentChapter[] = (data || []).map((chapter: any) => ({
    id: chapter.id.toString(),
    chapter_number: chapter.chapter_number?.toString() || "",
    title: chapter.title || "",
    created_at: chapter.created_at,
    series_name: chapter.series?.series_name || "Unknown Series",
  }));

  return { data: chapters, error: null };
}
