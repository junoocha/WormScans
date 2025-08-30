// api/checkChapterExists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { series_id, chapter_number } = await req.json();

  if (!series_id || !chapter_number) {
    return NextResponse.json(
      { error: "series_id and chapter_number required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("chapters")
    .select("id")
    .eq("series_id", series_id)
    .eq("chapter_number", chapter_number);

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({
    exists: data.length > 0,
    chapterId: data[0]?.id || null,
  });
}
