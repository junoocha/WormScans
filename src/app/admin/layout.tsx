// app/admin/layout.tsx
import type { ReactNode } from "react";
import AdminNav from "@/components/adminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Admin Navbar */}
      <AdminNav />

      {/* Page Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6">{children}</main>
    </div>
  );
}
