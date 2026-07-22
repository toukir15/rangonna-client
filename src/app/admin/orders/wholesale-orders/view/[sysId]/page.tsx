"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import AuthLayout from "@admin/layouts/AuthLayout";
import PrintableOrderSummary from "@admin/components/pages/Orders/ViewOrder/PrintableOrderSummary";
import FraudCheck from "@admin/components/pages/Orders/ViewOrder/FraudCheck";
import OrderPageNavigator from "@admin/components/pages/Orders/ViewOrder/OrderPageNavigator";
import Icon from "@admin/components/core/Icon/Icon";
import ProgressBar from "@admin/components/pages/Orders/ViewOrder/ProgressBar";
import { getWebName, noData } from "@admin/utils";
import ModalX from "@admin/components/pages/Orders/ModalX";
import { getStatusStyle } from "@admin/utils/system.utils";
import DetailsInfoSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/DetailsInfoSkeleton";
import OrderDetailsHeaderSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/OrderDetailsHeaderSkeleton";
import ReportIssueModal from "@admin/components/pages/ReportIssue/ReportIssueModal";
import TopBarButtonGroup from "@admin/components/pages/Orders/ViewOrder/TopBarButtonGroup";
import PathaoCourierQuickView from "@admin/components/pages/Couriers/PathaoCourierQuickView";

import { useGlobalContext } from "@admin/context/GlobalContext";
import { IOrderResponse } from "@admin/@interfaces/orders/viewOrder.interface";
import { IOrderLogResponse } from "@admin/@interfaces/orders/orderLogs.interface";
import SourceModal from "@admin/components/pages/Couriers/SourceModal";
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";
import WholeSaleOrderNote from "@admin/components/pages/wholesale/WholeSaleOrder/WholeSaleOrderNote";
import WholeSaleOrderSumary from "@admin/components/pages/wholesale/WholeSaleOrder/WholeSaleOrderSumary";
import WholeSaleOrderLogs from "@admin/components/pages/wholesale/WholeSaleOrder/WholeSaleOrderLogs";
import WholeSaleCustomerDetails from "@admin/components/pages/wholesale/WholeSaleOrder/WholeSaleCustomerDetails";
import WholeSaleOrderStatus from "@admin/components/pages/wholesale/WholeSaleOrderStatus";

const WholesaleOrderViewPageContent: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { sysId } = useParams();
  const searchParams = useSearchParams();
  const isAssign = searchParams.get("isAssign") === "true";
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [logs, setLogs] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalType, setModalType] = useState("");
  const [note, setNote] = useState<any>("");
  const [advancedAmount, setAdvancedAmount] = useState<any>("");
  const [trxID, setTrxID] = useState("");
  const [fraudData, setFraudData] = useState([]);
  const [totalParcel, setTotalParcel] = useState(0);
  const [totalDelivery, setTotalDelivery] = useState(0);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sumary, setSumary] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenPathao, setModalOpenPathao] = useState(false);
  const [modalOpenSource, setModalOpenSource] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isSummaryLoading, setSummaryIsLoading] = useState<boolean>(true);
  const [printStatus, setPrintStatus] = useState<any>();
  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [printOnCallDocument, setCallOnPrintDocument] =
    useState<boolean>(false);

  const baseApi = process.env.NEXT_PUBLIC_FRAUD_BASE_URL;

  const [formData, setFormData] = useState({
    order_id: "",
    advancedAmount: "",
    trx_id: "",
  });

  useEffect(() => {
    if (orderDetails) {
      setFormData({
        order_id: orderDetails?.sid,
        advancedAmount: orderDetails?.paid,
        trx_id: orderDetails?.payment?.transaction_id,
      });
      setAdvancedAmount(orderDetails?.paid);
      setTrxID(orderDetails?.payment?.transaction_id);
    }
  }, [orderDetails]);

  useEffect(() => {
    if (sysId && orderIds.length > 0) {
      const index = orderIds.indexOf(sysId.toString());
      setCurrentOrderIndex(index !== -1 ? index : null);
    }
  }, [sysId, orderIds]);

  const handleNextOrder = () => {
    if (currentOrderIndex !== null && currentOrderIndex > 0) {
      const nextId = orderIds[currentOrderIndex - 1];
      router.push(`/admin/orders/wholesale-orders/view/${nextId}`);
    }
  };
  const handlePrevOrder = () => {
    if (currentOrderIndex !== null && currentOrderIndex < orderIds.length - 1) {
      const prevId = orderIds[currentOrderIndex + 1];
      router.push(`/admin/orders/wholesale-orders/view/${prevId}`);
    }
  };

  const isPrevDisabled =
    currentOrderIndex === null || currentOrderIndex >= orderIds.length - 1;
  const isNextDisabled = currentOrderIndex === null || currentOrderIndex <= 0;

  useEffect(() => {
    if (orderDetails?.customer?.phone) {
      const number = orderDetails?.customer?.phone;
      const phoneNumber = number.slice(-11);
      const fetchFraudData = async () => {
        try {
          const response = await fetch(
            `${baseApi}/check?api=1381e7a82b62ae85aca763ec861bbdd7e7bd6d71&phone=${phoneNumber}`
          );
          const data = await response.json();
          setFraudData(data.data);
          const total = data?.data?.reduce(
            (acc: any, item: any) => acc + item.total,
            0
          );
          const delivered = data?.data?.reduce(
            (acc: any, item: any) => acc + item.delivered,
            0
          );
          setTotalParcel(total);
          setTotalDelivery(delivered);
        } catch (error) {
          console.log(error);
        }
      };
      fetchFraudData();
    }
  }, [orderDetails?.customer?.phone]);

  const handleSubmitAdvanced = async (event: any) => {
    event.preventDefault();
    if (advancedAmount < 0 || !formData?.trx_id) {
      ToastService.error(`TrxID ${trxID} is required!`);
      return;
    }
    setIsSubmitting(true);
    wholesaleOrderService
      .updateAdvance(sysId, {
        transaction_id: formData?.trx_id,
        paid: formData?.advancedAmount,
      })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchOrderSumary();
          setIsModalOpen(false);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const updateOrderStatus = async (newStatus: any, reason: any) => {
    setStatusLoading(true);
    if (newStatus === "return" || newStatus === "cancel") {
      wholesaleOrderService.returnStockUpdate(sysId, {
        status: newStatus,
      });
    }
    wholesaleOrderService
      .statusUpdate(sysId, { status: newStatus, reason })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchCurrentStatus();
          fetchLogsDetails();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setStatusLoading(false);
      });
  };

  // const handleOpenModal = (type: any) => {
  //   setModalType(type);
  //   setIsModalOpen(true);
  // };

  useEffect(() => {
    if (orderDetails?._id) {
      fetchPrintStatus();
    }
  }, [orderDetails?._id]);

  const updatePrintStatus = async () => {
    wholesaleOrderService
      .updateStatusPrint(orderDetails?._id, {
        is_print: false,
      })
      .then((res: any) => {
        if (res?.success) {
          fetchPrintStatus();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const fetchPrintStatus = async () => {
    wholesaleOrderService
      .fetchPrintStatus(orderDetails?._id)
      .then((res: any) => {
        if (res?.success) {
          setPrintStatus(res.data.is_print);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleEditUpdate = () => {
    router.push(`/admin/orders/wholesale-orders/edit/${sysId}`);
  };

  const [printOrderDetails, setPrintOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (!orderDetails?._id) return;
    wholesaleOrderService
      .getInvoicePrint(orderDetails?._id)
      .then((res: any) => {
        if (res?.success) {
          setPrintOrderDetails(res.data);
        } else {
          ToastService.error(res?.message);
          setPrintOrderDetails(null);
          return;
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, [orderDetails?._id]);

  const handlePrint = async () => {
    setCallOnPrintDocument(true);

    await new Promise(requestAnimationFrame);

    const printableContent = document.getElementById("printableContent");

    if (!printableContent) {
      ToastService.error("Printable content not ready yet.");
      return;
    }

    const printContents = printableContent.innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>Invoice</title>
          <style>
            @page { margin: 12mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { border-collapse: collapse; width: 100%; }
            th, td { padding: 8px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      document.body.removeChild(iframe);
      setCallOnPrintDocument(false);
    }, 1000);

    try {
      await wholesaleOrderService.updateStatusPrint(orderDetails._id, {
        is_print: true,
      });
      fetchPrintStatus?.();
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to update print status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchOrdersDetails = async () => {
    setIsLoading(true);
    await wholesaleOrderService
      .orderDetails(sysId)
      .then((res: IOrderResponse) => {
        if (res?.success) {
          setOrderDetails(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchLogsDetails = async () => {
    if (!sysId) return;
    wholesaleOrderService
      .orderLogs(sysId)
      .then((res: IOrderLogResponse) => {
        if (res?.success) {
          setLogs(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchCurrentStatus = async () => {
    wholesaleOrderService
      .fetchCurrentStatus(sysId)
      .then((res: any) => {
        if (res?.success) {
          setCurrentStatus(res.data.status);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchOrderSumary = async () => {
    try {
      const res = await wholesaleOrderService.orderSumary(sysId);
      if (res?.success) {
        setSumary(res.data);
      } else {
        ToastService.error(res?.message || "Failed to fetch order summary");
      }
    } catch (err: any) {
      ToastService.error(err.message || "An error occurred");
    } finally {
      setSummaryIsLoading(false);
    }
  };

  useEffect(() => {
    if (sysId) {
      setIsLoading(true);
      fetchOrdersDetails();
      fetchLogsDetails();
      fetchCurrentStatus();
      fetchOrderSumary();
    }
  }, [sysId]);

  useEffect(() => {
    if (isAssign) return;
    const statusFromStorage = localStorage.getItem("viewOrderStatus");
    if (!statusFromStorage) return;
    wholesaleOrderService
      .updateNextOrder(statusFromStorage)
      .then((res: any) => {
        if (res?.success) {
          setOrderIds(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, []);

  const showToast = (message: string) => {
    ToastService.success(message);
  };

  // const handleReportIssue = () => {
  //   wholesaleOrderService
  //     .createReportIssue(orderDetails?._id)
  //     .then((res: any) => {
  //       if (res?.success) {
  //         if (res.data.isExist === false) {
  //           setModalOpen(true);
  //         } else if (res.data.isExist === true) {
  //           router.push(`/report-issue/view/${orderDetails?._id}`);
  //         }
  //       } else {
  //         ToastService.error(res?.message);
  //       }
  //     })
  //     .catch((err: { message: string }) => {
  //       ToastService.error(err.message);
  //     })
  //     .finally(() => {});
  // };

  return (
    <AuthLayout>
      <div className="hidden">
        {printOrderDetails?.general && (
          <PrintableOrderSummary
            printOnCallDocument={printOnCallDocument}
            orderDetails={printOrderDetails}
          />
        )}
      </div>

      <ModalX
        isSubmitting={isSubmitting}
        isModalOpen={isModalOpen}
        // modalType={modalType}
        setIsModalOpen={setIsModalOpen}
        handleSubmitAdvanced={handleSubmitAdvanced}
        note={note}
        setNote={setNote}
        advancedAmount={advancedAmount}
        setAdvancedAmount={setAdvancedAmount}
        trxID={trxID}
        setTrxID={setTrxID}
        formData={formData}
        setFormData={setFormData}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        orderDetails={orderDetails?.labels}
        notes={orderDetails?.history}
      />

      <div className="bg-gray-100 lg:px-4 px-3 p-3 no-print dark:bg-black">
        <OrderPageNavigator
          prevOrderId={
            !isPrevDisabled ? orderIds[currentOrderIndex + 1] : undefined
          }
          nextOrderId={
            !isNextDisabled ? orderIds[currentOrderIndex - 1] : undefined
          }
          handlePrevOrder={handlePrevOrder}
          handleNextOrder={handleNextOrder}
        />
        <div className="mb-3">
          {isLoading ? (
            <OrderDetailsHeaderSkeleton />
          ) : (
            <div className="p-4 bg-white dark:bg-gray-800 shadow-md text-black  mb-3 rounded-lg flex flex-wrap md:items-center justify-between">
              <div className="flex flex-col order-1">
                <span className="mb-1">
                  <span
                    className={`${getStatusStyle(
                      currentStatus
                    )} capitalize px-4`}
                  >
                    {currentStatus === "ready-for-box"
                      ? "R-D"
                      : currentStatus === "waiting-payment"
                      ? "To be Paid"
                      : currentStatus}
                  </span>
                </span>

                <div className="font-bold cursor-pointer flex items-center dark:text-gray-400 mt-1 ">
                  <div className="flex items-center gap-2">
                    <p>{getWebName(orderDetails?.domain)} </p>{" "}
                    <p>#{orderDetails?.sysid}</p>
                  </div>

                  <Icon
                    size={16}
                    name="content_copy"
                    variant="outlined"
                    className="ml-2 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(orderDetails?.sysid);
                      ToastService.success("Order ID copied to clipboard!");
                    }}
                  />
                </div>
                <p className="font-semibold dark:text-gray-400">
                  Trx:{" "}
                  {orderDetails?.payment?.transaction_id
                    ? orderDetails?.payment?.transaction_id
                    : noData}
                </p>
              </div>

              <div className="md:w-1/4 w-full md:mt-0 mt-4 mx-4 md:order-2 order-3">
                <ProgressBar
                  totalParcel={totalParcel}
                  totalDelivery={totalDelivery}
                />
              </div>

              <TopBarButtonGroup
                buttons={[
                  // {
                  //   name: "Source",
                  //   icon: "route",
                  //   variant: "outlined",
                  //   color: "cyan-500",
                  //   size: 25,
                  //   onClick: () => setModalOpenSource(true),
                  // },
                  {
                    name: "Courier",
                    icon: "local_shipping",
                    variant: "outlined",
                    color: "orange-500",
                    onClick: () => setModalOpenPathao(true),
                  },
                  // ...(permissionList.includes("whol_orde_e")
                  //   ? [
                  //       {
                  //         name: "Advanced",
                  //         icon: "attach_money",
                  //         variant: "outlined",
                  //         color: "blue-500",
                  //         onClick: () => handleOpenModal("advanced"),
                  //       },
                  //     ]
                  //   : []),

                  ...(permissionList.includes("order_wholesale_edit") &&
                  currentStatus !== "ready-for-box" &&
                  currentStatus !== "cancel" &&
                  currentStatus !== "printed" &&
                  currentStatus !== "delivery" &&
                  currentStatus !== "refunded" &&
                  currentStatus !== "return" &&
                  currentStatus !== "exchange"
                    ? [
                        {
                          name: "Edit",
                          icon: "edit_square",
                          variant: "filled" as any,
                          color: "green-600",
                          onClick: handleEditUpdate,
                        },
                      ]
                    : []),

                  // ...(hasPermission(
                  //   permissionList,
                  //   "order_wholesale_edit",
                  //   "repo_issu_c"
                  // )
                  //   ? [
                  //       {
                  //         name: "Report",
                  //         icon: "report",
                  //         variant: "outlined",
                  //         color: "red-600",
                  //         onClick: () => handleReportIssue(),
                  //       },
                  //     ]
                  //   : []),
                  {
                    name: "Print",
                    icon: "print",
                    variant: "outlined",
                    color: "cyan-600",
                    onClick: handlePrint,
                    hasBadge: printStatus,
                    badgeContent: printStatus && (
                      <Icon
                        name="check_circle"
                        variant="filled"
                        className="text-green-600 absolute -top-1 -right-2"
                        size={15}
                      />
                    ),
                  },
                ]}
                showClearButton={printStatus}
                onClearClick={updatePrintStatus}
              />
            </div>
          )}
        </div>

        <div className="">
          {isLoading ? (
            <DetailsInfoSkeleton />
          ) : (
            <div className="md:flex gap-3 mb-3">
              <WholeSaleCustomerDetails
                customer={{
                  title: "Customer Details",
                  first:
                    orderDetails?.customer?.first_name +
                    orderDetails?.customer?.last_name,
                  second: orderDetails?.customer?.phone,
                  third: orderDetails?.payment?.title,
                  copy: true,
                }}
                showToast={showToast}
                is_verified={orderDetails?.is_verified}
                verifyIcon={true}
              />
              <WholeSaleCustomerDetails
                customer={{
                  title: "Delivery Details",
                  first: orderDetails?.customer?.address,
                  second: orderDetails?.customer?.email,
                  copy: false,
                }}
                orderDetails={orderDetails}
                sysId={sysId}
                fetchOrdersDetails={fetchOrdersDetails}
                is_verified={orderDetails?.is_verified}
              />
            </div>
          )}
        </div>
        <div className="md:flex items-start justify-between gap-4">
          <div className="md:w-3/5 w-full ">
            <WholeSaleOrderStatus
              currentStep={currentStatus}
              updateOrderStatus={updateOrderStatus}
              orderDetails={orderDetails}
              statusLoading={statusLoading}
              setIsChecked={setIsChecked}
              isChecked={isChecked}
              handlePrint={handlePrint}
            />
            <WholeSaleOrderSumary
              sumary={sumary}
              date={orderDetails?.createdAt}
              isLoading={isSummaryLoading}
            />
          </div>

          <div className="md:w-2/5  md:mt-0 mt-2">
            <WholeSaleOrderNote
              orderId={sysId}
              showCustomerNote={orderDetails}
              fetchOrdersDetail={fetchOrdersDetails}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3 ">
              <WholeSaleOrderLogs logsData={logs.data} />
            </div>
            <FraudCheck fraudData={fraudData} />
          </div>
        </div>
      </div>

      <PathaoCourierQuickView
        isModalOpen={modalOpenPathao}
        setIsModalOpen={setModalOpenPathao}
        orderId={sysId}
      />
      <SourceModal
        isModalOpen={modalOpenSource}
        setIsModalOpen={setModalOpenSource}
        orderId={sysId}
        fetchOrdersDetails={fetchOrdersDetails}
        fetchLogsDetails={fetchLogsDetails}
        fetchCurrentStatus={fetchCurrentStatus}
        fetchOrderSumary={fetchOrderSumary}
      />

      <ReportIssueModal
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        orderDetail={orderDetails}
      />
    </AuthLayout>
  );
};

const Page: React.FC = () => (
  <Suspense fallback={null}>
    <WholesaleOrderViewPageContent />
  </Suspense>
);

export default Page;
