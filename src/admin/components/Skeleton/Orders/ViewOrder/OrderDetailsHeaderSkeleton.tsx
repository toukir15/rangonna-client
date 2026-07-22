import React from "react";
import Skeleton from "../../Skeleton";

const OrderDetailsHeaderSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }];
  return (
    <div className=" w-full">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]  h-[100px] opacity-70 dark:opacity-50  rounded-lg p-3"
        >
          <div className="flex gap-5 justify-between">
            <div className="">
              <Skeleton type="text" count={1} height={18} width={200} />
              <Skeleton type="text" count={1} height={18} width={150} />
              <Skeleton type="text" count={1} height={18} width={100} />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton type="avatar" circle count={1} height={60} width={60} />
              <Skeleton type="avatar" circle count={1} height={60} width={60} />
              <Skeleton type="avatar" circle count={1} height={60} width={60} />
              <Skeleton type="avatar" circle count={1} height={60} width={60} />
            </div>
            <div className="flex gap-4 mt-2">
              <Skeleton type="text" count={1} height={50} width={50} />
              <Skeleton type="text" count={1} height={50} width={50} />
              <Skeleton type="text" count={1} height={50} width={50} />
              <Skeleton type="text" count={1} height={50} width={50} />
              <Skeleton type="text" count={1} height={50} width={50} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderDetailsHeaderSkeleton;
