const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export function menuHref(item?: {
  route?: string;
  category?: string | { _id?: string } | null;
}) {
  const raw = item?.category;
  const id =
    raw && typeof raw === "object"
      ? String(raw._id || "").trim()
      : String(raw || "").trim();
  if (OBJECT_ID.test(id)) return `/churi/${id}`;
  const route = String(item?.route || "").trim();
  return route || "#";
}

/** Storefront no longer sells named product brands — drop Brand nav items. */
export function withoutBrandNavItems<T extends { name?: string }>(
  items: T[] | null | undefined,
): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) => String(item?.name ?? "").trim().toLowerCase() !== "brand",
  );
}
