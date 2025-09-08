// api/admin/deleteChapter/[chapterId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  const { chapterId } = params;

  if (!chapterId) {
    return NextResponse.json({ error: "Chapter ID required" }, { status: 400 });
  }

  // Get the chapter first to know its series_id
  const { data: chapterData, error: chapterError } = await supabase
    .from("chapters")
    .select("series_id")
    .eq("id", chapterId)
    .single();

  if (chapterError || !chapterData) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const seriesId = chapterData.series_id;

  // Delete the chapter (this also deletes chapter_images due to FK cascade)
  const { error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if the series has any chapters left
  const { data: remainingChapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id")
    .eq("series_id", seriesId);

  if (chaptersError) {
    return NextResponse.json({ error: chaptersError.message }, { status: 500 });
  }

  // update has_chapters flag if you add that column to series
  await supabase
    .from("series")
    .update({ has_chapters: remainingChapters.length > 0 })
    .eq("id", seriesId);

  return NextResponse.json({
    success: true,
    seriesHasChapters: remainingChapters.length > 0,
  });
}
