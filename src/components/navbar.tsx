"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Bookmarks", href: "/bookmarks" },
    { name: "Comics", href: "/series?page=1" },
  ];

  return (
    <header className="bg-[var(--accent)] text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-5">
        {/* Left side - Logo + Nav links */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex h-12 w-12">
            <img src="/images/logo.webp" alt="Logo" className="object-cover" />
          </Link>
          <ul className="hidden md:flex flex-row">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`block px-3 py-2 text-sm tracking-wider rounded-md transition ${
                    pathname === link.href
                      ? "bg-black/40 text-white"
                      : "hover:bg-black/30"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side - search placeholder + login */}
        <div className="flex items-center gap-4">
          {/* Search bar (placeholder for now) */}
          <div className="hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-56 px-3 py-1 rounded-lg border border-black bg-[#16151D] text-white text-sm outline-none"
              disabled
            />
            <Search className="h-5 w-5 -ml-7 text-gray-400 cursor-not-allowed" />
          </div>

          {/* Login button (green) */}
          <Link href="/login">
            <button className="flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium bg-[#4dbb3a] text-white transition hover:bg-[#3fae2f]">
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
