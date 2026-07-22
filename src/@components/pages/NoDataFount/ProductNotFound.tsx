"use client";
import React from "react";
import WatchCard from "../Watches/WatchCard";
import { IProduct } from "@/@interfaces/common.interface";

const PapularProduct: React.FC<{ products: IProduct[] }> = ({ products }) => {
  return (
    <div className=" pb-5">
      <h2 className="text-2xl font-bold py-1 text-center bg-primary text-white mb-4">
        Our Best selling Watches
      </h2>
      <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 xl:gap-5">
        {products?.map((data) => (
          <WatchCard
            key={data._id}
            data={data}
            imgClassName="h-32 rounded-lg"
            isAddToCartButton={false}
          />
        ))}
      </div>
    </div>
  );
};

export default PapularProduct;
