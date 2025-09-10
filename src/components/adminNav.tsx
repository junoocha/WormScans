"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./logo";

export default function AdminNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Admin Home", href: "/admin" },
    { name: "Add Series/Chapter", href: "/admin/add" },
    { name: "Update Chapter", href: "/admin/updateChapter" },
    { name: "Update Series", href: "/admin/updateSeries" },
  ];

  return (
    <header className="bg-[var(--accent)] text-white">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-5">
        {/* Logo - Home button */}
        <div className="flex items-center gap-6">
          <Logo />
        </div>

        {/* Nav links */}
        <ul className="flex flex-row gap-2">
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
    </header>
  );
}
