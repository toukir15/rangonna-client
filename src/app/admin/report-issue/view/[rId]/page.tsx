"use client";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import { ToastService } from "@admin/utils/toastr.service";
import { getPaymentStatusStyle, getStatusStyle } from "@admin/utils/system.utils";
import { formatDateTime, formatTimeAgo } from "@admin/utils/hook.utils";
import ReturnTracker from "@admin/components/pages/Return/SaleReturn/ReturnTracker";
import ReportIssueLogs from "@admin/components/pages/ReportIssue/ReportIssueLogs";
import Image from "next/image";
import nodata from "@admin/assets/images/profile.png";
import Input from "@admin/components/core/Input/Input";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import * as yup from "yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { useGlobalContext } from "@admin/context/GlobalContext";
import ReportIssueSkeleton from "@admin/components/Skeleton/ReportIssue/ReportIssue.skeleton";
import ReportIssueLogsSkeleton from "@admin/components/Skeleton/ReportIssue/ReportIssueLogs.skeleton";
import CustomerReceipt from "@admin/components/pages/Orders/PrintScreen/CustomerReceipt";
import SupplierReceipt from "@admin/components/pages/Orders/PrintScreen/SupplierReceipt";
import ViewReportIssueModal from "@admin/components/pages/ReportIssue/ViewRportIssueModal";
import DescriptionEditModal from "@admin/components/pages/ReportIssue/DescriptionEditModal";
import {
  IReportIssueDetails,
  IReportIssueNoteEntry,
  IReportIssueNotesResponse,
} from "@admin/@interfaces/reportIssue/reportIssue.interface";
import { IBaseResponse } from "@admin/@interfaces/common.interface";
import { AdvanceSalaryService } from "@admin/@services/apis/SalaryManager/AdvanceSalary/AdvanceSalary.service";
import OrderPageNavigator from "@admin/components/pages/Orders/ViewOrder/OrderPageNavigator";
import { useReactToPrint } from "react-to-print";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import IssuePrintSlip from "@admin/components/pages/AllOrders/IssuePrintSlip";
import ReportIssueAdModal from "@admin/components/pages/ReportIssue/ReportIssueAdvanceModal";
interface ICommentForm {
  comment: string;
}

const defaultValue: ICommentForm = {
  comment: "",
};

const webSchema = yup.object({
  comment: yup.string().required("Comment is required"),
});

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();
  const { rId } = useParams();
  const [singleData, setSingleData] = useState<any>();
  const [noteData, setNotesData] = useState<any>();
  const [logsData, setLogsData] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [logsLoading, setLogsLoading] = useState<boolean>(true);
  const [cardLoading, setCardLoading] = useState<boolean>(true);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { userInfo } = useGlobalContext();
  /** Scroll only the chat panel — avoid scrollIntoView (scrolls the whole window). */
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenDescription, setModalOpenDescription] = useState(false);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit" | "View">("Add");
  const [advanceData, setAdvanceData] = useState<any>();
  const [advanceLoading, setAdvanceLoading] = useState(false);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number | null>(
    null,
  );
  const [orderIds, setOrderIds] = useState<string[]>([]);

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [printType, setPrintType] = useState<"invoice" | "packing" | null>(
    null,
  );

  const isCurrentPrinting = printingOrderId === singleData?._id;

  const { handleSubmit, register, reset, setFocus } = useForm<ICommentForm>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  // useEffect(() => {
  //   if (sysId && orderIds.length > 0) {
  //     const index = orderIds.indexOf(sysId.toString());
  //     setCurrentOrderIndex(index !== -1 ? index : null);
  //   }
  // }, [sysId, orderIds]);

  useEffect(() => {
    if (rId) {
      getReportIssueDetails();
    }
  }, [rId]);

  const fetchNextPreviousOrders = async () => {
    const statusFromStorage = localStorage.getItem(
      "viewReportIssueOrderStatus",
    );
    if (!statusFromStorage) return;

    try {
      const res = await OrdersService.updateReportIssueNextOrder(
        statusFromStorage,
      );
      if (res?.success) {
        setOrderIds(res.data || []);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to load navigation list");
    }
  };

  useEffect(() => {
    fetchNextPreviousOrders();
  }, [rId]);

  const scrollMessagesToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    const run = () => {
      const el = messagesScrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
    if (behavior === "auto") {
      window.setTimeout(run, 120);
    }
  };

  const getReportIssueDetails = () => {
    let id: string | undefined;

    // Normalize rId (string | string[])
    if (typeof rId === "string") {
      id = rId;
    } else if (Array.isArray(rId)) {
      id = rId[0];
    }

    if (!id) return;

    // Prepare payload
    // const payload = id.startsWith("order_id")
    //   ? {
    //     order_id: id.replace(/^order_id_?/, ""),
    //   }
    //   : {
    //     issue_id: id,
    //   };

    ReportIssueCategoryService.getSingleReportIssue(id)
      .then((res: any) => {
        if (res?.success) {
          setSingleData(res.data);
          setCurrentStatus(res.data.status);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setCardLoading(false);
      });
  };

  const updateOrderStatus = async (newStatus: string) => {
    setStatusLoading(true);

    ReportIssueCategoryService.statusUpdate(singleData?._id, {
      status: newStatus,
    })
      .then((res: IBaseResponse<null>) => {
        if (res?.success) {
          ToastService.success(res?.message);
          getReportIssueDetails();
          getReportIssueLogs();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => ToastService.error(err.message))
      .finally(() => {
        setStatusLoading(false);
      });
  };

  const getReportIssueComments = () => {
    let id: string | undefined;

    // Normalize rId (string | string[])
    if (typeof rId === "string") {
      id = rId;
    } else if (Array.isArray(rId)) {
      id = rId[0];
    }

    if (!id) return;

    // Prepare payload
    // const payload = id.startsWith("order_id")
    //   ? {
    //     order_id: id.replace(/^order_id_?/, ""),
    //   }
    //   : {
    //     issue_id: id,
    //   };

    return ReportIssueCategoryService.getReportIssueComment(id)
      .then((res: IReportIssueNotesResponse) => {
        if (res?.success) {
          setNotesData(res.data);
          return res.data;
        } else {
          ToastService.error(res?.message);
          return null;
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
        return null;
      });
  };

  const getReportIssueLogs = () => {
    let id: string | undefined;

    // Normalize rId (string | string[])
    if (typeof rId === "string") {
      id = rId;
    } else if (Array.isArray(rId)) {
      id = rId[0];
    }

    if (!id) return;

    // Prepare payload
    // const payload = id.startsWith("order_id")
    //   ? {
    //     order_id: id.replace(/^order_id_?/, ""),
    //   }
    //   : {
    //     issue_id: id,
    //   };
    ReportIssueCategoryService.getReportIssueLogs(id)
      .then((res: any) => {
        if (res?.success) {
          setLogsData(res.data.logs);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setLogsLoading(false);
      });
  };

  useEffect(() => {
    if (rId) {
      getReportIssueLogs();
      getReportIssueComments();
    }
  }, [rId]);

  /** Chat mounts only after cardLoading — scroll to latest message on open & when notes load. */
  useEffect(() => {
    if (cardLoading) return;
    const count = noteData?.notes?.length ?? 0;
    if (count === 0) return;
    scrollMessagesToBottom("auto");
    const retry = window.setTimeout(() => scrollMessagesToBottom("auto"), 200);
    return () => clearTimeout(retry);
  }, [cardLoading, noteData?.notes?.length, rId]);

  const formSubmit: SubmitHandler<ICommentForm> = (data) => {
    setIsSubmit(true);

    ReportIssueCategoryService.createReportIssueComment(singleData?._id, {
      notes: { text: data.comment },
    })
      .then((res: any) => {
        if (res?.success) {
          getReportIssueComments()?.then(() => {
            scrollMessagesToBottom("smooth");
          });
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
        reset();
        if (permissionList.includes("report_issue_edit")) {
          setTimeout(() => setFocus("comment"), 0);
        }
      });
  };

  const handleOrderCouponPrint = (
    selectedOrdersData: IReportIssueDetails | undefined,
  ) => {
    if (!selectedOrdersData) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(CustomerReceipt({ selectedOrdersData }));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 1000);
    }
  };
  const handleSupplierCouponPrint = (
    selectedOrdersData: IReportIssueDetails | undefined,
  ) => {
    if (!selectedOrdersData) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(SupplierReceipt({ selectedOrdersData }));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 1000);
    }
  };

  const handleAddAdvance = async () => {
    if (advanceLoading) return; // double click prevent
    setAdvanceLoading(true);

    try {
      const list = await fetchAdvanceOrder();

      if (list?.length > 0) {
        setModalMode("View");
      } else {
        setModalMode("Add");
      }

      setAdvanceModalOpen(true);
    } finally {
      setAdvanceLoading(false);
    }
  };

  // const handleAddAdvance = async () => {
  //   const list = await fetchAdvanceOrder();

  //   if (list?.length > 0) {
  //     setModalMode("View");
  //   } else {
  //     setModalMode("Add");
  //   }

  //   setAdvanceModalOpen(true);
  // };
  const handleAddNewPayment = () => {
    setModalMode("Add");
    setAdvanceModalOpen(true);
  };
  const handleEditPayment = () => {
    setModalMode("Edit");
    setAdvanceModalOpen(true);
  };

  const fetchAdvanceOrder = async () => {
    try {
      const res: any = await AdvanceSalaryService.getAdvanceOrderReportIssueId(
        singleData?._id,
      );
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

  const isPrevDisabled =
    currentOrderIndex === null || currentOrderIndex >= orderIds.length - 1;
  const isNextDisabled = currentOrderIndex === null || currentOrderIndex <= 0;

  const handleNextOrder = () => {
    if (currentOrderIndex !== null && currentOrderIndex > 0) {
      const nextId = orderIds[currentOrderIndex - 1];
      router.push(`/admin/report-issue/view/${nextId}`);
    }
  };
  const handlePrevOrder = () => {
    if (currentOrderIndex !== null && currentOrderIndex < orderIds.length - 1) {
      const prevId = orderIds[currentOrderIndex + 1];
      router.push(`/admin/report-issue/view/${prevId}`);
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
      // setPopupIndex(null);
    },
  });

  const fetchAndPrint = async (
    orderId: string,
    type: "invoice" | "packing",
  ) => {
    try {
      setPrintingOrderId(orderId);
      setPrintType(type);

      const res: any = await OrdersService.getReportIssueInvoice(orderId);

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

  const handlePackingSlipPrintClick = async (orderId: string) => {
    await fetchAndPrint(orderId, "packing");
  };

  useEffect(() => {
    const currentId =
      singleData?._id || (typeof rId === "string" ? rId : rId?.[0]);

    if (currentId && orderIds.length > 0) {
      const index = orderIds.findIndex((id) => id === currentId);
      setCurrentOrderIndex(index !== -1 ? index : null);
    } else {
      setCurrentOrderIndex(null);
    }
  }, [singleData?._id, rId, orderIds]);

  return (
    <AuthLayout>
      <div className="hidden">
        {invoiceData && printType === "packing" && (
          <IssuePrintSlip ref={printRef} invoiceData={invoiceData} />
        )}
      </div>
      <div className="px-4 pt-4 min-h-[85%]">
        <div className="mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Order Navigation
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {singleData?.issue_title}
                </h2>
              </div>

              <div className="rounded-xl bg-slate-50 p-1 dark:bg-slate-800/70">
                <OrderPageNavigator
                  prevOrderId={
                    !isPrevDisabled
                      ? orderIds[currentOrderIndex + 1]
                      : undefined
                  }
                  nextOrderId={
                    !isNextDisabled
                      ? orderIds[currentOrderIndex - 1]
                      : undefined
                  }
                  handlePrevOrder={handlePrevOrder}
                  handleNextOrder={handleNextOrder}
                />
              </div>
            </div>
          </div>
        </div>
        {cardLoading ? (
          <ReportIssueSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            {/* Left Main Card */}
            <div className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              {/* Header Action Bar */}
              <div className="flex flex-col gap-4 border-b border-slate-100 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  {permissionList.includes("report_issue_payment_view") && (
                    <button
                      type="button"
                      disabled={advanceLoading}
                      onClick={advanceLoading ? undefined : handleAddAdvance}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 ${
                        advanceLoading ? "cursor-not-allowed opacity-70" : ""
                      }`}
                    >
                      <Icon
                        name={advanceLoading ? "autorenew" : "attach_money"}
                        variant="outlined"
                        className={advanceLoading ? "animate-spin" : ""}
                      />
                    </button>
                  )}

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      Payment Status
                    </p>
                    <p
                      className={getPaymentStatusStyle(
                        singleData?.payment?.status,
                      )}
                    >
                      {singleData?.payment?.status}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handlePackingSlipPrintClick(singleData?._id)}
                    disabled={isCurrentPrinting}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${
                      isCurrentPrinting
                        ? "cursor-not-allowed bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isCurrentPrinting && printType === "packing" ? (
                      <ButtonLoader />
                    ) : (
                      "Invoice"
                    )}
                  </button>

                  {permissionList.includes("report_issue_edit") && (
                    <Button
                      className="!rounded-xl !bg-teal-600 !px-4 !py-2 !text-sm !font-semibold hover:!bg-teal-700"
                      onClick={() => setModalOpen(true)}
                    >
                      Pathao
                    </Button>
                  )}

                  <Button
                    className="!rounded-xl !bg-indigo-600 !px-4 !py-2 !text-sm !font-semibold hover:!bg-indigo-700"
                    onClick={() => handleOrderCouponPrint(singleData)}
                  >
                    Customer Receipt
                  </Button>

                  <Button
                    className="!rounded-xl !bg-emerald-600 !px-4 !py-2 !text-sm !font-semibold hover:!bg-emerald-700"
                    onClick={() => handleSupplierCouponPrint(singleData)}
                  >
                    Supplier Receipt
                  </Button>
                </div>
              </div>

              <div className="p-4">
                {/* Info Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-slate-700 dark:text-slate-200">
                      <Icon name="person" variant="outlined" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-slate-400">
                      Customer
                    </p>
                    <h2 className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">
                      {singleData?.name}
                    </h2>
                    <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p>
                        <a
                          href={`tel:${singleData?.phone}`}
                          className="hover:underline"
                        >
                          {singleData?.phone}
                        </a>
                      </p>
                      <p>Amount: {singleData?.payment?.amount}</p>
                      <p className="truncate">{singleData?.consignment_id}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-slate-200">
                      <Icon name="inventory_2" variant="outlined" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-slate-400">
                      Issue ID
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                      {singleData?.order_sysid}
                    </h2>
                    <p className="mt-2 truncate text-xs text-slate-500 dark:text-slate-300">
                      {singleData?.consignment_id}
                    </p>
                    <span className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-slate-700 dark:text-slate-200">
                      {singleData?.status === "ready-for-box"
                        ? "R-D"
                        : singleData?.status === "waiting-payment"
                          ? "To be Paid"
                          : singleData?.status}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-slate-700 dark:text-slate-200">
                      <Icon name="report" variant="outlined" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-purple-700 dark:text-slate-400">
                      Issue Type
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-base font-bold text-slate-900 dark:text-white">
                      {singleData?.issue_title}
                    </h2>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
                      {formatDateTime(singleData?.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-slate-700 dark:text-slate-200">
                      <Icon name="category" variant="outlined" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-slate-400">
                      Issue Subtitle
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-base font-bold text-slate-900 dark:text-white">
                      {singleData?.issue_sub_title}
                    </h2>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-300">
                      {formatDateTime(singleData?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Products */}
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {singleData?.report_issue_line_items?.map(
                    (data: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800"
                      >
                        <Image
                          src={data.image}
                          alt={data.title || "product"}
                          height={60}
                          width={60}
                          className="h-14 w-14 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                        />
                        <p className="line-clamp-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {data.title}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                {/* Description */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      Description
                    </p>

                    {permissionList.includes("report_issue_edit") && (
                      <Icon
                        name="edit_square"
                        variant="filled"
                        className="cursor-pointer text-slate-400 transition hover:text-blue-600"
                        onClick={() => setModalOpenDescription(true)}
                      />
                    )}
                  </div>

                  <p className="rounded-xl bg-white p-3 text-sm leading-6 text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    {singleData?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Notes Card */}
            <div className="xl:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Conversation
                    </p>
                    <p className="mt-1 font-bold text-slate-900 dark:text-white">
                      Issue #{singleData?.order_sysid}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {singleData?.user?.name}
                    </p>
                  </div>

                  <p
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                      singleData?.status,
                    )}`}
                  >
                    {singleData?.status === "ready-for-box"
                      ? "R-D"
                      : singleData?.status === "waiting-payment"
                        ? "To be Paid"
                        : singleData?.status}
                  </p>
                </div>
              </div>

              <div
                ref={messagesScrollRef}
                className="h-[375px] space-y-3 overflow-y-auto overflow-x-hidden p-4"
              >
                {noteData?.notes?.map(
                  (data: IReportIssueNoteEntry, index: number) => {
                    const isCurrentUser = userInfo?.id === data?.user?._id;

                    return (
                      <div
                        key={index}
                        className={`flex items-end gap-2 ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isCurrentUser && (
                          <Image
                            className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                            src={nodata}
                            alt=""
                          />
                        )}

                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-2 shadow-sm ${
                            isCurrentUser
                              ? "rounded-br-md bg-blue-600 text-white"
                              : "rounded-bl-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {!isCurrentUser && (
                            <p className="mb-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                              {data?.user?.name}
                            </p>
                          )}

                          <p className="text-sm leading-5">{data?.text}</p>

                          <p
                            className={`mt-1 text-[11px] ${
                              isCurrentUser ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            {formatTimeAgo(data?.createdAt)}
                          </p>
                        </div>

                        {isCurrentUser && (
                          <Image
                            className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                            src={nodata}
                            alt=""
                          />
                        )}
                      </div>
                    );
                  },
                )}
              </div>

              <div
                className={`border-t border-slate-100 px-4 dark:border-slate-800 ${
                  !permissionList.includes("report_issue_edit")
                    ? "cursor-not-allowed"
                    : ""
                }`}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSubmit(formSubmit)(e);
                  }}
                >
                  <div className="relative">
                    <Input
                      isDisabled={!permissionList.includes("report_issue_edit")}
                      placeholder="Write a comment..."
                      registerProperty={register("comment")}
                      classNames="!px-0 relative"
                      iconRight={
                        <Button
                          type="submit"
                          className="!absolute !-right-4 !-top-9 !rounded-lg !bg-blue-600 !px-8 !py-[5px] hover:!bg-blue-700"
                        >
                          {isSubmit ? (
                            <ButtonLoader className="!w-6 py-[5px]" />
                          ) : (
                            <Icon name="send" className="mt-1" />
                          )}
                        </Button>
                      }
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Issue Progress
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                Track Issue
              </h3>
            </div>

            <div className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Current: {currentStatus}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <ReturnTracker
              currentStep={currentStatus}
              updateOrderStatus={updateOrderStatus}
              statusLoading={statusLoading}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-blue-600" />
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Activity Logs
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Latest issue status updates
                </p>
              </div>
            </div>

            <div className="border-l-2 border-slate-200 pl-4 dark:border-slate-700">
              {logsLoading ? (
                <ReportIssueLogsSkeleton />
              ) : (
                <ReportIssueLogs logsData={logsData} />
              )}
            </div>
          </div>
        </div>

        <ViewReportIssueModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          orderDetail={singleData}
        />
        <DescriptionEditModal
          isModalOpen={modalOpenDescription}
          setIsModalOpen={setModalOpenDescription}
          orderDetail={singleData}
          getReportIssueDetails={getReportIssueDetails}
        />
        <ReportIssueAdModal
          isModalOpen={advanceModalOpen}
          setIsModalOpen={setAdvanceModalOpen}
          modalMode={modalMode}
          getAdvanceList={getReportIssueLogs}
          singleData={singleData}
          advanceData={advanceData}
          fetchAdvanceOrder={fetchAdvanceOrder}
          fetchOrderSumary={getReportIssueDetails}
          handleAddNewPayment={handleAddNewPayment}
          handleEditPayment={handleEditPayment}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
