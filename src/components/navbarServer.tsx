import NavBarClient from "./navbar";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function NavBarServer() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () =>
          (await (await cookies()).getAll()).map((c) => ({
            name: c.name,
            value: c.value,
          })),
        setAll: () => {}, // No-op for layout
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return <NavBarClient isAdmin={isAdmin} />;
}
