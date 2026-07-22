import React from "react";
import Skeleton from "../Skeleton";

const PurchaseSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }, { id: 2 }, { id: 3 }];
  return (
    <div className="">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-10 gap-1 w-full ">
        {demoData?.map((data) => (
          <div
            key={data?.id}
            className="bg-[#dfdfe0] h-[150px] opacity-70 dark:opacity-50 rounded-lg p-3"
          >
            <div className="flex gap-10">
              <div className=" space-y-2">
                <Skeleton type="text" count={1} height={25} width={300} />
                <Skeleton type="text" count={1} height={25} width={250} />
                <Skeleton type="text" count={1} height={22} width={150} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseSkeleton;
