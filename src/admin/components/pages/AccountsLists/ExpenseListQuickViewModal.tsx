"use client";

import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect, useMemo, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { DashboardShowroomService } from "@admin/@services/apis/DashboardService/DashboardShowroom.service";

type QuickViewItem = {
  sub_title_name: string;
  total_amount: number;
};

const ExpenseListQuickViewModal = ({
  isModalOpen,
  setIsModalOpen,
  items,
  startDate,
  endDate,
}: any) => {
  const [quickViewData, setQuickViewData] = useState<QuickViewItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShowroom = async () => {
    try {
      setLoading(true);

      const res: any = await DashboardShowroomService.getExpenseQuick(
        items?._id,
        {
          startDate,
          endDate,
        }
      );

      if (res?.success) {
        setQuickViewData(Array.isArray(res?.data) ? res.data : []);
      } else {
        ToastService.error(res?.message || "Failed to fetch data");
        setQuickViewData([]);
      }
    } catch (err: any) {
      ToastService.error(
        err?.message || "An error occurred while fetching showroom data"
      );
      setQuickViewData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) fetchShowroom();

    if (!isModalOpen) {
      setQuickViewData([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const rows = useMemo(() => quickViewData ?? [], [quickViewData]);

  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-5xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Expense Report View
            </h3>
          </div>

          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full space-y-3 min-h-96">
            {/* Top summary */}
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-200">
                Total:{" "}
                <span className="font-semibold">
                  {rows.length} transaction{rows.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
                Loading...
              </div>
            ) : rows.length === 0 ? (
              <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
                No data found for this filter.
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-200">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                    {rows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                          {idx + 1}
                        </td>

                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {row.sub_title_name}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {row.total_amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ExpenseListQuickViewModal;
