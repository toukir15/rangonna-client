import React from "react";
import Skeleton from "../../Skeleton";

const OrdersStatusSkeleton: React.FC = () => {
  const demoData = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
    { id: 13 },
  ];
  return (
    <div className="flex items-center gap-6 w-full bg-[#ebebec] rounded-lg p-3">
      {demoData?.map((data) => (
        <div key={data?.id} className="h-[22px] opacity-70 dark:opacity-50 ">
          <Skeleton type="text" count={1} height={20} width={80} />
        </div>
      ))}
    </div>
  );
};

export default OrdersStatusSkeleton;
