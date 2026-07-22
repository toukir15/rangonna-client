"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect, useMemo, useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import SelectComponent from "@admin/components/core/Select/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { ToastService } from "@admin/utils/toastr.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { SelectOption } from "@admin/@interfaces/common.interface";

type WarehouseForm = {
  warehouse: SelectOption | null;
};

const defaultValue: WarehouseForm = {
  warehouse: null,
};

const warehouseSchema = yup.object({
  warehouse: yup.mixed().required("Warehouse is required"),
});

type WarehouseModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  orderId: string | string[] | undefined;
  orderDetail?: {
    _id?: string;
    warehouse?: { _id?: string; title?: string } | string | null;
  } | null;
  fetchOrdersDetails?: () => void;
  fetchLogsDetails?: () => void;
};

const WarehouseModal = ({
  isModalOpen,
  setIsModalOpen,
  orderId,
  orderDetail,
  fetchOrdersDetails,
  fetchLogsDetails,
}: WarehouseModalProps) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [warehouseData, setWarehouseData] = useState<
    Array<{ _id: string; title: string }>
  >([]);

  const warehouseOptions = useMemo(
    () =>
      warehouseData.map((item) => ({
        label: item.title
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        value: item._id,
      })),
    [warehouseData],
  );

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WarehouseForm>({
    resolver: yupResolver(warehouseSchema),
    defaultValues: defaultValue,
  });

  const getWarehouseSuggestions = () => {
    WarehouseService.getWarehouseSuggestion()
      .then((res: { success?: boolean; data?: typeof warehouseData; message?: string }) => {
        if (res?.success) {
          setWarehouseData(res?.data ?? []);
        } else {
          ToastService.error(res?.message || "Failed to load warehouses");
        }
      })
      .catch((err: { message?: string }) => {
        ToastService.error(err.message || "Failed to load warehouses");
      });
  };

  useEffect(() => {
    if (!isModalOpen) return;
    getWarehouseSuggestions();
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      reset(defaultValue);
      return;
    }

    const warehouseId =
      typeof orderDetail?.warehouse === "string"
        ? orderDetail.warehouse
        : orderDetail?.warehouse?._id;

    if (!warehouseId || warehouseOptions.length === 0) return;

    const selected = warehouseOptions.find((opt) => opt.value === warehouseId);
    if (selected) {
      reset({ warehouse: selected });
    }
  }, [isModalOpen, orderDetail?.warehouse, warehouseOptions, reset]);

  const formSubmit = async (formData: WarehouseForm) => {
    const orderMongoId = orderDetail?._id || (Array.isArray(orderId) ? orderId[0] : orderId);
    if (!orderMongoId) return;

    setIsSubmit(true);
    OrdersService.updateOrderWarehouse(orderMongoId, {
      warehouse: formData.warehouse?.value,
    })
      .then((res: { success?: boolean; message?: string }) => {
        if (res?.success) {
          ToastService.success(res?.message || "Warehouse updated successfully");
          fetchOrdersDetails?.();
          fetchLogsDetails?.();
          setIsModalOpen(false);
        } else {
          ToastService.error(res?.message || "Failed to update warehouse");
        }
      })
      .catch((err: { message?: string }) => {
        ToastService.error(err.message || "Failed to update warehouse");
      })
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
          <h3 className="text-lg font-medium dark:text-white">Update Warehouse</h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full pb-2">
            <label className="block text-sm font-semibold mb-1 dark:text-gray-300">
              Warehouse <span className="text-red-400">*</span>
            </label>
            <Controller
              name="warehouse"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  options={warehouseOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Warehouse"
                />
              )}
            />
            {errors?.warehouse?.message && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.warehouse.message)}
              </p>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button type="button" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
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

export default WarehouseModal;
