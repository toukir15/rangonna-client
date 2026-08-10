"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusLabel, getStatusStyle } from "@admin/utils/system.utils";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { CourierPathaoContext } from "@/app/admin/couriers/report/page";
import { PathaoBooking } from "@admin/@interfaces/couriers/report.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { noData } from "@admin/utils";

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
        className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
        colValue={12}
      >
        <Thead>
          <Tr>
            <Th className="is-center">
              <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Order ID</Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Consignment ID</Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-36 !text-nowrap">
              Courier Status
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-36 !text-nowrap">
              Order Status
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Reason</Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 !text-nowrap">
              Cod & Collected
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 !text-nowrap">
              Invoice & Payment
            </Th>
            <Th>Error</Th>
            <Th className="!text-nowrap">Err Action</Th>
            <Th className="is-center">Action</Th>
            <Th className="is-right">Delivery</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pathaoList?.map((order: PathaoBooking, index: number) => {
            const orderId = order?.order?._id;

            return (
              <Tr key={order?.order_sysid ?? index}>
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
                  <div className="table-user-info">
                    <span className="table-id-chip">
                      {order?.order_sysid || noData}
                    </span>
                    <span className="table-date-cell">
                      <Icon
                        name="calendar_today"
                        size={14}
                        variant="outlined"
                      />
                      {formatTimeAgo(new Date(order?.createdAt)) || noData}
                    </span>
                  </div>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="data-table-primary">
                      {order?.consignment_id || noData}
                    </span>
                    {order?.order_created ? (
                      <span className="table-date-cell">
                        <Icon
                          name="calendar_today"
                          size={14}
                          variant="outlined"
                        />
                        {formatTimeAgo(order?.order_created)}
                      </span>
                    ) : null}
                  </div>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className={getStatusStyle(order?.delivery_status)}>
                      {getStatusLabel(order?.delivery_status)}
                    </span>
                    <span className="data-table-muted">
                      {formatTimeAgo(order?.updatedAt) || noData}
                    </span>
                  </div>
                </Td>

                <Td>
                  <span className={getStatusStyle(order?.order?.status)}>
                    {getStatusLabel(order?.order?.status)}
                  </span>
                </Td>

                <Td>
                  <span className="data-table-muted">
                    {order?.reason || noData}
                  </span>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="table-amount">COD: ৳ {order?.cod ?? 0}</span>
                    <span className="data-table-secondary">
                      Cld: ৳ {order?.collected_amount ?? 0}
                    </span>
                    <span className="data-table-muted">
                      Fee: ৳ {order?.delivery_fee ?? 0}
                    </span>
                  </div>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="data-table-primary">
                      {order?.invoice_id || noData}
                    </span>
                    <span
                      className={`table-role-badge ${
                        order?.payment_status === "paid"
                          ? "is-approved"
                          : "is-rejected"
                      }`}
                    >
                      {order?.payment_status || noData}
                    </span>
                  </div>
                </Td>

                <Td>
                  <span className="data-table-muted">
                    {order?.error_message || noData}
                  </span>
                </Td>

                <Td>
                  {permissionList.includes("courier_report_edit") &&
                  order?.is_error === true ? (
                    <button
                      type="button"
                      className="inline-flex h-8 min-w-[4.5rem] items-center justify-center rounded-lg bg-[var(--color-danger,#dc2626)] px-3 text-xs font-semibold text-white transition hover:opacity-90"
                      onClick={() => handleFixIt(orderId)}
                    >
                      {loadingFix[orderId] ? <ButtonLoader /> : "Fix it"}
                    </button>
                  ) : (
                    <span className="table-empty-value">—</span>
                  )}
                </Td>

                <Td className="is-center">
                  <button
                    type="button"
                    className="data-table-view-btn"
                    onClick={() => {
                      setModalOpen(true);
                      setOrderId(orderId);
                    }}
                  >
                    <Icon name="visibility" variant="outlined" size={14} />
                    View
                  </button>
                </Td>

                <Td className="is-right">
                  {permissionList.includes("order_order_delivery") &&
                  [
                    "delivered",
                    "exchanged",
                    "assigned-for-delivery",
                  ].includes(order?.delivery_status) &&
                  order?.order?.status !== "delivery" ? (
                    <button
                      type="button"
                      className="btn-primary btn-primary-inline inline-flex h-8 min-w-[5rem] items-center justify-center !px-3 !text-xs"
                      onClick={() => handleUpdateDelivery(orderId)}
                    >
                      {loadingStates[orderId] ? <ButtonLoader /> : "Delivery"}
                    </button>
                  ) : (
                    <span className="table-empty-value">—</span>
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
