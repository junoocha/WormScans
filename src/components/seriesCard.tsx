// components/seriesCard.tsx
import Link from "next/link";
import { formatChapterDate } from "@/lib/formatDate";

interface SeriesCardProps {
  seriesName: string;
  chapters: { id: string; chapter_number: string; created_at: string }[];
  slug: string;
  coverUrl?: string;
}

export default function SeriesCard({
  seriesName,
  chapters,
  slug,
  coverUrl,
}: SeriesCardProps) {
  return (
    <div className="flex bg-[var(--card-bg)] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-4">
      {/* Left: Cover */}
      <Link href={`/series/${slug}`} className="flex-shrink-0">
        <div className="w-32 h-44 rounded overflow-hidden bg-[var(--card-hover)] cursor-pointer">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${seriesName} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center text-white/60 h-full">
              [Cover]
            </span>
          )}
        </div>
      </Link>

      {/* Right: Title + Chapters */}
      <div className="flex-1 flex flex-col ml-4 min-w-0">
        {/* Title (always at top) */}
        <Link href={`/series/${slug}`}>
          <h2
            className="text-xl font-bold text-white cursor-pointer truncate"
            title={seriesName}
          >
            {seriesName}
          </h2>
        </Link>

        {/* Chapters (slightly more margin from title, more spacing between rows) */}
        <div className="mt-5 flex flex-col gap-3">
          {[...chapters]
            .sort((a, b) => Number(b.chapter_number) - Number(a.chapter_number))
            .map((ch) => (
              <Link
                key={ch.id}
                href={`/series/${slug}/chapter/${ch.chapter_number}`}
                className="flex justify-between items-center text-base text-gray-500 hover:text-white transition truncate"
              >
                <span className="truncate">Chapter {ch.chapter_number}</span>
                <span className="flex-shrink-0 text-sm text-gray-400">
                  {formatChapterDate(ch.created_at)}
                </span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
