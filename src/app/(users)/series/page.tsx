// app/(users)/series/page.tsx
import { fetchAllSeries } from "@/lib/getAllSeries";
import SeriesMiniCard from "@/components/seriesMiniCard";

export default async function AllSeriesPage() {
  const { data: seriesList, error } = await fetchAllSeries();

  if (error) {
    return <p className="p-6 text-red-500">Error fetching series list.</p>;
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Series</h1>

      {seriesList.length === 0 ? (
        <p className="text-gray-500">No series available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {seriesList.map((series) => (
            <SeriesMiniCard
              key={series.id}
              seriesName={series.series_name}
              slug={series.slug}
              coverUrl={series.cover_url}
            />
          ))}
        </div>
      )}
    </main>
  );
}
