// app/api/admin/updateSeries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// helper: generate slug from series name
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces → dash
    .replace(/[^a-z0-9\-]/g, ""); // strip invalid chars
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { series_name, series_desc, cover_url, series_status, country_origin } =
    body;

  if (!id) {
    return NextResponse.json({ error: "Series ID required" }, { status: 400 });
  }

  if (!series_name?.trim()) {
    return NextResponse.json(
      { error: "Series name is required" },
      { status: 400 }
    );
  }

  const slug = slugify(series_name);

  const { data, error } = await supabase
    .from("series")
    .update({
      series_name,
      series_desc,
      slug,
      cover_url: cover_url || null,
      series_status,
      country_origin,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
