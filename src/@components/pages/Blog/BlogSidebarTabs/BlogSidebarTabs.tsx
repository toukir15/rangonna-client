"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type SidebarPostItem = {
  title: string;
  date: string;
  img: string;
  href: string;
};

export type SidebarTagItem = {
  label: string;
  href: string;
};

const TABS = [
  { id: "popular" as const, label: "Popular" },
  { id: "recent" as const, label: "Recent" },
  { id: "comments" as const, label: "Comments" },
  { id: "tags" as const, label: "Tags" },
];

type TabId = (typeof TABS)[number]["id"];

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

function PostList({ items }: { items: SidebarPostItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm leading-relaxed text-slate-500">
        Nothing here yet.
      </p>
    );
  }
  return (
    <div className="divide-y divide-slate-200">
      {items.map((item) => (
        <Link
          href={item.href}
          key={item.href}
          className="group flex min-w-0 max-w-full gap-3 py-3.5 first:pt-0 -mx-1 rounded-sm px-1 transition-colors hover:bg-slate-50/80"
        >
          <CoverImage
            src={item.img}
            alt={item.title}
            className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm ring-1 ring-slate-200/80"
            fillClassName="object-cover transition duration-300 group-hover:scale-105"
          />

          <div className="min-w-0 flex-1 overflow-hidden">
            <h4 className="line-clamp-2 break-words text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-primary">
              {item.title}
            </h4>
            {item.date ? (
              <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {item.date}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function BlogSidebarTabs({
  popular,
  recent,
  tags,
}: {
  popular: SidebarPostItem[];
  recent: SidebarPostItem[];
  tags: SidebarTagItem[];
}) {
  const [tab, setTab] = useState<TabId>("popular");

  return (
    <aside className="min-w-0 overflow-hidden border border-slate-200 bg-white text-slate-800 antialiased">
      <div className="flex min-w-0 flex-wrap border-b border-slate-200 bg-slate-50/90">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative max-w-full truncate px-3 py-2.5 text-xs font-semibold transition-colors sm:px-4 sm:py-3 sm:text-sm ${
              tab === id
                ? "bg-white text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary sm:after:inset-x-3"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "popular" && <PostList items={popular} />}
        {tab === "recent" && <PostList items={recent} />}
        {tab === "comments" && (
          <p className="py-6 text-center text-sm leading-relaxed text-slate-500">
            No comments yet.
          </p>
        )}
        {tab === "tags" &&
          (tags.length === 0 ? (
            <p className="py-6 text-center text-sm leading-relaxed text-slate-500">
              No tags yet.
            </p>
          ) : (
            <div className="flex min-w-0 flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-semibold leading-snug text-slate-700 transition hover:border-primary/35 hover:bg-white hover:text-primary"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          ))}
      </div>
    </aside>
  );
}
