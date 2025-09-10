"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";
import Logo from "./logo";

export default function NavBar() {
  const pathname = usePathname() || "/";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Bookmarks", href: "/bookmarks" },
    { name: "Comics", href: "/series" },
  ];

  return (
    <header className="bg-[var(--accent)] text-white">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-6 h-20">
        {/* Left side - Logo + Nav links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <Logo />
          </div>
          <ul className="hidden md:flex flex-row gap-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`block px-4 py-3 text-base font-medium tracking-wider rounded-md transition ${
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
        <div className="flex items-center gap-6">
          {/* Search bar */}
          <div className="hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-72 px-4 py-2 rounded-lg border border-black bg-[#16151D] text-white text-base outline-none"
              disabled
            />
            <Search className="h-6 w-6 -ml-8 text-gray-400 cursor-not-allowed" />
          </div>

          {/* Login button */}
          <Link href="/login">
            <button className="flex items-center gap-2 px-5 py-3 rounded-md text-base font-semibold bg-[#4dbb3a] text-white transition hover:bg-[#3fae2f]">
              <User className="w-5 h-5" />
              <span>Login</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
