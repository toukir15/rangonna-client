import Image from "next/image";
import Link from "next/link";
import { BlogBannerGrid } from "@/@components/pages/Blog/BlogBannerGrid/BlogBannerGrid";
import { BlogSidebarTabs } from "@/@components/pages/Blog/BlogSidebarTabs/BlogSidebarTabs";
import { ENV } from "@/@config/env.config";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { blogHref, blogRouteId } from "@/utils/blogRoute";

type BlogEntry = {
  id: string;
  title: string;
  img: string;
  date: string;
  dateMs: number;
  tags: string[];
};

function resolveImageUrl(raw: string): string {
  const url = raw?.trim();
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const origin = ENV.ApiEndpoint.replace(/\/api\/v1\/?$/i, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

function formatBlogDate(value: unknown): string {
  if (value == null || value === "") return "";
  try {
    const d = new Date(value as string | number);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function featuredImageSrc(raw: Record<string, unknown>): string {
  const fi = raw.featured_image ?? raw.featuredImage ?? raw["featured-image"];
  if (typeof fi === "string") return fi.trim();
  if (fi && typeof fi === "object" && fi !== null && "src" in fi) {
    return String((fi as { src?: unknown }).src ?? "").trim();
  }
  return "";
}

function extractTags(raw: Record<string, unknown>): string[] {
  const out: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t && !out.includes(t)) out.push(t);
  };

  const tags = raw.tags;
  if (Array.isArray(tags)) {
    for (const t of tags) {
      if (typeof t === "string") push(t);
      else if (t && typeof t === "object" && t !== null) {
        const o = t as Record<string, unknown>;
        if (typeof o.name === "string") push(o.name);
        else if (typeof o.slug === "string") push(o.slug);
        else if (typeof o.title === "string") push(o.title);
      }
    }
  }

  const single = raw.tag ?? raw.category;
  if (typeof single === "string") push(single);

  const cats = raw.categories;
  if (Array.isArray(cats)) {
    for (const c of cats) {
      if (typeof c === "string") push(c);
    }
  }

  return out;
}

function rawDateMs(raw: Record<string, unknown>): number {
  const dateRaw = raw.createdAt ?? raw.publishedAt ?? raw.date ?? raw.updatedAt;
  if (dateRaw == null || dateRaw === "") return 0;
  const d = new Date(dateRaw as string | number);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function normalizeBlog(raw: Record<string, unknown>): BlogEntry | null {
  const title = String(raw.title ?? raw.name ?? "").trim();
  if (!title) return null;

  const id = blogRouteId(raw);
  if (!id) return null;

  const rawImg =
    featuredImageSrc(raw) ||
    raw.image ||
    raw.thumbnail ||
    raw.coverImage ||
    raw.featuredImage ||
    raw.banner ||
    raw.photo;

  const img = resolveImageUrl(String(rawImg ?? "").trim());

  const dateRaw = raw.createdAt ?? raw.publishedAt ?? raw.date ?? raw.updatedAt;
  const formatted = formatBlogDate(dateRaw);
  const date = formatted ? `○ ${formatted}` : "";
  const dateMs = rawDateMs(raw);
  const tags = extractTags(raw);

  return { id, title, img, date, dateMs, tags };
}

function extractBlogRows(res: unknown): Record<string, unknown>[] {
  if (!res || typeof res !== "object") return [];
  const r = res as { success?: boolean; data?: unknown };
  if (r.success === false) return [];

  const d = r.data;
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  if (d && typeof d === "object") {
    const obj = d as { data?: unknown; blogs?: unknown; rows?: unknown };
    if (Array.isArray(obj.data)) return obj.data as Record<string, unknown>[];
    if (Array.isArray(obj.blogs)) return obj.blogs as Record<string, unknown>[];
    if (Array.isArray(obj.rows)) return obj.rows as Record<string, unknown>[];
  }
  return [];
}

function extractTotalCount(res: unknown): number | undefined {
  if (!res || typeof res !== "object") return undefined;
  const r = res as Record<string, unknown>;

  const pick = (v: unknown): number | undefined => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number.parseInt(v, 10);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  for (const key of ["total", "totalCount", "count", "totalRecords"] as const) {
    const t = pick(r[key]);
    if (t != null && t >= 0) return t;
  }

  const meta = r.meta ?? r.pagination;
  if (meta && typeof meta === "object") {
    const m = meta as Record<string, unknown>;
    for (const key of ["total", "totalCount", "count"] as const) {
      const t = pick(m[key]);
      if (t != null && t >= 0) return t;
    }
  }

  const d = r.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const o = d as Record<string, unknown>;
    for (const key of ["total", "totalCount", "count"] as const) {
      const t = pick(o[key]);
      if (t != null && t >= 0) return t;
    }
    const innerMeta = o.meta ?? o.pagination;
    if (innerMeta && typeof innerMeta === "object") {
      const m = innerMeta as Record<string, unknown>;
      for (const key of ["total", "totalCount", "count"] as const) {
        const t = pick(m[key]);
        if (t != null && t >= 0) return t;
      }
    }
  }

  return undefined;
}

const DEFAULT_BLOG_LIMIT = 20;
const MAX_BLOG_LIMIT = 50;

function parseQueryInt(
  raw: string | string[] | undefined,
  fallback: number,
  opts?: { min?: number; max?: number },
): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(String(s ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  let v = Math.floor(n);
  if (opts?.min != null) v = Math.max(opts.min, v);
  if (opts?.max != null) v = Math.min(opts.max, v);
  return v;
}

function blogListHref(page: number, limit: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (limit !== DEFAULT_BLOG_LIMIT) params.set("limit", String(limit));
  const q = params.toString();
  return q ? `/blog?${q}` : "/blog";
}

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

export const dynamic = "force-dynamic";

type BlogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogHomePage({ searchParams }: BlogPageProps) {
  const sp = await searchParams;
  const page = parseQueryInt(sp.page, 1, { min: 1 });
  const limit = parseQueryInt(sp.limit, DEFAULT_BLOG_LIMIT, {
    min: 1,
    max: MAX_BLOG_LIMIT,
  });

  let rows: Record<string, unknown>[] = [];
  let total: number | undefined;
  try {
    const res = await ProductService.getBlog({ page, limit });
    rows = extractBlogRows(res);
    total = extractTotalCount(res);
  } catch {
    rows = [];
  }

  const blogs = rows
    .map((row) => normalizeBlog(row))
    .filter((x): x is BlogEntry => x !== null);

  if (blogs.length === 0) {
    const backHref = blogListHref(1, limit);
    return (
      <div className="py-6">
        <div className="mx-auto my-6 max-w-layout rounded-lg border border-primary-border bg-white p-8 text-center text-base leading-relaxed text-slate-600 antialiased md:p-12">
          {page > 1 ? (
            <>
              <p>No posts on this page.</p>
              <Link
                href={backHref}
                className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Back to first page
              </Link>
            </>
          ) : (
            <p>No blog posts available.</p>
          )}
        </div>
      </div>
    );
  }

  const totalPages =
    total != null && total > 0
      ? Math.max(1, Math.ceil(total / limit))
      : undefined;
  const hasPrev = page > 1;
  const hasNext =
    totalPages != null ? page < totalPages : blogs.length >= limit;

  const featured = blogs[5];
  const listPosts = blogs.slice(6, 9).map((b) => ({
    title: b.title,
    date: b.date,
    img: b.img,
    href: blogHref(b.id),
  }));

  const sidebarPopular = listPosts;
  const sidebarRecent = [...blogs]
    .sort((a, b) => b.dateMs - a.dateMs)
    .slice(0, 6)
    .map((b) => ({
      title: b.title,
      date: b.date,
      img: b.img,
      href: blogHref(b.id),
    }));

  const tagCounts = new Map<string, number>();
  for (const b of blogs) {
    for (const t of b.tags) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const sidebarTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label]) => ({
      label,
      href: `/blog/category?tag=${encodeURIComponent(label)}`,
    }));

  return (
    <div className="py-6">
      <div className="mx-auto max-w-layout overflow-x-hidden rounded-lg border border-primary-border bg-white p-4 text-left text-slate-800 antialiased md:p-6">
        <div className="shadow-sm !h-full min-w-0">
          <BlogBannerGrid posts={blogs} />

          {/* Content */}
          {(featured || listPosts.length > 0) && (
            <section className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[1fr_minmax(0,320px)]">
              {/* Left */}
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                    World
                  </h3>
                  <div
                    className="h-px flex-1 bg-[repeating-linear-gradient(90deg,#e2e8f0_0,#e2e8f0_4px,transparent_4px,transparent_8px)]"
                    aria-hidden
                  />
                </div>

                <div
                  className={`grid min-w-0 border border-slate-200 ${
                    featured && listPosts.length > 0 ? "md:grid-cols-2" : ""
                  }`}
                >
                  {featured && (
                    <Link
                      href={blogHref(featured.id)}
                      className="group block min-w-0 overflow-hidden p-4 transition-colors hover:bg-slate-50/90"
                    >
                      <CoverImage
                        src={featured.img}
                        alt={featured.title}
                        className="relative h-40 overflow-hidden"
                        fillClassName="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />

                      <h2 className="mt-4 line-clamp-4 break-words text-2xl font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-primary">
                        {featured.title}
                      </h2>

                      {featured.date ? (
                        <p className="mt-2 truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
                          {featured.date}
                        </p>
                      ) : null}
                    </Link>
                  )}

                  {listPosts.length > 0 && (
                    <div className="min-w-0 divide-y divide-slate-200 border-l border-slate-200">
                      {listPosts.map((item) => (
                        <Link
                          href={item.href}
                          key={item.href}
                          className="group flex min-w-0 gap-3 p-4 transition-colors hover:bg-slate-50"
                        >
                          <CoverImage
                            src={item.img}
                            alt={item.title}
                            className="relative h-16 w-24 shrink-0 overflow-hidden"
                            fillClassName="object-cover transition duration-300 group-hover:scale-105"
                          />

                          <div className="min-w-0 flex-1 overflow-hidden">
                            <h4 className="line-clamp-2 break-words text-[15px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-primary">
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
                  )}
                </div>
              </div>

              {/* Sidebar */}
              {listPosts.length > 0 && (
                <div className="min-w-0">
                  <BlogSidebarTabs
                    popular={sidebarPopular}
                    recent={sidebarRecent}
                    tags={sidebarTags}
                  />
                </div>
              )}
            </section>
          )}

          {(hasPrev || hasNext) && (
            <nav
              className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 pt-6 text-sm"
              aria-label="Blog list pagination"
            >
              {hasPrev ? (
                <Link
                  href={blogListHref(page - 1, limit)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:border-primary/40 hover:text-primary"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-4 py-2 font-semibold text-slate-400">
                  Previous
                </span>
              )}
              <span className="tabular-nums text-slate-600">
                Page {page}
                {totalPages != null ? ` / ${totalPages}` : ""}
              </span>
              {hasNext ? (
                <Link
                  href={blogListHref(page + 1, limit)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:border-primary/40 hover:text-primary"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-4 py-2 font-semibold text-slate-400">
                  Next
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
