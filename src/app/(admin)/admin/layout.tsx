// app/(admin)/admin/layout.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import AdminNav from "@/components/adminNav";
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Create Supabase SSR client with proper cookie access
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

  // Get session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not logged in → redirect to login
    redirect("/users/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    // Not an admin → redirect to 404
    redirect("/404");
  }

  // Admin session is valid → render layout
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-white`}
      >
        <AdminNav />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            success: { style: { background: "green", color: "white" } },
            error: { style: { background: "red", color: "white" } },
          }}
        />
      </body>
    </html>
  );
}
