// import React from "react";
// import Icon from "@admin/components/core/Icon/Icon";
// import OrdersStatusSkeleton from "@admin/components/Skeleton/Orders/AllOrders/OrdersStatusSkeleton";

// interface OrdersTabProps {
//   filter: string;
//   searchQuery: string;
//   handleFilterChange: (status: string) => void;
//   isCount?: boolean;
//   debouncedSearch?: any;
//   allStatuses?: any;
//   IsSearch?: boolean;
// }

// const CourierOrderTab: React.FC<OrdersTabProps> = ({
//   filter,
//   searchQuery,
//   handleFilterChange,
//   isCount = false,
//   debouncedSearch,
//   IsSearch = true,
//   allStatuses = [
//     { status: "all", name: "All" },
//     { status: "pending", name: "Pending" },
//     { status: "waiting-payment", name: "To be Paid" },
//     { status: "approved", name: "Approved" },
//     { status: "ready-for-box", name: "R-D" },
//     { status: "in-transit", name: "Transit" },
//     { status: "follow-up", name: "Follow Up" },
//     { status: "delivery", name: "Delivery" },
//     { status: "cancel", name: "Cancelled" },
//     { status: "refunded", name: "Refunded" },
//     { status: "return", name: "Return" },
//   ],
// }) => {
//   return (
//     <div className="dark:bg-gray-800 bg-white  rounded-lg shadow-sm mt-2 mb-2">
//       <div className="md:flex justify-between items-center">
//         <div className="flex items-center ] ">
//           <div className="rounded-md">
//             {allStatuses.length ? (
//               <div className="tabs flex  md:items-center md:justify-center gap-0.5 px-4 py-2   overflow-x-scroll md:!w-[1100px] sm:w-96 xs:w-80 md:pl-[270px]">
//                 {allStatuses?.map((item: any, index: any) => (
//                   <span
//                     key={index}
//                     className={`mr-0.5 text-lg hover:bg-blue-300 dark:hover:bg-black hover:text-white mb-0.5 py-0.5 px-3 rounded cursor-pointer transition-colors duration-200 text-gray-600
//             ${
//               filter === item.status
//                 ? "bg-white dark:bg-gray-600 dark:text-white border-b-4 dark:border-gray-400 border-blue-500 text-gray-900 p-2"
//                 : "hover:text-black dark:text-gray-400"
//             }`}
//                     onClick={() => handleFilterChange(item?.status)}
//                   >
//                     <span
//                       className={`2xl:text-lg text-sm text-nowrap ${
//                         filter === item.status && " text-blue-500"
//                       } `}
//                     >
//                       {item?.name}
//                     </span>
//                     {isCount && (
//                       <small className="text-green-500">
//                         - ({item?.count})
//                       </small>
//                     )}
//                   </span>
//                 ))}
//               </div>
//             ) : (
//               <div>
//                 <OrdersStatusSkeleton />
//               </div>
//             )}
//           </div>
//         </div>

//         {IsSearch === true && (
//           <div className="flex items-center space-x-2 relative ">
//             <div className="relative w-full md:mt-0 mt-4">
//               <input
//                 type="text"
//                 className="px-2 py-1.5 pr-10 w-full border dark:bg-gray-800 dark:border-gray-700 dark:text-white border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:dark:ring-gray-600 focus:outline-none"
//                 placeholder="Quick Search"
//                 defaultValue={searchQuery}
//                 onChange={(e: any) => debouncedSearch(e?.target?.value)}
//               />
//               <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 mt-1">
//                 <Icon name={"search"} variant="outlined" className="" />
//               </span>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CourierOrderTab;

"use client";
import React from "react";
import Icon from "@admin/components/core/Icon/Icon";
import OrdersStatusSkeleton from "@admin/components/Skeleton/Orders/AllOrders/OrdersStatusSkeleton";
import SelectComponent from "@admin/components/core/Select/Select";

interface OrdersTabProps {
  filter: string;
  searchQuery?: string;
  handleFilterChange: (status: string) => void;
  isCount?: boolean;
  debouncedSearch?: (query: string) => void;
  allStatuses?: { status: string; name: string; count?: number }[];
  IsSearch?: boolean;
}

const CourierOrderTab: React.FC<OrdersTabProps> = ({
  filter,
  searchQuery,
  handleFilterChange,
  isCount = false,
  debouncedSearch = () => {},
  IsSearch = false,
  allStatuses = [
    { status: "all", name: "All" },
    { status: "pending", name: "Pending" },
    { status: "waiting-payment", name: "To be Paid" },
    { status: "approved", name: "Approved" },
    { status: "ready-for-box", name: "R-D" },
    { status: "in-transit", name: "Transit" },
    { status: "follow-up", name: "Follow Up" },
    { status: "delivery", name: "Delivery" },
    { status: "cancel", name: "Cancelled" },
    { status: "refunded", name: "Refunded" },
    { status: "return", name: "Return" },
  ],
}) => {
  const options = allStatuses.map((item) => ({
    label: isCount && item.count ? `${item.name} (${item.count})` : item.name,
    value: item.status,
  }));

  return (
    <div className="dark:bg-gray-800 md:bg-white rounded-lg shadow-sm md:mt-2 md:mb-2">
      <div className="md:flex justify-between items-center">
        {/* ================= LEFT SIDE ================= */}
        <div className="flex items-center w-full md:w-auto">
          {/* ✅ Small screen: show Select dropdown */}
          <div className="block md:hidden w-full md:px-4 md:py-2">
            {allStatuses.length ? (
              <SelectComponent
                options={options}
                value={options.find((opt) => opt.value === filter)}
                onChange={(opt: any) => handleFilterChange(opt?.value)}
                placeholder="Select Status"
                className="w-full"
              />
            ) : (
              <OrdersStatusSkeleton />
            )}
          </div>

          {/* ✅ Large screen: show horizontal scrollable tabs */}
          <div className="hidden md:block rounded-md">
            {allStatuses.length ? (
              <div
                className="
                  tabs flex items-center gap-0.5 md:px-4 md:py-2 
                   whitespace-nowrap
                  sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm overflow-x-scroll xl:!w-full !w-[800px] 
                "
              >
                {allStatuses.map((item, index) => (
                  <span
                    key={index}
                    className={`4xl:mr-0.5 mr-[1px] text-lg hover:bg-blue-300 dark:hover:bg-black hover:text-white mb-0.5 py-0.5 4xl:px-3 px-2 rounded cursor-pointer transition-colors duration-200 text-gray-600 
                      ${
                        filter === item.status
                          ? "bg-white dark:bg-gray-600 dark:text-white border-b-4 dark:border-gray-400 border-blue-500 text-gray-900 p-2"
                          : "hover:text-black dark:text-gray-400"
                      }`}
                    onClick={() => handleFilterChange(item.status)}
                  >
                    <span
                      className={`4xl:text-base text-sm text-nowrap ${
                        filter === item.status ? "text-blue-500" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                    {isCount && typeof item.count === "number" && (
                      <small className="text-green-500 ml-1">
                        ({item.count})
                      </small>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <OrdersStatusSkeleton />
            )}
          </div>
        </div>

        {/* ================= RIGHT SIDE (Search) ================= */}
        {IsSearch && (
          <div className="flex items-center md:space-x-2 relative md:w-auto w-full  md:px-0">
            <div className="relative w-full md:mt-0 mt-3">
              <input
                type="text"
                className="px-2 py-1.5 pr-10 w-full border dark:bg-gray-800 dark:border-gray-700 dark:text-white border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                placeholder="Quick Search"
                defaultValue={searchQuery}
                onChange={(e) => debouncedSearch(e.target.value)}
              />
              <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 mt-1">
                <Icon name="search" variant="outlined" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierOrderTab;
