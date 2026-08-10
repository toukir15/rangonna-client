"use client";
import React, { useEffect, useState } from "react";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import Input from "@admin/components/core/Input/Input";

type ReportIssueForm = {
  description: string;
  name: string;
  amount: string;
  phone: string;
  address: string;
};

const defaultValue: ReportIssueForm = {
  description: "",
  name: "",
  amount: "",
  phone: "",
  address: "",
};

const webSchema = yup.object({
  description: yup.string(),
  phone: yup.string().required("Phone is required"),
  name: yup.string().required("Name is required"),
  amount: yup.string().required("Amount is required"),
  address: yup.string(),
});

const DescriptionEditModal = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  orderDetail,
  getReportIssueDetails,
}: any) => {
  const [isSubmit, setIsSubmit] = useState(false);



  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: ReportIssueForm) => {
    setIsSubmit(true);

    try {
      const res = await ReportIssueCategoryService.updateReportIssueDescription(
        orderDetail?._id,
        formData
      );

      if (res?.success) {
        ToastService.success(res?.message);
        setIsModalOpen(false);
        getReportIssueDetails();
        reset(defaultValue);
      } else {
        ToastService.error(res?.message || "Failed to create report");
      }
    } catch (err: any) {
      ToastService.error(err.message || "Something went wrong");
    } finally {
      setIsSubmit(false);
    }
  };
  useEffect(() => {
    if (orderDetail) {
      reset({
        description: orderDetail.description,
        name: orderDetail.name,
        amount: orderDetail?.payment?.amount,
        phone: orderDetail.phone,
        address: orderDetail.address,
      });
    } else {
      reset(defaultValue);
    }
  }, [orderDetail, reset, isModalOpen]);

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Edit
            <span className="font-bold dark:text-gray-300 ps-2">
              #{orderDetail?.order_sysid}
            </span>
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div>
            <Input
              label="Name"
              registerProperty={register("name")}
              errorText={errors?.name?.message}
              type="text"
              isRequired
              placeholder="Enter your name"
            />
            <Input
              label="Phone"
              registerProperty={register("phone")}
              errorText={errors?.phone?.message}
              type="text"
              isRequired
              placeholder="Enter your phone"
            />
            <Input
              label="Amount"
              registerProperty={register("amount")}
              errorText={errors?.amount?.message}
              type="text"
              isRequired
              placeholder="Enter your amount"
            />
            <Input
              label="Address"
              registerProperty={register("address")}
              errorText={errors?.address?.message}
              type="text"

              placeholder="Enter your address"
            />
            <Input
              label="Description"
              registerProperty={register("description")}
              errorText={errors?.description?.message}
              type="textarea"

              placeholder="Enter your description"
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn-primary"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <ButtonLoader />
            ) : modalMode === "Edit" ? (
              "Update"
            ) : (
              "Submit"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default DescriptionEditModal;
