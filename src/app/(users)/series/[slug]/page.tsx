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
        <div className="flex bg-[var(--card-bg)] rounded-xl shadow-md overflow-hidden p-4 mb-6">
          {/* Left: Cover */}
          <div className="flex-shrink-0">
            <div className="w-40 h-56 rounded overflow-hidden bg-[var(--card-hover)]">
              {series.cover_url ? (
                <img
                  src={series.cover_url}
                  alt={`${series.series_name} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="flex items-center justify-center text-white/60 h-full">
                  [Cover]
                </span>
              )}
            </div>
          </div>

          {/* Right: Title + Description */}
          <div className="flex-1 flex flex-col ml-6 min-w-0">
            <h1
              style={{ color: "var(--accent)" }}
              className="text-3xl font-bold truncate"
            >
              {series.series_name}
            </h1>

            {series.series_desc && (
              <p
                style={{ color: "var(--foreground)" }}
                className="mt-3 text-base leading-relaxed"
              >
                {series.series_desc}
              </p>
            )}
          </div>
        </div>

        {/* Chapters */}
        <div
          className={`space-y-2 border border-gray-700 rounded p-2 ${
            sortedChapters.length > 10 ? "max-h-[400px] overflow-y-auto" : ""
          }`}
        >
          {sortedChapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/series/${slug}/chapter/${ch.chapter_number}`}
              className="flex justify-between items-center border-b border-gray-700 py-2 transition-colors duration-200 hover:bg-[var(--card-hover)] hover:text-[var(--accent)] rounded-md px-2"
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
