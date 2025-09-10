// app/(users)/series/page/[page]/page.tsx
import SeriesMiniCard from "@/components/seriesMiniCard";
import { fetchAllSeries, Series } from "@/lib/getAllSeries";
import Link from "next/link";

interface PageProps {
  params: { page: string };
}

export default async function SeriesPaginatedPage({ params }: PageProps) {
  const pageNumber = parseInt(params.page) || 1;
  const { data: seriesList, error } = await fetchAllSeries({
    page: pageNumber,
    limit: 18,
  });

  if (error) {
    return <p className="p-6 text-red-500">Error loading series.</p>;
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        All Series - Page {pageNumber}
      </h1>

      {seriesList.length === 0 ? (
        <p className="text-gray-500">No series available yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {seriesList.map((series: Series) => (
              <SeriesMiniCard
                key={series.id}
                seriesName={series.series_name}
                slug={series.slug}
                coverUrl={series.cover_url}
              />
            ))}
          </div>

          {/* Pagination buttons */}
          <div className="flex justify-center gap-4 mt-8">
            {pageNumber > 1 ? (
              <Link
                href={
                  pageNumber === 2
                    ? "/series"
                    : `/series/page/${pageNumber - 1}`
                }
                className="px-4 py-2 rounded font-semibold bg-[var(--accent)] text-white hover:opacity-70 transition"
              >
                ← Prev
              </Link>
            ) : (
              <span className="px-4 py-2 rounded font-semibold bg-gray-700 text-gray-400 cursor-not-allowed">
                ← Prev
              </span>
            )}

            {seriesList.length === 18 ? (
              <Link
                href={`/series/page/${pageNumber + 1}`}
                className="px-4 py-2 rounded font-semibold bg-[var(--accent)] text-white hover:opacity-70 transition"
              >
                Next →
              </Link>
            ) : (
              <span className="px-4 py-2 rounded font-semibold bg-gray-700 text-gray-400 cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
