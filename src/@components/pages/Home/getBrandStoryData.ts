import { ENV } from "@/@config/env.config";

export type TBrandStory = {
  image: string;
  mobileImage: string;
  desktopImage: string;
  imageAlt: string;
  badgeEyebrow: string;
  badgeTitle: string;
  eyebrow: string;
  heading: string;
  description: string;
  values: { icon: string; label: string; text: string; priority: number }[];
  ctaLabel: string;
  ctaHref: string;
};

export async function getBrandStoryData(): Promise<TBrandStory | null> {
  try {
    const response = await fetch(`${ENV.ApiEndpoint?.trim()}/brand-story`, {
      next: { revalidate: 10, tags: ["brand-story"] },
    });
    if (!response.ok) return null;
    const result = await response.json();
    const data = result?.data;
    if (!data) return null;
    return {
      image: data.image || "/hero-bridal.png",
      mobileImage: data.mobileImage || data.image || "/hero-bridal.png",
      desktopImage: data.desktopImage || data.image || "/hero-bridal.png",
      imageAlt: data.imageAlt || "Rangonaa craftsmanship",
      badgeEyebrow: data.badgeEyebrow || "Est. with care",
      badgeTitle: data.badgeTitle || "Tradition, refined",
      eyebrow: data.eyebrow || "Our Story",
      heading: data.heading || "Modern Bengali elegance, handcrafted for her",
      description: data.description || "",
      values: [...(data.values || [])].sort((a, b) => (a.priority || 0) - (b.priority || 0)),
      ctaLabel: data.ctaLabel || "About Rangonaa",
      ctaHref: data.ctaHref || "/about",
    };
  } catch {
    return null;
  }
}
