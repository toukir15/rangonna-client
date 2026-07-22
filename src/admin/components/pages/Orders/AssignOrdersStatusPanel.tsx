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

const readSavedWebsiteDomain = (): string => {
  if (typeof window === "undefined") return "all";
  const saved = localStorage.getItem("selectedWebsite");
  if (!saved) return "all";
  try {
    const parsed = JSON.parse(saved);
    return parsed?.value || "all";
  } catch {
    return "all";
  }
};

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
        domain: readSavedWebsiteDomain(),
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
        className="min-h-[700px]"
        colValue={8}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300">
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
              Order ID
            </Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
              Customer Info
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200">
              Products
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 ps-10">
              Status
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
              Total & Due
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 text-blue-900 dark:text-gray-200 !text-nowrap">
              Customer Note & Note
            </Th>
            <Th className="text-blue-900 dark:text-gray-200 min-w-40 ps-8">
              View
            </Th>
            <Th className="text-blue-900 dark:text-gray-200">Actions</Th>
          </Tr>
        </Thead>

        <Tbody className="dark:bg-gray-800 bg-white">
          {orders.map((order: any, index: number) => (
            <Tr
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              key={String(order?._id || index)}
            >
              <Td>
                <div className="flex text-base font-bold items-center text-nowrap">
                  <span>{order?.sysid || noData}</span>
                  <Icon
                    size={16}
                    name="content_copy"
                    variant="outlined"
                    className="ml-2 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(String(order?.sysid ?? ""));
                      ToastService.success("Order ID copied to clipboard!");
                    }}
                  />
                </div>
                <div className="mt-0.5">
                  <span>{getWebName(order?.domain) || noData}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-nowrap min-w-32">
                  <Icon name="calendar_month" size={20} variant="outlined" />
                  <span>
                    {formatTimeAgo(order?.createdAt || order?.order_created) ||
                      noData}
                  </span>
                </div>
              </Td>

              <Td>
                <div className="text-base font-bold">
                  <span>
                    {order?.customer?.first_name}
                    {order?.customer?.last_name}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <a href={`tel:${order?.customer?.phone}`}>
                    {order?.customer?.phone}
                  </a>
                  <Icon
                    onClick={() => copyToClipboard(order?.customer?.phone)}
                    name="content_copy"
                    size={16}
                    className="ml-2 cursor-pointer"
                  />
                  <FontAwesomeIcon
                    icon={faWhatsapp}
                    className="ml-2 cursor-pointer text-green-500"
                    onClick={() =>
                      window.open(
                        `https://web.whatsapp.com/send?phone=88${String(
                          order?.customer?.phone || "",
                        ).replace(/\D/g, "")}`,
                        "_blank",
                      )
                    }
                  />
                </div>
                <div className="mt-0.5 text-nowrap">
                  <span>{order?.payment?.title || noData}</span>
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
                <div className="flex flex-wrap">
                  <span className="min-w-10 text-md font-semibold text-gray-600 dark:text-gray-300">
                    Total
                  </span>
                  <span className="text-md font-semibold text-gray-600 dark:text-gray-300">
                    : ৳ {order?.total || 0}
                  </span>
                </div>
                <div className="flex flex-wrap mt-1.5">
                  <span className="min-w-10 text-md font-semibold text-gray-600 dark:text-gray-300">
                    Due
                  </span>
                  <span className="text-md font-semibold text-gray-600 dark:text-gray-300">
                    : ৳ {order?.due || 0}
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
                  className="bg-blue-500 px-4 py-1 rounded-lg text-white text-center w-20 cursor-pointer"
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

              <Td>
                <div className="relative max-w-40">
                  <Icon
                    name="more_horiz"
                    variant="outlined"
                    onClick={() =>
                      setPopupIndex(popupIndex === index ? null : index)
                    }
                    className="cursor-pointer"
                  />
                  {popupIndex === index && (
                    <div
                      ref={popupRef}
                      className="absolute top-8 right-0 bg-white dark:bg-gray-700 border shadow-md rounded-lg p-2 z-20 min-w-40"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/orders/edit/${String(order?._id)}`)
                        }
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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
        isShowText={false}
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
