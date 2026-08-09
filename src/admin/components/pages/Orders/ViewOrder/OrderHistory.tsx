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
      <h2 className="ov-panel__title mb-3">Previous Order History</h2>
      {isLoading ? (
        <NoteSkeleton />
      ) : ordersHistory ? (
        <div className="overflow-x-auto">
          <table className="ov-table">
            <thead>
              <tr>
                <th>System ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersHistory?.map((order: any, index: string) => {
                return (
                  <tr key={index}>
                    <td>
                      <Link href={`/admin/orders/view/${order?._id}`}>
                        {order.sysid}
                      </Link>
                    </td>
                    <td>{formatTimeAgo(order.createdAt)}</td>
                    <td>{order.total}</td>
                    <td>
                      <div
                        className={`${getStatusStyle(
                          order.status,
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
        </div>
      ) : (
        <div className="ov-empty">
          <Image src={noData} alt={"no data found"} className="h-auto w-14" />
          <p>No Orders Available</p>
        </div>
      )}
    </>
  );
};

export default OrderHistory;
