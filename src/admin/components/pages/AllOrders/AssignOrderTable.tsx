import React, { useEffect, useRef, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusStyle } from "@admin/utils/system.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import { getWebName, noData } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { useRouter } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";

import { formatTimeAgo } from "@admin/utils/hook.utils";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { OrderAssignmentService } from "@admin/@services/apis/OrdersService/OrderAssignment.service";

const AssignOrderTable: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  const router = useRouter();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadQueue = async () => {
      setTableLoading(true);
      try {
        const res = await OrderAssignmentService.getMyQueue({
          page: 1,
          limit: 50,
          sort: "-createdAt",
        });
        if (cancelled) return;
        if (res?.success) {
          const list = res?.data?.data ?? res?.data ?? [];
          setAssignedOrders(Array.isArray(list) ? list : []);
        } else {
          ToastService.error(res?.message || "Failed to load assigned orders");
        }
      } catch (err: any) {
        if (!cancelled) {
          ToastService.error(err?.message || "Failed to load assigned orders");
        }
      } finally {
        if (!cancelled) setTableLoading(false);
      }
    };
    loadQueue();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      ToastService.success("Number copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
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

  return (
    <div className="xl:mt-3 mt-2">
      <TableWrapper
        showCheckbox={true}
        data={assignedOrders}
        noDataViewCondition={
          assignedOrders?.length < 1 ? "No data available" : null
        }
        isSwitchOn={true}
        isLoading={tableLoading}
        className="min-h-[700px]"
        colValue={9}
        printLabel="Label Print"
        orderListPrintBtn={true}
        orderInvoicePrintBtn={true}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
              Order ID
            </Th>
            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
              Customer Info
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
              Products
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200 ps-10">
              Status
            </Th>
            <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 dark:text-gray-200">
              Total & Due
            </Th>
            <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200 !text-nowrap">
              Customer Note & Note
            </Th>
            <Th className="dark:text-gray-200 min-w-40 ps-8">
              View
            </Th>
            <Th className="dark:text-gray-200">Actions</Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {assignedOrders?.map((order: any, index: number) => {
            return (
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
                        navigator.clipboard.writeText(
                          String(order?.sysid ?? "")
                        );
                        ToastService.success("Order ID copied to clipboard!");
                      }}
                    />
                  </div>
                  <div className="mt-0.5">
                    <span>{getWebName(order?.domain) || noData}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-nowrap min-w-32">
                    <Icon
                      name={"calendar_month"}
                      size={20}
                      variant="outlined"
                    />
                    <span>{formatTimeAgo(order?.createdAt) || noData}</span>
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
                            order?.customer?.phone || ""
                          ).replace(/\D/g, "")}`,
                          "_blank"
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
                      order?.status
                    )} min-w-20 max-w-40 text-center`}
                  >
                    {order?.status === "ready-for-box"
                      ? "R-D"
                      : order?.status === "waiting-payment"
                      ? "To be Paid"
                      : order?.status}
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
                    className="data-table-view-btn"
                    onClick={() => {
                      if (order?.status) {
                        localStorage.setItem("viewOrderStatus", order.status);
                      }

                      const idStr = String(order?._id);
                      if (idStr) {
                        router.push(`/admin/orders/view/${idStr}`);
                      }
                    }}
                  >
                    View
                  </div>
                </Td>
                <Td>
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
                        className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-2 z-20 min-w-40"
                      >
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/orders/edit/${String(order?._id)}`
                            )
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
            );
          })}
        </Tbody>
      </TableWrapper>

      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default AssignOrderTable;
