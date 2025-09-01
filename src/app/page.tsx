import NavBar from "@/components/navbar";
import ChapterCard from "@/components/chapterCard";
import { fetchRecentChapters, RecentChapter } from "@/lib/getRecentChapter";

export default async function HomePage() {
  const { data: chapters, error } = await fetchRecentChapters();

  if (error) {
    console.error("Supabase error:", error);
    return <p>Error fetching chapters</p>;
  }

  return (
    <div>
      <NavBar />
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Recent Chapters</h1>
        {chapters.length === 0 ? (
          <p className="text-gray-500">No chapters available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {chapters.map((chapter: RecentChapter) => (
              <ChapterCard
                key={chapter.id}
                seriesName={chapter.series_name}
                chapterNumber={chapter.chapter_number}
                createdAt={chapter.created_at}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
