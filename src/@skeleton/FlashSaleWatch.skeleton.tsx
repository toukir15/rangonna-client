import React from "react";
import Skeleton from "./Skeleton";

const FlashSaleWatch: React.FC = () => {
  const demoData = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
    { id: 13 },
    { id: 14 },
    { id: 15 },
  ];
  return (
    <div className=" w-full grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:gap-4 gap-3 ">
      {demoData?.map((data) => (
        <div
          key={data?.id}
          className="bg-[#dfdfe0]  sm:h-80 opacity-70  rounded-lg p-3"
        >
          <div className="">
            <div>
              <Skeleton type="text" count={1} height={150} width={"100%"} />
            </div>
            <div className=" mt-4">
              <Skeleton type="text" count={1} height={18} width={"100%"} />
              <Skeleton type="text" count={1} height={18} width={"80%"} />
              <Skeleton type="text" count={1} height={18} width={"60%"} />
            </div>
            <div className=" mt-4 sm:flex items-center w-full gap-3">
              <div className="sm:w-1/2">
                <Skeleton type="text" count={1} height={32} width={"100%"} />
              </div>
              <div className="sm:w-1/2">
                <Skeleton type="text" count={1} height={32} width={"100%"} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlashSaleWatch;
