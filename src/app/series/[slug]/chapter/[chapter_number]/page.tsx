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
    <div className="bg-[var(--background)] min-h-screen flex flex-col">
      <NavBar />

      <main className="p-6 max-w-4xl mx-auto space-y-4 flex-1">
        {/* Optional: top nav */}
        <div className="flex justify-between mb-4">
          <NavButton slug={slug} chapter={prev} label="← Previous" />
          <NavButton slug={slug} chapter={next} label="Next →" />
        </div>

        {imagesData.map((chapter) =>
          chapter.image_urls.map((url, idx) => (
            <img
              key={`${chapter.id}-${idx}`}
              src={url}
              alt={`Chapter ${chapter_number} image ${idx + 1}`}
              className="w-full rounded-lg shadow-lg transition"
              style={{ boxShadow: `0 0 5px var(--accent)` }}
            />
          ))
        )}

        {/* Bottom nav */}
        <div className="flex justify-between mt-6">
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
      className={`px-4 py-2 rounded-lg font-semibold ${
        chapter
          ? "bg-[var(--accent)] text-white hover:opacity-90"
          : "bg-gray-700 text-gray-400 cursor-not-allowed"
      }`}
    >
      {label}
    </a>
  );
}
