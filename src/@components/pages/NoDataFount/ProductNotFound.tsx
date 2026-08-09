"use client";
import React from "react";
import WatchCard from "../Watches/WatchCard";
import SectionHeader from "../Home/SectionHeader";
import { IProduct } from "@/@interfaces/common.interface";

const PapularProduct: React.FC<{ products: IProduct[] }> = ({ products }) => {
  const items = (products || []).slice(0, 5);

  if (!items.length) return null;

  return (
    <section className="rongonaa-bestsell">
      <SectionHeader
        eyebrow="Beloved picks"
        title="Best Sellers"
        description="Handpicked favorites from across Bangladesh — soft luxury, ready to gift."
        href="/churi"
        linkLabel="Shop all"
        align="center"
      />
      <div className="rongonaa-shop-grid">
        {items.map((data) => (
          <WatchCard key={data._id} data={data} />
        ))}
      </div>
    </section>
  );
};

export default PapularProduct;
