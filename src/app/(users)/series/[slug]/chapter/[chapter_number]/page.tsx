import { fetchChapterImages } from "@/lib/getChapterImages";
import { fetchAdjacentChapters } from "@/lib/getNextPrevChapters";
import KeyboardNavigation from "@/components/keyboardNavigation";
import ChapterDropdown from "@/components/chapterDropdown";
import { fetchChaptersForSeries } from "@/lib/getChaptersForSeries";
import { fetchSeries } from "@/lib/getSeriesById";
import BackToTopButton from "@/components/backToTop";

interface ChapterPageProps {
  params: { slug: string; chapter_number: string };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug, chapter_number } = await params;
  const current = parseFloat(chapter_number);

  const { data: imagesData, error } = await fetchChapterImages(
    slug,
    chapter_number
  );
  const { data: seriesData, error: seriesError } = await fetchSeries({ slug });

  if (!seriesData || seriesError) {
    return <p className="p-6 text-red-500">Error loading series info.</p>;
  }

  const seriesTitle = seriesData.series_name;

  const { prev, next } = await fetchAdjacentChapters(slug, current);
  const chapters = await fetchChaptersForSeries(slug);

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
        {/* {imagesData.map((chapter) =>
          chapter.image_urls.map((url, idx) => (
            <div
              key={`${chapter.id}-${idx}`}
              className="w-full flex justify-center bg-[var(--background)]"
            >
              <Image
                src={url}
                alt={`Chapter ${chapter_number} image ${idx + 1}`}
                width={800} // default width, tweak later
                height={1200} // default height, tweak later
                sizes="100vw"
                priority={idx === 0} // first image loads eagerly
                className="w-full max-w-4xl object-contain"
              />
            </div>
          ))
        )} */}

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
        chapter ? `/series/${slug}/chapter/${chapter?.toString() ?? ""}` : "#"
      }
      className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
        chapter
          ? "bg-[var(--accent)] text-white hover:opacity-90"
          : "bg-gray-700 text-gray-400 cursor-not-allowed"
      } ${className}`}
    >
      {label}
    </a>
  );
}
