"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Home, BookOpen, User } from "lucide-react";
import Logo from "./logo";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Admin Home", href: "/admin", Icon: Home },
    { name: "Add Series/Chapter", href: "/admin/add", Icon: BookOpen },
    {
      name: "Add Multiple Chapters",
      href: "/admin/addMultiple",
      Icon: BookOpen,
    },
    { name: "Update Chapter", href: "/admin/updateChapter", Icon: BookOpen },
    { name: "Update Series", href: "/admin/updateSeries", Icon: BookOpen },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/users/login");
    toast.success("Successfully Logged Out!");
  };

  return (
    <header className="bg-[var(--accent)] text-white relative z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Left: Logo + Desktop links */}
        <div className="flex items-center gap-6">
          <Logo />

          <ul className="hidden md:flex flex-row gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`block px-2 py-2 text-sm tracking-wider rounded-md transition ${
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

        {/* Right: Logout & mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Desktop logout button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md bg-[#4dbb3a] hover:bg-[#3fae2f] text-white text-base font-semibold transition"
          >
            <User className="w-5 h-5" />
            Logout
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded hover:bg-black/20 transition"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[var(--accent)] shadow-lg transform transition-transform z-50 ${
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
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-md hover:bg-black/20 text-white ${
                    isActive ? "bg-black/40" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              </li>
            );
          })}

          {/* Mobile logout */}
          <li>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-md bg-[#4dbb3a] hover:bg-[#3fae2f] text-white text-base font-semibold cursor-pointer"
            >
              <User className="w-5 h-5" />
              Logout
            </button>
          </li>
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
