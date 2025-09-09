// app/page.tsx
import SeriesCard from "@/components/seriesCard";
import { fetchRecentSeries, SeriesWithChapters } from "@/lib/getRecentSeries";

export default async function HomePage() {
  const { data: seriesList, error } = await fetchRecentSeries({
    page: 1, // first page
    limit: 10,
  });

  if (error) {
    console.error("Supabase error:", error);
    return <p className="p-6 text-red-500">Error fetching chapters.</p>;
  }

  return (
    <div>
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Recent Updates</h1>

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

            {/* Next button only */}
            {seriesList.length === 10 && (
              <div className="flex justify-center gap-4 mt-8">
                <a
                  href="/page/2"
                  className="px-4 py-2 rounded font-semibold transition bg-[var(--accent)] text-white hover:opacity-70"
                >
                  Next →
                </a>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
