// app/(users)/series/page/[page]/page.tsx
import SeriesMiniCard from "@/components/seriesMiniCard";
import { fetchAllSeries, Series } from "@/lib/getAllSeries";

interface PageProps {
  params: Promise<{ page: string }>;
  searchParams?: Promise<{ series_status?: string; country?: string }>;
}

const originMap: Record<string, string> = {
  manhwa: "korea",
  manhua: "china",
  manga: "japan",
};

export default async function SeriesPaginatedPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearch = (await searchParams) || {};

  const pageNumber = parseInt(resolvedParams.page) || 1;

  const rawStatus = resolvedSearch.series_status;
  const statusFilter =
    typeof rawStatus === "string" && rawStatus.trim() !== ""
      ? rawStatus.toLowerCase()
      : undefined;

  const countryUI = resolvedSearch.country || undefined;
  const countryFilter = countryUI ? originMap[countryUI] : undefined;

  const { data: seriesList, error } = await fetchAllSeries({
    page: pageNumber,
    limit: 18,
    series_status: statusFilter,
    countryOrigin: countryFilter,
  });

  if (error) {
    return <p className="p-6 text-red-500">Error loading series.</p>;
  }

  const buildQuery = (status?: string, country?: string) => {
    const params = new URLSearchParams();
    if (status) params.set("series_status", status);
    if (country) params.set("country", country);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const statusOptions = ["ongoing", "completed", "dropped"];
  const countryOptions: { value: string; label: string }[] = [
    { value: "manga", label: "Manga" },
    { value: "manhwa", label: "Manhwa" },
    { value: "manhua", label: "Manhua" },
  ];

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        All Series - Page {pageNumber}
      </h1>

      {/* Filters */}
      <form method="get" className="flex gap-2 flex-wrap mb-6">
        <select
          name="series_status"
          defaultValue={statusFilter || ""}
          className="px-2 py-1 border rounded bg-[var(--card-bg)] text-white text-sm"
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select
          name="country"
          defaultValue={countryUI || ""}
          className="px-2 py-1 border rounded bg-[var(--card-bg)] text-white text-sm"
        >
          <option value="">All Origins</option>
          {countryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-3 py-1 bg-[var(--accent)] text-white rounded hover:opacity-70 font-semibold text-sm"
        >
          Apply
        </button>
      </form>

      {seriesList.length === 0 ? (
        <p className="text-gray-500">No series available.</p>
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

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            {pageNumber > 1 ? (
              <a
                href={`/series/page/${pageNumber - 1}${buildQuery(
                  statusFilter,
                  countryUI
                )}`}
                className="w-full sm:w-auto text-center px-4 py-2 rounded font-semibold bg-[var(--accent)] text-white hover:opacity-70 transition"
              >
                ← Prev
              </a>
            ) : (
              <span className="w-full sm:w-auto text-center px-4 py-2 rounded font-semibold bg-gray-700 text-gray-400 cursor-not-allowed">
                ← Prev
              </span>
            )}

            {seriesList.length === 18 ? (
              <a
                href={`/series/page/${pageNumber + 1}${buildQuery(
                  statusFilter,
                  countryUI
                )}`}
                className="w-full sm:w-auto text-center px-4 py-2 rounded font-semibold bg-[var(--accent)] text-white hover:opacity-70 transition"
              >
                Next →
              </a>
            ) : (
              <span className="w-full sm:w-auto text-center px-4 py-2 rounded font-semibold bg-gray-700 text-gray-400 cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        </>
      )}
    </main>
  );
}
