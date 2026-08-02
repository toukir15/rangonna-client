"use client";
import React from "react";
import WatchCard from "../Watches/WatchCard";

const ProductDetails: React.FC<any> = ({ moreWatchData }: any) => {
  return (
    <div className="max-w-layout mx-auto pb-2">
      <div className="mb-5 text-center">
        <p className="rongonaa-pdp__desc-eyebrow">You may also like</p>
        <h2 className="rongonaa-pdp__desc-title" style={{ marginBottom: 0 }}>
          More Products
        </h2>
      </div>
      <div className="rongonaa-shop-grid">
        {moreWatchData?.slice(0, 5).map((data: any, index: number) => (
          <WatchCard
            key={data?._id || index}
            data={data}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
