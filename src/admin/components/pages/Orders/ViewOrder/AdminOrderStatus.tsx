"use client";
import Icon from "@admin/components/core/Icon/Icon";
import StatusSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/StatusSkeleton";
import React, { useMemo, useState } from "react";
import { getStatusLabel, getStatusStyle } from "@admin/utils/system.utils";

interface OrderStatusProps {
  currentStep: string;
  updateOrderStatus: (key: string, reason?: string) => Promise<void>;
  statusLoading: boolean;
}

const AdminOrderStatus: React.FC<OrderStatusProps> = ({
  currentStep,
  updateOrderStatus,
  statusLoading,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState<string>("");

  const allStatus = [
    { label: "Pending", key: "pending", icon: "hourglass_empty" },
    { label: "To be Paid", key: "waiting-payment", icon: "attach_money" },
    { label: "Approved", key: "approved", icon: "add_task" },
    { label: "Printed", key: "printed", icon: "print" },
    { label: "R-D", key: "ready-for-box", icon: "rocket_launch" },
    { label: "Transit", key: "in-transit", icon: "local_shipping" },
    { label: "Delivery", key: "delivery", icon: "done_all" },
    { label: "Return", key: "return", icon: "dangerous" },
    { label: "Follow Up", key: "follow-up", icon: "rss_feed" },
    { label: "Cancelled", key: "cancel", icon: "dangerous" },
    { label: "Refunded", key: "refunded", icon: "autorenew" },
    { label: "Exchange", key: "exchange", icon: "change_circle" },
  ];

  // Centralized messages
  const statusMessages: Record<string, string> = {
    pending:
      "This is the Admin Order Page. You have view-only permission here, so no further action is required.",
    "waiting-payment":
      "This is the Admin Order Page. You have view-only permission here, so no further action is required.",
    approved:
      "This is the Admin Order Page. You have view-only permission here, so no further action is required.",
    "ready-for-box":
      "This is the Admin Order Page. You have view-only permission here, so no further action is required.",
    printed:
      "This is the Admin Order Page. You have view-only permission here, so no further action is required.",
    "follow-up":
      "This is the Admin Order Page. You have view-only permission here, so no further action is required.",
    cancel:
      "This product has already been canceled, so no further action is required. Thank you!",
    refunded:
      "This product has already been refunded, so no further action is required. Thank you!",
    return:
      "This product has already been returned, so no further action is required. Thank you!",
    exchange:
      "This product has already been exchanged, so no further action is required. Thank you!",
  };

  // Show next available statuses depending on current step
  const visibleStatuses = useMemo(() => {
    switch (currentStep) {
      case "in-transit":
        return allStatus.filter((s) =>
          ["in-transit", "delivery"].includes(s.key)
        );
      case "delivery":
        return allStatus.filter((s) =>
          ["delivery", "in-transit", "refunded", "exchange"].includes(s.key)
        );
      default:
        return [];
    }
  }, [currentStep]);

  const handleClick = async (key: string, label: string) => {
    setLoadingName(label);
    if (statusLoading || loading) return;
    setLoading(true);
    try {
      await updateOrderStatus(key);
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = currentStep === "cancel";

  return (
    <div>
      {currentStep ? (
        <div className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-4 shadow-[var(--shadow-soft)] md:px-4 md:py-4">
          <div className="mb-3">
            <span className={getStatusStyle(currentStep)}>
              {getStatusLabel(currentStep)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            {statusMessages[currentStep] ? (
              <p className="text-lg py-4 text-app">
                {statusMessages[currentStep].includes("Admin Order Page") ? (
                  <>
                    This is the{" "}
                    <span className="font-semibold text-brand">
                      Admin Order Page
                    </span>
                    . You have view-only permission here, so no further action
                    is required.
                  </>
                ) : (
                  statusMessages[currentStep]
                )}
              </p>
            ) : (
              visibleStatuses?.map((step, index) => {
                const isCurrentStep = currentStep === step.key;

                const iconColor = isCancelled
                  ? step.key === "cancel"
                    ? "bg-[var(--color-danger,#dc2626)] border-[var(--color-danger,#dc2626)] text-white"
                    : "bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-muted)]"
                  : isCurrentStep
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                  : "bg-[var(--bg-hover)] border-[var(--border)] text-[var(--text-muted)]";

                const labelColor = isCancelled
                  ? step.key === "cancel"
                    ? "text-[var(--color-danger,#dc2626)] font-bold"
                    : "text-app-muted"
                  : isCurrentStep
                  ? "text-brand font-bold"
                  : "text-app-muted";

                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center relative min-w-14">
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
                              <div className="animate-spin rounded-full h-11 w-11 border-b-4 border-[var(--color-primary)]"></div>
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
                        className="border-b border-gray-200 dark:border-gray-600 w-full"
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
            )}
          </div>
        </div>
      ) : (
        <StatusSkeleton />
      )}
    </div>
  );
};

export default AdminOrderStatus;
