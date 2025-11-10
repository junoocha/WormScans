// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.nextUrl.pathname.startsWith("/admin")) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),

        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  console.log("cookies before getSession:", req.cookies.getAll());

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("session in middleware:", session);

  if (!session) return NextResponse.redirect(new URL("/users/login", req.url));

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!profile?.is_admin)
    return NextResponse.redirect(new URL("/404", req.url));

  return res;
}

// Only apply to /admin routes
export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
