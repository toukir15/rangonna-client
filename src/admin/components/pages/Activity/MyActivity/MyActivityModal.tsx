"use client";
import { userLogsService } from "@admin/@services/apis/Activity/UserLogs/userLogs.service";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import ProductReportSkeleton from "@admin/components/Skeleton/Product/ProductReport.skeleton";
import { ToastService } from "@admin/utils/toastr.service";
import { useEffect, useState } from "react";
import OrderStatusLabel from "../../Lavels/OrderStatusLavels";
// utils/orderStatusMap.ts
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  "waiting-payment": "To Be Paid",
  recall: "Recall",
  approved: "Approved",
  printed: "Printed",
  "ready-for-box": "R-D",
  "in-transit": "Shipped",
  return: "Return",
  "follow-up": "Follow Up",
  delivery: "Delivery",
  cancel: "Cancel",
  exchange: "Exchange",
  refunded: "Refunded",
};

const MyActivityModal = ({ isModalOpen, setIsModalOpen, productId }: any) => {
  const [userLogs, setUserLogs] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const getProductReportStatus = () => {
    setLoading(true);
    userLogsService
      .getLogsWithId(productId)
      .then((res: any) => {
        if (res?.success) {
          setUserLogs(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => ToastService.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isModalOpen) {
      getProductReportStatus();
    }
  }, [isModalOpen]);



  const renderValue = (data: any) => {
    // 🔹 Array হলে
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="border rounded-md p-2 bg-white dark:bg-gray-700"
            >
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }

    // 🔹 Object হলে
    if (typeof data === "object" && data !== null) {
      return Object.entries(data).map(([k, v]) => (
        <p key={k} className="text-sm">
          <span className="font-medium capitalize">
            {k.replace(/_/g, " ")}:
          </span>{" "}
          {renderValue(v)}
        </p>
      ));
    }

    // 🔹 If status matched → use reusable component
    if (typeof data === "string" && ORDER_STATUS_LABELS[data]) {
      return <OrderStatusLabel value={data} />;
    }

    // 🔹 Default fallback
    return <span className="text-sm">{String(data)}</span>;
  };

  const renderChanges = (changes: any) => {
    if (!changes || Object.keys(changes).length === 0)
      return <p className="text-gray-500">No changes available.</p>;

    return Object.entries(changes).map(([key, value]: [string, any]) => {
      return (
        <div
          key={key}
          className="border dark:border-gray-600 border-gray-300 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800"
        >
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 capitalize mb-3">
            {key.replace(/_/g, " ")}
          </h4>

          {value.before !== undefined || value.after !== undefined ? (
            <div className="space-y-3">
              {value.before !== undefined && (
                <div className="text-red-500">
                  <p className="font-medium mb-1">Before:</p>
                  {renderValue(value.before)}
                </div>
              )}

              {value.after !== undefined && (
                <div className="text-green-500">
                  <p className="font-medium mb-1">After:</p>
                  {renderValue(value.after)}
                </div>
              )}
            </div>
          ) : (
            renderValue(value)
          )}
        </div>
      );
    });
  };
  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      width="w-full md:w-3/4"
      maxWidth="max-w-2xl"
    >
      <Modal.Header className="flex items-center justify-between ">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          User Logs View
        </h3>
        <Icon
          name="close"
          onClick={() => setIsModalOpen(false)}
          className="text-gray-600 cursor-pointer dark:text-gray-300"
        />
      </Modal.Header>
      <Modal.Body>
        <div className="w-full gap-5 min-h-96">
          {loading ? (
            <ProductReportSkeleton />
          ) : userLogs?.changes ? (
            <div>{renderChanges(userLogs?.changes)}</div>
          ) : (
            <p className="text-gray-500 text-center mt-5">
              No changes found for this log.
            </p>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MyActivityModal;
