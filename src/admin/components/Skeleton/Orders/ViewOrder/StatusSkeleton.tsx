import React from "react";
import Skeleton from "../../Skeleton";

const StatusSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }];
  return (
    <div className="w-full  rounded-lg   h-28">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]   opacity-70 dark:opacity-50 rounded-lg p-3 py-6"
        >
          <div className="w-full flex items-center flex-wrap">
            <div>
              <Skeleton type="avatar" count={1} height={50} width={50} />
            </div>
            <div>
              <Skeleton
                type="text"
                count={1}
                height={6}
                width={200}
                className="mt-2 rounded-none"
              />
            </div>
            <div>
              <Skeleton type="avatar" count={1} height={50} width={50} />
            </div>
            <div>
              <Skeleton
                type="text"
                count={1}
                height={6}
                width={200}
                className="mt-2 rounded-none"
              />
            </div>
            <div>
              <Skeleton type="avatar" count={1} height={50} width={50} />
            </div>
            <div>
              <Skeleton
                type="text"
                count={1}
                height={6}
                width={200}
                className="mt-2 rounded-none"
              />
            </div>
            <div>
              <Skeleton type="avatar" count={1} height={50} width={50} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusSkeleton;
