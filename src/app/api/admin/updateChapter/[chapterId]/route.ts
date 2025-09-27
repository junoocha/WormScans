// app/api/admin/updateChapter/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const body = await req.json();
  const { chapter_number, title, image_urls, chapter_cover_url } = body;

  if (!chapterId) {
    return NextResponse.json({ error: "Chapter ID required" }, { status: 400 });
  }

  // Update chapter info
  const { data, error } = await supabase
    .from("chapters")
    .update({
      chapter_number,
      title,
      chapter_cover_url,
    })
    .eq("id", chapterId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update images separately if provided
  if (image_urls && Array.isArray(image_urls)) {
    const { error: imgError } = await supabase
      .from("chapter_images")
      .update({ image_urls })
      .eq("chapter_id", chapterId);

    if (imgError) {
      return NextResponse.json({ error: imgError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ data });
}
