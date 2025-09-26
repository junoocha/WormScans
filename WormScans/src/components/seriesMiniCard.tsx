// components/seriesMiniCard.tsx
import Link from "next/link";

interface SeriesMiniCardProps {
  seriesName: string;
  slug: string;
  coverUrl?: string;
}

export default function SeriesMiniCard({
  seriesName,
  slug,
  coverUrl,
}: SeriesMiniCardProps) {
  return (
    <Link
      href={`/series/${slug}`}
      className="block bg-[var(--card-bg)] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
    >
      {/* Cover */}
      <div className="w-full h-50 sm:h-56 bg-[var(--card-hover)]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${seriesName} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center text-white/60 h-full">
            [No Cover]
          </span>
        )}
      </div>

      {/* Title */}
      <div className="p-3">
        <h2
          className="text-lg font-semibold text-white truncate"
          title={seriesName}
        >
          {seriesName}
        </h2>
      </div>
    </Link>
  );
}
