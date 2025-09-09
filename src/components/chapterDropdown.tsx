"use client";

import { useRouter } from "next/navigation";

interface ChapterDropdownProps {
  slug: string;
  chapters: number[];
  current: number;
}

export default function ChapterDropdown({
  slug,
  chapters,
  current,
}: ChapterDropdownProps) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected) {
      router.push(`/series/${slug}/chapter/${selected}`);
    }
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="px-3 py-2 border rounded-lg bg-[var(--background)] text-[var(--foreground)] max-h-40 overflow-y-auto"
    >
      {chapters.map((num) => (
        <option key={num} value={num}>
          Chapter {num}
        </option>
      ))}
    </select>
  );
}
