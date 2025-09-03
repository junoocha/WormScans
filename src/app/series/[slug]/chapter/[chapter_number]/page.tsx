import { fetchChapterImages } from "@/lib/getChapterImages";
import { fetchAdjacentChapters } from "@/lib/getNextPrevChapters";
import NavBar from "@/components/navbar";

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

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <NavBar />

      <main className="flex flex-col items-center flex-1">
        {/* Top navigation */}
        <div className="flex justify-between w-full max-w-4xl px-6 py-4">
          <NavButton slug={slug} chapter={prev} label="← Prev" />
          <NavButton slug={slug} chapter={next} label="Next →" />
        </div>

        {/* Chapter images */}
        {imagesData.map((chapter) =>
          chapter.image_urls.map((url, idx) => (
            <div
              key={`${chapter.id}-${idx}`}
              className="w-full flex justify-center bg-black"
            >
              <img
                src={url}
                alt={`Chapter ${chapter_number} image ${idx + 1}`}
                className="w-full max-w-4xl object-contain p-[4px]"
              />
            </div>
          ))
        )}

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
      href={chapter ? `/series/${slug}/chapter/${chapter}` : "#"}
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
