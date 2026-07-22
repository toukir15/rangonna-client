/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusStyle } from "@admin/utils/system.utils";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Button from "@admin/components/core/Button/Button";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { CourierPathaoContext } from "@/app/admin/couriers/report/page";
import { PathaoBooking } from "@admin/@interfaces/couriers/report.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";

const PathaoTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    pathaoList,
    tableLoading,
    isCheck,
    handleSelectAll,
    selectedOrders,
    handleSelectOrder,
    setModalOpen,
    setOrderId,
    fetchPathaoList,
  } = useContext(CourierPathaoContext);

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const [loadingFix, setLoadingFix] = useState<Record<string, boolean>>({});

  const handleUpdateDelivery = async (sysid: string) => {
    setLoadingStates((prev) => ({ ...prev, [sysid]: true }));
    OrdersService.statusUpdateReportDelivery(sysid)

      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchPathaoList();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setLoadingStates((prev) => ({ ...prev, [sysid]: false }));
      });
  };

  const handleFixIt = async (sysid: string) => {
    setLoadingFix((prev) => ({ ...prev, [sysid]: true }));
    OrdersService.statusFixDelivery(sysid)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchPathaoList();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setLoadingFix((prev) => ({ ...prev, [sysid]: false }));
      });
  };

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
            <Th>
              <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-44 text-blue-900 dark:text-gray-200">
              Order ID
            </Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
              Consignment ID
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-44 text-blue-900 dark:text-gray-200 text-nowrap">
              Courier Status
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-48 text-blue-900 dark:text-gray-200 text-nowrap">
              Order Status
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
              Reason
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 text-nowrap">
              Cod & Collected
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200 text-nowrap">
              Invoice & Payment
            </Th>
            <Th className="text-blue-900 dark:text-gray-200 text-nowrap">
              Error
            </Th>
            <Th className="text-blue-900 dark:text-gray-200 text-nowrap">
              Err Action
            </Th>

            <Th className="text-blue-900 dark:text-gray-200">Action</Th>
            <Th className="text-blue-900 dark:text-gray-200">Delivery</Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {pathaoList &&
            pathaoList?.map((order: PathaoBooking, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>
                    <TableCheckbox
                      checked={selectedOrders?.includes(
                        order?.order_sysid?.toString(),
                      )}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() =>
                        handleSelectOrder(order?.order_sysid?.toString())
                      }
                    />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap text-base font-bold">
                      <span>{order?.order_sysid}</span>
                    </div>
                    <div className="mt-0.5">
                      <span>{formatTimeAgo(new Date(order?.createdAt))}</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="text-base font-semibold">
                      <p>{order?.consignment_id}</p>
                      <p>
                        {order?.order_created
                          ? formatTimeAgo(order?.order_created)
                          : ""}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    <div
                      className={`${getStatusStyle(
                        order?.delivery_status,
                      )} min-w-20 max-w-40 text-center uppercase`}
                    >
                      {order?.delivery_status}
                    </div>
                    <div className="pt-1">
                      <p> {formatTimeAgo(order?.updatedAt)}</p>
                    </div>
                  </Td>
                  <Td>
                    <div
                      className={`${getStatusStyle(
                        order?.order?.status,
                      )} min-w-20 max-w-40 text-center uppercase px-4`}
                    >
                      {order?.order?.status}
                    </div>
                  </Td>
                  <Td>{order?.reason}</Td>
                  <Td>
                    <div className="">
                      <p>COD- {order?.cod}</p>
                      <p className="mt-2">Cld-{order?.collected_amount}</p>
                      <p>Fee-{order?.delivery_fee}</p>
                    </div>
                  </Td>
                  <Td>
                    <div>
                      <p>{order?.invoice_id}</p>
                      <p className="mt-2 uppercase">{order?.payment_status}</p>
                    </div>
                  </Td>

                  <Td>{order?.error_message}</Td>
                  <Td>
                    {permissionList.includes("courier_report_edit") &&
                      order?.is_error === true && (
                        <Button
                          className="!py-1 !px-3 !text-xs bg-red-500 !w-20"
                          onClick={() => handleFixIt(order?.order?._id)}
                        >
                          {loadingFix[order?.order?._id] ? (
                            <ButtonLoader />
                          ) : (
                            "Fix it"
                          )}
                        </Button>
                      )}
                  </Td>

                  <Td>
                    <Icon
                      onClick={() => {
                        setModalOpen(true);
                        setOrderId(order?.order?._id);
                      }}
                      name={"visibility"}
                      variant="outlined"
                      className="cursor-pointer"
                    />
                  </Td>
                  <Td>
                    {permissionList.includes("order_order_delivery") &&
                      [
                        "delivered",
                        "exchanged",
                        "assigned-for-delivery",
                      ].includes(order?.delivery_status) &&
                      order?.order?.status !== "delivery" && (
                        <Button
                          className="!py-1 !px-3 !text-xs bg-blue-500 !w-20"
                          onClick={() =>
                            handleUpdateDelivery(order?.order?._id)
                          }
                        >
                          {loadingStates[order?.order?._id] ? (
                            <ButtonLoader />
                          ) : (
                            "Delivery"
                          )}
                        </Button>
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

export default PathaoTable;
