import { createClient } from "@supabase/supabase-js";

export async function fetchChaptersForSeries(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get series id from slug
  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("id")
    .eq("slug", slug)
    .single();

  if (seriesError || !series) return [];

  // Get chapters, newest first
  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("series_id", series.id)
    .order("chapter_number", { ascending: false });

  if (chaptersError || !chapters) return [];

  return chapters.map((c) => c.chapter_number);
}
