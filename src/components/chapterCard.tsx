interface ChapterCardProps {
  seriesSlug: string;
  chapterNumber: number | string;
  title?: string | null;
  date?: string;
  images: string[];
  chapterCoverUrl?: string | null;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ChapterCard({
  chapterNumber,
  title,
  date,
  chapterCoverUrl,
  isSelected = false,
  onClick,
}: ChapterCardProps) {
  const hasCover = !!chapterCoverUrl;

  return (
    <div
      className={`flex bg-[var(--card-bg)] rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-4 cursor-pointer ${
        isSelected ? "ring-4 ring-yellow-400" : ""
      }`}
      onClick={onClick}
    >
      {/* Cover (hidden on mobile) */}
      {hasCover && (
        <div className="hidden md:block w-32 h-24 rounded overflow-hidden bg-[var(--card-hover)] flex-shrink-0">
          <img
            src={chapterCoverUrl!}
            alt={`Chapter ${chapterNumber} cover`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Info */}
      <div
        className={`flex-1 flex flex-col ml-0 md:ml-4 min-w-0 justify-center ${
          !hasCover ? "text-center md:text-left" : ""
        }`}
      >
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
