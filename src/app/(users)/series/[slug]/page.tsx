import Link from "next/link";
import { fetchSeries } from "@/lib/getSeriesById";
import { formatChapterDate } from "@/lib/formatDate";

interface SeriesPageProps {
  params: { slug: string };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const { data: series, error } = await fetchSeries({ slug });

  if (error || !series) {
    return <p className="p-6 text-red-500">Series not found.</p>;
  }

  const sortedChapters = series.chapters.sort(
    (a, b) => Number(b.chapter_number) - Number(a.chapter_number)
  );

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <main className="p-6 max-w-4xl mx-auto text-[var(--foreground)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-start mb-6 gap-4">
          <div className="w-200 h-64 bg-[var(--card-bg)] rounded overflow-hidden flex items-center justify-center">
            <img
              src={series.cover_url}
              alt={`${series.series_name} cover`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Right-hand content */}
          <div className="flex flex-col justify-start h-70">
            <h1
              style={{ color: "var(--accent)" }}
              className="text-3xl font-bold"
            >
              {series.series_name}
            </h1>

            {series.series_desc && (
              <p style={{ color: "var(--foreground)" }} className="mt-2">
                {series.series_desc}
              </p>
            )}
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto border border-gray-700 rounded p-2">
          {sortedChapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/series/${slug}/chapter/${ch.chapter_number}`}
              className="flex justify-between items-center border-b border-gray-700 py-2 transition hover:text-[var(--accent)]"
              style={{ color: "var(--foreground)" }}
            >
              <span>
                Chapter {ch.chapter_number}
                {ch.title ? `: ${ch.title}` : ""}
              </span>
              <span style={{ color: "var(--foreground)" }} className="text-sm">
                {formatChapterDate(ch.created_at)}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
