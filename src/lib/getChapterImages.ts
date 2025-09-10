import { createClient } from "@supabase/supabase-js";

export type ChapterImages = {
  id: string;
  image_urls: string[];
};

export async function fetchChapterImages(
  seriesSlug: string,
  chapterNumber: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 1: Find the series ID from slug
  const { data: seriesData, error: seriesError } = await supabase
    .from("series")
    .select("id")
    .eq("slug", seriesSlug)
    .single();

  if (seriesError || !seriesData) {
    return { data: null, error: seriesError || "Series not found" };
  }

  // Step 2: Get chapter scoped to this series
  const { data: chapterData, error: chapterError } = await supabase
    .from("chapters")
    .select("id")
    .eq("chapter_number", chapterNumber)
    .eq("series_id", seriesData.id) // ✅ ensures uniqueness
    .single();

  if (chapterError || !chapterData) {
    return { data: null, error: chapterError || "Chapter not found" };
  }

  // Step 3: Get images for the chapter
  const { data: imagesData, error: imagesError } = await supabase
    .from("chapter_images")
    .select("id, image_urls")
    .eq("chapter_id", chapterData.id);

  if (imagesError || !imagesData) {
    return { data: null, error: imagesError || "Images not found" };
  }

  return { data: imagesData as ChapterImages[], error: null };
}
