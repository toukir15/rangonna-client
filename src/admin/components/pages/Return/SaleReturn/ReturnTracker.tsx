"use client";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import React, { useMemo, useState } from "react";

interface ShippingTrackerProps {
  currentStep: string;
  updateOrderStatus: (key: string) => Promise<void>;
  statusLoading: boolean;
  requiredPermission?: string;
  statusList?: { label: string; key: string; icon: string }[];
  flowMap?: Record<string, string[]>;
  lockedStatuses?: string[];
}

const ReturnTracker: React.FC<ShippingTrackerProps> = ({
  currentStep,
  updateOrderStatus,
  statusLoading,
  requiredPermission = "report_issue_edit",
  statusList,
  flowMap,
  lockedStatuses = ["delivery", "close"],
}) => {
  const { permissionList } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState<string>("");

  const defaultStatusList = [
    { label: "Pending", key: "pending", icon: "hourglass_empty" },
    { label: "Received", key: "received-product", icon: "checklist_rtl" },
    { label: "Assign", key: "assign", icon: "assignment" },
    {
      label: "Sent Supplier",
      key: "product-sent-to-supplier",
      icon: "assist_walker",
    },
    {
      label: "Received Supplier",
      key: "received-from-supplier",
      icon: "emoji_people",
    },
    { label: "Checking", key: "checking", icon: "fact_check" },
    { label: "Solved", key: "solved", icon: "verified_user" },
    { label: "R-D", key: "ready-for-box", icon: "redeem" },
    { label: "Delivery", key: "delivery", icon: "local_shipping" },
    { label: "Close", key: "close", icon: "close" },
  ];
  const allStatus = statusList || defaultStatusList;

  const defaultFlowMap: Record<string, string[]> = {
    pending: ["received-product", "solved", "close"],
    "received-product": ["assign", "product-sent-to-supplier", "checking"],
    "product-sent-to-supplier": ["received-from-supplier"],
    "received-from-supplier": ["checking"],
    assign: ["product-sent-to-supplier", "close"],
    checking: ["assign", "solved"],
    solved: ["ready-for-box", "close"],
    "ready-for-box": ["delivery"],
  };
  const statusFlowMap = flowMap || defaultFlowMap;

  const allowedSteps = useMemo(() => {
    const nextKeys = statusFlowMap[currentStep] || [];
    return allStatus.filter(
      (step) => step.key === currentStep || nextKeys.includes(step.key),
    );
  }, [currentStep]);

  const isCancelled = currentStep === "cancel";
  const isLocked = lockedStatuses.includes(currentStep);

  const handleClick = async (key: string, label: string) => {
    if (isLocked) return;

    setLoadingName(label);
    if (statusLoading || loading) return;

    setLoading(true);
    try {
      await updateOrderStatus(key);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg md:px-0 md:py-2 px-2 py-4">
      {/* 🔥 Tracker */}
      <div className="flex items-center justify-between overflow-x-scroll scrollbar-hide w-full">
        {!isLocked &&
          allowedSteps.map((step, index) => {
            const isCurrentStep = currentStep === step.key;
            const isNextStep = statusFlowMap[currentStep]?.includes(step.key);

            const iconColor = isCancelled
              ? step.key === "cancel"
                ? "bg-red-600 border-red-500 text-white"
                : "bg-gray-300 border-gray-200 text-white"
              : isCurrentStep
                ? "bg-green-600 border-green-500 text-white"
                : isNextStep
                  ? "bg-gray-300 border-gray-200 dark:border-gray-400 dark:bg-gray-500 text-white"
                  : "bg-gray-300 border-gray-200 dark:border-gray-400 dark:bg-gray-500 text-white";

            const labelColor = isCancelled
              ? step.key === "cancel"
                ? "text-red-600 dark:text-red-400 font-bold"
                : "text-gray-600 dark:text-gray-400"
              : isCurrentStep
                ? "text-green-600 dark:text-green-400 font-bold"
                : "text-gray-600 dark:text-gray-400";

            const canClick =
              permissionList.includes(requiredPermission) &&
              !statusLoading &&
              !loading &&
              !isLocked &&
              isNextStep;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center relative md:!min-w-24 !min-w-32">
                  <div className="relative text-center items-center pt-4">
                    <Icon
                      name={step.icon}
                      onClick={() => {
                        if (canClick) {
                          handleClick(step.key, step.label);
                        }
                      }}
                      className={`flex items-center justify-center h-12 w-12 text-center pt-2 rounded-full border-4 transition-all duration-300 ${
                        iconColor
                      } ${
                        canClick
                          ? "cursor-pointer hover:opacity-80"
                          : "cursor-not-allowed opacity-60"
                      }`}
                      variant="outlined"
                    />

                    {(statusLoading || loading) &&
                      loadingName === step.label && (
                        <div className="absolute inset-0 flex items-center justify-center mt-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
                        </div>
                      )}
                  </div>

                  <span
                    className={`mt-2 text-base text-nowrap ms-2 ${labelColor}`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < allowedSteps.length - 1 && (
                  <div
                    className="border-b border-gray-200 dark:border-gray-600 w-full"
                    style={{
                      marginTop: "-15px",
                      borderStyle: "dashed",
                      borderWidth: "2px",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
      </div>

      {/* ✅ No Further Action Message */}
      {isLocked && (
        <div className="mt-2 text-center">
          <div className="flex-col items-center bg-green-50 border border-green-200 px-6 py-4 rounded-xl">
            <Icon name="verified" className="text-green-600 text-3xl mb-2" />
            <p className="text-green-700 font-semibold text-base">
              {currentStep}
            </p>
            <p className="text-green-600 text-sm">
              আর কোনো action নেওয়ার প্রয়োজন নেই
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnTracker;
