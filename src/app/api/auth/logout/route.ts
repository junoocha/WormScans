// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  const resCookies = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          resCookies.getAll().map((c) => ({ name: c.name, value: c.value })),
        setAll: (toSet) => {
          for (const { name, value, options } of toSet) {
            resCookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Sign out server-side
  await supabase.auth.signOut();

  return NextResponse.json({ message: "Logged out" });
}
