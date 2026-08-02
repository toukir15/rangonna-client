import Hero from "@/@components/pages/Home/Hero";
import StoreCategories from "@/@components/pages/Home/StoreCategories";
import ShopByOccasion from "@/@components/pages/Home/ShopByOccasion";
import GirlsEmotion from "@/@components/pages/Home/GirlsEmotion";
import PopularProduct from "@/@components/pages/Home/PopularProduct";
import BestOffers from "@/@components/pages/Home/BestOffers";
import NewProduct from "@/@components/pages/Home/NewProduct";
import CustomerLove from "@/@components/pages/Home/CustomerLove";
import BrandStoryTeaser from "@/@components/pages/Home/BrandStoryTeaser";
import RecentlyViewed from "@/@components/pages/Home/RecentlyViewed";
import NewsletterSection from "@/@components/pages/Home/NewsletterSection";
import InstagramGallery from "@/@components/pages/Home/InstagramGallery";

export default function Home() {
  return (
    <>
      <Hero />
      <BestOffers />
      <StoreCategories />
      <PopularProduct />
      <ShopByOccasion />
      <NewProduct />
      <GirlsEmotion />
      <CustomerLove />
      <BrandStoryTeaser />
      <RecentlyViewed />
      <NewsletterSection />
      <InstagramGallery />
    </>
  );
}
