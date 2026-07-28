import Banner from "@/@components/pages/Home/Banner";
import BestOffers from "@/@components/pages/Home/BestOffers";
// import CustomerReview from "@/@components/pages/Home/CustomerReview";
import HomeDescription from "@/@components/pages/Home/HomeDescription";
import NewProduct from "@/@components/pages/Home/NewProduct";
import PopularProduct from "@/@components/pages/Home/PopularProduct";
import StoreCategories from "@/@components/pages/Home/StoreCategories";

export default function Home() {
  return (
    <>
      <Banner />
      <BestOffers />
      <StoreCategories />
      <div className="px-3">
        <PopularProduct />
        {/* <CustomerReview /> */}
        <NewProduct />
        <HomeDescription />
      </div>
    </>
  );
}
