"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import WatchCard from "../Watches/WatchCard";

interface OtherProductProps {
  moreWatchData: any;
  title: string;
  viewAllLink?: string;
}

const OtherProduct: React.FC<OtherProductProps> = ({
  moreWatchData,
  title,
  viewAllLink,
}) => {
  return (
    <div className="max-w-layout mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="w-14 h-[3px] bg-primary rounded-full mt-2"></div>
        </div>
      </div>

      {/* Products */}
      <div className="grid xs:grid-cols-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {moreWatchData?.map((data: any, index: number) => (
          <WatchCard
            key={index}
            data={data}
            isAddToCartButton={true}
            isByNowButton={false}
          />
        ))}
      </div>
      <div className="flex items-center justify-center w-full pt-6">
        <div className="!w-40 text-center flex items-center ">
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="group w-40 text-center flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-primary px-4 text-white py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white shadow-sm"
            >
              View All
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherProduct;
