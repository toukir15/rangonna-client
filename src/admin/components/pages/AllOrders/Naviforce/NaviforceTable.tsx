import React, { useContext, useEffect, useRef, useState } from "react";
import { Thead, Tbody, Tr, Th, Td } from "@admin/components/Table/Table";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { getStatusStyle } from "@admin/utils/system.utils";
import Image from "next/image";
import notFoundImage from "@admin/assets/images/Image-not-found.png";
import { getWebName, noData, trimString } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { useRouter } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Link from "next/link";
import { NaviforceOrderListContext } from "@/app/admin/orders/naviforce/page";
import PackingSlipPrint from "../PackingSlipPrint";
import InvoiceNew from "../InvoiceNew";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { useReactToPrint } from "react-to-print";
import { dueColor } from "@admin/utils/constant";

const NaviforceTable: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
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
    // setModalOpen,
    filter,
  } = useContext(NaviforceOrderListContext);

  const router = useRouter();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [printType, setPrintType] = useState<"invoice" | "packing" | null>(
    null
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
    type: "invoice" | "packing"
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      ToastService.success("Number copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
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
        className="min-h-[700px]"
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
      >
        <Thead>
          <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th>
              <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
            </Th>
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
            <Th className="text-blue-900 dark:text-gray-200 min-w-40 ps-8 ">
              View
            </Th>
            <Th className="text-blue-900 dark:text-gray-200 min-w-20 !text-nowrap">
              Is Printed
            </Th>
            {/* <Th className="text-blue-900 dark:text-gray-200 min-w-20 !text-nowrap">
              Quick View
            </Th> */}
            <Th className="text-blue-900 dark:text-gray-200">Actions</Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {orderList?.map((order: any, index: number) => {
            const orderIdStr = String(order?._id);
            const isCurrentPrinting = printingOrderId === orderIdStr;

            return (
              <Tr
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                key={index}
              >
                <Td>
                  <TableCheckbox
                    checked={selectedOrders.includes(orderIdStr)}
                    onChange={() => handleSelectOrder(orderIdStr)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Td>
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
                      {trimString(order?.customer?.first_name, 50)}
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
                      Due :
                    </span>
                    <span className={`text-md font-semibold  dark:text-gray-300 ${dueColor}`}>
                      ৳ {order?.due || 0}
                    </span>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap">
                    {Array.isArray(order?.notes) && order.notes.length > 0
                      ? trimString(
                        order.notes[order.notes.length - 1]?.text,
                        100
                      )
                      : noData}
                  </div>
                  <div className="flex flex-wrap pt-2">
                    {trimString(order?.customer_note?.text, 100) || noData}
                    {order?.label && (
                      <p className="bg-red-100 text-red-600 px-2 rounded-lg ml-2">
                        {" "}
                        {order?.label}
                      </p>
                    )}
                  </div>
                </Td>
                <Td>
                  <Link
                    href={`/orders/view/${order?._id}`}
                    onClick={() => {
                      if (order?.status) {
                        localStorage.setItem("viewOrderStatus", order.status);
                      }
                    }}
                    className="bg-blue-500 px-4 py-1 rounded-lg text-white text-center w-20 cursor-pointer inline-block"
                  >
                    View
                  </Link>
                </Td>
                <Td>
                  {order?.is_print ? (
                    <Icon
                      name="check_circle"
                      variant="filled"
                      className="text-green-600"
                      size={15}
                    />
                  ) : (
                    noData
                  )}
                </Td>
                {/* <Td className="ps-10">
                  <Icon
                    onClick={() => setModalOpen(true)}
                    name={"visibility"}
                    variant="outlined"
                    className="cursor-pointer"
                  />
                </Td> */}
                <Td>
                  <div className="relative max-w-40">
                    <Icon
                      name="more_horiz"
                      variant="outlined"
                      onClick={() => togglePopup(index)}
                      className="cursor-pointer"
                    />

                    {popupIndex === index && (
                      <div
                        ref={popupRef}
                        className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-2 z-20 min-w-40"
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
                                  `/orders/edit/${String(order?._id)}`
                                )
                              }
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            >
                              Edit
                            </button>
                          )}

                        <button
                          onClick={() => handleInvoicePrintClick(orderIdStr)}
                          disabled={isCurrentPrinting}
                          className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg mb-1 ${isCurrentPrinting
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-600"
                            : "hover:bg-gray-100 dark:hover:bg-gray-600"
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
                          className={`flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg ${isCurrentPrinting
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-600"
                            : "hover:bg-gray-100 dark:hover:bg-gray-600"
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

export default NaviforceTable;
