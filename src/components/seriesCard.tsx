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
    <div className="rounded-2xl shadow p-4 transition duration-300 hover:shadow-lg bg-[var(--card-bg)]">
      {/* Cover */}
      <Link href={`/series/${slug}`}>
        <div className="h-40 w-full rounded mb-4 overflow-hidden flex items-center justify-center cursor-pointer bg-[var(--card-hover)]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${seriesName} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white/60">[Cover Image]</span>
          )}
        </div>
      </Link>

      {/* Series Title */}
      <Link href={`/series/${slug}`}>
        <h2 className="text-lg font-bold mb-2 uppercase text-white cursor-pointer">
          {seriesName}
        </h2>
      </Link>

      {/* Chapters */}
      <div className="space-y-2">
        {[...chapters]
          .sort((a, b) => Number(b.chapter_number) - Number(a.chapter_number))
          .map((ch) => (
            <Link
              key={ch.id}
              href={`/series/${slug}/chapter/${ch.chapter_number}`}
              className="flex justify-between text-sm text-gray-400 hover:text-white transition"
            >
              <span>Chapter {ch.chapter_number}</span>
              <span>{formatChapterDate(ch.created_at)}</span>
            </Link>
          ))}
      </div>
    </div>
  );
}
