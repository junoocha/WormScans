//app/(users)/series/[slug]/chapter/[chapter_number]/page.tsx

import { fetchChapterImages } from "@/lib/getChapterImages";
import { fetchAdjacentChapters } from "@/lib/getNextPrevChapters";
import KeyboardNavigation from "@/components/keyboardNavigation";
import ChapterDropdown from "@/components/chapterDropdown";
import { fetchChaptersForSeries } from "@/lib/getChaptersForSeries";
import { fetchSeries } from "@/lib/getSeriesById";
import BackToTopButton from "@/components/backToTop";

export default async function ChapterPage({ params }: any) {
  const { slug, chapter_number } = await params;
  const current = parseFloat(chapter_number); // float number for decimals

  // fetch chapter images
  const { data: imagesData, error } = await fetchChapterImages(
    slug,
    chapter_number
  );

  // fetch series info using slug
  const { data: seriesData, error: seriesError } = await fetchSeries({ slug });

  if (!seriesData || seriesError) {
    return <p className="p-6 text-red-500">Error loading series info.</p>;
  }

  // series title for the button
  const seriesTitle = seriesData.series_name;

  // fetch next and previous chapters
  const { prev, next } = await fetchAdjacentChapters(slug, current);

  // fetch all chapter numbers for dropdown
  const chapters = await fetchChaptersForSeries(slug);

  // handle chapter when no image error
  if (error || !imagesData) {
    return <p className="p-6 text-red-500">Error loading chapter images.</p>;
  }

  if (
    !imagesData ||
    imagesData.length === 0 ||
    imagesData[0].image_urls.length === 0
  ) {
    return (
      <p className="p-6 text-gray-400">No images found for this chapter.</p>
    );
  }

  // array of image urls
  const chapterImages = imagesData[0].image_urls;

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col">
      {/* Keyboard navigation hook */}
      <KeyboardNavigation slug={slug} prev={prev} next={next} />
      <BackToTopButton />

      <main className="flex flex-col items-center flex-1">
        {/* title + link back to series */}
        <div className="w-full max-w-4xl px-6 pt-6 text-center">
          <h1 className="text-2xl font-bold text-white">
            {seriesTitle} Chapter {chapter_number}
          </h1>
          <a
            href={`/series/${seriesData.slug}`}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            {seriesTitle}
          </a>
        </div>

        {/* Top bar */}
        <div className="w-full max-w-4xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Dropdown */}
          <ChapterDropdown slug={slug} chapters={chapters} current={current} />

          {/* Prev / Next */}
          <div className="flex justify-between w-full sm:w-auto">
            <NavButton
              slug={slug}
              chapter={prev}
              className="sm:mr-4"
              label="← Prev"
            />
            <NavButton
              slug={slug}
              chapter={next}
              className="sm:mr-4"
              label="Next →"
            />
          </div>
        </div>

        {/* Chapter images */}
        {chapterImages.map((url, idx) => (
          <div
            key={idx}
            className="w-full flex justify-center bg-[var(--background)]"
          >
            <img
              src={url}
              alt={`Chapter ${chapter_number} image ${idx + 1}`}
              loading="lazy"
              className="w-full max-w-4xl object-contain py-1"
            />
          </div>
        ))}

        {/* bottom nav */}
        <div className="w-full max-w-4xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          {/* Dropdown */}
          <ChapterDropdown slug={slug} chapters={chapters} current={current} />

          {/* Prev / Next */}
          <div className="flex justify-between w-full sm:w-auto">
            <NavButton
              slug={slug}
              chapter={prev}
              className="sm:mr-4"
              label="← Prev"
            />
            <NavButton
              slug={slug}
              chapter={next}
              className="sm:mr-4"
              label="Next →"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// for the next and prev buttons
function NavButton({
  slug,
  chapter,
  label,
  className = "",
}: {
  slug: string;
  chapter: number | null;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={
        // build link url dynamically
        // if defined --> based off the route
        // if undefined, disable link with # href
        chapter ? `/series/${slug}/chapter/${chapter?.toString() ?? ""}` : "#"
      }
      className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
        chapter
          ? "bg-[var(--accent)] text-white hover:opacity-90" // active
          : "bg-gray-700 text-gray-400 cursor-not-allowed" // disabled
      } ${className}`}
    >
      {label}
    </a>
  );
}
