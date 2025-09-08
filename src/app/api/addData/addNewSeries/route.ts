// app/api/addNewSeries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { series_name, series_desc, slug, cover_url } = body;

  if (!series_name) {
    return NextResponse.json(
      { error: "Series name is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("series")
    .insert([
      {
        series_name,
        series_desc,
        slug,
        cover_url: cover_url || null, // <-- added cover_url support
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ data });
}
