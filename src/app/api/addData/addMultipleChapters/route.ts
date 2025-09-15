// api/addData/addMultipleChapters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { series_id, chapters } = await req.json();

  if (!series_id)
    return NextResponse.json(
      { error: "series_id is required" },
      { status: 400 }
    );
  if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return NextResponse.json(
      { error: "No chapters provided" },
      { status: 400 }
    );
  }

  const results: any[] = [];
  const skipped: number[] = [];

  for (const ch of chapters) {
    const { chapter_number, images } = ch;

    // check if chapter already exists
    const { data: existing } = await supabase
      .from("chapters")
      .select("id")
      .eq("series_id", series_id)
      .eq("chapter_number", chapter_number)
      .limit(1)
      .single();

    if (existing) {
      skipped.push(chapter_number);
      continue; // skip this chapter
    }

    if (!images || images.length === 0) continue; // skip empty chapters

    // pick random chapter cover
    const chapterCover = images[Math.floor(Math.random() * images.length)];

    // insert chapter
    const { data: chapterData, error: chapterError } = await supabase
      .from("chapters")
      .insert([
        {
          series_id,
          chapter_number,
          title: null,
          chapter_cover_url: chapterCover,
        },
      ])
      .select()
      .single();

    if (chapterError || !chapterData) {
      return NextResponse.json(
        { error: chapterError?.message || "Failed to insert chapter" },
        { status: 500 }
      );
    }

    // insert images
    const { error: imagesError } = await supabase
      .from("chapter_images")
      .insert([{ chapter_id: chapterData.id, image_urls: images }]);

    if (imagesError) {
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }

    results.push(chapterData.chapter_number);
  }

  return NextResponse.json({ uploaded: results, skipped });
}
