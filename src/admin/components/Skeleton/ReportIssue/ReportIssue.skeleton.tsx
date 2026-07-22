import React from "react";
import Skeleton from "../Skeleton";

const ReportIssueSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  return (
    <div className="flex items-center gap-5">
      <div className="w-8/12 bg-white dark:bg-gray-700 rounded-lg p-10 h-96 flex flex-col">
        <div>
          <div className=" w-full grid grid-cols-4 gap-5">
            {demoData?.map((data) => (
              <div
                key={data?.id}
                className="bg-[#dfdfe0]  h-[200px] opacity-70 dark:opacity-50  rounded-xl p-4 "
              >
                <div className=" space-y-3">
                  <div className="text-center ">
                    <Skeleton type="text" count={1} height={20} width={40} />
                  </div>
                  <div className="text-center">
                    <Skeleton type="text" count={1} height={15} width={170} />
                  </div>
                  <div className="text-center">
                    <Skeleton type="text" count={1} height={20} width={130} />
                  </div>
                  <div className="text-center">
                    <Skeleton type="text" count={1} height={20} width={170} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className=" w-full mt-[40px]">
            <div className="bg-[#dfdfe0] h-14   opacity-70 dark:opacity-50 rounded-xl p-4 ">
              <div className="">
                <div className=" ">
                  <Skeleton type="text" count={1} height={20} width={200} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-4/12 bg-white dark:bg-gray-700 rounded-lg h-96 flex flex-col">
        <div className=" w-full ">
          <div className=" h-96 opacity-70 dark:opacity-50 rounded-lg p-4 ">
            <div className="flex items-center justify-between">
              <div className=" ">
                <Skeleton type="text" count={1} height={20} width={150} />
              </div>
              <div className=" ">
                <Skeleton type="text" count={1} height={20} width={100} />
              </div>
            </div>

            <div className=" ">
              <Skeleton type="text" count={1} height={2} />
            </div>
            <div className="flex  justify-between mt-2">
              <div className="flex gap-2 ">
                <Skeleton type="avatar" count={1} height={55} width={55} />
                <Skeleton type="text" count={1} height={28} width={150} />
              </div>
              <div className="flex gap-2 mt-10">
                <Skeleton type="text" count={1} height={28} width={150} />
                <Skeleton type="avatar" count={1} height={55} width={55} />
              </div>
            </div>
            <div className="flex  justify-between mt-2">
              <div className="flex gap-2 ">
                <Skeleton type="avatar" count={1} height={55} width={55} />
                <Skeleton type="text" count={1} height={28} width={150} />
              </div>
              <div className="flex gap-2 mt-10">
                <Skeleton type="text" count={1} height={28} width={150} />
                <Skeleton type="avatar" count={1} height={55} width={55} />
              </div>
            </div>
            <div className=" mt-5">
              <Skeleton type="text" count={1} height={2} />
            </div>
            <div className=" ">
              <Skeleton type="text" count={1} height={40} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueSkeleton;
