// app/admin/page.tsx

import Link from "next/link";

export default function AdminLanding() {
  return (
    <div className="min-h-screen">
      {" "}
      {/* optional dark bg to match navbar */}
      <main className="max-w-4xl mx-auto flex flex-col items-center gap-6 mt-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-2 text-white text-center">
          Admin Dashboard
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Quick access to manage series, chapters, and updates.
        </p>

        <div className="grid grid-cols-1 mb-8 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Link
            href="/admin/add"
            className="bg-[var(--accent)] hover:bg-green-600 text-white font-semibold py-6 rounded-lg text-center transition"
          >
            Add Series / Chapter
          </Link>
          <Link
            href="/admin/addMultiple"
            className="bg-[var(--accent)] hover:bg-green-600 text-white font-semibold py-6 rounded-lg text-center transition"
          >
            Add Multiple Chapters
          </Link>
          <Link
            href="/admin/updateSeries"
            className="bg-[var(--accent)] hover:bg-green-600 text-white font-semibold py-6 rounded-lg text-center transition"
          >
            Update Series
          </Link>
          <Link
            href="/admin/updateChapter"
            className="bg-[var(--accent)] hover:bg-green-600 text-white font-semibold py-6 rounded-lg text-center transition"
          >
            Update Chapter
          </Link>
        </div>
      </main>
    </div>
  );
}
