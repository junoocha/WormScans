// api/addNewChapter/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { series_id, chapter_number, title, chapter_cover_url } = body;

  if (!series_id)
    return NextResponse.json(
      { error: "series_id is required" },
      { status: 400 }
    );

  const { data, error } = await supabase
    .from("chapters")
    .insert([{ series_id, chapter_number, title, chapter_cover_url }])
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ data });
}
