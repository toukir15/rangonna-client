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
import {
  expenseSourceOptions,
  userRoleOptions,
} from "../../Utilities/paymentData";
import { ExpenseSettingContext } from "@/app/admin/setting/expense/page";
import { ExpenseSettingService } from "@admin/@services/apis/SettingsService/ExpenseSettings/ExpenseSetting.service";
import { ExpensesService } from "@admin/@services/apis/ExpensesCategory/Expense.service";
import ModalFormSkeleton from "@admin/components/Skeleton/ModalForm/ModalFormSkeleton";

// ===== Types =====
interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

type Option = { label: string; value: string };
type TSelectOption = Option | null;

type TContext = {
  modalMode: "Add" | "Edit";
  items: any | null;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getReportCategory: () => void;
  isModalOpen: boolean;
};

// ===== Form =====
type FormValues = {
  user_role: TSelectOption;
  expense_categories_mapping: Array<{
    source: TSelectOption;
    expense_categories: Option[];
  }>;
};

const defaultValue: FormValues = {
  user_role: null,
  expense_categories_mapping: [{ source: null, expense_categories: [] }],
};

const webSchema: any = yup.object({
  user_role: yup.mixed<any>().nullable().required("User role is required"),
  expense_categories_mapping: yup
    .array()
    .of(
      yup.object({
        source: yup.mixed<any>().nullable().required("Source is required"),
        expense_categories: yup
          .array()
          .of(
            yup.object({
              label: yup.string().required(),
              value: yup.string().required(),
            })
          )
          .min(1, "Expense categories are required")
          .required(),
      })
    )
    .min(1, "At least one mapping is required")
    .required(),
});

// ===== Helpers =====
const normalizeValue = (v: any): string | undefined => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (typeof v.value === "string") return v.value;
    if (typeof v._id === "string") return v._id;
    if (typeof v.id === "string") return v.id;
  }
  return undefined;
};

const findOption = (options: Option[], val?: string): Option | null => {
  if (!val) return null;
  return options.find((o) => o.value === val) || null;
};

/**
 * input can be:
 * 1) ["id1","id2"]
 * 2) [{value:"id1"},...]
 * 3) [{_id:"id1", title:"..."}, ...]  <-- YOUR API FORMAT
 */
const mapToMultiOptions = (options: Option[], input?: any): Option[] => {
  if (!input || !Array.isArray(input)) return [];

  const ids: string[] = input
    .map((x) => {
      if (typeof x === "string") return x;
      if (typeof x === "object" && x) {
        return x.value || x._id || x.id;
      }
      return undefined;
    })
    .filter(Boolean);

  if (!ids.length) return [];

  const set = new Set(ids);
  return options.filter((o) => set.has(o.value));
};

const ExpenseSettingModal: React.FC = () => {
  const { modalMode, items, setIsModalOpen, getReportCategory, isModalOpen } =
    useContext(ExpenseSettingContext) as unknown as TContext;
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  const [isSubmit, setIsSubmit] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);

  const transformedExpenseCategoryOptions: Option[] = useMemo(() => {
    return (expenseCategories || []).map((item: any) => ({
      label: String(item?.title || "").toUpperCase(),
      value: String(item?._id || ""),
    }));
  }, [expenseCategories]);

  const { handleSubmit, reset, control } = useForm<FormValues>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
    mode: "onSubmit",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "expense_categories_mapping",
  });

  const getExpensesCategory = () => {
    setIsCategoryLoading(true);
    ExpensesService.getExpenses()
      .then((res: any) => {
        if (res?.success) {
          setExpenseCategories(res?.data?.data || []);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(
          err?.message || "Failed to fetch expense categories"
        );
      })
      .finally(() => setIsCategoryLoading(false));
  };

  // Fetch dropdown data on open
  useEffect(() => {
    if (isModalOpen) getExpensesCategory();
  }, [isModalOpen]);

  // Reset for Create / Edit after options exist
  useEffect(() => {
    if (!isModalOpen) return;

    // Create mode
    if (modalMode !== "Edit" || !items) {
      reset(defaultValue);
      replace(defaultValue.expense_categories_mapping);
      return;
    }

    // user_role: string | {value} | {_id}
    const userRoleValue = normalizeValue(items?.user_role);
    const selectedUserRole = findOption(
      userRoleOptions as Option[],
      userRoleValue
    );

    const mappedRows: FormValues["expense_categories_mapping"] =
      (items?.expense_categories_mapping || []).map((row: any) => {
        const sourceValue = normalizeValue(row?.source);
        const selectedSource =
          (expenseSourceOptions as Option[]).find(
            (opt) => opt.value === sourceValue
          ) || null;

        // IMPORTANT: here row.expense_categories is [{_id,title}] from API
        const selectedExpenseCategories = mapToMultiOptions(
          transformedExpenseCategoryOptions,
          row?.expense_categories
        );

        return {
          source: selectedSource,
          expense_categories: selectedExpenseCategories,
        };
      }) || [];

    const finalRows =
      mappedRows.length > 0
        ? mappedRows
        : [{ source: null, expense_categories: [] }];

    // one reset is enough, replace for FieldArray sync
    reset({
      user_role: selectedUserRole,
      expense_categories_mapping: finalRows,
    });
    replace(finalRows);
  }, [
    isModalOpen,
    modalMode,
    items,
    reset,
    replace,
    transformedExpenseCategoryOptions,
  ]);

  const formSubmit = async (data: FormValues) => {
    setIsSubmit(true);

    const payload = {
      user_role: data.user_role?.value,
      expense_categories_mapping: (data.expense_categories_mapping || []).map(
        (row) => ({
          source: row?.source?.value,
          expense_categories: (row?.expense_categories || []).map(
            (c) => c.value
          ),
        })
      ),
    };

    const req =
      modalMode === "Edit" && items?._id
        ? ExpenseSettingService.updateExpenseSetting(items._id, payload)
        : ExpenseSettingService.createExpenseSetting(payload);

    req
      .then((res: IApiResponse) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          getReportCategory();
          reset(defaultValue);
          replace(defaultValue.expense_categories_mapping);
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
              ? "Edit Expense Setting"
              : "Create Expense Setting"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>

        <Modal.Body>
          {isCategoryLoading ? (
            <ModalFormSkeleton />
          ) : (
            <div className="w-full gap-5">
              {/* User Role */}
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  User Role
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>

                <Controller
                  name="user_role"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      options={userRoleOptions}
                      value={field.value ?? null}
                      onChange={field.onChange}
                      placeholder="Select User Role"
                      isRequired
                    />
                  )}
                />
              </div>

              {/* Expense Categories Mapping (Array) */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300">
                    Expense Categories Mapping
                    <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                      *
                    </span>
                  </label>

                  <Button
                    type="button"
                    className="!px-3 !py-1 !text-sm bg-blue-600 dark:bg-gray-700 "
                    onClick={() =>
                      append({ source: null, expense_categories: [] })
                    }
                  >
                    + Add
                  </Button>
                </div>

                {fields.map((row, index) => (
                  <div key={row.id} className="border rounded p-3 mb-3">
                    {/* Source */}
                    <div className="pb-2">
                      <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                        Source
                      </label>

                      <Controller
                        name={`expense_categories_mapping.${index}.source`}
                        control={control}
                        render={({ field }) => (
                          <SelectComponent
                            options={expenseSourceOptions}
                            value={field.value ?? null}
                            onChange={field.onChange}
                            placeholder="Select Source"
                            isRequired
                          />
                        )}
                      />
                    </div>

                    {/* Expense Categories (Multi) */}
                    <div className="pb-2">
                      <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                        Expense Categories
                      </label>

                      <Controller
                        name={`expense_categories_mapping.${index}.expense_categories`}
                        control={control}
                        render={({ field }) => (
                          <SelectComponent
                            options={transformedExpenseCategoryOptions}
                            value={
                              Array.isArray(field.value) ? field.value : []
                            }
                            onChange={field.onChange}
                            placeholder="Select Expense Categories"
                            isRequired
                            isMulti
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
          )}
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

export default ExpenseSettingModal;
