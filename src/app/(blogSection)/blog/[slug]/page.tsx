import Image from "next/image";
import Link from "next/link";
import { ENV } from "@/@config/env.config";
import { ProductService } from "@/@services/apis/Product/Product.service";
import BlogDescriptionParser from "@/@components/core/HtmlParser/BlogDescriptionParser";
import {
  blogHref,
  blogRouteId,
  extractBlogRows,
  fetchBlogRawByRouteParam,
  pickBlogCategory,
  pickBlogHtml,
} from "@/utils/blogRoute";

type TocHeading = {
  id: string;
  text: string;
  level: 2;
};

type BlogDetails = {
  id: string;
  title: string;
  img: string;
  date: string;
  category: string;
  author: string;
  readTime: string;
  html: string;
};

type RelatedPost = {
  id: string;
  title: string;
  img: string;
  date: string;
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

function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function slugifyHeading(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/&[a-z]+;/gi, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "section";
}

function buildH2TocAndHtml(html: string): { toc: TocHeading[]; html: string } {
  const seen = new Map<string, number>();
  const toc: TocHeading[] = [];

  const out = html.replace(
    /<(h2)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tagRaw: string, attrs: string, inner: string) => {
      const text = stripTags(inner).replace(/\s+/g, " ").trim();
      if (!text) return full;

      const idMatch = attrs.match(/\sid\s*=\s*["']([^"']+)["']/i);
      let id = idMatch?.[1]?.trim() ?? "";
      if (!id) id = slugifyHeading(text);

      const count = (seen.get(id) ?? 0) + 1;
      seen.set(id, count);
      if (count > 1) id = `${id}-${count}`;

      toc.push({ id, text, level: 2 });

      if (idMatch) return full;
      const tag = String(tagRaw).toLowerCase();
      return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
    },
  );

  return { toc, html: out };
}

function pickString(raw: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function normalizeBlogDetails(
  raw: Record<string, unknown>,
): BlogDetails | null {
  const title = pickString(raw, ["title", "name"]);
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
  const date = formatted ? formatted : "";

  const category = pickBlogCategory(raw);
  const author =
    pickString(raw, ["author", "authorName", "writer", "createdBy"]) || "Admin";
  const readTime =
    pickString(raw, ["readTime", "readingTime", "timeToRead"]) || "";

  const html = stripScripts(pickBlogHtml(raw));

  return { id, title, img, date, category, author, readTime, html };
}

function normalizeRelatedPost(
  raw: Record<string, unknown>,
): RelatedPost | null {
  const title = pickString(raw, ["title", "name"]);
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
  const date = formatted ? formatted : "";

  return { id, title, img, date };
}

const fallbackToc = ["Introduction", "Overview", "Key Points", "Conclusion"];

export const dynamic = "force-dynamic";

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let blog: BlogDetails | null = null;
  let related: RelatedPost[] = [];
  try {
    const raw = await fetchBlogRawByRouteParam(slug, {
      getSingle: ProductService.getSingleBlog,
      getList: ProductService.getBlog,
    });
    if (raw) blog = normalizeBlogDetails(raw);
  } catch {
    blog = null;
  }

  if (!blog) {
    return (
      <main className="py-10">
        <div className="mx-auto max-w-layout px-4">
          <div className="rounded-2xl border border-primary-border bg-white p-10 text-center text-slate-700">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Blog not found
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              This post may have been removed or the link is incorrect.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Back to blogs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentBlog = blog;
  const { toc: h2Toc, html: htmlWithH2Ids } = currentBlog.html
    ? buildH2TocAndHtml(currentBlog.html)
    : { toc: [], html: "" };

  try {
    const res = await ProductService.getBlog({ page: 1, limit: 10 });
    related = extractBlogRows(res)
      .map((row) => normalizeRelatedPost(row))
      .filter((x): x is RelatedPost => x !== null)
      .filter((p) => p.id !== currentBlog.id && p.id !== slug)
      .slice(0, 3);
  } catch {
    related = [];
  }

  return (
    <main className="py-10">
      <div className="mx-auto grid min-w-0 max-w-layout gap-4 px-4 lg:grid-cols-[1fr_minmax(0,320px)]">
        <article className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="relative h-[420px] w-full">
            <Image
              src={
                blog.img ||
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
              }
              alt={blog.title}
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute bottom-10 left-10 right-10 text-white">
              {blog.category ? (
                <span className="inline-flex max-w-full truncate rounded-lg bg-primary/90 px-4 py-2 text-sm font-semibold">
                  {blog.category}
                </span>
              ) : null}

              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">
                {blog.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-gray-200">
                {blog.date ? <span>📅 {blog.date}</span> : null}
                {blog.author ? <span>👨‍💻 {blog.author}</span> : null}
                {blog.readTime ? <span>⏱ {blog.readTime}</span> : null}
              </div>
            </div>
          </div>

          <div className="px-4 py-6 md:px-8">
            {htmlWithH2Ids ? (
              <BlogDescriptionParser htmlContent={htmlWithH2Ids} />
            ) : (
              <p className="text-base leading-8 text-slate-700">
                Content is not available for this post.
              </p>
            )}
          </div>
        </article>

        <aside className="min-w-0 space-y-8">
          <div className="sticky top-24 z-30 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-6 py-5">
              <h2 className="text-center text-2xl font-extrabold text-white">
                Table Of Contents
              </h2>
            </div>

            <div className="p-4">
              {h2Toc.length > 0 ? (
                <div className="space-y-2">
                  {h2Toc.map((h, index) => (
                    <Link
                      key={h.id}
                      href={`#${h.id}`}
                      className="group flex min-w-0 items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary/40 hover:bg-primary-light hover:text-primary"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{h.text}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {fallbackToc.map((label, index) => (
                    <div
                      key={`${index}-${label}`}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm font-semibold text-gray-700"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-blue-500 px-6 py-5">
              <h2 className="text-center text-2xl font-extrabold text-white">
                Related Posts
              </h2>
            </div>

            <div className="min-w-0 space-y-3 p-4">
              {related.length > 0 ? (
                related.map((post) => (
                  <Link
                    href={blogHref(post.id)}
                    key={post.id}
                    className="group flex min-w-0 max-w-full gap-4 rounded-2xl p-1 transition-colors hover:bg-slate-50"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
                      <Image
                        src={
                          post.img ||
                          "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
                        }
                        alt={post.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h3 className="line-clamp-2 break-words font-bold leading-6 text-slate-900 transition group-hover:text-blue-600">
                        {post.title}
                      </h3>

                      {post.date ? (
                        <p className="mt-2 truncate text-sm text-slate-500">
                          {post.date}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">No related posts yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
