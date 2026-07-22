import React from "react";
import Skeleton from "../Skeleton";

const CardSkeleton: React.FC = () => {
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
    <div className="">
      {/* <div className="flex items-center gap-4">
        <div className="bg-[#dfdfe0]   opacity-70  rounded-lg p-3 mb-4">
          <Skeleton type="text" count={1} height={18} width={200} />
        </div>
        <div className="bg-[#dfdfe0]   opacity-70  rounded-lg p-3 mb-4">
          <Skeleton type="text" count={1} height={18} width={200} />
        </div>
      </div> */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-5 gap-1 w-full ">
        {demoData?.map((data) => (
          <div
            key={data?.id}
            className="bg-gray-50 dark:bg-gray-800/60  h-[100px] opacity-70 dark:opacity-50 rounded-lg p-3"
          >
            <div className="flex  gap-5">
              <div>
                <Skeleton type="text" count={1} height={60} width={60} />
              </div>
              <div className="">
                <Skeleton type="text" count={1} height={15} width={200} />
                <Skeleton type="text" count={1} height={15} width={150} />
                <Skeleton type="text" count={1} height={12} width={100} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSkeleton;
