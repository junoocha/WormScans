"use client";

import { useEffect, useRef } from "react";
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
  const scrolling = useRef(false);
  const delayPassed = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prev !== null) {
        router.push(`/series/${slug}/chapter/${prev}`);
      } else if (e.key === "ArrowRight" && next !== null) {
        router.push(`/series/${slug}/chapter/${next}`);
      } else if (
        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
        !scrolling.current
      ) {
        scrolling.current = true;
        delayPassed.current = false;
        setTimeout(() => {
          delayPassed.current = true;
        }, 2500);

        const direction = e.key === "ArrowUp" ? "up" : "down";

        const step = () => {
          if (scrolling.current && delayPassed.current) {
            window.scrollBy(0, direction === "up" ? -10 : 10);
          }
          if (scrolling.current) {
            rafId.current = requestAnimationFrame(step);
          }
        };

        rafId.current = requestAnimationFrame(step);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        scrolling.current = false;
        delayPassed.current = false;
        if (rafId.current) cancelAnimationFrame(rafId.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [prev, next, router, slug]);

  return null;
}
