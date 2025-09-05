// app/admin/page.tsx

import Link from "next/link";

export default function AdminLanding() {
  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto flex flex-col items-center gap-6 mt-12">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-gray-400 text-center mb-8">
          Quick access to manage series, chapters, and updates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <Link
            href="/admin/add"
            className="bg-green-400 hover:bg-green-300 text-black font-semibold py-6 rounded-lg text-center transition"
          >
            Add Series / Chapter
          </Link>
          <Link
            href="/admin/updateSeries"
            className="bg-green-400 hover:bg-green-300 text-black font-semibold py-6 rounded-lg text-center transition"
          >
            Update Series
          </Link>
          <Link
            href="/admin/updateChapter"
            className="bg-green-400 hover:bg-green-300 text-black font-semibold py-6 rounded-lg text-center transition"
          >
            Update Chapter
          </Link>
        </div>
      </main>
    </div>
  );
}
