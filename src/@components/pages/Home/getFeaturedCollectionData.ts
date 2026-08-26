import { ENV } from "@/@config/env.config";

export type TFeaturedCollectionItem = {
  image: string;
  title: string;
  description: string;
  link: string;
  large?: boolean;
};

export type TFeaturedCollectionData = {
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
  mobile: TFeaturedCollectionItem[];
  desktop: TFeaturedCollectionItem[];
};

type TApiItem = {
  image?: string;
  title?: string;
  description?: string;
  link?: string;
  priority?: number;
};

type TApiResponse = {
  success: boolean;
  data?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    href?: string;
    linkLabel?: string;
    mobile?: TApiItem[];
    desktop?: TApiItem[];
    items?: TApiItem[];
  } | null;
};

function mapItems(items: TApiItem[] | undefined): TFeaturedCollectionItem[] {
  return [...(items || [])]
    .filter((item) => Boolean(item?.image) && Boolean(item?.title))
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .map((item, index) => ({
      image: item.image as string,
      title: item.title || "",
      description: item.description || "",
      link: item.link || "/churi",
      large: index === 0,
    }));
}

export async function getFeaturedCollectionData(): Promise<TFeaturedCollectionData | null> {
  try {
    const res = await fetch(`${ENV.ApiEndpoint?.trim()}/featured-collection`, {
      method: "GET",
      next: { revalidate: 10, tags: ["featured-collection"] },
    });

    if (!res.ok) return null;

    const result: TApiResponse = await res.json();
    const data = result?.data;
    if (!data) return null;

    const fallback = data.items || [];
    const mobile = mapItems(data.mobile?.length ? data.mobile : fallback);
    const desktop = mapItems(data.desktop?.length ? data.desktop : fallback);

    if (!mobile.length && !desktop.length) return null;

    return {
      eyebrow: data.eyebrow || "Curated for you",
      heading: data.heading || "Featured Collections",
      description: data.description || "",
      href: data.href || "/churi",
      linkLabel: data.linkLabel || "View all collections",
      mobile,
      desktop,
    };
  } catch (error) {
    console.error("Featured collection fetch error:", error);
    return null;
  }
}
