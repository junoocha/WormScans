import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query) return NextResponse.json({ data: [] });

  const { data, error } = await supabase
    .from("series")
    .select("id, series_name, slug, cover_url")
    .ilike("series_name", `%${query}%`)
    .order("series_name", { ascending: true })
    .limit(10);

  if (error) return NextResponse.json({ data: [], error: error.message });

  return NextResponse.json({ data });
}
