"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User } from "lucide-react";
import Logo from "./logo";
import { useState, useEffect, useRef } from "react";

type SeriesResult = {
  id: string;
  series_name: string;
  slug: string;
  cover_url?: string;
};

export default function NavBar() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Comics", href: "/series" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SeriesResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/searchSeries?q=${encodeURIComponent(searchQuery)}`
        );
        const json = await res.json();
        setResults(json.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
      setLoading(false);
    }, 300); // debounce 300ms

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle navigation when clicking a result
  const handleSelect = (slug: string) => {
    router.push(`/series/${slug}`);
    setSearchQuery("");
    setResults([]);
  };

  return (
    <header className="bg-[var(--accent)] text-white relative z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-6 h-20">
        {/* Left side */}
        <div className="flex items-center gap-6">
          <Logo />
          <ul className="hidden md:flex flex-row gap-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 text-base font-medium tracking-wider rounded-md transition ${
                      isActive ? "bg-black/40 text-white" : "hover:bg-black/30"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-6 relative">
          {/* Search */}
          {/* Search */}
          <div className="hidden md:flex flex-col relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search series..."
              className="w-96 px-5 py-3 rounded-xl border border-black bg-[#16151D] text-white text-lg outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            />
            <Search className="h-7 w-7 -ml-10 text-gray-400 cursor-text absolute top-1/2 transform -translate-y-1/2 right-3" />

            {/* Dropdown */}
            {isFocused && results.length > 0 && (
              <ul className="absolute top-full mt-2 w-96 bg-[#16151D] border border-black rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
                {results.map((series) => (
                  <li
                    key={series.id}
                    className="px-5 py-3 hover:bg-gray-800 cursor-pointer flex items-center gap-4 text-lg"
                    onMouseDown={() => handleSelect(series.slug)}
                  >
                    {series.cover_url && (
                      <img
                        src={series.cover_url}
                        alt={series.series_name}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <span>{series.series_name}</span>
                  </li>
                ))}
              </ul>
            )}
            {isFocused && searchQuery && results.length === 0 && !loading && (
              <div className="absolute top-full mt-2 w-96 bg-[#16151D] border border-black rounded-xl shadow-lg px-5 py-3 text-gray-400 text-lg">
                No results found.
              </div>
            )}
          </div>

          {/* Login button */}
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-3 rounded-md text-base font-semibold bg-[#4dbb3a] text-white transition hover:bg-[#3fae2f]"
          >
            <User className="w-5 h-5" />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
