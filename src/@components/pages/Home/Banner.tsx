
import React from "react";
import HeroSlider from "@/@components/core/Slider/Slider";
import { ISlide } from "@/@interfaces/HomeInterface/home.interfaces";
import { ENV } from "@/@config/env.config";

type TBannerItem = {
  image: string;
  link: string;
  title?: string;
  description?: string;
  priority?: number;
};

type TBannerResponse = {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    website?: {
      _id: string;
      web_url?: string;
      web_name?: string;
    };
    mobile?: TBannerItem[];
    desktop?: TBannerItem[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
  };
};

async function getBannerData(): Promise<{
  desktopSlides: ISlide[];
  mobileSlides: ISlide[];
}> {
  try {
    const res = await fetch(`${ENV.ApiEndpoint?.trim()}/banner/naviforce`, {
      method: "GET",
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return {
        desktopSlides: [],
        mobileSlides: [],
      };
    }

    const result: TBannerResponse = await res.json();
    const banner = result?.data;

    if (!banner) {
      return {
        desktopSlides: [],
        mobileSlides: [],
      };
    }

    const desktopSlides: any[] = [...(banner.desktop || [])]
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map((item, index) => ({
        image: item.image,
        title: item.title || `Desktop Slide ${index + 1}`,
        description: item.description || "",
        link: item.link || "/",
      }));

    const mobileSlides: any[] = [...(banner.mobile || [])]
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map((item, index) => ({
        image: item.image,
        title: item.title || `Mobile Slide ${index + 1}`,
        description: item.description || "",
        link: item.link || "/",
      }));

    return {
      desktopSlides,
      mobileSlides,
    };
  } catch (error) {
    console.error("Banner fetch error:", error);
    return {
      desktopSlides: [],
      mobileSlides: [],
    };
  }
}

const Page = async () => {
  const { desktopSlides, mobileSlides } = await getBannerData();

  if (!desktopSlides.length && !mobileSlides.length) {
    return null;
  }

  return (
    <div className="max-w-layout mx-auto">
      <HeroSlider slides={desktopSlides} mobileSlides={mobileSlides} />
    </div>
  );
};

export default Page;
