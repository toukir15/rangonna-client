"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";

const BookingCourierQuickView = ({ isModalOpen, setIsModalOpen }: any) => {
  const getReportCategory = () => {
    console.log("view modal a click korcci akon api call soro hobe");

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

  //   const datas = [
  //     {
  //       id: 1,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 2,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 3,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 4,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 5,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 6,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 7,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 8,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 9,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 10,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //     {
  //       id: 11,
  //       name: "order delivery has been on hold",
  //       title: "Customer is not available at the delivery address",
  //       date: "Jul 9, 2025 10:47 AM",
  //     },
  //   ];

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
            Booking Quick View
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5 min-h-96 max-h-[800px] overflow-y-scroll scrollbar-hide">
            Booking Quick View
            {/* <div className="">
              {datas.map((data) => (
                <div key={data?.id} className="border-l-4">
                  <div className="bg-gray-100 p-2  mb-4 rounded-r-lg">
                    <p className="text-lg">{data.name}</p>
                    <p className="text-sm mt-0.5">{data.title}</p>
                    <p className="text-base mt-0.5">{data.date}</p>
                  </div>
                </div>
              ))}
            </div> */}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default BookingCourierQuickView;
