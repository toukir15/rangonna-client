import React from "react";
import Skeleton from "../../Skeleton";

const InfosSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-5">
      <div className="w-full bg-white dark:bg-gray-700 rounded-lg ">
        <div className="flex w-full gap-4">
          <div className="bg-[#dfdfe0] h-11 mt-2 opacity-70 dark:opacity-50 rounded-xl p-2 w-1/2">
            <Skeleton type="text" count={1} height={22} />
          </div>
          <div className="bg-[#dfdfe0] h-11 mt-2 opacity-70 dark:opacity-50 rounded-xl p-2 w-1/2">
            <Skeleton type="text" count={1} height={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfosSkeleton;
