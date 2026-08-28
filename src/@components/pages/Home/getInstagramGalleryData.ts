import { ENV } from "@/@config/env.config";

export type TInstagramGallery = {
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
  items: { src: string; label: string; href: string }[];
};

export async function getInstagramGalleryData(): Promise<TInstagramGallery | null> {
  try {
    const response = await fetch(`${ENV.ApiEndpoint?.trim()}/instagram-gallery`, {
      next: { revalidate: 10, tags: ["instagram-gallery"] },
    });
    if (!response.ok) return null;
    const result = await response.json();
    const data = result?.data;
    if (!data) return null;

    const items = [...(data.items || [])]
      .filter((item) => item?.src && item?.label)
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map((item) => ({
        src: item.src,
        label: item.label,
        href: item.href || data.href || "https://instagram.com/rangonaa",
      }));
    if (!items.length) return null;

    return {
      eyebrow: data.eyebrow || "@rangonaa",
      heading: data.heading || "On Instagram",
      description: data.description || "",
      href: data.href || "https://instagram.com/rangonaa",
      linkLabel: data.linkLabel || "Follow @rangonaa",
      items,
    };
  } catch {
    return null;
  }
}
