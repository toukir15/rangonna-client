"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import SelectComponent from "@admin/components/core/Select/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { ToastService } from "@admin/utils/toastr.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { useGlobalContext } from "@admin/context/GlobalContext";

const statusOption = [
  { value: "pending", label: "Pending" },
  { value: "in-transit", label: "In Transit" },
  { value: "follow-up", label: "Follow Up" },
];

const defaultValue: any = {
  source: "",
  status: null,
};

const webSchema = yup.object({
  source: yup.mixed().required("Source is required"),
  status: yup.mixed().nullable(),
});

const SourceModal = ({
  isModalOpen,
  setIsModalOpen,
  orderId,
  fetchOrdersDetails,
  fetchCurrentStatus,
  fetchOrderSumary,
}: any) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const { sourceOptions } = useGlobalContext();

  const { handleSubmit, control, watch } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const selectedSource = watch("source");

  const showStatus = ["pathao-ride", "showroom"].includes(
    selectedSource?.value
  );

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);
    const payload: any = {
      source: formData.source?.value,
      ...(showStatus && {
        status: formData.status?.value || null,
      }),
    };
    OrdersService.updateOrderSource(orderId, payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchOrdersDetails();
          fetchCurrentStatus();
          fetchOrderSumary();
          setIsModalOpen(false);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => ToastService.error(err.message))
      .finally(() => setIsSubmit(false));
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
          <h3 className="text-lg font-medium dark:text-white">
            Update Order Source
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full gap-5 min-h-96 max-h-[800px] overflow-y-scroll scrollbar-hide">
            {/* SOURCE FIELD */}
            <div className="pb-2">
              <label className="block text-sm font-semibold mb-1 dark:text-gray-300">
                Order Source <span className="text-red-400">*</span>
              </label>
              <Controller
                name="source"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={sourceOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Order Source"
                  />
                )}
              />
            </div>

            {/* STATUS FIELD WHEN pathao ride OR office pickup */}
            {showStatus && (
              <div className="pb-2">
                <label className="block text-sm font-semibold mb-1">
                  Order Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      options={statusOption}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Order Status"
                    />
                  )}
                />
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button
            type="submit"
            disabled={isSubmit}
            className="bg-blue-500 text-white px-4 rounded"
          >
            {isSubmit ? <ButtonLoader /> : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default SourceModal;
