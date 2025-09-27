// api/getSeries/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("series")
    .select("id, series_name");

  if (error) return NextResponse.json({ error }, { status: 500 });

  return NextResponse.json({ data });
}
