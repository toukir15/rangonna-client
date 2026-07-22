import React from "react";
import Skeleton from "../Skeleton";

const EmployeeReport: React.FC = () => {
  const demoData = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
  return (
    <div className="grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 md:gap-5 gap-1 w-full">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]  h-[100px] opacity-70 dark:opacity-50 rounded-lg p-4"
        >
          <div className="flex  gap-5">
            <div>
              <Skeleton type="text" count={1} height={60} width={60} />
            </div>
            <div className="">
              <Skeleton type="text" count={1} height={15} width={180} />
              <Skeleton type="text" count={1} height={15} width={140} />
              <Skeleton type="text" count={1} height={12} width={100} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeReport;
