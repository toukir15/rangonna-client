import { ENV } from "@/@config/env.config";

export type TBannerSlide = {
  src: string;
  headline: string;
  copy: string;
  link: string;
};

type TBannerItem = {
  image?: string;
  link?: string;
  title?: string;
  description?: string;
  priority?: number;
};

type TBannerResponse = {
  success: boolean;
  data?: {
    mobile?: TBannerItem[];
    desktop?: TBannerItem[];
  } | null;
};

function mapSlides(items: TBannerItem[] | undefined): TBannerSlide[] {
  return [...(items || [])]
    .filter((item) => Boolean(item?.image))
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .map((item) => ({
      src: item.image as string,
      headline: item.title || "",
      copy: item.description || "",
      link: item.link || "/",
    }));
}

export async function getBannerData(): Promise<{
  desktopSlides: TBannerSlide[];
  mobileSlides: TBannerSlide[];
}> {
  const empty = { desktopSlides: [] as TBannerSlide[], mobileSlides: [] as TBannerSlide[] };

  try {
    const res = await fetch(`${ENV.ApiEndpoint?.trim()}/banner`, {
      method: "GET",
      next: { revalidate: 10, tags: ["banner"] },
    });

    if (!res.ok) return empty;

    const result: TBannerResponse = await res.json();
    const banner = result?.data;

    if (!banner) return empty;

    return {
      desktopSlides: mapSlides(banner.desktop),
      mobileSlides: mapSlides(banner.mobile),
    };
  } catch (error) {
    console.error("Banner fetch error:", error);
    return empty;
  }
}
