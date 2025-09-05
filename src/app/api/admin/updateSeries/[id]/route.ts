// app/api/admin/updateSeries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const body = await req.json();
  const { series_name, series_desc, cover_url } = body;

  if (!id) {
    return NextResponse.json({ error: "Series ID required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("series")
    .update({
      series_name,
      series_desc,
      cover_url: cover_url || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
