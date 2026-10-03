export type MenuCategoryOption = {
  _id: string;
  key: string;
  value: string;
};

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export function resolveMenuCategoryId(
  item: { route?: string; category?: string },
  options: MenuCategoryOption[],
) {
  const stored = String(item.category || "").trim();
  if (OBJECT_ID.test(stored)) return stored;

  const match = String(item.route || "").trim().match(/^\/churi\/([^/?#]+)$/);
  if (!match) return "";
  const token = decodeURIComponent(match[1]).trim();
  if (OBJECT_ID.test(token)) return token;
  return (
    options.find((row) => row.value.toLowerCase() === token.toLowerCase())?._id || ""
  );
}

export function categoryMenuRoute(categoryId: string) {
  return categoryId ? `/churi/${categoryId}` : "";
}
