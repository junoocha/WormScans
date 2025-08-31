// lib/getRecentChapters.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function fetchRecentChapters() {
  const { data, error } = await supabase
    .from("chapters")
    .select(
      `
      id,
      chapter_number,
      title,
      created_at,
      series:series_id (series_name)
    `
    )
    .order("created_at", { ascending: false })
    .limit(10);

  return { data, error };
}
