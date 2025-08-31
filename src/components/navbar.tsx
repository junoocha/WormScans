"use client";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-xl">
          MyLogo
        </Link>
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/bookmarks" className="hover:underline">
          Bookmarks
        </Link>
        <Link href="/login" className="hover:underline">
          Login
        </Link>
        <Link href="/all-series" className="hover:underline">
          All Series
        </Link>
      </div>
    </nav>
  );
}
