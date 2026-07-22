"use client";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import React, { useState } from "react";

interface ShippingTrackerProps {
  currentStep: string;
  updateOrderStatus: (key: string) => Promise<void>;
  statusLoading: boolean;
}

const TaskDetailsStatus: React.FC<ShippingTrackerProps> = ({
  currentStep,
  updateOrderStatus,
  statusLoading,
}) => {
  const { permissionList } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState<string>("");

  const allStatus = [
    { label: "Pending", key: "pending", icon: "hourglass_empty" },
    { label: "In Progress", key: "in-progress", icon: "construction" },
    { label: "Cancel", key: "cancel", icon: "close" },
    {
      label: "On Hold",
      key: "on-hold",
      icon: "pan_tool",
    },
    {
      label: "In Review",
      key: "in-review",
      icon: "incomplete_circle",
    },
    {
      label: "Complete",
      key: "complete",
      icon: "done_all",
    },
  ];

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
    <div className="bg-white dark:bg-gray-800  rounded-lg md:px-0 md:py-2 px-2 py-4   ">
      <div className="flex items-center justify-between overflow-x-scroll scrollbar-hide w-full">
        {allStatus.map((step, index) => {
          const isCurrentStep = currentStep === step.key;

          const iconColor = isCancelled
            ? step.key === "cancel"
              ? "bg-red-600 border-red-500 text-white"
              : "bg-gray-300  border-gray-200 text-white"
            : isCurrentStep
            ? "bg-green-600  border-green-500 text-white"
            : "bg-gray-300 border-gray-200 dark:border-gray-400 dark:bg-gray-500 text-white";

          const labelColor = isCancelled
            ? step.key === "cancel"
              ? "text-red-600 dark:text-red-400 font-bold"
              : "text-gray-600 dark:text-gray-400"
            : isCurrentStep
            ? "text-green-600 dark:text-green-400 font-bold"
            : "text-gray-600 dark:text-gray-400";

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative md:!min-w-14 !min-w-32">
                <div className="relative text-center items-center pt-4">
                  <Icon
                    name={step?.icon}
                    onClick={() => {
                      if (permissionList.includes("report_issue_edit")) {
                        if (!statusLoading && !loading) {
                          handleClick(step.key, step.label);
                        }
                      }
                    }}
                    className={`flex items-center justify-center h-12 w-12 text-center pt-2 rounded-full border-4 transition-all duration-300 ${iconColor} ${
                      statusLoading || loading
                        ? "cursor-not-allowed"
                        : permissionList.includes("report_issue_edit")
                        ? "cursor-pointer hover:opacity-80"
                        : "cursor-not-allowed"
                    }
`}
                    variant="outlined"
                  />
                  {(statusLoading || loading) &&
                    loadingName === step?.label && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 text-center pt-5 mt-4 border-green-600"></div>
                      </div>
                    )}
                </div>
                <span
                  className={`mt-2 text-base text-nowrap ms-2 ${labelColor}`}
                >
                  {step?.label}
                </span>
              </div>

              {index < allStatus.length - 1 && (
                <div
                  className={`border-b border-gray-200 dark:border-gray-600 w-full`}
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
    </div>
  );
};

export default TaskDetailsStatus;
