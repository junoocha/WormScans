import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Sets the session cookies automatically
  await supabase.auth.setSession(data.session);

  return NextResponse.json({ user: data.user });
}
