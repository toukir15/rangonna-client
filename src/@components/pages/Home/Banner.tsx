import React from "react";
import HeroSlider from "@/@components/core/Slider/Slider";
import { getBannerData } from "@/@components/pages/Home/getBannerData";

const Page = async () => {
  const { desktopSlides, mobileSlides } = await getBannerData();

  if (!desktopSlides.length && !mobileSlides.length) {
    return null;
  }

  return (
    <div className="max-w-layout mx-auto">
      <HeroSlider
        slides={desktopSlides.map((item) => ({
          image: item.src,
          title: item.headline,
          description: item.copy,
          link: item.link,
        }))}
        mobileSlides={mobileSlides.map((item) => ({
          image: item.src,
          title: item.headline,
          description: item.copy,
          link: item.link,
        }))}
      />
    </div>
  );
};

export default Page;
