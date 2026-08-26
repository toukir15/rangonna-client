import { ENV } from "@/@config/env.config";

export type TCustomerLoveItem = {
  image: string;
  name: string;
  city: string;
  rating: number;
  text: string;
  product: string;
};

export type TCustomerLoveData = {
  eyebrow: string;
  heading: string;
  description: string;
  mobile: TCustomerLoveItem[];
  desktop: TCustomerLoveItem[];
};

type TApiItem = {
  image?: string;
  name?: string;
  city?: string;
  rating?: number;
  text?: string;
  product?: string;
  priority?: number;
};

type TApiResponse = {
  success: boolean;
  data?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    mobile?: TApiItem[];
    desktop?: TApiItem[];
    items?: TApiItem[];
  } | null;
};

function mapItems(items: TApiItem[] | undefined): TCustomerLoveItem[] {
  return [...(items || [])]
    .filter((item) => Boolean(item?.name) && Boolean(item?.text))
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .map((item) => ({
      image: item.image || "",
      name: item.name || "",
      city: item.city || "",
      rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
      text: item.text || "",
      product: item.product || "",
    }));
}

export async function getCustomerLoveData(): Promise<TCustomerLoveData | null> {
  try {
    const res = await fetch(`${ENV.ApiEndpoint?.trim()}/customer-love`, {
      method: "GET",
      next: { revalidate: 10, tags: ["customer-love"] },
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
      eyebrow: data.eyebrow || "Social proof",
      heading: data.heading || "Loved by Her",
      description: data.description || "",
      mobile,
      desktop,
    };
  } catch (error) {
    console.error("Customer love fetch error:", error);
    return null;
  }
}
