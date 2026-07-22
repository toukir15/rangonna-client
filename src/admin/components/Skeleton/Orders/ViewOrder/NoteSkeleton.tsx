import React from "react";
import Skeleton from "../../Skeleton";

const NoteSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }];
  return (
    <div className="w-full mt-2">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]   opacity-70 dark:opacity-50  rounded-lg p-3"
        >
          <div className="w-full">
            <Skeleton type="text" count={1} height={30} />
            <Skeleton type="text" count={1} height={30} className="mt-2" />
            <Skeleton type="text" count={1} height={30} className="mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteSkeleton;
