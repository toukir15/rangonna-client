"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import SelectComponent from "@admin/components/core/Select/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { DepositSettingContext } from "@/app/admin/setting/deposit/page";
import { depositSourceOptions } from "../../Utilities/paymentData";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { DepositCategoryService } from "@admin/@services/apis/DepositCategory/DepositCategory.service";
import { DepositSettingService } from "@admin/@services/apis/SettingsService/DepositSettings/DepositSetting.service";
import { useGlobalContext } from "@admin/context/GlobalContext";

// ===== Types =====
interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

type TSelectOption = { label: string; value: string } | "";

// Adjust this if your context items shape differs
type TDepositCategoryItem = {
  deposit_category: { _id: string } | string;
  source: string;
};

type TDepositSettingItem = {
  _id: string;
  payment_method: string;
  account: { _id: string };
  deposit_categories: TDepositCategoryItem[];
};

type TContext = {
  modalMode: "Add" | "Edit";
  items: TDepositSettingItem | null;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getReportCategory: () => void;
  isModalOpen: boolean;
};

// ===== Form =====
type FormValues = {
  payment_method: TSelectOption;
  account: TSelectOption;
  deposit_categories: Array<{
    deposit_category: TSelectOption;
    source: TSelectOption;
  }>;
};

const defaultValue: FormValues = {
  payment_method: "",
  account: "",
  deposit_categories: [{ deposit_category: "", source: "" }],
};

const webSchema = yup.object({
  payment_method: yup.mixed().required("Payment method is required"),
  account: yup.mixed().required("Account is required"),
  deposit_categories: yup
    .array()
    .of(
      yup.object({
        deposit_category: yup.mixed().required("Deposit Category required"),
        source: yup.mixed().required("Source is required"),
      })
    )
    .min(1, "At least one deposit category is required")
    .required(),
});

const DepositSettingModal: React.FC = () => {
  const { modalMode, items, setIsModalOpen, getReportCategory, isModalOpen } =
    useContext(DepositSettingContext) as unknown as TContext;
  const { paymentMethodOptions } = useGlobalContext();

  const [isSubmit, setIsSubmit] = useState(false);
  const [accountData, setAccountData] = useState<any[]>([]);
  const [depositCategoryData, setDepositCategoryData] = useState<any[]>([]);

  const transformedAccountOptions = useMemo(() => {
    return (accountData || []).map((item: any) => ({
      label: String(item?.account_name || "")
        .toLowerCase()
        .replace(/\b\w/g, (char: string) => char.toUpperCase()),
      value: String(item?._id || ""),
    }));
  }, [accountData]);

  const transformedDepositCategoryOptions = useMemo(() => {
    return (depositCategoryData || []).map((item: any) => ({
      label: String(item?.title || "")
        .toLowerCase()
        .replace(/\b\w/g, (char: string) => char.toUpperCase()),
      value: String(item?._id || ""),
    }));
  }, [depositCategoryData]);

  const { handleSubmit, reset, control } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "deposit_categories",
  });

  const getAccountList = () => {
    AccountListService.getAccountList()
      .then((res: any) => {
        if (res?.success) {
          setAccountData(res?.data?.data || []);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err?.message || "Failed to fetch accounts");
      });
  };

  const getDepositCategory = () => {
    DepositCategoryService.getDepositCategory()
      .then((res: any) => {
        if (res?.success) {
          setDepositCategoryData(res?.data?.data || []);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(
          err?.message || "Failed to fetch deposit categories"
        );
      });
  };

  // Fetch dropdown data on open
  useEffect(() => {
    if (isModalOpen) {
      getDepositCategory();
      getAccountList();
    }
  }, [isModalOpen]);

  // Helper: safe find option
  const findOption = (
    options: Array<{ label: string; value: string }>,
    val?: string
  ) => {
    if (!val) return "";
    return options.find((o) => o.value === val) || "";
  };

  const findOptionByValueOrId = (
    options: Array<{ label: string; value: string }>,
    v?: unknown
  ) => {
    if (!v) return "";
    // v could be { _id } or a string id
    const id = typeof v === "string" ? v : (v as any)?._id;
    if (!id) return "";
    return options.find((o) => o.value === id) || "";
  };

  // Reset for Create / Edit after options exist
  useEffect(() => {
    if (!isModalOpen) return;

    // Create mode
    if (modalMode !== "Edit" || !items) {
      reset(defaultValue);
      replace(defaultValue.deposit_categories);
      return;
    }

    // Edit mode: prefill
    const selectedPayment =
      paymentMethodOptions?.find(
        (opt: any) => opt.value === items.payment_method
      ) || "";

    const selectedAccount =
      findOption(transformedAccountOptions, items?.account?._id) || "";

    const mappedRows =
      (items?.deposit_categories || []).map((dc: any) => {
        const selectedDepositCategory = findOptionByValueOrId(
          transformedDepositCategoryOptions,
          dc?.deposit_category
        );

        const selectedSource =
          depositSourceOptions?.find((opt: any) => opt.value === dc?.source) ||
          "";

        return {
          deposit_category: selectedDepositCategory || "",
          source: selectedSource || "",
        };
      }) || [];

    const finalRows = mappedRows.length
      ? mappedRows
      : [{ deposit_category: "", source: "" }];

    reset({
      payment_method: selectedPayment,
      account: selectedAccount,
      deposit_categories: finalRows,
    });

    replace(finalRows);
  }, [
    isModalOpen,
    modalMode,
    items,
    reset,
    replace,
    transformedAccountOptions,
    transformedDepositCategoryOptions,
  ]);

  const formSubmit = async (data: FormValues) => {
    setIsSubmit(true);

    const formData = {
      payment_method: (data.payment_method as any)?.value,
      account: (data.account as any)?.value,
      deposit_categories: (data.deposit_categories || []).map((row: any) => ({
        deposit_category: row?.deposit_category?.value,
        source: row?.source?.value,
      })),
    };

    const req =
      modalMode === "Edit" && items?._id
        ? DepositSettingService.updateDepositSetting(items._id, formData)
        : DepositSettingService.createDepositSetting(formData);

    req
      .then((res: IApiResponse) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          getReportCategory();
          reset(defaultValue);
          replace(defaultValue.deposit_categories);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error) ToastService.error(err.message);
        else ToastService.error("Unexpected error");
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
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {modalMode === "Edit"
              ? "Edit Deposit Setting"
              : "Create Deposit Setting"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full gap-5">
            {/* Payment Method */}
            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Payment Method
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>

              <Controller
                name="payment_method"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={paymentMethodOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Payment"
                    isRequired
                  />
                )}
              />
            </div>

            {/* Account */}
            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Account
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>

              <Controller
                name="account"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={transformedAccountOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Account"
                    isRequired
                  />
                )}
              />
            </div>

            {/* Deposit Categories (Array) */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300">
                  Deposit Categories
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>

                <Button
                  type="button"
                  className="!px-3 !py-1 !text-sm bg-blue-600 dark:bg-gray-700 "
                  onClick={() => append({ deposit_category: "", source: "" })}
                >
                  + Add
                </Button>
              </div>

              {fields.map((row, index) => (
                <div key={row.id} className="border rounded p-3 mb-3">
                  {/* Deposit Category */}
                  <div className="pb-2">
                    <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                      Deposit Category
                    </label>

                    <Controller
                      name={
                        `deposit_categories.${index}.deposit_category` as const
                      }
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          options={transformedDepositCategoryOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Category"
                          isRequired
                        />
                      )}
                    />
                  </div>

                  {/* Source */}
                  <div className="pb-2">
                    <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                      Source
                    </label>

                    <Controller
                      name={`deposit_categories.${index}.source` as const}
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          options={depositSourceOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Source"
                          isRequired
                        />
                      )}
                    />
                  </div>

                  {/* Remove */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      className="!px-3 !py-1 !text-sm bg-red-500 text-white"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            type="button"
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

export default DepositSettingModal;
