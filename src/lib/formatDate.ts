export function formatChapterDate(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);

  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60 * 60) return "RECENT";
  if (diffHour < 24)
    return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
  if (diffDay < 7) return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  if (diffWeek <= 4)
    return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;

  // deterministic full date (SSR-safe)
  const year = created.getFullYear();
  const month = created.getMonth() + 1; // months are 0-based
  const day = created.getDate();

  // pad month/day with leading zero if you want consistency
  const paddedMonth = month.toString().padStart(2, "0");
  const paddedDay = day.toString().padStart(2, "0");

  return `${paddedMonth}/${paddedDay}/${year}`; // e.g., 09/11/2025
}
