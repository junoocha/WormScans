interface ChapterCardProps {
  seriesName: string;
  chapterNumber: string;
  createdAt: string;
}

export default function ChapterCard({
  seriesName,
  chapterNumber,
  createdAt,
}: ChapterCardProps) {
  const date = new Date(createdAt).toLocaleDateString();

  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition">
      <h2 className="font-bold">{seriesName}</h2>
      <p>Chapter {chapterNumber}</p>
      <p className="text-sm text-gray-500">Posted on {date}</p>
    </div>
  );
}
