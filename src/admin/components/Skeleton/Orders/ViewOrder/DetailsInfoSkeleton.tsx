import React from "react";
import Skeleton from "../../Skeleton";
const DetailsInfoSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }, { id: 2 }];
  return (
    <div className="grid grid-cols-2 md:gap-5 gap-1 w-full mb-3">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]  h-[140px] opacity-70 dark:opacity-50  rounded-lg p-3"
        >
          <div className="flex  gap-5">
            <div className="">
              <Skeleton
                type="text"
                count={1}
                height={25}
                width={300}
                className="mb-1"
              />
              <Skeleton
                type="text"
                count={1}
                height={22}
                width={250}
                className="mb-1"
              />
              <Skeleton type="text" count={1} height={18} width={100} />
              <Skeleton type="text" count={1} height={18} width={180} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetailsInfoSkeleton;
