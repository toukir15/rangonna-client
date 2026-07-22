import React from "react";
import Skeleton from "./Skeleton";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full  md:gap-4 gap-3 ">
      <div className="bg-[#dfdfe0]  sm:h-20 opacity-70  rounded-lg p-3 ">
        <div className="">
          <Skeleton type="text" count={1} height={22} width={"80%"} />
        </div>
        <div className=" ">
          <Skeleton type="text" count={1} height={22} width={"50%"} />
        </div>
      </div>

      <div className="bg-[#dfdfe0]  sm:h-28 opacity-70  rounded-lg p-3 mt-4">
        <div className="">
          <Skeleton type="text" count={1} height={22} width={"80%"} />
        </div>
        <div className=" ">
          <Skeleton type="text" count={1} height={22} width={"70%"} />
        </div>
        <div className=" ">
          <Skeleton type="text" count={1} height={22} width={"50%"} />
        </div>
      </div>
      <div className="bg-[#dfdfe0]  sm:h-28 opacity-70  rounded-lg p-3 mt-4">
        <div className="">
          <Skeleton type="text" count={1} height={22} width={"80%"} />
        </div>
        <div className=" ">
          <Skeleton type="text" count={1} height={22} width={"70%"} />
        </div>
        <div className=" ">
          <Skeleton type="text" count={1} height={22} width={"50%"} />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
