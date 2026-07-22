import React from "react";
import Skeleton from "../Skeleton";

const ProductReportSkeleton: React.FC = () => {
  const demoData = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
  return (
    <div className=" bg-white rounded-lg w-full">
      {demoData?.map((data: any, index: number) => (
        <div className=" w-full mt-5" key={index}>
          <div className="bg-[#dfdfe0] h-14   opacity-70 dark:opacity-50 rounded-xl p-4 ">
            <div className="">
              <div className=" ">
                <Skeleton type="text" count={1} height={20} width={200} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductReportSkeleton;
