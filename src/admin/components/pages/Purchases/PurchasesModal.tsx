import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { PurchasesService } from "@admin/@services/apis/PurchasesService/Purchases.service";

interface PurchasesModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  modalMode: "Add" | "Edit";
  items: {
    product_id: string;
    unit_cost?: number;
    title?: string;
  } | null;
  setProductUnitCosts: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

const defaultValue = {
  purchase_price: 0,
};

const webSchema = yup.object({
  purchase_price: yup
    .number()
    .typeError("Unit cost is required")
    .required("Unit cost is required")
    .min(0, "Unit cost cannot be negative"),
});

const PurchasesModal: React.FC<PurchasesModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  items,
  setProductUnitCosts,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        purchase_price: Number(items.unit_cost) || 0,
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset, isModalOpen]);

  const formSubmit = async (formData: any) => {
    if (modalMode !== "Edit" || !items?.product_id) return;

    const nextCost = Number(formData.purchase_price);
    setProductUnitCosts((prev) => ({
      ...prev,
      [items.product_id]: nextCost,
    }));

    try {
      const res = await PurchasesService.updatePurchasesProduct(
        items.product_id,
        { purchase_price: nextCost }
      );
      if (res?.success) {
        ToastService.success(res?.message || "Purchase price updated");
      } else {
        ToastService.error(res?.message || "Could not update purchase price");
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Could not update purchase price");
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      width="w-full md:w-3/4"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(formSubmit)}>
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {items?.title ? `Edit unit cost: ${items.title}` : "Edit unit cost"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <Input
            label="Unit Cost"
            registerProperty={register("purchase_price", {
              valueAsNumber: true,
            })}
            errorText={errors?.purchase_price?.message}
            type="number"
            isRequired
            placeholder="Enter unit cost"
          />
        </Modal.Body>
        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button type="submit" className="btn-primary">
            Update
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default PurchasesModal;
