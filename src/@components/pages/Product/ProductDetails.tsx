"use client";
import React from "react";
import WatchCard from "../Watches/WatchCard";

const ProductDetails: React.FC<any> = ({ moreWatchData }: any) => {
  return (
    <div className="max-w-layout mx-auto pb-2">
      <h2 className="premium-section-title mb-5 rounded-xl px-4 py-3 text-center text-xl font-bold">
        More Products
      </h2>
      <div className="grid xs:grid-cols-2 sm: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 ">
        {moreWatchData?.map((data: any, index: number) => (
          <WatchCard
            key={index}
            data={data}
            isAddToCartButton={true}
            isByNowButton={false}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
