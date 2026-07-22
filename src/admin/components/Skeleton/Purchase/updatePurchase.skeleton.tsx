import React from "react";
import Skeleton from "../Skeleton";

const UpdatePurchaseSkeleton: React.FC = () => {
  return (
    <div className="w-full  dark:bg-gray-700 rounded-lg grid grid-cols-3  gap-5">
      <div className="bg-[#dfdfe0] h-11 mt-2 opacity-70 dark:opacity-50 rounded-xl p-2 ">
        <Skeleton type="text" count={1} height={22} />
      </div>
      <div className="bg-[#dfdfe0] h-11 mt-2 opacity-70 dark:opacity-50 rounded-xl p-2 ">
        <Skeleton type="text" count={1} height={22} />
      </div>
      <div className="flex  gap-5">
        <div className="bg-[#dfdfe0] h-11 mt-2 opacity-70 dark:opacity-50 rounded-xl p-2 w-full">
          <Skeleton type="text" count={1} height={22} />
        </div>
      </div>
    </div>
  );
};

export default UpdatePurchaseSkeleton;
