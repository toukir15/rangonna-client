import React from "react";
import Skeleton from "../Skeleton";

const ProductSkeleton: React.FC = () => {
  const demoData = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
  ];
  return (
    <div className="space-y-3 w-full">
      <div className="bg-[#dfdfe0]  h-[40px] opacity-70 dark:opacity-50 p-2 rounded-lg  w-72 ">
        <div className="">
          <Skeleton type="text" count={1} height={18} width={200} />
        </div>
      </div>
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]  h-[140px] opacity-70 dark:opacity-50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-5">
              <div>
                <Skeleton type="text" count={1} height={105} width={105} />
              </div>
              <div className="space-y-2">
                <Skeleton type="text" count={1} height={25} width={300} />
                <Skeleton type="text" count={1} height={25} width={250} />
                <Skeleton type="text" count={1} height={20} width={200} />
              </div>
            </div>
            <div className="flex items-center gap-5">
              <Skeleton type="text" count={1} height={25} width={100} />
              <Skeleton type="text" count={1} height={25} width={110} />
              <Skeleton type="text" count={1} height={25} width={110} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
