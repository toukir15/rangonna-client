// @/@components/pages/Blog/BlogNavbar.tsx

"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import bandLogo from "@/@assets/Naviforce white logo.png";

const navLinks = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Blogs",
    href: "/blog",
  },
  {
    name: "Watches",
    href: "/watches",
  },

  {
    name: "Contact",
    href: "/contact-us",
  },
];

const BlogNavbar = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 premium-gradient backdrop-blur-xl text-white">
      <div className="mx-auto flex max-w-layout items-center justify-between px-4 py-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={bandLogo}
            alt="Naviforce Logo"
            width={150}
            height={40}
            className="cursor-pointer h-auto w-[135px] md:w-[140px] lg:w-36"
          />
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-lg px-4 py-1 text-sm font-semibold transition ${
                  active
                    ? "bg-gray-500 text-white"
                    : "text-white hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/blog"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Read Blogs
        </Link>
      </div>
    </header>
  );
};

export default BlogNavbar;

// hello
