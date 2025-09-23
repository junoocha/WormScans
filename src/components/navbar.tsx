"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Menu, X, Home, BookOpen } from "lucide-react";
import Logo from "./logo";
import { useState, useEffect, useRef } from "react";

type SeriesResult = {
  id: string;
  series_name: string;
  slug: string;
  cover_url?: string;
};

type NavBarClientProps = {
  isAdmin: boolean;
};

export default function NavBarClient({ isAdmin }: NavBarClientProps) {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

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
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSelect = (slug: string) => {
    router.push(`/series/${slug}`);
    setSearchQuery("");
    setResults([]);
    setIsFocused(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[var(--accent)] text-white relative z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Logo />
          <ul className="hidden md:flex flex-row gap-2 ml-4">
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

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop search */}
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

          {/* Mobile search button */}
          <button
            className="md:hidden p-2 rounded hover:bg-black/20 transition"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
          >
            <Search className="w-6 h-6" />
          </button>

          {/* Login/Admin button — shows on all screen sizes */}
          <Link
            href={isAdmin ? "/admin" : "/users/login"}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-base font-semibold bg-[#4dbb3a] text-white transition hover:bg-[#3fae2f]"
          >
            <User className="w-5 h-5" />
            <span>{isAdmin ? "Admin" : "Login"}</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded hover:bg-black/20 transition"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile search input */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-2 relative">
          <input
            type="text"
            placeholder="Search series..."
            className="w-full px-4 py-3 rounded-xl border border-black bg-[#16151D] text-white text-lg outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {results.length > 0 && (
            <ul className="mt-2 w-full bg-[#16151D] border border-black rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
              {results.map((series) => (
                <li
                  key={series.id}
                  className="px-4 py-3 hover:bg-gray-800 cursor-pointer flex items-center gap-4 text-lg"
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
          {searchQuery && results.length === 0 && !loading && (
            <div className="absolute mt-2 w-full bg-[#16151D] border border-black rounded-xl shadow-lg px-4 py-3 text-gray-400 text-lg">
              No results found
            </div>
          )}
        </div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-t from-green-500 to-green-700 shadow-lg transform transition-transform z-50 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setMobileMenuOpen(false)} className="p-2">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <ul className="flex flex-col gap-2 px-4">
          {navLinks.map((link) => {
            const Icon = link.name === "Home" ? Home : BookOpen;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md hover:bg-black/20 text-white focus:outline-none"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}
