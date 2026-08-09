"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusLabel, getStatusStyle } from "@admin/utils/system.utils";
import Image from "next/image";
import notFoundImage from "@admin/assets/images/Image-not-found.png";
import { getWebName, noData, trimString } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { useRouter } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Link from "next/link";
import { AllOrderListContext } from "@/app/admin/orders/all-order/page";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { useReactToPrint } from "react-to-print";
import PackingSlipPrint from "./PackingSlipPrint";

import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import InvoiceNew from "./InvoiceNew";

const AllOrderTable: React.FC = () => {
  const { permissionList } = useGlobalContext();

  const {
    orderList,
    tableLoading,
    selectedOrders,
    handleListPrintSelected,
    handleOrderPrintSelected,
    selectedAction,
    setSelectedAction,
    handleOrderInvoicePrint,
    handleBalkUpdate,
    statusSubmitting,
    isCheck,
    handleSelectAll,
    handleSelectOrder,
    handleImageClick,
    filter,
    selectedWebsite,
  } = useContext(AllOrderListContext);

  const router = useRouter();

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [printType, setPrintType] = useState<"invoice" | "packing" | null>(
    null,
  );

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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle:
      printType === "invoice"
        ? invoiceData?.order?.sysid
          ? `invoice-${invoiceData.order.sysid}`
          : "invoice"
        : invoiceData?.order?.sysid
          ? `packing-slip-${invoiceData.order.sysid}`
          : "packing-slip",
    onAfterPrint: () => {
      setPrintingOrderId(null);
      setPopupIndex(null);
    },
  });

  const fetchAndPrint = async (
    orderId: string,
    type: "invoice" | "packing",
  ) => {
    try {
      setPrintingOrderId(orderId);
      setPrintType(type);

      const res: any = await OrdersService.getInvoicePrint(orderId);

      if (res?.success) {
        setInvoiceData(res.data);

        setTimeout(() => {
          handlePrint();
        }, 200);
      } else {
        ToastService.error(res?.message || `Failed to load ${type}`);
        setInvoiceData(null);
        setPrintingOrderId(null);
        setPrintType(null);
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Something went wrong");
      setPrintingOrderId(null);
      setPrintType(null);
      setInvoiceData(null);
    }
  };

  const handleInvoicePrintClick = async (orderId: string) => {
    await fetchAndPrint(orderId, "invoice");
  };

  const handlePackingSlipPrintClick = async (orderId: string) => {
    await fetchAndPrint(orderId, "packing");
  };

  return (
    <div className="">
      <div className="hidden">
        {invoiceData && printType === "invoice" && (
          <InvoiceNew ref={printRef} invoiceData={invoiceData} />
        )}

        {invoiceData && printType === "packing" && (
          <PackingSlipPrint ref={printRef} invoiceData={invoiceData} />
        )}
      </div>

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
        statusSubmitting={statusSubmitting}
        orderListPrintBtn={true}
        orderInvoicePrintBtn={true}
        bulkActionBtn={true}
        openBulk={filter === "ready-for-box"}
        handleBulkAction={handleBalkUpdate}
        selectedWebsite={selectedWebsite}
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
            <Th className="is-center min-w-28">View</Th>
            <Th className="is-center min-w-20 !text-nowrap">Is Printed</Th>
            <Th className="is-right">Actions</Th>
          </Tr>
        </Thead>

        <Tbody>
          {orderList?.map((order: any, index: number) => {
            const orderIdStr = String(order?._id);
            const isCurrentPrinting = printingOrderId === orderIdStr;

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
                    <div className="flex items-center gap-1.5">
                      <span className="table-id-chip">
                        {order?.sysid || noData}
                      </span>
                      <Icon
                        size={14}
                        name="content_copy"
                        variant="outlined"
                        className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--accent)]"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            String(order?.sysid ?? ""),
                          );
                          ToastService.success("Order ID copied to clipboard!");
                        }}
                      />
                    </div>
                    <p className="data-table-muted">
                      {getWebName(order?.domain) || noData}
                    </p>
                    <span className="table-date-cell">
                      <Icon name="calendar_today" size={14} variant="outlined" />
                      {formatTimeAgo(order?.createdAt) || noData}
                    </span>
                  </div>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="data-table-primary">
                      {trimString(order?.customer?.first_name, 50)}
                      {order?.customer?.last_name}
                    </span>
                    <span className="table-contact-line">
                      <Icon name="call" size={14} variant="outlined" />
                      <a href={`tel:${order?.customer?.phone}`}>
                        {order?.customer?.phone}
                      </a>
                      <Icon
                        onClick={() => copyToClipboard(order?.customer?.phone)}
                        name="content_copy"
                        size={14}
                        className="cursor-pointer"
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
                                  if (typeof src === "string") {
                                    handleImageClick(src);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Td>

                <Td>
                  <span className={getStatusStyle(order?.status)}>
                    {getStatusLabel(order?.status)}
                  </span>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className="table-amount">
                      Total: ৳ {order?.total || 0}
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
                      ? trimString(
                          order?.notes[order.notes.length - 1]?.text,
                          100,
                        )
                      : noData}
                  </div>

                  <div className="flex flex-wrap pt-2">
                    {trimString(order?.customer_note?.text, 100) || noData}

                    {order?.label && (
                      <p className="table-role-badge is-rejected ml-1">
                        {order?.label}
                      </p>
                    )}

                    <div className="flex gap-2">
                      {order?.line_items?.some(
                        (item: any) => item?.stock_status === "out-of-stock",
                      ) && (
                        <p className="table-role-badge is-rejected">
                          out-of-stock
                        </p>
                      )}
                    </div>
                  </div>
                </Td>

                <Td className="is-center">
                  <Link
                    href={`/admin/orders/view/${order?._id}`}
                    onClick={() => {
                      if (order?.status) {
                        localStorage.setItem("viewOrderStatus", order.status);
                      }
                    }}
                    className="data-table-view-btn"
                  >
                    <Icon name="visibility" variant="outlined" size={14} />
                    View
                  </Link>
                </Td>

                <Td className="is-center">
                  {order?.is_print ? (
                    <Icon
                      name="check_circle"
                      variant="filled"
                      className="text-[var(--color-primary)]"
                      size={15}
                    />
                  ) : (
                    noData
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
                        {permissionList.includes("order_edit") &&
                          ![
                            "delivery",
                            "cancel",
                            "exchange",
                            "return",
                            "refunded",
                          ].includes(order?.status) && (
                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/orders/edit/${String(order?._id)}`,
                                )
                              }
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            >
                              Edit
                            </button>
                          )}

                        <button
                          onClick={() => handleInvoicePrintClick(orderIdStr)}
                          disabled={isCurrentPrinting}
                          className={`mb-0.5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                            isCurrentPrinting
                              ? "cursor-not-allowed text-app-muted opacity-60"
                              : "text-app hover:bg-[var(--bg-hover)]"
                          }`}
                        >
                          {isCurrentPrinting && printType === "invoice" ? (
                            <>
                              <ButtonLoader />
                            </>
                          ) : (
                            "Invoice"
                          )}
                        </button>

                        <button
                          onClick={() =>
                            handlePackingSlipPrintClick(orderIdStr)
                          }
                          disabled={isCurrentPrinting}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                            isCurrentPrinting
                              ? "cursor-not-allowed text-app-muted opacity-60"
                              : "text-app hover:bg-[var(--bg-hover)]"
                          }`}
                        >
                          {isCurrentPrinting && printType === "packing" ? (
                            <>
                              <ButtonLoader />
                            </>
                          ) : (
                            "Packing Slip"
                          )}
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

export default AllOrderTable;
