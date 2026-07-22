"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { blogHref } from "@/utils/blogRoute";

const HERO_GRID_CLASSES = [
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
] as const;

export type BlogBannerPost = {
  id: string;
  title: string;
  img: string;
  date: string;
};

function CoverImage({
  src,
  alt,
  className,
  fillClassName,
}: {
  src: string;
  alt: string;
  className: string;
  fillClassName?: string;
}) {
  if (!src) {
    return <div className={`bg-gray-200 ${className}`} aria-hidden />;
  }
  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        fill
        className={fillClassName ?? "object-cover"}
      />
    </div>
  );
}

export function BlogBannerGrid({ posts }: { posts: BlogBannerPost[] }) {
  const n = posts.length;
  const [start, setStart] = useState(0);

  const goPrev = useCallback(() => {
    if (n <= 1) return;
    setStart((s) => (s - 1 + n) % n);
  }, [n]);

  const goNext = useCallback(() => {
    if (n <= 1) return;
    setStart((s) => (s + 1) % n);
  }, [n]);

  if (n === 0) return null;

  const tileCount = Math.min(5, n);
  const visible = Array.from({ length: tileCount }, (_, i) => {
    const post = posts[(start + i) % n];
    return {
      ...post,
      className: HERO_GRID_CLASSES[i] ?? "md:col-span-1",
    };
  });

  const showArrows = n > 1;

  return (
    <section className="relative min-w-0">
      {showArrows && (
        <div className="pointer-events-none absolute right-2 top-2 z-20 flex gap-1 md:right-3 md:top-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              goPrev();
            }}
            className="pointer-events-auto rounded-sm bg-black/55 px-3 py-2 text-xl font-light leading-none text-white shadow-sm transition hover:bg-black/75 md:px-4 md:py-3 md:text-2xl"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              goNext();
            }}
            className="pointer-events-auto rounded-sm bg-black/55 px-3 py-2 text-xl font-light leading-none text-white shadow-sm transition hover:bg-black/75 md:px-4 md:py-3 md:text-2xl"
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      )}

      <div className="grid min-w-0 auto-rows-[215px] grid-cols-1 gap-[2px] md:grid-cols-4">
        {visible.map((post, index) => (
          <Link
            href={blogHref(post.id)}
            key={`${post.id}-${start}-${index}`}
            className={`group relative min-w-0 overflow-hidden ${post.className}`}
          >
            <CoverImage
              src={post.img}
              alt={post.title}
              className="absolute inset-0"
              fillClassName="object-cover transition duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 max-w-full text-white sm:left-5 sm:right-5">
              {post.date ? (
                <p className="mb-1.5 truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
                  {post.date}
                </p>
              ) : null}

              <h2 className="line-clamp-2 break-words text-base font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] min-[480px]:line-clamp-3 md:text-lg lg:text-xl">
                {post.title}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
