// api/checkSeriesExists/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { series_name } = await req.json();
  const { data, error } = await supabase
    .from("series")
    .select("id")
    .ilike("series_name", series_name);

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ exists: data.length > 0 });
}
