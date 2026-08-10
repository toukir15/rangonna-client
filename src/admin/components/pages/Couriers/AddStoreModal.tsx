import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import { CourierManagementContext } from "@admin/context/CourierManagementContext";

const defaultValue: any = {
  store: "",
};

const webSchema = yup.object({
  store: yup.mixed().required("Store is required"),
});

const AddStoreModal = () => {
  const {
    isModalStoreOpen,
    setIsModalStoreOpen,
    modalMode,
    items,
    fetchCouriers,
  } = useContext(CourierManagementContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [storeData, setStoreData] = useState<any>();

  const StoreOption = storeData?.map((item: any) => ({
    label: item.store_name
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item.store_id,
  }));

  const { handleSubmit, control } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const selectedStore = storeData?.find(
      (item: any) => String(item.store_id) === String(formData?.store?.value),
    );

    const payload = {
      store_name: selectedStore?.store_name || formData?.store?.label || "",
      credentials: {
        store_id: Number(formData?.store?.value),
      },
    };

    CourierService.updateStorePathao(items?._id, payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalStoreOpen(false);
          fetchCouriers();
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
  };

  const fetchStoreOptoin = () => {
    CourierService.getStorePathao(items?._id)
      .then((res: any) => {
        if (res?.success) {
          setStoreData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    if (isModalStoreOpen) {
      fetchStoreOptoin();
    }
  }, [isModalStoreOpen]);

  return (
    <Modal
      isOpen={isModalStoreOpen}
      onClose={() => setIsModalStoreOpen(false)}
      width="w-full md:w-3/4"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(formSubmit)}>
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Add Store
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalStoreOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5 min-h-48">
            <div className="">
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Store
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="store"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={StoreOption}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Store"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={() => setIsModalStoreOpen(false)}
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
      </form>
    </Modal>
  );
};

export default AddStoreModal;
