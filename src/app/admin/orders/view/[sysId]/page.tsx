"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import AuthLayout from "@admin/layouts/AuthLayout";
import OrderSummary from "@admin/components/pages/Orders/ViewOrder/OrderSummary";
import PrintableOrderSummary from "@admin/components/pages/Orders/ViewOrder/PrintableOrderSummary";
import OrderNotes from "@admin/components/pages/Orders/ViewOrder/OrderNotes";
import OrderLogs from "@admin/components/pages/Orders/ViewOrder/OrderLogs";
import FraudCheck from "@admin/components/pages/Orders/ViewOrder/FraudCheck";
import CustomerDetails from "@admin/components/pages/Orders/ViewOrder/CustomerDetails";
import OrderPageNavigator from "@admin/components/pages/Orders/ViewOrder/OrderPageNavigator";
import Icon from "@admin/components/core/Icon/Icon";
import ProgressBar from "@admin/components/pages/Orders/ViewOrder/ProgressBar";
import { getWebName, hasPermission, noData } from "@admin/utils";
import ModalX from "@admin/components/pages/Orders/ModalX";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { OrderAssignmentService } from "@admin/@services/apis/OrdersService/OrderAssignment.service";
import {
  clearAssignOrderViewing,
  markAssignOrderViewing,
} from "@admin/@config/socket.config";
import { getStatusStyle } from "@admin/utils/system.utils";
import DetailsInfoSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/DetailsInfoSkeleton";
import OrderDetailsHeaderSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/OrderDetailsHeaderSkeleton";
import ReportIssueModal from "@admin/components/pages/ReportIssue/ReportIssueModal";
import TopBarButtonGroup from "@admin/components/pages/Orders/ViewOrder/TopBarButtonGroup";
import OrderStatus from "@admin/components/pages/Orders/ViewOrder/ShippingTracker";
import PathaoCourierQuickView from "@admin/components/pages/Couriers/PathaoCourierQuickView";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { IOrderResponse } from "@admin/@interfaces/orders/viewOrder.interface";
import { IOrderLogResponse } from "@admin/@interfaces/orders/orderLogs.interface";
import SourceModal from "@admin/components/pages/Couriers/SourceModal";
import StatusModal from "@admin/components/pages/Couriers/StatusModal";
import OrderAdvanceModal from "@admin/components/pages/ReportIssue/OrderAdvanceModal";
import { AdvanceSalaryService } from "@admin/@services/apis/SalaryManager/AdvanceSalary/AdvanceSalary.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { SalaryReportService } from "@admin/@services/apis/SalaryManager/SalaryReport/SalaryReport.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { stockOptions } from "@admin/components/pages/Utilities/paymentData";
import { SelectOption } from "@admin/@interfaces/common.interface";
import SelectStatusModal from "@admin/components/pages/ReportIssue/SelectStatusModal";
import WarehouseModal from "@admin/components/pages/Orders/ViewOrder/WarehouseModal";

const OrderViewPageContent: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const { sysId } = useParams();
  const searchParams = useSearchParams();
  const isAssign = searchParams.get("isAssign") === "true";
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [logs, setLogs] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState<any>("");
  const [advancedAmount, setAdvancedAmount] = useState<any>("");
  const [trxID, setTrxID] = useState("");
  const [fraudData, setFraudData] = useState([]);
  const [totalParcel, setTotalParcel] = useState(0);
  const [totalDelivery, setTotalDelivery] = useState(0);
  const [fraudSummary, setFraudSummary] = useState();
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sumary, setSumary] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [modalOpenPathao, setModalOpenPathao] = useState(false);
  const [modalOpenSource, setModalOpenSource] = useState(false);
  const [statusModalOpenSource, setStatusModalOpenSource] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isSummaryLoading, setSummaryIsLoading] = useState<boolean>(true);
  const [printStatus, setPrintStatus] = useState<any>();
  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [printOnCallDocument, setCallOnPrintDocument] =
    useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit" | "View">("Add");
  const [advanceData, setAdvanceData] = useState<any>();
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [labelLoading, setLevelLoading] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<SelectOption>();
  const [lineId, setLineId] = useState<string | null>();
  const [syncedOrderNotes, setSyncedOrderNotes] = useState<any[]>();

  const handleStatusUpdate = (lineId: any) => {
    setLineId(lineId);
    setIsAlertOpen(true);
  };

  const cancelUpdate = () => {
    setLineId(null);
    setIsAlertOpen(false);
  };

  const handleAddAdvance = async () => {
    const list = await fetchAdvanceOrder();

    if (list?.length > 0) {
      setModalMode("View");
    } else {
      setModalMode("Add");
    }

    setAdvanceModalOpen(true);
  };

  const handleAddNewPayment = () => {
    setModalMode("Add");
    setAdvanceModalOpen(true);
  };
  const handleEditPayment = () => {
    setModalMode("Edit");
    setAdvanceModalOpen(true);
  };

  const baseApi = process.env.NEXT_PUBLIC_FRAUD_BASE_URL;

  const [formData, setFormData] = useState({
    order_id: "",
    advancedAmount: "",
    trx_id: "",
    payment_method: "",
  });

  useEffect(() => {
    if (orderDetails) {
      setFormData({
        order_id: orderDetails?.sid,
        advancedAmount: orderDetails?.paid,
        trx_id: orderDetails?.payment?.transaction_id,
        payment_method: orderDetails?.payment,
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

  const assignViewSuffix = isAssign ? "?isAssign=true" : "";

  // Assign queue is listed newest→oldest; Next goes down the list, Prev goes up.
  // Regular order list from updateNextOrder uses the opposite index math.
  const handleNextOrder = () => {
    if (currentOrderIndex === null) return;
    const nextId = isAssign
      ? currentOrderIndex < orderIds.length - 1
        ? orderIds[currentOrderIndex + 1]
        : null
      : currentOrderIndex > 0
        ? orderIds[currentOrderIndex - 1]
        : null;
    if (nextId) router.push(`/admin/orders/view/${nextId}${assignViewSuffix}`);
  };
  const handlePrevOrder = () => {
    if (currentOrderIndex === null) return;
    const prevId = isAssign
      ? currentOrderIndex > 0
        ? orderIds[currentOrderIndex - 1]
        : null
      : currentOrderIndex < orderIds.length - 1
        ? orderIds[currentOrderIndex + 1]
        : null;
    if (prevId) router.push(`/admin/orders/view/${prevId}${assignViewSuffix}`);
  };

  const isPrevDisabled = isAssign
    ? currentOrderIndex === null || currentOrderIndex <= 0
    : currentOrderIndex === null || currentOrderIndex >= orderIds.length - 1;
  const isNextDisabled = isAssign
    ? currentOrderIndex === null || currentOrderIndex >= orderIds.length - 1
    : currentOrderIndex === null || currentOrderIndex <= 0;

  useEffect(() => {
    if (orderDetails?.customer?.phone) {
      const number = orderDetails?.customer?.phone;
      const phoneNumber = number.slice(-11);
      const fetchFraudData = async () => {
        try {
          const response = await fetch(
            `${baseApi}/check?api=1381e7a82b62ae85aca763ec861bbdd7e7bd6d71&phone=${phoneNumber}`,
          );
          const data = await response.json();
          setFraudSummary(data?.summary);
          setFraudData(data.detailed);
          const total = data?.data?.reduce(
            (acc: any, item: any) => acc + item.total,
            0,
          );
          const delivered = data?.data?.reduce(
            (acc: any, item: any) => acc + item.delivered,
            0,
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
    OrdersService.updateAdvance(sysId, {
      transaction_id: formData?.trx_id,
      paid: formData?.advancedAmount,
      payment_method: formData?.payment_method,
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

  const updateOrderStatus = async (
    newStatus: any,
    reason?: any,
    extra?: Record<string, any>,
  ) => {
    setStatusLoading(true);

    const apiCall =
      newStatus === "delivery"
        ? OrdersService.statusUpdateDeliveryAdmin
        : OrdersService.statusUpdate;

    apiCall(sysId, { status: newStatus, reason, ...extra })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          if (["cancel"].includes(newStatus)) {
            OrdersService.returnStockUpdate(sysId, { status: newStatus });
            OrdersService.noteUpdate(sysId, { text: reason }).then(
              (noteRes) => {
                if (noteRes?.notes) {
                  setSyncedOrderNotes(noteRes.notes);
                }
              },
            );
          }

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

  useEffect(() => {
    if (orderDetails?._id) {
      fetchPrintStatus();
    }
  }, [orderDetails?._id]);

  const updatePrintStatus = async () => {
    OrdersService.updateStatusPrint(orderDetails?._id, {
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
    OrdersService.fetchPrintStatus(orderDetails?._id)
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

  const fetchAdvanceOrder = async () => {
    try {
      const res: any = await AdvanceSalaryService.getAdvanceOrderId(sysId);
      if (res?.success) {
        setAdvanceData(res.data);
        return res.data || [];
      } else {
        ToastService.error(res?.message);
        setAdvanceData([]);
        return [];
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to fetch advance data");
      setAdvanceData([]);
      return [];
    }
  };

  const handleEditUpdate = () => {
    router.push(`/admin/orders/edit/${sysId}`);
  };

  const [printOrderDetails, setPrintOrderDetails] = useState<any>(null);

  const fetchPrintOrderDetails = async (orderId = orderDetails?._id) => {
    if (!orderId) return null;

    try {
      const res = await OrdersService.getInvoicePrint(orderId);
      if (res?.success) {
        setPrintOrderDetails(res.data);
        return res.data;
      }

      ToastService.error(res?.message);
      setPrintOrderDetails(null);
      return null;
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to load print data");
      return null;
    }
  };

  useEffect(() => {
    fetchPrintOrderDetails();
  }, [orderDetails?._id]);

  const handlePrint = async () => {
    const latestPrintDetails = await fetchPrintOrderDetails();
    if (!latestPrintDetails?.general) {
      ToastService.error("Printable content not ready yet.");
      return;
    }

    setCallOnPrintDocument(true);

    await new Promise((resolve) => setTimeout(resolve, 150));

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
      await OrdersService.updateStatusPrint(orderDetails._id, {
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
    await OrdersService.orderDetails(sysId)
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
    OrdersService.orderLogs(sysId)
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
    OrdersService.fetchCurrentStatus(sysId)
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
      const res = await OrdersService.orderSumary(sysId);
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
    if (!canFetchPageData || !sysId) return;

    setIsLoading(true);
    fetchOrdersDetails();
    fetchLogsDetails();
    fetchCurrentStatus();
    fetchOrderSumary();
    // fetchAdvanceOrder();
  }, [sysId, canFetchPageData]);

  // While working an assigned order, lock it from admin transfer
  useEffect(() => {
    if (!isAssign) return;
    const id = Array.isArray(sysId) ? sysId[0] : sysId;
    if (!id) return;

    markAssignOrderViewing(String(id));
    return () => {
      clearAssignOrderViewing();
    };
  }, [isAssign, sysId]);

  useEffect(() => {
    if (advanceModalOpen) {
      fetchAdvanceOrder();
    }
  }, [advanceModalOpen]);

  const fetchNextPreviousOrders = () => {
    if (isAssign) {
      OrderAssignmentService.getMyQueue({
        page: 1,
        limit: 50,
        sort: "-createdAt",
      })
        .then((res: any) => {
          if (!res?.success) {
            ToastService.error(res?.message || "Failed to load assigned queue");
            return;
          }
          const list = res?.data?.data ?? res?.data ?? [];
          const ids = (Array.isArray(list) ? list : [])
            .map((order: any) => String(order?._id || ""))
            .filter(Boolean);
          setOrderIds(ids);
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        });
      return;
    }

    const statusFromStorage = localStorage.getItem("viewOrderStatus");
    if (!statusFromStorage || !orderDetails?.domain) return;

    OrdersService.updateNextOrder(statusFromStorage, orderDetails.domain)
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
  };

  useEffect(() => {
    if (isAssign) {
      fetchNextPreviousOrders();
      return;
    }
    if (orderDetails?.domain) {
      fetchNextPreviousOrders();
    }
  }, [orderDetails?.domain, isAssign]);

  const showToast = (message: string) => {
    ToastService.success(message);
  };

  const handleDelivery = () => {
    return OrdersService.statusUpdateDeliveryAdmin(sysId, {
      status: "delivery",
    })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res.message);
          // fetchOrdersDetails();
          fetchLogsDetails();
          fetchCurrentStatus();
          fetchOrderSumary();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const StatusUpdate = async () => {
    setLevelLoading(true);
    if (!sysId) return;

    SalaryReportService.updateOrderLevel(sysId, [
      {
        product_id: lineId,
        stock_status: "out-of-stock",
      },
    ])
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchOrdersDetails();
          fetchOrderSumary();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsAlertOpen(false);
        setLevelLoading(false);
      });
  };

  useTableRefreshRegister(fetchOrdersDetails);


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

      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes"
        cancelLabel="Cancel"
        onConfirm={StatusUpdate}
        onCancel={cancelUpdate}
        isLoading={labelLoading}
        disabled={!selectedMethod?.value}
      >
        <h3 className="text-2xl font-bold text-center bg-red-100 rounded-md text-red-600">
          Warning
        </h3>

        <h6 className="text-lg my-4 text-center font-bold">
          প্রোডাক্টটি স্টকে না থাকলে “Stock Out” সিলেক্ট করে কনফার্ম করুন,
          অন্যথায় কিছু করার প্রয়োজন নেই।
        </h6>
        <div className="mb-4">
          <SelectComponent
            options={stockOptions}
            value={selectedMethod}
            onChange={setSelectedMethod}
            placeholder="Select Stock Status"
            className=" w-full"
          />
        </div>

        <div className="flex items-center justify-center my-8">
          <Icon
            name="production_quantity_limits"
            variant="outlined"
            size={80}
            className="text-green-500"
          />
        </div>
      </Alert>

      <ModalX
        isSubmitting={isSubmitting}
        isModalOpen={isModalOpen}
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
            !isPrevDisabled && currentOrderIndex !== null
              ? orderIds[
                  isAssign ? currentOrderIndex - 1 : currentOrderIndex + 1
                ]
              : undefined
          }
          nextOrderId={
            !isNextDisabled && currentOrderIndex !== null
              ? orderIds[
                  isAssign ? currentOrderIndex + 1 : currentOrderIndex - 1
                ]
              : undefined
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
                <div className="flex items-center gap-2">
                  <div>
                    <span className="mb-1">
                      <span
                        className={`${getStatusStyle(
                          currentStatus,
                        )} capitalize px-4`}
                      >
                        {currentStatus === "ready-for-box"
                          ? "R-D"
                          : currentStatus === "waiting-payment"
                            ? "To be Paid"
                            : currentStatus}
                      </span>
                    </span>
                  </div>
                  {permissionList.includes("order_status_selected") &&
                    ![
                      "damaged",
                      "delivery",
                      "partial-delivery",
                      "exchange",
                      "return",
                      "refunded",
                      "cancel",
                    ].includes(orderDetails?.status) && (
                      <div
                        className="bg-green-100 text-green-600 px-2 rounded-lg cursor-pointer text-sm"
                        onClick={() => setSelectModalOpen(true)}
                      >
                        <button>Change</button>
                      </div>
                    )}
                </div>

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
                  fraudSummary={fraudSummary}
                  totalParcel={totalParcel}
                  totalDelivery={totalDelivery}
                />
              </div>

              <TopBarButtonGroup
                buttons={[
                  ...((hasPermission(permissionList, "order_warehouse_edit") &&
                    currentStatus === "pending") ||
                  currentStatus === "follow-up" ||
                  currentStatus === "waiting-payment" ||
                  currentStatus === "approved"
                    ? [
                        {
                          name: "Warehouse",
                          icon: "warehouse",
                          variant: "outlined",
                          color: "green-600",
                          onClick: () => setWarehouseModalOpen(true),
                        },
                      ]
                    : []),
                  ...(permissionList.includes("order_admin") &&
                  currentStatus === "delivery"
                    ? [
                        {
                          name: "Admin Order",
                          icon: "admin_panel_settings",
                          variant: "outlined",
                          color: "red-500",
                          onClick: () => setStatusModalOpenSource(true),
                        },
                      ]
                    : []),
                  ...(permissionList.includes("order_order_delivery") &&
                  currentStatus === "in-transit"
                    ? [
                        {
                          name: "Delivery",
                          icon: "send",
                          variant: "outlined",
                          color: "green-500",
                          onClick: () => handleDelivery(),
                        },
                      ]
                    : []),
                  ...(permissionList.includes("order_source_view") &&
                  ["pending", "follow-up"].includes(currentStatus)
                    ? [
                        {
                          name: "Source",
                          icon: "route",
                          variant: "outlined",
                          color: "cyan-500",
                          // size: 25,
                          onClick: () => setModalOpenSource(true),
                        },
                      ]
                    : []),

                  {
                    name: "Courier",
                    icon: "local_shipping",
                    variant: "outlined",
                    color: "orange-500",
                    onClick: () => setModalOpenPathao(true),
                  },
                  ...(permissionList.includes("order_payment_view")
                    ? [
                        {
                          name: "Order Payment",
                          icon: "attach_money",
                          variant: "outlined",
                          color: "blue-500",
                          onClick: () => handleAddAdvance(),
                        },
                      ]
                    : []),

                  ...(permissionList.includes("order_edit") &&
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

                  ...(hasPermission(
                    permissionList,
                    "order_edit",
                    "report_issue_create",
                  )
                    ? [
                        {
                          name: "Report",
                          icon: "report",
                          variant: "outlined",
                          color: "red-600",
                          onClick: () => setModalOpen(true),
                        },
                      ]
                    : []),
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
              <CustomerDetails
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
                iSSms={true}
              />
              <CustomerDetails
                customer={{
                  title: "Delivery Details",
                  first: orderDetails?.customer?.address,
                  second: orderDetails?.customer?.email,
                  copy: false,
                }}
                orderDetails={orderDetails}
                sysId={sysId}
                fetchOrdersDetails={fetchOrdersDetails}
                fetchPrintOrderDetails={fetchPrintOrderDetails}
                showUpdateCourier
                is_verified={orderDetails?.is_verified}
              />
            </div>
          )}
        </div>
        <div className="md:flex items-start justify-between gap-4">
          <div className="md:w-3/5 w-full ">
            <OrderStatus
              currentStep={currentStatus}
              updateOrderStatus={updateOrderStatus}
              orderDetails={orderDetails}
              statusLoading={statusLoading}
              setIsChecked={setIsChecked}
              isChecked={isChecked}
              handlePrint={handlePrint}
              fetchOrdersDetails={fetchOrdersDetails}
              fetchPrintOrderDetails={fetchPrintOrderDetails}
            />
            <OrderSummary
              sumary={sumary}
              date={orderDetails?.createdAt}
              isLoading={isSummaryLoading}
              fetchOrderSumary={fetchOrderSumary}
              domain={orderDetails?.domain}
              handleStatusUpdate={handleStatusUpdate}
              orderStatus={orderDetails?.status}
            />
          </div>

          <div className="md:w-2/5  md:mt-0 mt-2">
            <OrderNotes
              orderId={sysId}
              showCustomerNote={orderDetails}
              fetchOrdersDetail={fetchOrdersDetails}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              syncedNotes={syncedOrderNotes}
            />
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3 ">
              <OrderLogs logsData={logs.data} />
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
      <StatusModal
        isModalOpen={statusModalOpenSource}
        setIsModalOpen={setStatusModalOpenSource}
        orderId={sysId}
        currentStatus={currentStatus}
        fetchCurrentStatus={fetchCurrentStatus}
        fetchLogsDetails={fetchLogsDetails}
      />

      <WarehouseModal
        isModalOpen={warehouseModalOpen}
        setIsModalOpen={setWarehouseModalOpen}
        orderId={orderDetails?._id}
        orderDetail={orderDetails}
        fetchOrdersDetails={fetchOrdersDetails}
        fetchLogsDetails={fetchLogsDetails}
      />
      <ReportIssueModal
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        orderDetail={orderDetails}
      />
      <SelectStatusModal
        isModalOpen={selectModalOpen}
        setIsModalOpen={setSelectModalOpen}
        sysId={sysId}
        fetchCurrentStatus={fetchCurrentStatus}
        fetchLogsDetails={fetchLogsDetails}
      />
      <OrderAdvanceModal
        isModalOpen={advanceModalOpen}
        setIsModalOpen={setAdvanceModalOpen}
        modalMode={modalMode}
        getAdvanceList={fetchOrdersDetails}
        orderId={sysId}
        advanceData={advanceData}
        fetchAdvanceOrder={fetchAdvanceOrder}
        fetchOrderSumary={fetchOrderSumary}
        handleAddNewPayment={handleAddNewPayment}
        handleEditPayment={handleEditPayment}
        handlePrintInvoiceNew={fetchPrintOrderDetails}
      />
    </AuthLayout>
  );
};

const Page: React.FC = () => (
  <Suspense fallback={null}>
    <OrderViewPageContent />
  </Suspense>
);

export default Page;
