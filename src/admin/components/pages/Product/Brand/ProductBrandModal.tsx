import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { ProductBrandContext } from "@/app/admin/product/brand/page";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";

interface IDefault {
  key: string;
  value: string;
}

const defaultValue: IDefault = { key: "", value: "" };

const webSchema = yup.object({
  key: yup.string().required("Title is required"),
  value: yup.string().required("Slug is required"),
});

const toSlug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "-");

const ProductBrandModal = () => {
  const { modalMode, items, setIsModalOpen, fetchProductBrand, isModalOpen } =
    useContext(ProductBrandContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      setValue("key", items?.key ?? "");
      setValue("value", items?.value ?? "");
    } else {
      reset(defaultValue);
    }
  }, [modalMode, items, setValue, reset]);

  const keyRegister = register("key", {
    onChange: (e) => {
      const k = e.target.value as string;
      setValue("value", toSlug(k), { shouldValidate: true, shouldDirty: true });
    },
  });

  const formSubmit = async (formData: any) => {
    const payload = {
      key: formData.key,
      value: formData.value,
    };
    setIsSubmit(true);
    if (modalMode === "Edit") {
      ProductBrandService.updateProductBrand(items._id, payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            fetchProductBrand();
            reset();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => ToastService.error(err.message))
        .finally(() => setIsSubmit(false));
    } else {
      ProductBrandService.createProductBrand(payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            fetchProductBrand();
            reset();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => ToastService.error(err.message))
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
              ? `Edit: ${items?.key}`
              : "Create Product Brand"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>
        <Modal.Body>
          <div>
            <Input
              label={"Title"}
              registerProperty={keyRegister}
              errorText={errors?.key?.message}
              type="text"
              isRequired
              placeholder="Enter your title"
            />
            <Input
              label={"Slug"}
              registerProperty={register("value")}
              errorText={errors?.value?.message}
              type="text"
              isRequired
              placeholder="Enter your slug"
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
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ProductBrandModal;
