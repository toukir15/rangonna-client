"use client";

import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useState, useEffect } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { InferType } from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { WareHouseContext } from "@/app/admin/setting/warehouse/page";

const WarehouseSchema = yup.object({
  title: yup.string().required("Title is required"),
  phone: yup.string().required("Phone is required"),
  address: yup.string().required("Address is required"),
  email: yup.string().email("Invalid email").optional(),
});

type WarehouseFormData = InferType<typeof WarehouseSchema>;

interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

const defaultValue: WarehouseFormData = {
  title: "",
  phone: "",
  address: "",
  email: "",
};

const WarehouseModal: React.FC = () => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { modalMode, items, setIsModalOpen, getWarehouse, isModalOpen } =
    useContext(WareHouseContext);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: yupResolver(WarehouseSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        title: items.title || "",
        phone: items.phone || "",
        address: items.address || "",
        email: items.email || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (formData: WarehouseFormData) => {
    setIsSubmit(true);

    if (modalMode === "Edit" && items?._id) {
      WarehouseService.updateWarehouse(items._id, formData)
        .then((res: IApiResponse) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getWarehouse();
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
      WarehouseService.createWarehouse(formData)
        .then((res: IApiResponse) => {
          if (res?.success) {
            ToastService.success(res?.message);
            getWarehouse();
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
              ? `Edit Warehouse: ${items?.title}`
              : "Create Warehouse"}
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
              <Input
                label="Title"
                registerProperty={register("title")}
                errorText={errors?.title?.message}
                type="text"
                isRequired
                placeholder="Enter your title"
              />
              <Input
                label="Email"
                registerProperty={register("email")}
                errorText={errors?.email?.message}
                type="text"
                placeholder="Enter your email"
              />
              <Input
                label="Phone"
                registerProperty={register("phone")}
                errorText={errors?.phone?.message}
                type="text"
                isRequired
                placeholder="Enter your phone no"
              />
              <Input
                label="Address"
                registerProperty={register("address")}
                errorText={errors?.address?.message}
                type="text"
                isRequired
                placeholder="Enter your address"
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

export default WarehouseModal;
