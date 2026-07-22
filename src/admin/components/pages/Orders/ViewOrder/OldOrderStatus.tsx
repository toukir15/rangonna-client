"use client";
import Icon from "@admin/components/core/Icon/Icon";
import React, { useState } from "react";

interface OrderStatusProps {
  currentStep: string;
  updateOrderStatus: (key: string, reason?: string) => Promise<void>;
  statusLoading: boolean;
  orderDetails?: any;
  setIsChecked?: any;
  isChecked: boolean;
}

const cancellationReasons = [
  "Customer want to cancel",
  "Payment issue",
  "Double order",
  "Fake order",
];

const OrderStatus: React.FC<OrderStatusProps> = ({
  currentStep,
  updateOrderStatus,
  statusLoading,
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState<string>("");
  const [loadingName, setLoadingName] = useState<string>("");

  const allStatus = [
    { label: "Pending", key: "pending", icon: "hourglass_empty" },
    { label: "To be Paid", key: "waiting-payment", icon: "attach_money" },
    { label: "Approved", key: "approved", icon: "add_task" },
    { label: "R-D", key: "ready-for-box", icon: "rocket_launch" },
    { label: "Transit", key: "in-transit", icon: "local_shipping" },
    { label: "Return", key: "return", icon: "dangerous" },
    { label: "Follow Up", key: "follow-up", icon: "rss_feed" },
    { label: "Delivery", key: "delivery", icon: "done_all" },
    { label: "Cancelled", key: "cancel", icon: "dangerous" },
    { label: "Refunded", key: "refunded", icon: "autorenew" },
  ];

  const handleClick = async (key: string, label: string) => {
    setLoadingName(label);
    if (statusLoading || loading) return;
    setLoading(true);
    if (key === "cancel") {
      setShowModal(true);
      setLoading(false);
      return;
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
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg md:px-4 md:py-4 px-2 py-4 mb-3">
      <div className="flex items-center justify-between">
        {allStatus.map((step, index) => {
          const isCurrentStep = currentStep === step.key;

          const iconColor = isCancelled
            ? step.key === "cancel"
              ? "bg-red-600 border-red-500 text-white"
              : "bg-gray-300 border-gray-200 text-white"
            : isCurrentStep
            ? "bg-green-600 border-green-500 text-white"
            : "bg-gray-300 border-gray-200 text-white";

          const labelColor = isCancelled
            ? step.key === "cancel"
              ? "text-red-600 dark:text-red-400 font-bold"
              : "text-gray-600 dark:text-gray-400"
            : isCurrentStep
            ? "text-green-600 dark:text-green-400 font-bold"
            : "text-gray-600 dark:text-gray-400";

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative min-w-14">
                <div className="relative">
                  <Icon
                    name={step?.icon}
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
                    loadingName === step?.label && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-11 w-11 border-b-4 border-green-600"></div>
                      </div>
                    )}
                </div>
                <span className={`mt-2 text-base text-nowrap ${labelColor}`}>
                  {step?.label}
                </span>
              </div>

              {index < allStatus.length - 1 && (
                <div
                  className={`border-b border-gray-200 dark:border-gray-600 w-full`}
                  style={{
                    marginTop: "-25px",
                    borderStyle: "dashed",
                    borderWidth: "2px",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

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
                    className={`w-full text-left px-2 py-1 rounded-lg hover:bg-gray-300 ${
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

            <p className="pb-2">
              {!selectedReason ||
              (selectedReason === "Other" && !customReason) ? (
                <small className="text-red-500">This field is required</small>
              ) : null}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg"
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
  );
};

export default OrderStatus;
