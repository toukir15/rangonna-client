/** Storefront no longer sells named product brands — drop Brand nav items. */
export function withoutBrandNavItems<T extends { name?: string }>(
  items: T[] | null | undefined,
): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (item) => String(item?.name ?? "").trim().toLowerCase() !== "brand",
  );
}
