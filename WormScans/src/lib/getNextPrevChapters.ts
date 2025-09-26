// lib/getNextPrevChapters.ts
import { createClient } from "@supabase/supabase-js";

export async function fetchAdjacentChapters(
  slug: string,
  currentNumber: number
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // first get series id
  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("id")
    .eq("slug", slug)
    .single();

  if (seriesError || !series) return { prev: null, next: null };

  const seriesId = series.id;

  // prev chapter (largest less than current)
  const { data: prevData } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("series_id", seriesId)
    .lt("chapter_number", currentNumber)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  // next chapter (smallest greater than current)
  const { data: nextData } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("series_id", seriesId)
    .gt("chapter_number", currentNumber)
    .order("chapter_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    prev: prevData?.chapter_number ?? null,
    next: nextData?.chapter_number ?? null,
  };
}
