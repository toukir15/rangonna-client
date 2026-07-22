"use client";

import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface SelectOption {
  label: string;
  value: string;
}

const WholeSaleQuickView = ({
  isModalOpen,
  setIsModalOpen,
  orderDetails,
  fetchPathaoList,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<{
    payment_methods: SelectOption[];
    tier: SelectOption | "";
  }>({
    defaultValues: {
      payment_methods: [],
      tier: "",
    },
  });

  const methodOptions: SelectOption[] = [
    { label: "Cash On Delivery", value: "cash_on_delivery" },
    { label: "Bkash", value: "bkash" },
  ];

  const tierOptions: SelectOption[] = [
    { label: "General", value: "general" },
    { label: "VIP", value: "vip" },
    { label: "Resale", value: "resale" },
  ];

  const mapToSelectOptions = (
    values: string[] = [],
    options: SelectOption[]
  ) => {
    return options.filter((opt) => values.includes(opt.value));
  };

  useEffect(() => {
    if (isModalOpen && orderDetails) {
      reset({
        payment_methods: mapToSelectOptions(
          orderDetails?.payment_methods || [],
          methodOptions
        ),
        tier: tierOptions.find((t) => t.value === orderDetails?.tier) || "",
      });
    }
  }, [isModalOpen, orderDetails, reset]);

  const onSubmit = (formData: any) => {
    setIsSubmit(true);

    const data = {
      payment_methods: formData.payment_methods.map(
        (item: SelectOption) => item.value
      ),
      ...(formData?.tier?.value && { tier: formData.tier.value }),
    };

    wholesaleOrderService
      .updateWholeSalePaymentMethod(orderDetails?._id, data)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchPathaoList();
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
        setIsModalOpen(false);
        reset();
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Update Info
          </h3>

          <Icon
            name="close"
            onClick={() => {
              setIsModalOpen(false);
              reset();
            }}
            className="cursor-pointer text-gray-600 dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body className="min-h-[60vh]">
          <div className="w-full mt-4">
            <p className="text-sm font-semibold text-neutral-600 dark:text-gray-300">
              Payment Method
            </p>

            <Controller
              name="payment_methods"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  options={methodOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Payment Methods"
                  isMulti
                />
              )}
            />

            {errors.payment_methods && (
              <p className="text-sm text-red-500">
                {String(errors.payment_methods.message)}
              </p>
            )}
          </div>

          {/* TIER */}
          <div className="w-full mt-4">
            <p className="text-sm font-semibold text-neutral-600 dark:text-gray-300">
              Tier
            </p>

            <Controller
              name="tier"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  options={tierOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Tier"
                />
              )}
            />

            {errors.tier && (
              <p className="text-sm text-red-500">
                {String(errors.tier.message)}
              </p>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={() => {
              setIsModalOpen(false);
              reset();
            }}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmit}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
          >
            {isSubmit ? <ButtonLoader /> : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default WholeSaleQuickView;
