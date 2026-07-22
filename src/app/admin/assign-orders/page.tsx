"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableNoData from "@admin/components/Table/TableNoData";
import Image from "next/image";
import { getWebName, noData } from "@admin/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import { getStatusStyle } from "@admin/utils/system.utils";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import {
  OrderAssignmentService,
  AvailabilityStatus,
  IEmployeeAvailability,
} from "@admin/@services/apis/OrdersService/OrderAssignment.service";
import { ensureSocketConnected } from "@admin/@config/socket.config";
import {
  startAssignPresenceSession,
  stopAssignPresenceSession,
} from "@admin/@config/assignPresence.session";
import { useGlobalContext } from "@admin/context/GlobalContext";
import TransferOrdersModal from "@admin/components/pages/Orders/TransferOrdersModal";
import AssignOrdersStatusPanel, {
  AssignStatusFilter,
} from "@admin/components/pages/Orders/AssignOrdersStatusPanel";

type AssignOrdersView = "assigned" | AssignStatusFilter;

/** UI refresh — socket handles realtime; poll matches typical assign cadence (~15s). */
const QUEUE_REFRESH_INTERVAL_MS = 15_000;
const QUEUE_REFRESH_INTERVAL_SEC = QUEUE_REFRESH_INTERVAL_MS / 1000;
const ASSIGN_VIEW_PERMISSION = "order_assignment_view";
const ASSIGN_TRANSFER_PERMISSION = "order_assignment_transfer";
const ASSIGN_ONLINE_SESSION_KEY = "assignOrdersStayOnline";

const isOnlineStatus = (status?: AvailabilityStatus) =>
  status === "available" || status === "busy";

const formatRefreshCountdown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const Page: React.FC = () => {
  const router = useRouter();
  const { permissionList, userInfo, canFetchPageData } = useGlobalContext();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);

  const [assignedOrders, setAssignedOrders] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [availability, setAvailability] =
    useState<IEmployeeAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [requestingOrders, setRequestingOrders] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [orderView, setOrderView] = useState<AssignOrdersView>("assigned");
  const [refreshSecondsLeft, setRefreshSecondsLeft] = useState(
    QUEUE_REFRESH_INTERVAL_SEC,
  );
  const nextRefreshAtRef = useRef<number>(
    Date.now() + QUEUE_REFRESH_INTERVAL_MS,
  );

  const online = isOnlineStatus(availability?.status);
  const canViewAssign = permissionList?.includes(ASSIGN_VIEW_PERMISSION);
  const canTransfer = permissionList?.includes(ASSIGN_TRANSFER_PERMISSION);

  const myUserId = String(userInfo?.id || "");

  const resetRefreshTimer = useCallback(() => {
    nextRefreshAtRef.current = Date.now() + QUEUE_REFRESH_INTERVAL_MS;
    setRefreshSecondsLeft(QUEUE_REFRESH_INTERVAL_SEC);
  }, []);

  const fetchMyQueue = useCallback(async () => {
    try {
      const res = await OrderAssignmentService.getMyQueue({
        page: 1,
        limit: 50,
        sort: "-createdAt",
      });
      if (res?.success) {
        const list = res?.data?.data ?? res?.data ?? [];
        setAssignedOrders(Array.isArray(list) ? list : []);
      } else {
        ToastService.error(res?.message || "Failed to load assigned orders");
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to load assigned orders");
    }
  }, []);

  const fetchAvailability =
    useCallback(async (): Promise<IEmployeeAvailability | null> => {
      try {
        const res = await OrderAssignmentService.getMe();
        if (res?.success) {
          setAvailability(res.data);
          return res.data;
        }
      } catch (err: any) {
        ToastService.error(err?.message || "Failed to load availability");
      }
      return null;
    }, []);

  const initPage = useCallback(async () => {
    if (!canViewAssign) {
      setTableLoading(false);
      setAvailabilityLoading(false);
      return;
    }

    setAvailabilityLoading(true);
    setAssignedOrders([]);
    setOrderView("assigned");

    try {
      const availabilityData = await fetchAvailability();
      const shouldRestoreOnline =
        typeof window !== "undefined" &&
        sessionStorage.getItem(ASSIGN_ONLINE_SESSION_KEY) === "true";

      if (shouldRestoreOnline && isOnlineStatus(availabilityData?.status)) {
        setTableLoading(true);
        await fetchMyQueue();
        resetRefreshTimer();
      } else {
        if (isOnlineStatus(availabilityData?.status)) {
          const offlineRes = await OrderAssignmentService.goOffline();
          if (offlineRes?.success) {
            setAvailability(offlineRes.data);
          } else {
            setAvailability({ status: "offline" });
          }
        } else {
          setAvailability(availabilityData || { status: "offline" });
        }

        if (typeof window !== "undefined") {
          sessionStorage.removeItem(ASSIGN_ONLINE_SESSION_KEY);
        }
        setOrderView("assigned");
        stopAssignPresenceSession();
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to initialize page");
      setAvailability({ status: "offline" });
      stopAssignPresenceSession();
    } finally {
      setAvailabilityLoading(false);
      setTableLoading(false);
    }
  }, [canViewAssign, fetchAvailability, fetchMyQueue, resetRefreshTimer]);

  useEffect(() => {
    if (!canFetchPageData) return;
    initPage();
  }, [canFetchPageData, initPage]);

  // Safety-net UI refresh (realtime via assign:queue-updated + heartbeat fill)
  useEffect(() => {
    if (!online) return;

    const refreshQueue = async () => {
      try {
        await fetchMyQueue();
        const res = await OrderAssignmentService.getMe();
        if (res?.success && res.data) {
          setAvailability((prev) => ({
            ...(prev || { status: "available" }),
            ...res.data,
          }));
        }
      } catch {
        // keep silent
      } finally {
        resetRefreshTimer();
      }
    };

    resetRefreshTimer();
    const intervalId = window.setInterval(
      refreshQueue,
      QUEUE_REFRESH_INTERVAL_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [online, fetchMyQueue, resetRefreshTimer]);

  useEffect(() => {
    if (!online) return;

    const tick = () => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((nextRefreshAtRef.current - Date.now()) / 1000),
      );
      setRefreshSecondsLeft(secondsLeft);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [online]);

  // Keep presence while online — do NOT tear down on route leave / unmount
  useEffect(() => {
    // Wait until availability is loaded so a brief null state doesn't stop session
    if (availability == null) return;
    if (!online) {
      stopAssignPresenceSession();
      return;
    }
    startAssignPresenceSession();
  }, [online, availability]);

  // Transfer realtime: both from/to agents refresh queue + counts
  useEffect(() => {
    if (!myUserId) return;
    const socket = ensureSocketConnected();
    if (!socket) return;

    const onQueueUpdated = (payload: {
      user_id?: string;
      user_ids?: string[];
      from_user?: string;
      to_user?: string;
    }) => {
      const ids = new Set(
        [
          ...(Array.isArray(payload?.user_ids) ? payload.user_ids : []),
          payload?.user_id,
          payload?.from_user,
          payload?.to_user,
        ]
          .filter(Boolean)
          .map((id) => String(id)),
      );
      if (!ids.has(myUserId)) return;
      fetchMyQueue();
      fetchAvailability();
      resetRefreshTimer();
    };
    socket.on("assign:queue-updated", onQueueUpdated);
    return () => {
      socket.off("assign:queue-updated", onQueueUpdated);
    };
  }, [myUserId, fetchMyQueue, fetchAvailability, resetRefreshTimer]);

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

  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

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

  const handleToggleOnline = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (online) {
        const res = await OrderAssignmentService.goOffline();
        if (!res?.success) {
          ToastService.error(res?.message || "Failed to go offline");
          return;
        }
        setAvailability(res.data);
        setAssignedOrders([]);
        setOrderView("assigned");
        stopAssignPresenceSession();
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(ASSIGN_ONLINE_SESSION_KEY);
        }
      } else {
        const res = await OrderAssignmentService.goOnline();
        if (!res?.success) {
          ToastService.error(res?.message || "Failed to go online");
          return;
        }
        if (typeof window !== "undefined") {
          sessionStorage.setItem(ASSIGN_ONLINE_SESSION_KEY, "true");
        }
        setAvailability(res.data?.availability || res.data);
        setOrderView("assigned");
        setTableLoading(true);
        const orders = res.data?.assigned_orders;
        if (Array.isArray(orders) && orders.length > 0) {
          setAssignedOrders(orders);
        }
        startAssignPresenceSession();
        await fetchMyQueue();
        setTableLoading(false);
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to update availability");
    } finally {
      setToggling(false);
    }
  };

  const handleNeedOrders = async () => {
    if (requestingOrders) return;
    setRequestingOrders(true);
    try {
      const res = await OrderAssignmentService.requestNeedOrders();
      if (!res?.success) {
        ToastService.error(res?.message || "Failed to request orders");
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to request orders");
    } finally {
      setRequestingOrders(false);
    }
  };

  const statusLabel = availability?.status || "offline";
  const statusStyles: Record<
    string,
    { dot: string; badge: string; label: string }
  > = {
    available: {
      dot: "bg-emerald-500",
      badge:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
      label: "Available",
    },
    busy: {
      dot: "bg-amber-500",
      badge:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
      label: "Busy",
    },
    break: {
      dot: "bg-yellow-500",
      badge:
        "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30",
      label: "Break",
    },
    offline: {
      dot: "bg-gray-400",
      badge:
        "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600",
      label: "Offline",
    },
  };
  const currentStatusStyle = statusStyles[statusLabel] || statusStyles.offline;

  const skeletonBar = "rounded bg-gray-200 dark:bg-gray-600 animate-pulse";

  const viewButtonClass = (view: AssignOrdersView) =>
    `inline-flex h-9 items-center rounded-lg px-3.5 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
      orderView === view
        ? "bg-indigo-600 text-white hover:bg-indigo-700"
        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700/40 dark:text-gray-200 dark:hover:bg-gray-700"
    }`;

  const tableTitle =
    !online && orderView === "assigned"
      ? "Assign Orders"
      : orderView === "assigned"
        ? "Your Assigned Orders"
        : orderView === "waiting-payment"
          ? "To be Paid Orders"
          : "Follow Up Orders";

  const showOfflinePage = !online && orderView === "assigned";

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 mb-3">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 px-4 py-3 shadow-sm">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-100 shrink-0">
              {tableTitle}
            </h2>

            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-600 shrink-0" />

            {availabilityLoading ? (
              <div className="flex items-center gap-2 min-h-[32px]">
                <span className={`h-8 w-36 rounded-full ${skeletonBar}`} />
              </div>
            ) : (
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shrink-0 ${currentStatusStyle.badge}`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${currentStatusStyle.dot} ${
                    online ? "animate-pulse" : ""
                  }`}
                />
                <span className="capitalize">{currentStatusStyle.label}</span>
                {typeof availability?.active_order_count === "number" && (
                  <>
                    <span className="opacity-40">·</span>
                    <span className="font-semibold tabular-nums">
                      {availability.active_order_count}
                      {availability.max_orders
                        ? ` / ${availability.max_orders}`
                        : ""}
                    </span>
                    <span className="opacity-80">orders</span>
                  </>
                )}
              </div>
            )}

            {!availabilityLoading && online && (
              <>
                <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-600 shrink-0" />
                <div
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 text-sm text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 shrink-0"
                  title={`Order list refreshes every ${QUEUE_REFRESH_INTERVAL_SEC} seconds. New orders also arrive instantly via socket.`}
                >
                  <Icon name="sync" className="text-base opacity-80" />
                  <span className="hidden sm:inline text-xs opacity-80">
                    Next update
                  </span>
                  <span className="font-semibold tabular-nums min-w-[36px]">
                    {formatRefreshCountdown(refreshSecondsLeft)}
                  </span>
                </div>
              </>
            )}

            <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-600 shrink-0" />

            {availabilityLoading ? (
              <div className="flex items-center gap-2 min-h-[36px]">
                {canTransfer ? (
                  <span className={`h-9 w-32 rounded-lg ${skeletonBar}`} />
                ) : (
                  <span className={`h-9 w-28 rounded-lg ${skeletonBar}`} />
                )}
                <span className={`h-9 w-28 rounded-lg ${skeletonBar}`} />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {canTransfer && (
                  <button
                    type="button"
                    onClick={() => setTransferOpen(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    <Icon name="swap_horiz" className="text-base" />
                    Transfer orders
                  </button>
                )}
                {online && !canTransfer && (
                  <button
                    type="button"
                    disabled={requestingOrders}
                    onClick={handleNeedOrders}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50"
                  >
                    <Icon name="add_shopping_cart" className="text-base" />
                    {requestingOrders ? "Sending…" : "Need orders"}
                  </button>
                )}

                <div className="inline-flex h-9 items-center gap-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 px-3">
                  <span
                    className={`text-sm font-medium ${
                      online
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {online ? "Online" : "Offline"}
                  </span>
                  <ToggleSwitch
                    isChecked={online}
                    disabled={toggling}
                    onToggle={handleToggleOnline}
                  />
                </div>

                <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-600 shrink-0" />

                {online && (
                  <button
                    type="button"
                    onClick={() => setOrderView("assigned")}
                    className={viewButtonClass("assigned")}
                  >
                    Assign Order
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOrderView("recall")}
                  className={viewButtonClass("recall")}
                >
                  Recall
                </button>
                <button
                  type="button"
                  onClick={() => setOrderView("waiting-payment")}
                  className={viewButtonClass("waiting-payment")}
                >
                  To be Paid
                </button>
                <button
                  type="button"
                  onClick={() => setOrderView("follow-up")}
                  className={viewButtonClass("follow-up")}
                >
                  Follow Up
                </button>
              </div>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          {availabilityLoading ? (
            <div className="min-h-[700px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
              <span className={`h-10 w-48 rounded-lg ${skeletonBar}`} />
            </div>
          ) : showOfflinePage ? (
            <div className="min-h-[700px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <TableNoData isSwitch={false} />
            </div>
          ) : orderView === "assigned" ? (
            <>
              <TableWrapper
                showCheckbox={true}
                data={assignedOrders}
                noDataViewCondition={
                  assignedOrders?.length < 1 ? "No data available" : null
                }
                isSwitchOn={availabilityLoading ? true : online}
                isLoading={tableLoading}
                className="min-h-[700px]"
                colValue={9}
                printLabel="Label Print"
                orderListPrintBtn={true}
                orderInvoicePrintBtn={true}
              >
                <Thead>
                  <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
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
                    <Th className="text-blue-900 dark:text-gray-200">
                      Actions
                    </Th>
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
                                  String(order?.sysid ?? ""),
                                );
                                ToastService.success(
                                  "Order ID copied to clipboard!",
                                );
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
                            <span>
                              {formatTimeAgo(
                                order?.createdAt || order?.order_created,
                              ) || noData}
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
                              onClick={() =>
                                copyToClipboard(order?.customer?.phone)
                              }
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
                                const src =
                                  item?.product_id?.featured_image?.src;
                                return (
                                  <div
                                    key={itemIndex}
                                    className="flex items-center"
                                  >
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
                            {Array.isArray(order?.notes) &&
                            order.notes.length > 0
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
                                localStorage.setItem(
                                  "viewOrderStatus",
                                  order.status,
                                );
                              }

                              const idStr = String(order?._id);
                              if (idStr) {
                                router.push(`/admin/assign-orders/view/${idStr}`);
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
                                className="absolute top-8 right-0 bg-white dark:bg-gray-700 border shadow-md rounded-lg p-2 z-20 min-w-40"
                              >
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/assign-orders/edit/${String(order?._id)}`,
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
            </>
          ) : (
            <AssignOrdersStatusPanel key={orderView} status={orderView} />
          )}
        </div>
      </div>

      {canTransfer && (
        <TransferOrdersModal
          isOpen={transferOpen}
          onClose={() => setTransferOpen(false)}
          onTransferred={() => {
            fetchMyQueue();
            fetchAvailability();
            resetRefreshTimer();
          }}
        />
      )}
    </AuthLayout>
  );
};

export default Page;
