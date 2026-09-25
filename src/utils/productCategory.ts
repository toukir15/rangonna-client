export type CategoryRef =
  | string
  | {
      _id?: string;
      key?: string;
      value?: string;
      name?: string;
      title?: string;
      slug?: string;
    };

export function categoryObjectId(category: CategoryRef | null | undefined): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category._id ? String(category._id) : "";
}

export function categorySlug(category: CategoryRef | null | undefined): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return String(
    category.value || category.slug || category.key || category.name || category.title || "",
  );
}

export function categoryLabel(category: CategoryRef | null | undefined): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return String(
    category.key || category.name || category.title || category.value || category.slug || category._id || "",
  );
}

export function categoryLabels(categories: unknown): string {
  if (!Array.isArray(categories)) return categoryLabel(categories as CategoryRef);
  return categories.map((item) => categoryLabel(item as CategoryRef)).filter(Boolean).join(", ");
}

export function categoryMatchesOption(raw: CategoryRef, optionValue: string): boolean {
  const id = categoryObjectId(raw);
  const slug = categorySlug(raw);
  const label = categoryLabel(raw);
  return (
    optionValue === id ||
    optionValue === slug ||
    optionValue === label ||
    (typeof raw === "string" && raw === optionValue)
  );
}

export function hasCategory(categories: unknown, slugOrId: string): boolean {
  const list = Array.isArray(categories) ? categories : categories ? [categories] : [];
  const needle = slugOrId.trim().toLowerCase();
  return list.some((item) => {
    const category = item as CategoryRef;
    return (
      categoryObjectId(category).toLowerCase() === needle ||
      categorySlug(category).toLowerCase() === needle ||
      categoryLabel(category).toLowerCase() === needle
    );
  });
}
