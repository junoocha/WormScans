"use client";

import { useEffect, useState } from "react";

export default function BackToTopButton() {
  // state for showing if button is visible
  const [visible, setVisible] = useState(false);

  // appears when we scroll up a bit up
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed top-4 right-4 z-50 p-4 text-xl rounded-2xl bg-[var(--accent)] text-white shadow-lg transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
