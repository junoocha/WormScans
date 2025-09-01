// components/seriesCard.tsx
import { formatChapterDate } from "../lib/formatDate";

interface SeriesCardProps {
  seriesName: string;
  chapters: { id: string; chapter_number: string; created_at: string }[];
}

export default function SeriesCard({ seriesName, chapters }: SeriesCardProps) {
  return (
    <div className="rounded-2xl shadow p-4 bg-white">
      {/* Profile image placeholder */}
      <div className="h-40 w-full bg-gray-200 rounded mb-4 flex items-center justify-center">
        <span className="text-gray-500">[Cover Image]</span>
      </div>

      <h2 className="text-lg font-bold mb-2">{seriesName}</h2>

      <div className="space-y-2">
        {chapters.map((ch) => (
          <div key={ch.id} className="flex justify-between text-sm">
            <span>Chapter {ch.chapter_number}</span>
            <span className="text-gray-500">
              {formatChapterDate(ch.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
