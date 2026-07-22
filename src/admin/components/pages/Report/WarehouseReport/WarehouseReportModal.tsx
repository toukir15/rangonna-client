"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";

const WarehouseReportModal = ({ isModalOpen, setIsModalOpen }: any) => {
  const getReportCategory = () => {
    return;
    ReportIssueCategoryService.getReportIssueCategory()
      .then((res: any) => {
        if (res?.success) {
        } else {
          ToastService.error(res?.message || "Failed to get report categories");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(
          err.message || "An error occurred while fetching report categories"
        );
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
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Warehouse Report Quick View
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5 min-h-96">View data coming soon</div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WarehouseReportModal;
