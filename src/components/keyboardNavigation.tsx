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
  const holdTimer = useRef<number | null>(null);

  useEffect(() => {
    const SCROLL_SPEED = 30; // continuous scroll px per frame (tweak if needed)
    const SCROLL_DELAY = 800; // ms before continuous scroll starts (tweak if needed)
    const TAP_MULTIPLIER = 0.6; // change this to 2, 3, 4... bigger => larger tap jump

    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null;
      return (
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      );
    };

    const getScroller = (): HTMLElement => {
      // Prefer the browser's scrolling element, fallback to documentElement/body
      return (document.scrollingElement ||
        document.documentElement ||
        document.body) as HTMLElement;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // don't interfere while typing in inputs
      if (isTyping()) return;

      // prevent default tiny browser scroll for arrows so our jump is consistent
      if (["ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }

      // ← Prev chapter
      if (e.key === "ArrowLeft" && prev !== null) {
        router.push(`/series/${slug}/chapter/${prev}`);
        // ensure we reset to top after navigation
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // → Next chapter
      if (e.key === "ArrowRight" && next !== null) {
        router.push(`/series/${slug}/chapter/${next}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // ↑ / ↓ scrolling (tap jump + hold-to-scroll)
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const direction = e.key === "ArrowUp" ? -1 : 1;
        const scroller = getScroller();

        // compute TAP_JUMP based on the real scroller height
        const TAP_JUMP =
          Math.max(scroller.clientHeight, window.innerHeight) * TAP_MULTIPLIER;
        const jumpAmount = direction * TAP_JUMP;

        // Do an immediate (large) jump. Use "auto" for instant; "smooth" if you prefer smooth.
        scroller.scrollBy({ top: jumpAmount, behavior: "smooth" });

        // start hold behavior after a delay if the key is kept pressed
        if (!scrolling.current) {
          scrolling.current = true;
          delayPassed.current = false;

          // start a timeout; if it fires, we enter continuous scroll mode
          holdTimer.current = window.setTimeout(() => {
            delayPassed.current = true;

            const step = () => {
              if (scrolling.current && delayPassed.current) {
                scroller.scrollBy(
                  0,
                  direction === -1 ? -SCROLL_SPEED : SCROLL_SPEED
                );
              }
              if (scrolling.current) {
                rafId.current = requestAnimationFrame(step);
              }
            };

            rafId.current = requestAnimationFrame(step);
          }, SCROLL_DELAY);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        scrolling.current = false;
        delayPassed.current = false;

        if (holdTimer.current !== null) {
          window.clearTimeout(holdTimer.current);
          holdTimer.current = null;
        }
        if (rafId.current !== null) {
          cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [prev, next, router, slug]);

  return null;
}
