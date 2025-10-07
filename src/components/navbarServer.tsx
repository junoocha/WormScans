import NavBarClient from "./navbar";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function NavBarServer() {
  const cookieStore = await cookies(); // <-- important!
  const cookieArray = cookieStore.getAll().map((c) => ({
    name: c.name,
    value: c.value,
  }));

  // console.log("COOKIE ARRAY", cookieArray); // should now show cookies in terminal

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieArray, setAll: () => {} } }
  );

  let isAdmin = false;
  // name usually just has that in it so don't search for it specifically dummy
  const hasAuthCookie = cookieArray.some((c) => c.name.endsWith("-auth-token"));

  // console.log("HAS AUTH COOKIE?", hasAuthCookie);

  if (hasAuthCookie) {
    try {
      // don't use session, could be tampered with, just use getUser which authenticates for me using the supabase auth server
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (user && !error) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        isAdmin = profile?.is_admin ?? false;
      }
    } catch (err) {
      // console.error("ERROR FETCHING PROFILE", err);
      isAdmin = false;
    }

    // console.log("IS ADMIN", isAdmin);
  }

  return <NavBarClient ssrIsAdmin={isAdmin} />;
}
