import Link from "next/link";
import React from "react";
import noData from "@admin/assets/images/noDataFound.png";
import Image from "next/image";
import { getStatusStyle } from "@admin/utils/system.utils";
import NoteSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/NoteSkeleton";
import { formatTimeAgo } from "@admin/utils/hook.utils";

interface OrderHistoryProps {
  ordersHistory: any;
  isLoading: boolean;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  ordersHistory,
  isLoading,
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2 dark:text-gray-400">
        Previous Order History
      </h2>
      {isLoading ? (
        <NoteSkeleton />
      ) : ordersHistory ? (
        <table className="min-w-full bg-white border dark:border-gray-500 overflow-x-scroll">
          <thead className="bg-blue-100 dark:bg-gray-700 h-[35px] shadow-sm">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                System ID
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {ordersHistory?.map((order: any, index: string) => {
              return (
                <tr
                  key={index}
                  className="bg-white dark:bg-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700 border-r dark:text-gray-300 dark:border-gray-600">
                    <Link
                      href={`/orders/view/${order?._id}`}
                      className="hover:underline"
                    >
                      {order.sysid}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700 border-r dark:text-gray-300 dark:border-gray-600">
                    {formatTimeAgo(order.createdAt)}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700 border-r dark:text-gray-300 dark:border-gray-600">
                    {order.total}
                  </td>
                  <td className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700 dark:text-gray-300 dark:border-gray-600">
                    <div
                      className={`${getStatusStyle(
                        order.status
                      )} min-w-20 max-w-40 text-center text-xs`}
                    >
                      {order.status}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col items-center justify-center  dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          <Image src={noData} alt={"no data found"} className="h-auto w-14" />
          <p className="text-sm font-medium text-center text-gray-500 dark:text-gray-400 mt-2">
            No Orders Available
          </p>
        </div>
      )}
    </>
  );
};

export default OrderHistory;
