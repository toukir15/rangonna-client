import React from "react";
import Skeleton from "../../Skeleton";

const EditProductInfoSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }];
  return (
    <div className=" w-full">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0] dark:bg-gray-500  opacity-70 dark:opacity-50 rounded-lg p-3"
        >
          <div className="flex items-center gap-10 mt-5">
            <div className="w-full">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={260}
              />
            </div>
            <div className="w-full ">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={400}
              />
            </div>
            <div className="w-full">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={260}
              />
            </div>
            <div className="w-full ">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={400}
              />
            </div>
          </div>
          <div className="flex items-center gap-10 mt-10">
            <div className="w-full">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={260}
              />
            </div>
            <div className="w-full ">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={400}
              />
            </div>
            <div className="w-full">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={260}
              />
            </div>
            <div className="w-full ">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={400}
              />
            </div>
          </div>
          <div className="flex items-center gap-10 mt-10">
            <div className="w-full">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={260}
              />
            </div>
            <div className="w-full ">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={400}
              />
            </div>
            <div className="w-full">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={260}
              />
            </div>
            <div className="w-full ">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={60}
                width={400}
              />
            </div>
          </div>
          <div className="flex items-center gap-10 mt-7">
            <div className="w-full flex items-end justify-end gap-4">
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={45}
                width={200}
              />
              <Skeleton
                type="text"
                className="!rounded-lg"
                count={1}
                height={45}
                width={200}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EditProductInfoSkeleton;
