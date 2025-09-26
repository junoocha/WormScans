// app/series/[slug]/page.tsx
import { fetchSeries } from "@/lib/getSeriesById";
import ChaptersList from "@/components/chapterList";

interface SeriesPageProps {
  params: { slug: string };
}

function formatType(origin: string | null) {
  // map to represent whether the comic is you know, that
  switch (origin?.toLowerCase()) {
    case "korea":
      return "Manhwa";
    case "japan":
      return "Manga";
    case "china":
      return "Manhua";
    default:
      return "Unknown";
  }
}

// capitalize the status since i saved them as lower case in my supabase
function capitalizeFirst(text: string | null) {
  if (!text) return "Unknown";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  // grab slug from params, then fetch series details based off slug
  const { slug } = await params;
  const { data: series, error } = await fetchSeries({ slug });

  if (error || !series) {
    return <p className="p-6 text-red-500">Series not found.</p>;
  }

  // sort chapter number for display
  const sortedChapters = series.chapters.sort(
    (a, b) => Number(b.chapter_number) - Number(a.chapter_number)
  );

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <main className="p-6 max-w-4xl mx-auto text-[var(--foreground)]">
        {/* Header */}
        <div className="bg-[var(--card-bg)] rounded-xl shadow-md overflow-hidden p-4 mb-6">
          {/* Desktop layout */}
          <div className="hidden md:flex">
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

              <div className="flex justify-between items-center mt-10 text-gray-300">
                <span>
                  <strong className="text-white">Type:</strong>{" "}
                  {formatType(series.country_origin)}
                </span>
                <span>
                  <strong className="text-white">Status:</strong>{" "}
                  {capitalizeFirst(series.series_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex flex-col items-center text-center md:hidden">
            <div className="w-40 h-56 rounded overflow-hidden bg-[var(--card-hover)]">
              {/* mobile cover */}
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

            {/* mobile name and description */}
            <h1
              style={{ color: "var(--accent)" }}
              className="mt-4 text-2xl font-bold"
            >
              {series.series_name}
            </h1>

            {series.series_desc && (
              <p className="mt-3 text-base leading-relaxed">
                {series.series_desc}
              </p>
            )}

            {/* mobile status and origin */}
            <div className="flex justify-center gap-6 mt-6 text-gray-300">
              <span>
                <strong className="text-white">Type:</strong>{" "}
                {formatType(series.country_origin)}
              </span>
              <span>
                <strong className="text-white">Status:</strong>{" "}
                {capitalizeFirst(series.series_status)}
              </span>
            </div>
          </div>
        </div>

        {/* Chapters */}
        <ChaptersList seriesSlug={slug} chapters={sortedChapters} />
      </main>
    </div>
  );
}
