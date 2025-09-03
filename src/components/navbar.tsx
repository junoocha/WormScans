"use client";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="p-4 flex justify-between items-center bg-[var(--accent)] shadow-md">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-white">
          MyLogo
        </Link>
        <Link href="/" className="text-white hover:text-white/80 transition">
          Home
        </Link>
        <Link
          href="/bookmarks"
          className="text-white hover:text-white/80 transition"
        >
          Bookmarks
        </Link>
        <Link
          href="/login"
          className="text-white hover:text-white/80 transition"
        >
          Login
        </Link>
        <Link
          href="/all-series"
          className="text-white hover:text-white/80 transition"
        >
          All Series
        </Link>
      </div>
    </nav>
  );
}
