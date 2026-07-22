/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useRef, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Icon from "@admin/components/core/Icon/Icon";
import { WholeSaleUserContext } from "@/app/admin/wholesale/user/page";
import { WholesaleUser } from "@admin/@interfaces/wholesale/wholesaleUser.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";

const WholeSaleTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    pathaoList,
    tableLoading,
    handleStatus,
    setIsModalOpen,
    setOrder,
    // handleCreatePayment,
  } = useContext(WholeSaleUserContext);

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

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  return (
    <div>
      <TableWrapper
        showCheckbox={true}
        data={pathaoList}
        noDataViewCondition={
          pathaoList?.length < 1 ? "No data available" : null
        }
        isSwitchOn={true}
        isLoading={tableLoading}
        className="min-h-[700px]"
        colValue={12}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-44 text-blue-900 dark:text-gray-200">
              User Details
            </Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
              Company
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-44 text-blue-900 dark:text-gray-200 text-nowrap">
              Payment
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-48 text-blue-900 dark:text-gray-200 text-nowrap">
              Location
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
              Tier
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 text-nowrap">
              Status
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 text-nowrap">
              Payment Method
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200 text-nowrap">
              Registered
            </Th>
            <Th className="text-blue-900 dark:text-gray-200 2xl:min-w-32 lg:min-w-28 min-w-32">
              Status Action
            </Th>
            <Th className="text-blue-900 dark:text-gray-200">Action</Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {pathaoList &&
            pathaoList?.map((order: WholesaleUser, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>
                    <div className=" ">
                      <p className="text-base font-bold">{order?.name}</p>
                      <p className="text-base font-semibold pt-1">
                        {order?.email}
                      </p>
                      <p className="text-base font-semibold pt-1">
                        {order?.phone}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    <div className="text-base font-semibold">
                      <p>{order?.business?.company_name}</p>
                      <p>{order?.business?.trade_license}</p>
                    </div>
                  </Td>
                  <Td>
                    <p
                      className={` text-center rounded-md py-0.5 ${
                        order?.is_payment_verified === true
                          ? "bg-green-200 text-green-600"
                          : "bg-yellow-200 text-yellow-600"
                      }`}
                    >
                      {order?.is_payment_verified === true ? "Paid" : "Unpaid"}
                    </p>
                  </Td>
                  <Td>
                    <div>{order?.address?.full_address}</div>
                  </Td>
                  <Td>{order?.tier}</Td>
                  <Td>
                    <div
                      className={`mt-2 uppercase px-3 py-1 rounded-md  inline-block ${
                        order?.active_status === "pending"
                          ? "bg-yellow-100 text-yellow-600 border border-yellow-300"
                          : order?.active_status === "approved"
                          ? "bg-green-100 text-green-500 border border-green-300"
                          : order?.active_status === "rejected"
                          ? "bg-red-100 text-red-600 border border-red-300"
                          : "bg-gray-100 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {order?.active_status}
                    </div>
                  </Td>
                  <Td>
                    <div className="mt-0.5">
                      {order.payment_methods.join(", ")}
                    </div>
                  </Td>
                  <Td>
                    <div className="mt-0.5">
                      <span>{formatTimeAgo(new Date(order?.createdAt))}</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2 mt-0.5">
                      {order?.active_status === "pending" && (
                        <>
                          <button
                            className="px-3 py-1 text-xs rounded-md bg-green-500 hover:bg-green-600 text-white transition"
                            onClick={() => handleStatus(order?._id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1 text-xs rounded-md bg-red-500 hover:bg-red-600 text-white transition"
                            onClick={() => handleStatus(order?._id, "rejected")}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {permissionList.includes("wholesale_user_edit") && (
                        <>
                          {order?.active_status === "approved" && (
                            <button
                              className="px-3 py-1 text-xs rounded-md bg-red-500 hover:bg-red-600 text-white transition"
                              onClick={() =>
                                handleStatus(order?._id, "rejected")
                              }
                            >
                              Reject
                            </button>
                          )}

                          {order?.active_status === "rejected" && (
                            <button
                              className="px-3 py-1 text-xs rounded-md bg-green-500 hover:bg-green-600 text-white transition"
                              onClick={() =>
                                handleStatus(order?._id, "approved")
                              }
                            >
                              Approve
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </Td>

                  <Td className="">
                    {permissionList.includes("wholesale_user_edit") && (
                      <div className="relative">
                        <Icon
                          name={"more_horiz"}
                          variant="outlined"
                          onClick={() => togglePopup(index)}
                          className="cursor-pointer"
                        />
                        {popupIndex === index && (
                          <div
                            ref={popupRef}
                            className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                          >
                            <button
                              className="block w-52 text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg "
                              onClick={() => {
                                setIsModalOpen(true);
                                setOrder(order);
                              }}
                            >
                              Update Info
                            </button>
                            {/* <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleCreatePayment(order)}
                            >
                              Create Payment
                            </button> */}
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              //   onClick={() => handleRemove(data?._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default WholeSaleTable;
