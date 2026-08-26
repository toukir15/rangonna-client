import { ENV } from "@/@config/env.config";

export type TShopOccasionItem = {
  image: string;
  title: string;
  description: string;
  link: string;
};

export type TShopOccasionData = {
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
  mobile: TShopOccasionItem[];
  desktop: TShopOccasionItem[];
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

function mapItems(items: TApiItem[] | undefined): TShopOccasionItem[] {
  return [...(items || [])]
    .filter((item) => Boolean(item?.image) && Boolean(item?.title))
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .map((item) => ({
      image: item.image as string,
      title: item.title || "",
      description: item.description || "",
      link: item.link || "/churi",
    }));
}

export async function getShopOccasionData(): Promise<TShopOccasionData | null> {
  try {
    const res = await fetch(`${ENV.ApiEndpoint?.trim()}/shop-occasion`, {
      method: "GET",
      next: { revalidate: 10, tags: ["shop-occasion"] },
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
      eyebrow: data.eyebrow || "Shop by moment",
      heading: data.heading || "Shop by Occasion",
      description: data.description || "",
      href: data.href || "",
      linkLabel: data.linkLabel || "",
      mobile,
      desktop,
    };
  } catch (error) {
    console.error("Shop occasion fetch error:", error);
    return null;
  }
}
