import NavBar from "@/components/navbar";
import SeriesCard from "@/components/seriesCard";
import { fetchRecentSeries, SeriesWithChapters } from "@/lib/getRecentSeries";

export default async function HomePage() {
  const { data: seriesList, error } = await fetchRecentSeries();

  if (error) {
    console.error("Supabase error:", error);
    return <p className="p-6 text-red-500">Error fetching chapters.</p>;
  }

  return (
    <div>
      <NavBar />
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Recent Updates</h1>

        {seriesList.length === 0 ? (
          <p className="text-gray-500">No chapters available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {seriesList.map((series: SeriesWithChapters) => (
              <SeriesCard
                key={series.series_id}
                seriesName={series.series_name}
                chapters={series.chapters}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
