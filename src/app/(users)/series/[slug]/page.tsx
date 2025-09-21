// app/series/[slug]/page.tsx
import { fetchSeries } from "@/lib/getSeriesById";
import ChaptersList from "@/components/chapterList";

interface SeriesPageProps {
  params: { slug: string };
}

function formatOrigin(origin: string | null) {
  switch (origin?.toLowerCase()) {
    case "korea":
      return "Korea / Manhwa";
    case "japan":
      return "Japan / Manga";
    case "china":
      return "China / Manhua";
    default:
      return origin || "Unknown";
  }
}

function capitalizeFirst(text: string | null) {
  if (!text) return "Unknown";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
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

            {/* New row stacked below */}
            <div className="flex justify-between items-center mt-10 text-gray-300">
              <span>
                <strong className="text-white">Country of Origin:</strong>{" "}
                {formatOrigin(series.country_origin)}
              </span>
              <span>
                <strong className="text-white">Status:</strong>{" "}
                {capitalizeFirst(series.series_status)}
              </span>
            </div>
          </div>
        </div>

        {/* Chapters Client Component */}
        <ChaptersList seriesSlug={slug} chapters={sortedChapters} />
      </main>
    </div>
  );
}
