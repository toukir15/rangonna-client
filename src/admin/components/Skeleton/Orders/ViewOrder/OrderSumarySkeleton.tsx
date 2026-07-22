import React from "react";
import Skeleton from "../../Skeleton";

const OrderSumarySkeleton: React.FC = () => {
  const demoData = [{ id: 1 }];
  return (
    <div className="w-full">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]   opacity-70 dark:opacity-50  rounded-lg p-3"
        >
          <div className="">
            <div className="">
              <Skeleton type="text" count={1} height={25} width={400} />
            </div>
            <div className="mt-3 w-full flex items-center justify-between">
              <Skeleton type="text" count={1} height={35} width={150} />
              <Skeleton type="text" count={1} height={35} width={150} />
              <Skeleton type="text" count={1} height={35} width={150} />
              <Skeleton type="text" count={1} height={35} width={150} />
            </div>
            <div className="mt-3 w-full flex items-center justify-between">
              <div>
                <Skeleton type="text" count={1} height={120} width={150} />
              </div>
              <Skeleton type="text" count={1} height={35} width={150} />
              <Skeleton type="text" count={1} height={35} width={200} />
              <Skeleton type="text" count={1} height={35} width={150} />
            </div>
            <div className="mt-3 w-full flex items-center justify-between">
              <Skeleton type="text" count={1} height={35} width={250} />
              <Skeleton type="text" count={1} height={35} width={150} />
              <Skeleton type="text" count={1} height={35} width={150} />
              <Skeleton type="text" count={1} height={35} width={150} />
            </div>
            <div className="mt-3 w-full flex items-end justify-end">
              <div>
                <Skeleton
                  type="text"
                  count={1}
                  height={25}
                  width={250}
                  className=""
                />
                <Skeleton
                  type="text"
                  count={1}
                  height={25}
                  width={250}
                  className="mt-2"
                />
                <Skeleton
                  type="text"
                  count={1}
                  height={25}
                  width={250}
                  className="mt-2"
                />
                <Skeleton
                  type="text"
                  count={1}
                  height={25}
                  width={250}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderSumarySkeleton;
