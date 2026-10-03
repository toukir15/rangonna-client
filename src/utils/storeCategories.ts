import { apiIns } from "@/@config/api.config";
import { queryStringMapper } from "@/@services/utils";

export type StoreCategory = {
  _id: string;
  key: string;
  value: string;
};

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
const EMPTY_CATEGORY_ID = "000000000000000000000000";

export function isCategoryObjectId(value: string) {
  return OBJECT_ID.test(value);
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

function rowsFrom(payload: unknown): StoreCategory[] {
  const body = payload as { data?: unknown } | null;
  const list = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(payload)
      ? payload
      : [];
  return list.map(asCategory).filter((row): row is StoreCategory => Boolean(row));
}

let listPromise: Promise<StoreCategory[]> | null = null;

export function loadStoreCategories(): Promise<StoreCategory[]> {
  if (!listPromise) {
    listPromise = apiIns
      .get("/product-category" + queryStringMapper({ limit: 100, sort: "key" }))
      .then((res: { data?: unknown }) => rowsFrom(res?.data ?? res))
      .catch((error: unknown) => {
        listPromise = null;
        throw error;
      });
  }
  return listPromise;
}

export async function loadStoreCategory(slugOrId: string): Promise<StoreCategory | null> {
  const token = decodeURIComponent(String(slugOrId || "")).trim();
  if (!token) return null;

  const list = await loadStoreCategories().catch(() => [] as StoreCategory[]);
  const fromList = list.find(
    (row) =>
      row._id === token ||
      row.value.toLowerCase() === token.toLowerCase() ||
      row.key.toLowerCase() === token.toLowerCase(),
  );
  if (fromList) return fromList;

  try {
    const res = await apiIns.get("/product-category/" + encodeURIComponent(token));
    return asCategory((res as { data?: unknown })?.data);
  } catch {
    return null;
  }
}

export function categoryLabelMap(categories: StoreCategory[]) {
  return Object.fromEntries(categories.map((row) => [row._id, row.key]));
}

/** Turn slugs, titles, or ids into category ObjectIds for product queries. */
export async function resolveCategoryQueryParam(raw: unknown): Promise<string | undefined> {
  const text = decodeURIComponent(String(raw ?? "")).trim();
  if (!text || text.toLowerCase() === "all") return text || undefined;

  const tokens = text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== "all");
  if (!tokens.length) return undefined;

  const list = await loadStoreCategories().catch(() => [] as StoreCategory[]);
  const ids = tokens
    .map((token) => {
      if (isCategoryObjectId(token)) {
        return list.some((row) => row._id === token) || list.length === 0 ? token : "";
      }
      const found = list.find(
        (row) =>
          row.value.toLowerCase() === token.toLowerCase() ||
          row.key.toLowerCase() === token.toLowerCase(),
      );
      return found?._id || "";
    })
    .filter(Boolean);

  const unique = Array.from(new Set(ids));
  return unique.length ? unique.join(",") : EMPTY_CATEGORY_ID;
}
