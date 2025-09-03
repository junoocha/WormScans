import NavBar from "@/components/navbar";
import { fetchChapterImages } from "@/lib/getChapterImages";

interface ChapterPageProps {
  params: { slug: string; chapter_number: string };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug, chapter_number } = await params;
  const { data: imagesData, error } = await fetchChapterImages(
    slug,
    chapter_number
  );

  if (error || !imagesData) {
    return <p className="p-6 text-red-500">Error loading chapter images.</p>;
  }

  return (
    <div className="bg-[var(--background)] min-h-screen">
      <NavBar />
      <main className="p-6 max-w-4xl mx-auto space-y-4">
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
      </main>
    </div>
  );
}
