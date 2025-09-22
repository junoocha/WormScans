// components/Logo.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-[.84]">
      <Image
        src="/images/logo.png"
        alt="Logo"
        width={100}
        height={60}
        className="object-cover"
        priority // ensures it's loaded quickly
      />
    </Link>
  );
}
