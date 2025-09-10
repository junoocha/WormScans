// app/page/[page]/page.tsx
import SeriesCard from "@/components/seriesCard";
import { fetchRecentSeries, SeriesWithChapters } from "@/lib/getRecentSeries";

interface PageProps {
  params: { page: string };
}

export default async function PaginatedPage({ params }: PageProps) {
  const pageNumber = parseInt(params.page) || 1;

  const { data: seriesList, error } = await fetchRecentSeries({
    page: pageNumber,
    limit: 10, // 5 rows of 2 series per page
  });

  if (error) {
    console.error("Supabase error:", error);
    return <p className="p-6 text-red-500">Error fetching chapters.</p>;
  }

  return (
    <div>
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Recent Updates - Page {pageNumber}
        </h1>

        {seriesList.length === 0 ? (
          <p className="text-gray-500">No chapters available yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {seriesList.map((series: SeriesWithChapters) => (
                <SeriesCard
                  key={series.series_id}
                  seriesName={series.series_name}
                  chapters={series.chapters}
                  slug={series.slug}
                  coverUrl={series.cover_url}
                />
              ))}
            </div>

            {/* Pagination buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <a
                href={
                  pageNumber === 2
                    ? `/`
                    : pageNumber > 2
                    ? `/page/${pageNumber - 1}`
                    : "#"
                }
                className={`px-4 py-2 rounded font-semibold transition ${
                  pageNumber > 1
                    ? "bg-[var(--accent)] text-white hover:opacity-70"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                ← Prev
              </a>

              <a
                href={
                  seriesList.length === 10 ? `/page/${pageNumber + 1}` : "#"
                }
                className={`px-4 py-2 rounded font-semibold transition ${
                  seriesList.length === 10
                    ? "bg-[var(--accent)] text-white hover:opacity-70"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next →
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
