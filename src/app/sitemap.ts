import type { MetadataRoute } from "next";
import { ENV } from "@/@config/env.config";
import { absoluteUrl } from "@/@config/site";
import { fetchStoreCategories } from "@/utils/storeCategory.server";

const STATIC_PATHS = [
  "/",
  "/churi",
  "/wallet",
  "/sunglass",
  "/perfume",
  "/about-us",
  "/contact-us",
  "/how-to-buy",
  "/reviews",
  "/privacy-policy",
  "/refund-policy",
  "/delivery-return-policy",
  "/replacement-warranty",
  "/terms-conditions",
  "/voucher-terms-conditions",
];

type ProductRow = { slug?: string; updatedAt?: string };

async function fetchProductSlugs(): Promise<ProductRow[]> {
  const api = ENV.ApiEndpoint?.trim().replace(/\/+$/, "");
  if (!api) return [];

  const rows: ProductRow[] = [];
  const limit = 100;

  for (let page = 1; page <= 50; page += 1) {
    try {
      const res = await fetch(`${api}/product?page=${page}&limit=${limit}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;

      const json = await res.json();
      const batch: ProductRow[] = json?.data?.data ?? [];
      rows.push(...batch.filter((item) => item?.slug));

      const totalPage = Number(json?.data?.meta?.total_page || 1);
      if (page >= totalPage || batch.length === 0) break;
    } catch {
      break;
    }
  }

  return rows;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const categories = await fetchStoreCategories();
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: absoluteUrl(`/churi/${category.value}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const products = await fetchProductSlugs();
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
