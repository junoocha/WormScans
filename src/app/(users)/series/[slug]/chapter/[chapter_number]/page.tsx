import { fetchChapterImages } from "@/lib/getChapterImages";
import { fetchAdjacentChapters } from "@/lib/getNextPrevChapters";
import KeyboardNavigation from "@/components/keyboardNavigation";

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
  const { prev, next } = await fetchAdjacentChapters(slug, current);

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

      <main className="flex flex-col items-center flex-1">
        {/* Top navigation */}
        <div className="flex justify-between w-full max-w-4xl px-6 py-4">
          <NavButton slug={slug} chapter={prev} label="← Prev" />
          <NavButton slug={slug} chapter={next} label="Next →" />
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

        {/* Bottom navigation */}
        <div className="flex justify-between w-full max-w-4xl px-6 py-6">
          <NavButton slug={slug} chapter={prev} label="← Previous" />
          <NavButton slug={slug} chapter={next} label="Next →" />
        </div>
      </main>
    </div>
  );
}

function NavButton({
  slug,
  chapter,
  label,
}: {
  slug: string;
  chapter: number | null;
  label: string;
}) {
  return (
    <a
      href={
        chapter ? `/series/${slug}/chapter/${chapter?.toString() ?? ""}` : "#"
      }
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        chapter
          ? "bg-[var(--accent)] text-white hover:opacity-90"
          : "bg-gray-700 text-gray-400 cursor-not-allowed"
      }`}
    >
      {label}
    </a>
  );
}
