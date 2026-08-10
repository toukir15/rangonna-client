import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { PurchasesReturnService } from "@admin/@services/apis/PurchasesService/PurchasesReturn.service";

interface PurchasesModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  modalMode: "Add" | "Edit";
  items: {
    product_id: string;
    unit_cost?: number;
    title?: string;
  } | null;
  setProductUnitCosts: (value: Record<string, number>) => void;
}

const defaultValue = {
  purchase_price: "",
};

const webSchema = yup.object({
  purchase_price: yup.number().required("Unit Cost is required").min(0),
});

const PurchasesReturnModal: React.FC<PurchasesModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  items,
  setProductUnitCosts,
}) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

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
        purchase_price: items?.unit_cost || "",
      });
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    try {
      if (modalMode === "Edit" && items) {
        // Update the specific product's unit cost in the state
        setProductUnitCosts((prev: any) => ({
          ...prev,
          [items.product_id]: Number(formData.purchase_price),
        }));

        // If you need to make an API call to save the change:
        const res = await PurchasesReturnService.updatePurchasesProduct(
          items.product_id,
          { purchase_price: formData.purchase_price }
        );

        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
        } else {
          ToastService.error(res?.message);
        }
      }
    } catch (err: any) {
      ToastService.error(err.message || "Failed to update unit cost");
    } finally {
      setIsSubmit(false);
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
            {modalMode === "Edit" && items
              ? `Update Unit Cost: ${items.title || "Product"}`
              : "Create New Account"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5">
            <div className="">
              <Input
                label={"Unit Cost"}
                registerProperty={register("purchase_price", {
                  valueAsNumber: true,
                })}
                errorText={errors?.purchase_price?.message}
                type="number"
                isRequired
                placeholder="Enter unit cost"
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
            className="btn-primary"
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

export default PurchasesReturnModal;
