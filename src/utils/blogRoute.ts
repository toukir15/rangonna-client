export function isMongoObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value.trim());
}

/** /blog/[slug] — prefer slug; fallback to _id when slug is missing. */
export function blogHref(routeId: string): string {
  return `/blog/${encodeURIComponent(routeId)}`;
}

export function blogRouteId(raw: Record<string, unknown>): string {
  const slug = raw.slug;
  if (typeof slug === "string" && slug.trim()) return slug.trim();
  if (slug != null && String(slug).trim()) return String(slug).trim();

  const oid = raw._id ?? raw.id;
  if (oid != null && oid !== "") return String(oid).trim();
  return "";
}

export function blogSlug(raw: Record<string, unknown>): string {
  const slug = raw.slug;
  if (typeof slug === "string" && slug.trim()) return slug.trim();
  if (slug != null && String(slug).trim()) return String(slug).trim();
  return "";
}

export function blogMongoId(raw: Record<string, unknown>): string {
  const oid = raw._id ?? raw.id;
  if (oid == null || oid === "") return "";
  return String(oid).trim();
}

export function pickBlogCategory(raw: Record<string, unknown>): string {
  const cats = raw.categories;
  if (Array.isArray(cats) && cats.length > 0) {
    const first = cats[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first && typeof first === "object") {
      const o = first as Record<string, unknown>;
      const label = o.name ?? o.title ?? o.slug;
      if (label != null && String(label).trim()) return String(label).trim();
    }
  }
  const single = raw.category ?? raw.tag;
  if (typeof single === "string" && single.trim()) return single.trim();
  return "";
}

export function pickBlogHtml(raw: Record<string, unknown>): string {
  const v = raw.description ?? raw.contentHtml ?? raw.html ?? raw.content;
  if (typeof v === "string" && v.trim()) return v.trim();
  return "";
}

export function extractSingleBlog(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== "object") return null;
  const r = res as { success?: boolean; data?: unknown };
  if (r.success === false) return null;
  const d = r.data;
  if (d && typeof d === "object" && !Array.isArray(d))
    return d as Record<string, unknown>;
  return null;
}

export function extractBlogRows(res: unknown): Record<string, unknown>[] {
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

type BlogFetchDeps = {
  getSingle: (key: string) => Promise<unknown>;
  getList: (query: { page: number; limit: number }) => Promise<unknown>;
};

export async function fetchBlogRawByRouteParam(
  routeParam: string,
  deps: BlogFetchDeps,
): Promise<Record<string, unknown> | null> {
  const key = routeParam.trim();
  if (!key) return null;

  const trySingle = async (k: string) => {
    const res = await deps.getSingle(k);
    return extractSingleBlog(res);
  };

  let raw = await trySingle(key);
  if (raw) return raw;

  for (let page = 1; page <= 10; page++) {
    const res = await deps.getList({ page, limit: 50 });
    const rows = extractBlogRows(res);
    if (rows.length === 0) break;

    const match = rows.find(
      (row) =>
        blogSlug(row) === key ||
        blogMongoId(row) === key ||
        blogRouteId(row) === key,
    );

    if (match) {
      const slug = blogSlug(match);
      if (slug && slug !== key) {
        const bySlug = await trySingle(slug);
        if (bySlug) return bySlug;
      }
      return match;
    }

    if (rows.length < 50) break;
  }

  return null;
}
