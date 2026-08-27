"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Icon from "@admin/components/core/Icon/Icon";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { getWebName, noData } from "@admin/utils";
import { formatDateRange, formatTimeAgo } from "@admin/utils/hook.utils";
import { getStatusStyle } from "@admin/utils/system.utils";
import { ToastService } from "@admin/utils/toastr.service";
import { maxRange } from "@admin/utils/helper";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";

const DEFAULT_DATE_RANGE = {
  ...maxRange(),
  label: "Max",
};

const ORDER_LIST_FIELDS =
  "_id,createdAt,label,customer.first_name,customer.last_name,customer.phone,note.text,due,is_print,line_items.image,line_items.stock_status,order_created,note.text,order_id,payment.title,status,total,sysid,domain,customer_note.text,notes.text,line_items.title,line_items.quantity,line_items.total,order_created";

export type AssignStatusFilter = "waiting-payment" | "follow-up" | "recall";

interface AssignOrdersStatusPanelProps {
  status: AssignStatusFilter;
}

const AssignOrdersStatusPanel: React.FC<AssignOrdersStatusPanelProps> = ({
  status,
}) => {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const fetchOrdersList = useCallback(async () => {
    setTableLoading(true);
    const formattedFrom = formatDateRange(DEFAULT_DATE_RANGE.startDate).trim();
    const formattedTo = formatDateRange(DEFAULT_DATE_RANGE.endDate).trim();

    try {
      const res = await OrdersService.getOrders({
        page: currentPage,
        limit: ordersPerPage,
        status,
        domain: "all",
        startDate: formattedFrom,
        endDate: formattedTo,
        dateFilter: "createdAt",
        source: "all",
        fields: ORDER_LIST_FIELDS,
      });

      if (res?.success) {
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setOrders(list);
        setTotalOrders(res?.data?.meta?.total_record ?? list.length);
      } else {
        setOrders([]);
        setTotalOrders(0);
        ToastService.error(res?.message || "Failed to load orders");
      }
    } catch (err: any) {
      setOrders([]);
      setTotalOrders(0);
      ToastService.error(err?.message || "Failed to load orders");
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, ordersPerPage, status]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

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
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      ToastService.success("Number copied to clipboard!");
    } catch {
      ToastService.error("Failed to copy number");
    }
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const handleOrdersPerPageChange = (newOrdersPerPage: number) => {
    setOrdersPerPage(newOrdersPerPage);
    setCurrentPage(1);
  };

  const getStatusLabel = (orderStatus?: string) => {
    if (orderStatus === "ready-for-box") return "R-D";
    if (orderStatus === "waiting-payment") return "To be Paid";
    if (orderStatus === "follow-up") return "Follow Up";
    if (orderStatus === "recall") return "Recall";
    return orderStatus || noData;
  };

  return (
    <>
      <TableWrapper
        data={orders}
        noDataViewCondition={orders?.length < 1 ? "No data available" : null}
        isSwitchOn={true}
        isLoading={tableLoading}
        className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
        colValue={8}
      >
        <Thead>
          <Tr>
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Order ID</Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Customer Info</Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Products</Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Status</Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Total & Due</Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 !text-nowrap">
              Customer Note & Note
            </Th>
            <Th className="is-center min-w-40">View</Th>
            <Th className="is-right">Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {orders.map((order: any, index: number) => (
            <Tr key={String(order?._id || index)}>
              <Td>
                <div className="table-user-info">
                  <div className="table-id-row">
                    <span className="table-id-chip">
                      {order?.sysid || noData}
                    </span>
                    <button
                      type="button"
                      className="table-copy-btn"
                      aria-label="Copy order ID"
                      title="Copy order ID"
                      onClick={() => {
                        navigator.clipboard.writeText(String(order?.sysid ?? ""));
                        ToastService.success("Order ID copied to clipboard!");
                      }}
                    >
                      <Icon size={13} name="content_copy" variant="outlined" />
                    </button>
                  </div>
                  <p className="data-table-muted">
                    {getWebName(order?.domain) || noData}
                  </p>
                  <span className="table-date-cell">
                    <Icon name="calendar_today" size={13} variant="outlined" />
                    {formatTimeAgo(order?.createdAt || order?.order_created) ||
                      noData}
                  </span>
                </div>
              </Td>

              <Td>
                <div className="table-contact-stack">
                  <span className="data-table-primary">
                    {order?.customer?.first_name}
                    {order?.customer?.last_name}
                  </span>
                  <span className="table-contact-line">
                    <Icon name="call" size={14} variant="outlined" />
                    <a href={`tel:${order?.customer?.phone}`}>
                      {order?.customer?.phone}
                    </a>
                    <button
                      type="button"
                      className="table-copy-btn"
                      aria-label="Copy phone number"
                      title="Copy phone number"
                      onClick={() => copyToClipboard(order?.customer?.phone)}
                    >
                      <Icon name="content_copy" size={13} variant="outlined" />
                    </button>
                    <FontAwesomeIcon
                      icon={faWhatsapp}
                      className="ml-1 cursor-pointer text-green-500"
                      onClick={() =>
                        window.open(
                          `https://web.whatsapp.com/send?phone=88${String(
                            order?.customer?.phone || "",
                          ).replace(/\D/g, "")}`,
                          "_blank",
                        )
                      }
                    />
                  </span>
                  <span className="data-table-muted">
                    {order?.payment?.title || noData}
                  </span>
                </div>
              </Td>

              <Td>
                <div className="flex gap-2">
                  {order?.line_items
                    ?.slice(0, 3)
                    ?.map((item: any, itemIndex: number) => {
                      const src = item?.product_id?.featured_image?.src;
                      return (
                        <div key={itemIndex} className="flex items-center">
                          <div className="w-16 h-12 relative cursor-pointer">
                            <Image
                              src={src || ""}
                              quality={50}
                              alt={item?.title || "Product Image"}
                              className="rounded"
                              title={item?.title}
                              width={90}
                              height={20}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (typeof src === "string")
                                  handleImageClick(src);
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Td>

              <Td>
                <div
                  className={`${getStatusStyle(
                    order?.status,
                  )} min-w-20 max-w-40 text-center`}
                >
                  {getStatusLabel(order?.status)}
                </div>
              </Td>

              <Td>
                <div className="table-contact-stack">
                  <span className="table-amount">
                    <span className="table-amount-label">Total</span>
                    ৳ {order?.total || 0}
                  </span>
                  <span
                    className={`table-role-badge ${
                      Number(order?.due) > 0 ? "is-rejected" : "is-approved"
                    }`}
                  >
                    Due: ৳ {order?.due || 0}
                  </span>
                </div>
              </Td>

              <Td>
                <div className="flex flex-wrap">
                  {Array.isArray(order?.notes) && order.notes.length > 0
                    ? order.notes[order.notes.length - 1]?.text
                    : noData}
                </div>
                <div className="flex flex-wrap">
                  {order?.customer_note?.text || noData}
                </div>
              </Td>

              <Td>
                <div
                  className="data-table-view-btn"
                  onClick={() => {
                    if (order?.status) {
                      localStorage.setItem("viewOrderStatus", order.status);
                    }
                    const idStr = String(order?._id);
                    if (idStr) router.push(`/admin/orders/view/${idStr}`);
                  }}
                >
                  View
                </div>
              </Td>

              <Td className="is-right">
                <div className="relative max-w-40">
                  <button
                    type="button"
                    className="data-table-action-btn"
                    aria-expanded={popupIndex === index}
                    onClick={() =>
                      setPopupIndex(popupIndex === index ? null : index)
                    }
                  >
                    <Icon name="more_vert" variant="outlined" size={18} />
                  </button>
                  {popupIndex === index && (
                    <div
                      ref={popupRef}
                      className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/admin/orders/edit/${String(order?._id)}`)
                        }
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableWrapper>

      <PaginationComponent
        ordersPerPage={ordersPerPage}
        handleOrdersPerPageChange={handleOrdersPerPageChange}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalData={totalOrders}
        isShowText={true}
        showRefresh={false}
        className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
      />

      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </>
  );
};

export default AssignOrdersStatusPanel;
