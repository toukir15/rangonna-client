import React from "react";
import Skeleton from "../../Skeleton";

const UploadImageSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  return (
    <div className="  gap-5">
      <div className="w-full opacity-70 dark:opacity-50">
        <Skeleton type="text" count={1} height={300} />
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-5 gap-1 mt-4">
        {demoData?.map((data) => (
          <div
            key={data?.id}
            className="dark:opacity-50 opacity-70  rounded-lg"
          >
            <div className="flex gap-5">
              <div className="w-full">
                <Skeleton type="text" count={1} height={75} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadImageSkeleton;
