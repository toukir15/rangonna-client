"use client";
import React, { useContext, useEffect, useState } from "react";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import { GeneralSettingContext } from "@/app/admin/setting/general/page";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { IFormValues } from "@admin/@interfaces/setting/general/general.interface";
import { Controller } from "react-hook-form";
import SelectComponent from "@admin/components/core/Select/Select";
import { ToastService } from "@admin/utils/toastr.service";
import { IWebsiteOption } from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";

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
    control,
  } = useContext(GeneralSettingContext);

  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);

  // ✅ Fetch Website List
  useEffect(() => {
    const fetchWebList = async () => {
      try {
        const res: any = await GlobalService.getWebsiteList();
        if (res?.success) {
          const options = res.data.map((item: any) => ({
            label: item.web_name,
            value: item.web_url,
          }));
          setWebsiteOptions(options);
        } else {
          ToastService.error(res?.message);
        }
      } catch (err: any) {
        ToastService.error(err.message);
      } finally {
        setLoadingWebsites(false);
      }
    };

    fetchWebList();
  }, []);

  useEffect(() => {
    if (!loadingWebsites) {
      if (drawerMode === "Edit" && items) {
        const matched = websiteOptions.find(
          (opt) => opt.value === items.web_url
        );

        reset({
          shop_name: items.shop_name || "",
          shop_address: items.shop_address || "",
          phone: items.phone || "",
          logo: items.logo || "",
          website_user_name: items.website_user_name || "",
          web_url: matched ? matched.value : "",
        });
      } else {
        reset({
          shop_name: "",
          shop_address: "",
          phone: "",
          logo: "",
          website_user_name: "",
          web_url: "",
        });
      }
    }
  }, [drawerMode, items, reset, websiteOptions, loadingWebsites]);

  // ✅ Submit Form
  const formSubmit = async (data: IFormValues) => {
    try {
      // convert Select value to actual object (label, value)
      const selectedWebsite = websiteOptions.find(
        (opt) => opt.value === data.web_url
      );

      const formattedData = {
        ...data,
        web_url: selectedWebsite?.value || "",
        website_user_name: selectedWebsite?.label || "",
      };

      await handleDrawerSubmit(formattedData, drawerMode);
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

          <div className="pb-2">
            <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
              Website
              <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                *
              </span>
            </label>
            <Controller
              name="web_url"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectComponent
                  options={websiteOptions}
                  value={
                    websiteOptions.find((opt) => opt.value === field.value) ||
                    null
                  }
                  onChange={(opt: any) => field.onChange(opt?.value || "")}
                  placeholder={
                    loadingWebsites ? "Loading websites..." : "Select Website"
                  }
                  isDisabled={loadingWebsites}
                  isRequired
                />
              )}
            />
          </div>

          {/* Shop Name */}
          <Input
            label="Shop Name"
            placeholder="Enter shop name"
            registerProperty={register("shop_name")}
            errorText={errors?.shop_name?.message}
            isRequired
          />

          {/* Shop Address */}
          <Input
            label="Shop Address"
            placeholder="Enter shop address"
            registerProperty={register("shop_address")}
            errorText={errors?.shop_address?.message}
            isRequired
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            placeholder="Enter your number"
            registerProperty={register("phone")}
            errorText={errors?.phone?.message}
            type="number"
            isRequired
          />

          {/* Logo */}
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
            className="bg-gray-400"
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
