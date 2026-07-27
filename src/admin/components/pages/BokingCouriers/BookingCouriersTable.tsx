import React, { useContext, useEffect, useRef, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusStyle } from "@admin/utils/system.utils";
import { getWebName, hasPermission, noData } from "@admin/utils";
import { CourierBookingContext } from "@/app/admin/couriers/booking/page";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import NodataImg from "@admin/assets/images/Image-not-found.png";
import Image from "next/image";
import Icon from "@admin/components/core/Icon/Icon";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useRouter } from "next/navigation";
import {
  LineItem,
  PathaoBooking,
} from "@admin/@interfaces/couriers/booking.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";

const BookingCouriersTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();
  const {
    orderList,
    tableLoading,
    isCheck,
    handleSelectAll,
    selectedOrders,
    handleSelectOrder,
    handleImageClick,
  } = useContext(CourierBookingContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div>
      <TableWrapper
        showCheckbox={true}
        data={orderList}
        noDataViewCondition={orderList?.length < 1 ? "No data available" : null}
        isSwitchOn={true}
        isLoading={tableLoading}
        className="min-h-[700px]"
        colValue={10}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th>
              <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-48 text-blue-900 dark:text-gray-200">
              Order ID
            </Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
              Customer Info
            </Th>

            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
              Products
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-40 text-blue-900 dark:text-gray-200">
              Status
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
              Total & Due
            </Th>

            <Th className="2xl:min-w-32 lg:min-w-28 min-w-48 text-blue-900 dark:text-gray-200">
              Customer Note & Note
            </Th>

            <Th className="  text-blue-900 dark:text-gray-200 2xl:min-w-32 lg:min-w-28 min-w-36">
              Courier Status
            </Th>
            <Th className=" text-blue-900 dark:text-gray-200">Action</Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {orderList &&
            orderList?.map((order: PathaoBooking, index: number) => {
              return (
                <Tr
                  className=" hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>
                    <TableCheckbox
                      checked={selectedOrders.includes(order?.order?._id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleSelectOrder(order?.order?._id)}
                    />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap text-base font-bold">
                      <span>{order?.order_sysid || noData}</span>
                    </div>
                    <div className="mt-0.5">
                      <span>{getWebName(order?.order?.domain) || noData}</span>
                    </div>
                    <div className="mt-0.5">
                      <span>
                        {formatTimeAgo(new Date(order?.createdAt)) || noData}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <div className="text-base font-bold">
                      <span>
                        {order?.order?.customer?.first_name}{" "}
                        {order?.order.customer?.last_name}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <a href={`tel:${order?.order?.customer?.phone}`}>
                        {order?.order?.customer?.phone}
                      </a>
                    </div>

                    <div className="mt-0.5">
                      <span>{order?.order?.payment?.title || noData}</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex gap-2 ">
                      {order?.order?.line_items
                        .slice(0, 3)
                        .map((item: LineItem, index: number) => (
                          <div key={index} className="flex items-center ">
                            <div className="w-16 h-16 relative cursor-pointer">
                              <Image
                                src={
                                  item?.product_id?.featured_image?.src
                                    ? item?.product_id?.featured_image?.src
                                    : NodataImg
                                }
                                alt={item?.product_id?._id}
                                className="rounded"
                                title={item.title}
                                width={90}
                                height={20}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageClick(
                                    item?.product_id?.featured_image?.src
                                  );
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </Td>
                  <Td>
                    <div
                      className={`${getStatusStyle(
                        order?.order?.status
                      )} min-w-20 max-w-40 text-center`}
                    >
                      {order?.order?.status}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap">
                      <span className="min-w-10 text-md font-semibold text-gray-600 dark:text-gray-300">
                        Total
                      </span>
                      <span className="text-md font-semibold text-gray-600 dark:text-gray-300">
                        {" "}
                        : ৳ {order?.order?.total || noData}
                      </span>
                    </div>
                    <div className="flex flex-wrap mt-1.5">
                      <span className="min-w-10 text-md font-semibold text-gray-600 dark:text-gray-300">
                        Due
                      </span>
                      <span className="text-md font-semibold text-gray-600 dark:text-gray-300">
                        {" "}
                        : ৳ {order?.order?.due || noData}
                      </span>
                    </div>
                  </Td>

                  <Td>
                    <div className="flex flex-wrap">
                      {order?.error_message || noData}
                    </div>
                    <div className="flex flex-wrap">
                      {order?.consignment_id || noData}
                    </div>
                  </Td>

                  <Td>
                    <div className="relative max-w-40">
                      <Icon
                        name={`${order?.consignment_id && "done_all"}`}
                        className={`${
                          order?.consignment_id && "text-green-600"
                        }`}
                      />
                    </div>
                  </Td>
                  <Td>
                    {hasPermission(permissionList, "order_edit")}
                    <div className="relative max-w-40">
                      <Icon
                        name={"more_horiz"}
                        variant="outlined"
                        onClick={() => togglePopup(index)}
                        className="cursor-pointer"
                      />
                      {popupIndex === index && (
                        <div
                          ref={popupRef}
                          className="absolute top-8 right-0 bg-white border dark:bg-gray-700 dark:border-gray-500 shadow-md rounded-lg p-2 z-20 min-w-40"
                        >
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/orders/edit/${String(order?.order?._id)}`
                              )
                            }
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-600"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default BookingCouriersTable;
