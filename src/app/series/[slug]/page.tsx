import NavBar from "@/components/navbar";
import { fetchSeries, SeriesDetail } from "@/lib/getSeriesById";
import { formatChapterDate } from "@/lib/formatDate";

interface SeriesPageProps {
  params: { slug: string };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;

  // fetch by slug
  const { data: series, error } = await fetchSeries({ slug });

  if (error || !series) {
    console.error("Error fetching series:", error);
    return <p className="p-6 text-red-500">Series not found.</p>;
  }

  // Sort chapters chronologically
  const sortedChapters = series.chapters.sort(
    (a, b) => Number(a.chapter_number) - Number(b.chapter_number)
  );

  return (
    <div>
      <NavBar />
      <main className="p-6 max-w-4xl mx-auto">
        {/* Series Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-4">
          {/* Profile Image Placeholder */}
          <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500">[Cover]</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold">{series.series_name}</h1>
            {series.series_desc && (
              <p className="text-gray-600 mt-2">{series.series_desc}</p>
            )}
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-2">
          {sortedChapters.map((ch) => (
            <div
              key={ch.id}
              className="flex justify-between items-center border-b py-2"
            >
              <span>
                Chapter {ch.chapter_number}
                {ch.title ? `: ${ch.title}` : ""}
              </span>
              <span className="text-gray-500 text-sm">
                {formatChapterDate(ch.created_at)}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
