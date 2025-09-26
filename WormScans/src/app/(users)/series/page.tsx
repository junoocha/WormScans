// app/(users)/series/page.tsx
import { redirect } from "next/navigation";

// the overall series page, but just redirects you to page 1 which is the same no?
export default function SeriesRootPage() {
  redirect("/series/page/1");
}
