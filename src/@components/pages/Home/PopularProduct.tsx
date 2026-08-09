import React from "react";
import WatchCard from "../Watches/WatchCard";
import { IProduct } from "@/@interfaces/common.interface";
import { ENV } from "@/@config/env.config";
import SectionHeader from "./SectionHeader";

export const revalidate = 10;

async function getPopularProducts() {
  try {
    const qs = new URLSearchParams({
      limit: "5",
      category: "all",
      sort: "best-selling",
    });

    const rawUrl = `${ENV.ApiEndpoint?.trim()}/product?${qs.toString()}`;
    const safeUrl = encodeURI(rawUrl);

    const res = await fetch(safeUrl, {
      next: { revalidate: 10, tags: ["products", "popular"] },
    });

    if (!res.ok) {
      return { data: { data: [] } };
    }

    return res.json();
  } catch {
    return { data: { data: [] } };
  }
}

const PopularProduct = async () => {
  const response = await getPopularProducts();
  const products: IProduct[] = (response?.data?.data ?? []).slice(0, 5);

  if (!products.length) return null;

  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow="Beloved"
          title="Best Sellers"
          description="The pieces our community reaches for again and again."
          href="/churi"
          linkLabel="Shop all"
        />
        <div className="rongonaa-flash-sale__grid">
          {products.map((data: IProduct) => (
            <WatchCard
              key={data._id}
              data={data}
              isAddToCartButton={false}
              isByNowButton
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularProduct;
