"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardNavigation({
  slug,
  prev,
  next,
}: {
  slug: string;
  prev: number | null;
  next: number | null;
}) {
  const router = useRouter();
  let scrolling = false;
  let rafId: number | null = null;
  let delayPassed = false;

  // Continuous scroll function
  const scrollStep = (direction: "up" | "down") => {
    const distance = 10; // px per frame
    window.scrollBy(0, direction === "up" ? -distance : distance);
    rafId = requestAnimationFrame(() => scrollStep(direction));
  };

  // based on arrow key, either move to appropriate chapter or scroll up and down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev !== null) {
        router.push(`/series/${slug}/chapter/${prev}`);
      } else if (e.key === "ArrowRight" && next !== null) {
        router.push(`/series/${slug}/chapter/${next}`);
      } else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !scrolling) {
        scrolling = true;

        // Add a delay before scroll to ignore early repeat events
        delayPassed = false;
        setTimeout(() => {
          delayPassed = true;
        }, 2500); // 2.5 seconds delay

        const direction = e.key === "ArrowUp" ? "up" : "down";

        const step = () => {
          if (scrolling && delayPassed) {
            window.scrollBy(0, direction === "up" ? -10 : 10);
          }
          if (scrolling) {
            rafId = requestAnimationFrame(step);
          }
        };

        rafId = requestAnimationFrame(step);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        scrolling = false;
        delayPassed = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prev, next, router, slug]);

  return null;
}
