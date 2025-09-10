// app/(users)/series/page.tsx
import SeriesPaginatedPage from "./page/[page]/page";

export default function SeriesPage() {
  return <SeriesPaginatedPage params={{ page: "1" }} />;
}
