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

  // get the chapter id by series slug + chapter number
  const { data: chapterData, error: chapterError } = await supabase
    .from("chapters")
    .select("id, series_id")
    .eq("chapter_number", chapterNumber)
    .single();

  if (chapterError || !chapterData)
    return { data: null, error: chapterError || "Chapter not found" };

  // get images for the chapter
  const { data: imagesData, error: imagesError } = await supabase
    .from("chapter_images")
    .select("id, image_urls")
    .eq("chapter_id", chapterData.id);

  if (imagesError || !imagesData)
    return { data: null, error: imagesError || "Images not found" };

  return { data: imagesData as ChapterImages[], error: null };
}
