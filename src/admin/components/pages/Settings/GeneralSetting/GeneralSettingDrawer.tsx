"use client";
import React, { useContext, useEffect } from "react";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import { GeneralSettingContext } from "@/app/admin/setting/general/page";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { IFormValues } from "@admin/@interfaces/setting/general/general.interface";

const GeneralSettingModal: React.FC = () => {
  const {
    openDrawer,
    setOpenDrawer,
    items,
    drawerMode,
    handleDrawerSubmit,
    handleSubmit,
    register,
    reset,
    errors,
    isSubmit,
  } = useContext(GeneralSettingContext);

  useEffect(() => {
    if (drawerMode === "Edit" && items) {
      reset({
        shop_name: items.shop_name || "",
        shop_address: items.shop_address || "",
        phone: items.phone || "",
        logo: items.logo || "",
        website_user_name: items.website_user_name || "",
      });
    } else {
      reset({
        shop_name: "",
        shop_address: "",
        phone: "",
        logo: "",
        website_user_name: "",
      });
    }
  }, [drawerMode, items, reset]);

  const formSubmit = async (data: IFormValues) => {
    try {
      await handleDrawerSubmit(data, drawerMode);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        className="p-5 "
      >
        <Modal.Header className="flex items-center justify-between pb-2">
          <h3 className="text-lg font-bold dark:text-gray-300">
            {drawerMode === "Edit"
              ? `Edit: ${items?.shop_name}`
              : "Add General Setting"}
          </h3>
          <Icon
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
            onClick={() => setOpenDrawer(false)}
            name="close"
          />
        </Modal.Header>

        <Modal.Body className="mb-4 pt-0">
          <Input
            label="Business Name"
            placeholder="Enter business name"
            registerProperty={register("website_user_name")}
            errorText={errors?.website_user_name?.message}
            isRequired
          />

          <Input
            label="Shop Name"
            placeholder="Enter shop name"
            registerProperty={register("shop_name")}
            errorText={errors?.shop_name?.message}
            isRequired
          />

          <Input
            label="Shop Address"
            placeholder="Enter shop address"
            registerProperty={register("shop_address")}
            errorText={errors?.shop_address?.message}
            isRequired
          />

          <Input
            label="Phone Number"
            placeholder="Enter your number"
            registerProperty={register("phone")}
            errorText={errors?.phone?.message}
            type="number"
            isRequired
          />

          <Input
            label="Image Url"
            placeholder="Enter image url"
            registerProperty={register("logo")}
            errorText={errors?.logo?.message}
            isRequired
          />
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-3">
          <Button
            type="button"
            className="btn-secondary"
            onClick={() => setOpenDrawer(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-500 text-white"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <ButtonLoader />
            ) : drawerMode === "Edit" ? (
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

export default GeneralSettingModal;
