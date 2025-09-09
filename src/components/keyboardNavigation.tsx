"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface KeyboardNavigationProps {
  slug: string;
  prev: number | null;
  next: number | null;
}

export default function KeyboardNavigationClient({
  slug,
  prev,
  next,
}: KeyboardNavigationProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Ensure router is ready
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (prev) router.push(`/series/${slug}/chapter/${prev}`);
          break;
        case "ArrowRight":
          if (next) router.push(`/series/${slug}/chapter/${next}`);
          break;
        case "ArrowDown":
          window.scrollBy({ top: 100, behavior: "smooth" });
          break;
        case "ArrowUp":
          window.scrollBy({ top: -100, behavior: "smooth" });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, slug, prev, next, router]);

  return null;
}

// uses window.location.href. simpler and doesn't depend on router dependency, e.g. client vs server. but its rougher and requires full reload.

// "use client";

// import { useEffect } from "react";

// interface KeyboardNavigationProps {
//   slug: string;
//   prev: number | null;
//   next: number | null;
// }

// export default function KeyboardNavigation({
//   slug,
//   prev,
//   next,
// }: KeyboardNavigationProps) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch (e.key) {
//         case "ArrowLeft":
//           if (prev) window.location.href = `/series/${slug}/chapter/${prev}`;
//           break;
//         case "ArrowRight":
//           if (next) window.location.href = `/series/${slug}/chapter/${next}`;
//           break;
//         case "ArrowDown":
//           window.scrollBy({ top: 100, behavior: "smooth" });
//           break;
//         case "ArrowUp":
//           window.scrollBy({ top: -100, behavior: "smooth" });
//           break;
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [slug, prev, next]);

//   return null; // No visual output
// }
