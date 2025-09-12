import Link from "next/link";

interface ChapterCardProps {
  seriesSlug: string;
  chapterNumber: number | string;
  title?: string | null;
  date?: string;
  images: string[];
  chapterCoverUrl?: string; // current cover
  isSelected?: boolean; // highlight if selected
  onClick?: () => void; // sets this chapter as cover
}

export default function ChapterCard({
  seriesSlug,
  chapterNumber,
  title,
  date,
  images,
  chapterCoverUrl,
  isSelected = false,
  onClick,
}: ChapterCardProps) {
  const cover = chapterCoverUrl;

  return (
    <div
      className={`flex bg-[var(--card-bg)] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-4 cursor-pointer ${
        isSelected ? "ring-4 ring-yellow-400" : ""
      }`}
      onClick={onClick}
    >
      {/* Left: Cover */}
      <div className="w-50 h-40 rounded overflow-hidden bg-[var(--card-hover)] flex-shrink-0">
        {cover ? (
          <img
            src={cover}
            alt={`Chapter ${chapterNumber} cover`}
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-300"
          />
        ) : (
          <span className="flex items-center justify-center text-white/50 h-full">
            [No Cover]
          </span>
        )}
      </div>

      {/* Right: Info  */}
      <div className="flex-1 flex flex-col ml-4 min-w-0 justify-center">
        <span className="font-bold text-white truncate">
          Chapter {chapterNumber}
          {title ? `: ${title}` : ""}
        </span>
        {date && (
          <span className="text-sm text-gray-400 mt-1 truncate">{date}</span>
        )}
      </div>
    </div>
  );
}
