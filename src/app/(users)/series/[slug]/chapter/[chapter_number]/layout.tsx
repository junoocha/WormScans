import type { Metadata } from "next";

function prettifySlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; chapter_number: string };
}): Promise<Metadata> {
  const { slug, chapter_number } = params;
  return {
    title: `${prettifySlug(slug)} Chapter ${chapter_number} - WormScans`,
  };
}

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
