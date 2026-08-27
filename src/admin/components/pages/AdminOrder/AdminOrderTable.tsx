import React, { useContext, useEffect, useRef, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusStyle } from "@admin/utils/system.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Image from "next/image";
import notFoundImage from "@admin/assets/images/Image-not-found.png";
import { getWebName, noData } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { useRouter } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { AdminOrderListContext } from "@/app/admin/admin-orders/page";
import Link from "next/link";

const AdminOrderTable: React.FC = () => {
  const {
    orderList,
    tableLoading,
    selectedOrders,
    handleListPrintSelected,
    handleOrderPrintSelected,
    selectedAction,
    setSelectedAction,
    handleOrderInvoicePrint,
    // handleBalkUpdate,
    statusSubmitting,
    isCheck,
    handleSelectAll,
    handleSelectOrder,
    handleImageClick,
    filter,
    handleDelivery,
  } = useContext(AdminOrderListContext);

  const router = useRouter();
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      ToastService.success("Number copied to clipboard!");
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
        isSelect={selectedOrders?.length > 0}
        handleListPrintSelected={handleListPrintSelected}
        handleOrderPrintSelected={handleOrderPrintSelected}
        className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
        colValue={11}
        printLabel="Label Print"
        selectedAction={selectedAction}
        setSelectedAction={setSelectedAction}
        handleOrderInvoicePrint={handleOrderInvoicePrint}
        // handleBulkAction={handleBalkUpdate}
        statusSubmitting={statusSubmitting}
        orderListPrintBtn={true}
        orderInvoicePrintBtn={true}
        bulkActionBtn={true}
        openBulk={filter === "ready-for-box"}
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
            <Th className="is-center min-w-40">View</Th>
            <Th className="is-center min-w-20 !text-nowrap">Delivery</Th>
            <Th className="is-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orderList?.map((order: any, index: number) => {
            const orderIdStr = String(order?._id);

            return (
              <Tr key={index}>
                <Td>
                  <TableCheckbox
                    checked={selectedOrders.includes(orderIdStr)}
                    onChange={() => handleSelectOrder(orderIdStr)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Td>
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
                          navigator.clipboard.writeText(
                            String(order?.sysid ?? ""),
                          );
                          ToastService.success("Order ID copied to clipboard!");
                        }}
                      >
                        <Icon
                          size={13}
                          name="content_copy"
                          variant="outlined"
                        />
                      </button>
                    </div>
                    <p className="data-table-muted">
                      {getWebName(order?.domain) || noData}
                    </p>
                    <span className="table-date-cell">
                      <Icon name="calendar_today" size={13} variant="outlined" />
                      {formatTimeAgo(order?.createdAt) || noData}
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
                        <Icon
                          name="content_copy"
                          size={13}
                          variant="outlined"
                        />
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
                        const src =
                          item?.product_id?.featured_image?.src ||
                          notFoundImage;
                        return (
                          <div key={itemIndex} className="flex items-center">
                            <div className="w-16 h-12 relative cursor-pointer">
                              <Image
                                src={src}
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
                  <Link
                    href={`/admin/admin-orders/view/${order?._id}`}
                    onClick={() => {
                      if (order?.status) {
                        localStorage.setItem("viewOrderStatus", order.status);
                      }
                    }}
                    className="data-table-view-btn"
                  >
                    View
                  </Link>
                </Td>
                <Td className="ps-10">
                  <div>
                    {order?.status === "in-transit" && (
                      <p
                        className="bg-green-600 text-white px-2 py-1 text-center rounded-lg cursor-pointer"
                        onClick={() => handleDelivery(orderIdStr, "delivery")}
                      >
                        Delivery
                      </p>
                    )}
                  </div>
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
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/admin-orders/edit/${String(order?._id)}`,
                            )
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
            );
          })}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default AdminOrderTable;
