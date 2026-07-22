"use client";
import Icon from "@admin/components/core/Icon/Icon";
import StatusSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/StatusSkeleton";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { getStatusBgStyle, getStatusTextStyle } from "@admin/utils/system.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useMemo, useState } from "react";

interface OrderStatusProps {
  currentStep: string;
  updateOrderStatus: (key: string, reason?: string) => Promise<void>;
  statusLoading: boolean;
  orderDetails?: any;
  setIsChecked?: (v: boolean) => void;
  handlePrint?: any;
  isChecked: boolean;
}

const cancellationReasons = [
  "Customer want to cancel",
  "Payment issue",
  // "Can't my phone receive",
  "Double order",
  "Fake order",
  // "Wrong phone number",
  // "Busy Customer",
  // "Other",
];

const WholeSaleOrderStatus: React.FC<OrderStatusProps> = ({
  currentStep,
  updateOrderStatus,
  statusLoading,
  // setIsChecked,
  // isChecked,
  orderDetails,
  handlePrint,
}) => {
  const { userInfo, permissionList } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>("");
  const [loadingName, setLoadingName] = useState<string>("");

  const allStatus = [
    { label: "Pending", key: "pending", icon: "hourglass_empty" },
    { label: "To be Paid", key: "waiting-payment", icon: "attach_money" },
    { label: "Approved", key: "approved", icon: "add_task" },
    { label: "Printed", key: "printed", icon: "print" },
    { label: "R-D", key: "ready-for-box", icon: "rocket_launch" },
    { label: "Transit", key: "in-transit", icon: "local_shipping" },
    { label: "Return", key: "return", icon: "dangerous" },
    { label: "Follow Up", key: "follow-up", icon: "rss_feed" },
    { label: "Cancelled", key: "cancel", icon: "dangerous" },
    { label: "Refunded", key: "refunded", icon: "autorenew" },
  ];

  const visibleStatuses = useMemo(() => {
    const statusPermissionMap: Record<string, string[]> = {
      wholesale_order_pending: ["pending"],
      wholesale_order_to_be_paid: ["waiting-payment"],
      wholesale_order_approved: ["approved"],
      wholesale_order_printed: ["printed"],
      wholesale_order_rd: ["ready-for-box"],
      wholesale_order_transit: ["in-transit"],
      wholesale_order_return: ["return"],
      wholesale_order_follow_up: ["follow-up"],
      wholesale_order_delivery: ["delivery"],
      wholesale_order_cancelled: ["cancel"],
      wholesale_order_exchange: ["exchange"],
    };

    const allowedStatusKeys = Object.entries(statusPermissionMap)
      .filter(([permission]) => hasPermission(permissionList, permission))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .flatMap(([_, statuses]) => statuses);

    // if (userInfo?.role === "team-leader") return allStatus;

    const filterAllowed = (statuses: string[]) =>
      allStatus.filter(
        (s) => allowedStatusKeys.includes(s.key) && statuses.includes(s.key)
      );

    let filtered: any[] = [];

    switch (currentStep) {
      case "pending":
        filtered = filterAllowed([
          "pending",
          "waiting-payment",
          "approved",
          "follow-up",
          "cancel",
        ]);
        break;
      case "waiting-payment":
        filtered = filterAllowed([
          "waiting-payment",
          "approved",
          "follow-up",
          "cancel",
        ]);
        break;
      case "approved":
        filtered = filterAllowed([
          "approved",
          "follow-up",
          "cancel",
          "printed",
        ]);
        break;
      case "printed":
        filtered = filterAllowed([
          "printed",
          "ready-for-box",
          ...(userInfo?.role === "team-leader" ? ["cancel", "pending"] : []),
        ]);
        break;
      case "ready-for-box":
        filtered = filterAllowed([
          "ready-for-box",
          "in-transit",
          ...(userInfo?.role === "team-leader" ? ["cancel", "pending"] : []),
        ]);
        break;
      case "in-transit":
        filtered = filterAllowed(["in-transit", "return"]);
        break;
      case "follow-up":
        filtered = filterAllowed([
          "follow-up",
          "waiting-payment",
          "approved",
          "cancel",
        ]);
        break;
      default:
        filtered = allStatus.filter((s) => allowedStatusKeys.includes(s.key));
        break;
    }

    return filtered;
  }, [currentStep, permissionList, userInfo?.role, allStatus]);

  const handleClick = async (key: string, label: string) => {
    setLoadingName(label);
    if (statusLoading || loading) return;
    setLoading(true);

    if (key === "cancel") {
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (key === "printed") handlePrint?.();

    if (key === "approved") {
      if (
        !orderDetails?.customer?.city?.city_id ||
        !orderDetails?.customer?.zone?.zone_id
      ) {
        setLoading(false);
        return ToastService.warning(
          "Cannot set Approved: Customer city or zone is missing"
        );
      }
    }

    try {
      await updateOrderStatus(key);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const reasonToSend =
      selectedReason === "Other" ? customReason : selectedReason;
    if (!reasonToSend) return;

    setLoading(true);
    setShowModal(false);
    try {
      await updateOrderStatus("cancel", reasonToSend);
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = currentStep === "cancel";

  return (
    <div>
      {currentStep ? (
        <div
          className={`rounded-lg md:px-4 md:py-4 px-2 py-4 mb-3 dark:bg-gray-800 dark:border-gray-500 ${
            currentStep === "delivery"
              ? "bg-emerald-200 text-emerald-800 border border-emerald-300"
              : currentStep === "cancel"
              ? "bg-red-50 text-red-600 border border-red-300"
              : currentStep === "refunded"
              ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-300"
              : currentStep === "return"
              ? "bg-red-50 text-red-500 border border-red-300"
              : currentStep === "exchange"
              ? "bg-zinc-50 text-zinc-600 border border-zinc-300"
              : "bg-white  dark:bg-gray-800 shadow-md"
          }`}
        >
          {/* 🟢 Show message if the order is in final state */}
          {["delivery", "cancel", "refunded", "return", "exchange"].includes(
            currentStep
          ) ? (
            <p className="2xl:text-lg md:text-base text-sm py-4 text-center font-medium dark:text-gray-200">
              {currentStep === "delivery"
                ? "This product has already been delivered, so no further action is required. Thank you!"
                : currentStep === "cancel"
                ? "This product has already been canceled, so no further action is required. Thank you!"
                : currentStep === "refunded"
                ? "This product has already been refunded, so no further action is required. Thank you!"
                : currentStep === "return"
                ? "This product has already been returned, so no further action is required. Thank you!"
                : "This product has already been exchanged, so no further action is required. Thank you!"}
            </p>
          ) : (
            /* 🟡 Otherwise, show status buttons as before */
            <div className="flex items-center justify-between">
              {visibleStatuses?.length > 0 ? (
                visibleStatuses.map((step, index) => {
                  const isCurrentStep = currentStep === step.key;
                  const iconColor = isCancelled
                    ? step.key === "cancel"
                      ? "bg-red-600 border-red-500 text-white"
                      : "bg-gray-300 border-gray-200 text-white"
                    : isCurrentStep
                    ? `${getStatusBgStyle(currentStep)} text-white`
                    : "bg-gray-300 border-gray-200 text-white dark:bg-gray-500 dark:border-gray-400";

                  const labelColor = isCancelled
                    ? step.key === "cancel"
                      ? "text-red-600 dark:text-red-400 font-bold"
                      : "text-gray-600 dark:text-gray-400"
                    : isCurrentStep
                    ? `${getStatusTextStyle(currentStep)} font-bold`
                    : "text-gray-600 dark:text-gray-400";

                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center relative min-w-14 ">
                        <div className="relative">
                          <Icon
                            name={step.icon}
                            size={28}
                            onClick={() => {
                              if (!statusLoading && !loading) {
                                handleClick(step.key, step.label);
                              }
                            }}
                            className={`flex items-center justify-center size-11 p-1 rounded-full border-4 transition-all duration-300 ${iconColor} ${
                              !statusLoading && !loading
                                ? "cursor-pointer hover:opacity-80"
                                : "cursor-not-allowed"
                            }`}
                            variant="outlined"
                          />
                          {(statusLoading || loading) &&
                            loadingName === step.label && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-11 w-11 border-b-4 border-green-600"></div>
                              </div>
                            )}
                        </div>
                        <span
                          className={`mt-2 text-base text-nowrap ${labelColor}`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {index < visibleStatuses.length - 1 && (
                        <div
                          className="border-b border-gray-200 dark:border-gray-500 w-full"
                          style={{
                            marginTop: "-25px",
                            borderStyle: "dashed",
                            borderWidth: "2px",
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="w-full text-center py-2">
                  <p className="text-red-500 font-semibold text-base">
                    ⚠️ You don’t have permission to change this order status.
                    <br />
                    Please contact your administrator.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cancel Modal (unchanged) */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-96">
                <h2 className="text-lg font-bold mb-4 dark:text-gray-300">
                  Select Cancellation Reason
                </h2>
                <ul className="space-y-2 mb-2">
                  {cancellationReasons.map((reason, index) => (
                    <li key={index}>
                      <button
                        className={`w-full text-left px-2 py-1 rounded-lg hover:bg-gray-300  dark:text-gray-300 ${
                          selectedReason === reason
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                        onClick={() => setSelectedReason(reason)}
                      >
                        {reason}
                      </button>
                    </li>
                  ))}
                </ul>

                {selectedReason === "Other" && (
                  <div className="mt-4">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-600 dark:text-white"
                      placeholder="Enter custom reason"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg dark:text-gray-300"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                    disabled={
                      !selectedReason ||
                      (selectedReason === "Other" && !customReason)
                    }
                    onClick={handleCancel}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <StatusSkeleton />
      )}
    </div>
  );
};

export default WholeSaleOrderStatus;
