// api/admin/getChapterDetails/[chapterId].ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  const { chapterId } = await params;

  const { data, error } = await supabase
    .from("chapters")
    .select(
      "id, chapter_number, title, series_id, chapter_images(id, image_urls)"
    )
    .eq("id", chapterId)
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
