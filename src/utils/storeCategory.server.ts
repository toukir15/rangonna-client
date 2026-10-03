import { ENV } from "@/@config/env.config";

export type StoreCategory = {
  _id: string;
  key: string;
  value: string;
};

function apiBase() {
  return ENV.ApiEndpoint?.trim().replace(/\/+$/, "") || "";
}

function asCategory(row: unknown): StoreCategory | null {
  if (!row || typeof row !== "object") return null;
  const item = row as { _id?: unknown; key?: unknown; value?: unknown };
  const id = String(item._id ?? "").trim();
  const key = String(item.key ?? "").trim();
  const value = String(item.value ?? "").trim();
  if (!id || !key || !value) return null;
  return { _id: id, key, value };
}

export async function fetchStoreCategories(): Promise<StoreCategory[]> {
  const api = apiBase();
  if (!api) return [];

  try {
    const res = await fetch(`${api}/product-category?limit=100&sort=key`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows.map(asCategory).filter((row): row is StoreCategory => Boolean(row));
  } catch {
    return [];
  }
}

export async function fetchStoreCategory(slugOrId: string): Promise<StoreCategory | null> {
  const api = apiBase();
  const token = decodeURIComponent(String(slugOrId || "")).trim();
  if (!api || !token) return null;

  try {
    const res = await fetch(`${api}/product-category/${encodeURIComponent(token)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return asCategory(json?.data);
  } catch {
    return null;
  }
}
