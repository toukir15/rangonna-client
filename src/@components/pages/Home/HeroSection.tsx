import Hero from "@/@components/pages/Home/Hero";
import { getBannerData } from "@/@components/pages/Home/getBannerData";

export default async function HeroSection() {
  const { desktopSlides, mobileSlides } = await getBannerData();

  if (!desktopSlides.length && !mobileSlides.length) {
    return null;
  }

  return <Hero desktopSlides={desktopSlides} mobileSlides={mobileSlides} />;
}
