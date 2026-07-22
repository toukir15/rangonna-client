"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import { getStatusStyle } from "@admin/utils/system.utils";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import QourierReport from "@admin/components/Skeleton/Report/QourierReport.sekeleton";
import Skeleton from "@admin/components/Skeleton/Skeleton";

const PathaoCourierQuickView = ({
  isModalOpen,
  setIsModalOpen,
  orderId,
}: any) => {
  const [pathaoDetails, setPathaoDetails] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  const getReportCategory = () => {
    setLoading(true);
    ReportIssueCategoryService.getSingleReportPathaoBooking(orderId)
      .then((res: any) => {
        if (res?.success) {
          setPathaoDetails(res.data);
        } else {
          ToastService.error(res?.message || "Failed to get report categories");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(
          err.message || "An error occurred while fetching report categories"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isModalOpen) {
      getReportCategory();
    }
  }, [isModalOpen]);

  return (
    <div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between ">
          {loading ? (
            <div className=" ">
              <Skeleton type="text" count={1} height={20} width={200} />
            </div>
          ) : (
            <div className="flex items-center gap-20">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Courier {pathaoDetails?.consignment_id}
              </h3>
              <p
                className={`${
                  pathaoDetails?.delivery_status &&
                  getStatusStyle(pathaoDetails?.delivery_status)
                } px-4`}
              >
                {pathaoDetails?.delivery_status}
              </p>
            </div>
          )}

          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5 min-h-96 max-h-[800px] overflow-y-scroll scrollbar-hide">
            {loading ? (
              <QourierReport />
            ) : (
              <div className="">
                {pathaoDetails?.webhook_logs.map((data: any) => (
                  <div
                    key={data?._id}
                    className="border-l-4 dark:border-l-gray-500 rounded-lg"
                  >
                    <div className="bg-gray-100 dark:bg-gray-600 p-2  mb-4 rounded-r-lg">
                      <p className="text-lg dark:text-gray-300">
                        {data.log_message}
                      </p>
                      <p className="text-sm mt-0.5">{data.reason}</p>
                      <p className="text-base mt-0.5 dark:text-gray-300">
                        {formatTimeAgo(data?.timeStamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PathaoCourierQuickView;
