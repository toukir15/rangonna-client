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
import { SupplierService } from "@admin/@services/apis/TeamService/SupplierService/supplier.service";

export interface SupplierListModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  modalMode: string;
  items: any;
  getAllSupplier: () => void;
}

const defaultValue: any = {
  name: "",
  company_name: "",
  phone: "",
  address: "",
  email: "",
};

const webSchema = yup.object({
  name: yup.string().required("Name is required"),
  company_name: yup.string().required("Company name is required"),
  phone: yup.string().required("Phone is required"),
  address: yup.string(),
  email: yup.mixed().required("Email is required"),
});

const SupplierModal = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  items,
  getAllSupplier,
}: SupplierListModalProps) => {
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
        name: items.name || "",
        company_name: items.company_name || "",
        phone: items.phone || "",
        address: items.address || "",
        email: items.email || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    if (modalMode === "Edit") {
      SupplierService.updateSupplier(items._id, formData)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getAllSupplier();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          setIsSubmit(false);
        });
    } else {
      SupplierService.createSupplier(formData)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            getAllSupplier();
            setIsModalOpen(false);
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          setIsSubmit(false);
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
              ? `Edit Supplier: ${items?.name}`
              : "Create Supplier"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5">
            <div className="">
              <Input
                label={"Name"}
                registerProperty={register("name")}
                errorText={errors?.name?.message}
                type="text"
                isRequired
                placeholder="Enter your name"
              />
              <Input
                label={"Company Name"}
                registerProperty={register("company_name")}
                errorText={errors?.company_name?.message}
                type="text"
                isRequired
                placeholder="Enter company name"
              />
              <Input
                label={"Phone"}
                registerProperty={register("phone")}
                errorText={errors?.phone?.message}
                type="number"
                isRequired
                placeholder="Enter your phone no"
              />
              <Input
                label={"Address"}
                registerProperty={register("address")}
                errorText={errors?.address?.message}
                type="text"
                isRequired
                placeholder="Enter your address"
              />
              <Input
                label={"Email"}
                registerProperty={register("email")}
                errorText={errors?.email?.message}
                type="text"
                isRequired
                placeholder="Enter your email"
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

export default SupplierModal;
