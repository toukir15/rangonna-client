"use client";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useState, useEffect } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { InferType } from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { BkashPaymentContext } from "@/app/admin/bkash-payment/refund/page";
import { RefundService } from "@admin/@services/apis/BkashPayment/Refund/Refund.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { SelectOption } from "@admin/@interfaces/common.interface";

const WarehouseSchema = yup.object({
  trxID: yup.string().required("TrxID is required"),
  refund_reason: yup.string().required("Refund reason is required"),
  refund_amount: yup.string().required("Refund amount is required"),
  full_refund: yup.boolean().required("Refund type is required"),
});

type WarehouseFormData = InferType<typeof WarehouseSchema>;

interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

const defaultValue: WarehouseFormData = {
  trxID: "",
  refund_reason: "",
  refund_amount: "",
  full_refund: false,
};

const RefundModal: React.FC = () => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { modalMode, items, setIsModalOpen, getRefund, isModalOpen } =
    useContext(BkashPaymentContext);

  const refundTypeOptions: SelectOption[] = [
    { label: "Partial Refund", value: "false" },
    { label: "Full Refund", value: "true" },
  ];

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: yupResolver(WarehouseSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        trxID: items.trxID || "",
        refund_reason: items.refund_reason || "",
        refund_amount: items.refund_amount || "",
        full_refund:
          typeof items?.full_refund === "boolean" ? items.full_refund : false,
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (formData: WarehouseFormData) => {
    setIsSubmit(true);

    if (modalMode === "Edit" && items?._id) {
      RefundService.updateRefund(items._id, formData)
        .then((res: IApiResponse) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getRefund();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            ToastService.error(err.message);
          } else {
            ToastService.error("Unexpected error");
          }
        })
        .finally(() => {
          setIsSubmit(false);
        });
    } else {
      RefundService.createRefund(formData)
        .then((res: IApiResponse) => {
          if (res?.success) {
            ToastService.success(res?.message);
            getRefund();
            setIsModalOpen(false);
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            ToastService.error(err.message);
          } else {
            ToastService.error("Unexpected error");
          }
        })
        .finally(() => {
          setIsSubmit(false);
          reset();
        });
    }
  };

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
            {modalMode === "Edit"
              ? `Edit Refund: ${items?.title}`
              : "Create Refund"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full gap-5">
            <div>
              <div className="w-full mb-1">
                <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Refund Type{" "}
                  <span className="text-red-400 font-inter text-[12px] font-semibold">
                    *
                  </span>
                </p>
                <Controller
                  name="full_refund"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      options={refundTypeOptions}
                      value={
                        refundTypeOptions.find(
                          (o) => o.value === String(field.value)
                        ) ?? refundTypeOptions[0]
                      }
                      onChange={(opt: SelectOption) =>
                        field.onChange(opt?.value === "true")
                      }
                      placeholder="Select Refund Type"
                      className="w-full"
                      isRequired
                    />
                  )}
                />
                {errors?.full_refund && (
                  <p className="text-red-500 text-sm">
                    {errors.full_refund.message as string}
                  </p>
                )}
              </div>
              <Input
                label="Trx ID"
                registerProperty={register("trxID")}
                errorText={errors?.trxID?.message}
                type="text"
                isRequired
                placeholder="Enter your trxID"
              />
              <Input
                label="Refund Reason"
                registerProperty={register("refund_reason")}
                errorText={errors?.refund_reason?.message}
                type="text"
                placeholder="Enter your refund reason"
                isRequired
              />
              <Input
                label="Refund Amount"
                registerProperty={register("refund_amount")}
                errorText={errors?.refund_amount?.message}
                type="text"
                isRequired
                placeholder="Enter your refund amount"
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <ButtonLoader />
            ) : modalMode === "Edit" ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default RefundModal;
