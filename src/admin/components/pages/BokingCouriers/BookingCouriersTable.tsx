"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusLabel, getStatusStyle } from "@admin/utils/system.utils";
import { getWebName, noData, trimString } from "@admin/utils";
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
import { ToastService } from "@admin/utils/toastr.service";

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

  const copyToClipboard = async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      ToastService.success(label);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div>
      <TableWrapper
        showCheckbox={true}
        data={orderList}
        noDataViewCondition={orderList?.length < 1 ? "No data available" : null}
        isSwitchOn={true}
        isLoading={tableLoading}
        className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
        colValue={10}
      >
        <Thead>
          <Tr>
            <Th className="is-center">
              <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Order ID</Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Customer Info</Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Products</Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Status</Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Total & Due</Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 !text-nowrap">
              Customer Note & Note
            </Th>
            <Th className="is-center min-w-28">Courier Status</Th>
            <Th className="is-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orderList?.map((order: PathaoBooking, index: number) => {
            const phone = order?.order?.customer?.phone;
            const orderSysId = String(order?.order_sysid ?? "");

            return (
              <Tr key={order?.order?._id ?? index}>
                <Td>
                  <TableCheckbox
                    checked={selectedOrders.includes(order?.order?._id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleSelectOrder(order?.order?._id)}
                  />
                </Td>

                <Td>
                  <div className="table-user-info">
                    <div className="table-id-row">
                      <span className="table-id-chip">
                        {order?.order_sysid || noData}
                      </span>
                      {orderSysId && (
                        <button
                          type="button"
                          className="table-copy-btn"
                          aria-label="Copy order ID"
                          title="Copy order ID"
                          onClick={() =>
                            copyToClipboard(
                              orderSysId,
                              "Order ID copied to clipboard!",
                            )
                          }
                        >
                          <Icon
                            size={13}
                            name="content_copy"
                            variant="outlined"
                          />
                        </button>
                      )}
                    </div>
                    <p className="data-table-muted">
                      {getWebName(order?.order?.domain) || noData}
                    </p>
                    <span className="table-date-cell">
                      <Icon
                        name="calendar_today"
                        size={13}
                        variant="outlined"
                      />
                      {formatTimeAgo(new Date(order?.createdAt)) || noData}
                    </span>
                  </div>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="data-table-primary">
                      {trimString(order?.order?.customer?.first_name, 50)}{" "}
                      {order?.order?.customer?.last_name}
                    </span>
                    {phone ? (
                      <span className="table-contact-line">
                        <Icon name="call" size={14} variant="outlined" />
                        <a href={`tel:${phone}`}>{phone}</a>
                        <button
                          type="button"
                          className="table-copy-btn"
                          aria-label="Copy phone number"
                          title="Copy phone number"
                          onClick={() =>
                            copyToClipboard(
                              phone,
                              "Number copied to clipboard!",
                            )
                          }
                        >
                          <Icon
                            name="content_copy"
                            size={13}
                            variant="outlined"
                          />
                        </button>
                      </span>
                    ) : (
                      <span className="data-table-muted">{noData}</span>
                    )}
                    <span className="data-table-muted">
                      {order?.order?.payment?.title || noData}
                    </span>
                  </div>
                </Td>

                <Td>
                  <div className="table-product-thumbs">
                    {order?.order?.line_items
                      ?.slice(0, 3)
                      ?.map((item: LineItem, itemIndex: number) => {
                        const src =
                          item?.product_id?.featured_image?.src || NodataImg;

                        return (
                          <button
                            key={itemIndex}
                            type="button"
                            className="table-product-thumb"
                            title={item?.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (typeof src === "string") {
                                handleImageClick(src);
                              }
                            }}
                          >
                            <Image
                              src={src}
                              quality={70}
                              alt={item?.title || "Product Image"}
                              width={120}
                              height={108}
                            />
                          </button>
                        );
                      })}
                  </div>
                </Td>

                <Td>
                  <span className={getStatusStyle(order?.order?.status)}>
                    {getStatusLabel(order?.order?.status)}
                  </span>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="table-amount">
                      <span className="table-amount-label">Total</span>
                      ৳ {order?.order?.total || 0}
                    </span>
                    <span
                      className={`table-role-badge ${
                        Number(order?.order?.due) > 0
                          ? "is-rejected"
                          : "is-approved"
                      }`}
                    >
                      Due: ৳ {order?.order?.due || 0}
                    </span>
                  </div>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="data-table-muted">
                      {trimString(order?.error_message, 100) || noData}
                    </span>
                    <span className="data-table-secondary">
                      {order?.consignment_id || noData}
                    </span>
                  </div>
                </Td>

                <Td className="is-center">
                  {order?.consignment_id ? (
                    <span className="table-courier-status" title="Booked">
                      <Icon name="done_all" variant="filled" size={16} />
                    </span>
                  ) : (
                    <span className="table-empty-value">—</span>
                  )}
                </Td>

                <Td className="is-right">
                  <div className="relative max-w-40">
                    <button
                      type="button"
                      className="data-table-action-btn"
                      aria-expanded={popupIndex === index}
                      onClick={() => togglePopup(index)}
                    >
                      <Icon name="more_vert" variant="outlined" size={18} />
                    </button>

                    {popupIndex === index && (
                      <div
                        ref={popupRef}
                        className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                      >
                        {permissionList.includes("order_edit") && (
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/orders/edit/${String(order?.order?._id)}`,
                              )
                            }
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                          >
                            Edit
                          </button>
                        )}
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
