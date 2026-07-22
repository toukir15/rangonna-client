import React from "react";
import Skeleton from "../../Skeleton";

const EditOrderSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }];
  return (
    <div className=" w-full">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0] dark:bg-gray-500   opacity-70 dark:opacity-50  rounded-lg p-3"
        >
          <div className="grid grid-cols-3  gap-x-10 gap-y-4">
            <div className="w-full">
              <Skeleton type="text" count={1} height={15} width={120} />
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={42}
              />
            </div>
            <div className="w-full">
              <Skeleton type="text" count={1} height={15} width={120} />
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={42}
              />
            </div>
            <div className="w-full">
              <Skeleton type="text" count={1} height={15} width={120} />
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={42}
              />
            </div>
            <div className="w-full">
              <Skeleton type="text" count={1} height={15} width={120} />
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={42}
              />
            </div>
            <div className="w-full">
              <Skeleton type="text" count={1} height={15} width={120} />
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={42}
              />
            </div>
            <div className="w-full">
              <Skeleton type="text" count={1} height={15} width={120} />
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={42}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EditOrderSkeleton;
