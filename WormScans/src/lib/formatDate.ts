export function formatChapterDate(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60 * 60) {
    // less than 1 hour
    return "RECENT";
  } else if (diffHour < 24) {
    // display in hours
    return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
  } else if (diffDay < 7) {
    // display in days
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  } else if (diffWeek <= 4) {
    // display in weeks
    return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;
  } else {
    // more than 4 weeks, show full date
    return created.toLocaleDateString();
  }
}
