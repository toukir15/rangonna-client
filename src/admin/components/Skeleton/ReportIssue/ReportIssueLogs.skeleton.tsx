import React from "react";
import Skeleton from "../Skeleton";

const ReportIssueLogsSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }, { id: 2 }, { id: 3 }];
  return (
    <div>
      {demoData?.map((data) => (
        <div className=" w-full my-2" key={data.id}>
          <div className="bg-[#dfdfe0] h-14 opacity-70 dark:opacity-50  rounded-xl p-4 ">
            <div className=" flex  items-center justify-between">
              <div className=" ">
                <Skeleton type="text" count={1} height={20} width={400} />
              </div>
              <div className=" ">
                <Skeleton type="text" count={1} height={20} width={150} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportIssueLogsSkeleton;
