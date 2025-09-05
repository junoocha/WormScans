// api/addData/uploadCover

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const slug = formData.get("slug") as string;

  if (!file || !slug) {
    return NextResponse.json(
      { error: "File and slug are required" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop();
  const filePath = `${slug}/cover.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("series-covers")
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data } = supabase.storage
    .from("series-covers")
    .getPublicUrl(filePath);

  return NextResponse.json({ coverUrl: data.publicUrl });
}
