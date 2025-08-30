// api/addChapterImages/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { chapter_id, image_urls } = body;

  if (!chapter_id || !Array.isArray(image_urls))
    return NextResponse.json(
      { error: "chapter_id and image_urls are required" },
      { status: 400 }
    );

  const { data, error } = await supabase
    .from("chapter_images")
    .insert([{ chapter_id, image_urls }])
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ data });
}
