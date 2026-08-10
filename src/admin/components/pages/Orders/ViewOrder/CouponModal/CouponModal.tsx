"use client";
import React, { useState } from "react";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import { useForm } from "react-hook-form";

type ReportIssueForm = {
  coupon: string;
};

const defaultValue: ReportIssueForm = {
  coupon: "",
};

const webSchema = yup.object({
  coupon: yup.string().required("Coupon is required"),
});

const CouponModal = ({
  isModalOpen,
  setIsModalOpen,
  orderId,
  fetchOrderSumary,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const normalizeCoupon = (value: string) => {
    return value.toLowerCase().replace(/[\s]/g, "");
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<ReportIssueForm | any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: ReportIssueForm) => {
    const mainData = {
      code: normalizeCoupon(formData.coupon),
    };

    setIsSubmit(true);
    if (!orderId) {
      ToastService.error("Order ID is missing");
      setIsSubmit(false);
      return;
    }
    ReportIssueCategoryService.couponApply(orderId, mainData)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          fetchOrderSumary();
        } else {
          ToastService.error(res?.message || "Failed to create report");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message || "Something went wrong");
      })
      .finally(() => {
        setIsSubmit(false);
        reset();
      });
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between ">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
            Apply Coupon
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full ">
            <div className="">
              <Input
                label="Coupon Code"
                registerProperty={register("coupon")}
                errorText={errors?.coupon?.message}
                type="text"
                isRequired
                placeholder="Enter your coupon"
              />
            </div>
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
            {isSubmit ? <ButtonLoader /> : "Apply"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default CouponModal;
