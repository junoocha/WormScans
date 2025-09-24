// lib/supabaseServer.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const supabaseServer = async () => {
  const supabase = createServerComponentClient({
    cookies: async () => await cookies(), // wrap in async function
  });
  return supabase;
};
