"use client";

import WatchCard from "../Watches/WatchCard";
import { IProduct } from "@/@interfaces/common.interface";
import SectionHeader from "./SectionHeader";

export default function NewProductLoad({
  initialProducts,
}: {
  initialProducts: IProduct[];
}) {
  const products = initialProducts.slice(0, 6);

  if (!products.length) return null;

  return (
    <section className="rongonaa-home-section">
      <div className="rongonaa-home-section__inner">
        <SectionHeader
          eyebrow="Just in"
          title="New Arrivals"
          description="Fresh stacks for the season — soft luxury and celebration sparkle."
          href="/churi"
          linkLabel="View all"
        />

        <div className="rongonaa-flash-sale__grid">
          {products.map((product) => (
            <WatchCard
              key={product._id}
              data={product}
              isAddToCartButton={false}
              isByNowButton
            />
          ))}
        </div>
      </div>
    </section>
  );
}
