"use client";
import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { IOrderHistory } from "@/app/(root)/my-account/page";
import { formatTimeAgo } from "@/utils";

interface RecentActivityProps {
  orderHistory?: IOrderHistory[];
}

const colors = [
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-primary",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-primary-light0",
  "bg-gray-500",
];

const RecentActivity: React.FC<RecentActivityProps> = ({ orderHistory }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedData = showAll ? orderHistory : orderHistory?.slice(0, 3);

  return (
    <div className="bg-white lg:p-6 p-4 rounded-lg lg:mt-10 md:mt-6 mt-4 ">
      <div className="flex items-center gap-2">
        <div className="bg-gray-200 p-1 rounded-lg">
          <ShoppingBag />
        </div>
        <h4 className="font-semibold">Recent Order</h4>
      </div>

      <div className="mt-4">
        {displayedData?.map((item: IOrderHistory, index: number) => (
          <div
            key={item?._id}
            className="md:flex  items-center justify-between border-b border-gray-200 py-3"
          >
            <div className="flex items-center gap-3">
              {/* Small colored circle - dynamic */}
              <span
                className={`w-2 h-2 rounded-full ${
                  colors[index % colors.length]
                }`}
              ></span>
              <p className="font-medium">
                Order #{item?.sysid} was {item?.status}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(item?.createdAt)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center">
        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="font-medium mt-4 hover:bg-gray-300 w-full rounded-lg cursor-pointer py-1"
          >
            View All Activity
          </button>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
