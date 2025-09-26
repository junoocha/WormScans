"use client";

import ChapterCard from "./chapterCard";
import Link from "next/link";
import { formatChapterDate } from "@/lib/formatDate";

interface ChaptersClientProps {
  seriesSlug: string;
  chapters: any[];
}

export default function ChaptersList({
  seriesSlug,
  chapters,
}: ChaptersClientProps) {
  return (
    <div className="space-y-4  rounded p-3 max-h-[600px] overflow-y-auto overflow-x-hidden">
      {/* map a bunch of chapter cards which are also all links. */}
      {chapters.map((ch) => (
        <Link
          key={ch.id}
          href={`/series/${seriesSlug}/chapter/${ch.chapter_number}`}
          className="block transform transition duration-300 hover:scale-102 hover:shadow-lg"
        >
          <ChapterCard
            seriesSlug={seriesSlug}
            chapterNumber={ch.chapter_number}
            title={ch.title}
            date={formatChapterDate(ch.created_at)}
            images={ch.chapter_images?.[0]?.image_urls || []}
            chapterCoverUrl={ch.chapter_cover_url}
          />
        </Link>
      ))}
    </div>
  );
}
