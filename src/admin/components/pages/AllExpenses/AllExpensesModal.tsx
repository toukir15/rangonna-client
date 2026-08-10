"use client";

import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { AllExpensesService } from "@admin/@services/apis/Account/AllExpenses/AllExpenses.service";
import { ExpensesService } from "@admin/@services/apis/ExpensesCategory/Expense.service";
import { AllExpensesContext } from "@/app/admin/account/expense/page";
import ModalFormSkeleton from "@admin/components/Skeleton/ModalForm/ModalFormSkeleton";
import { useGlobalContext } from "@admin/context/GlobalContext";

const defaultValue: any = {
  payment_method: "",
  account: "",
  expense_category: "",
  expense_sub_title: "",
  amount: null,
  note: "",
};

const webSchema = yup.object({
  payment_method: yup.mixed().required("Payment method is required"),
  account: yup.mixed().required("Account is required"),
  expense_category: yup.mixed().required("Expenses Category required"),
  expense_sub_title: yup.mixed().required("Expense sub title required"),
  amount: yup
    .number()
    .typeError("Amount is required")
    .required("Amount is required"),
  note: yup.string(),
});

const AllExpensesModal = () => {
  const { isModalOpen, setIsModalOpen, modalMode, items, getAllExpenses } =
    useContext(AllExpensesContext);
  const { paymentMethodOptions } = useGlobalContext();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [accountData, setAccountData] = useState<any[]>([]);
  const [expensesCategoryData, setExpensesCategoryData] = useState<any[]>([]);

  // ✅ modal loading (options + edit init)
  const [modalLoading, setModalLoading] = useState(false);

  const transformedDataOption = useMemo(() => {
    return (
      accountData?.map((item: any) => ({
        label: String(item?.account_name || "")
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase()),
        value: item?._id,
      })) || []
    );
  }, [accountData]);

  const expensesDataOption = useMemo(() => {
    return (
      expensesCategoryData?.map((item: any) => ({
        label: String(item?.title || "")
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase()),
        value: item?._id,
      })) || []
    );
  }, [expensesCategoryData]);

  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const selectedExpenseCategory = watch("expense_category");

  const expensesSubDataOption =
    expensesCategoryData
      ?.find((c: any) => c?._id === selectedExpenseCategory?.value)
      ?.sub_titles?.map((s: string) => ({
        label: String(s).toUpperCase(),
        value: s,
      })) || [];

  const getAccountList = useCallback(async () => {
    const res: any = await AccountListService.getAccountSuggestion();
    if (res?.success) return res?.data || [];
    throw new Error(res?.message || "Failed to load accounts");
  }, []);

  const getExpensesCategory = useCallback(async () => {
    const res: any = await ExpensesService.getExpensesSuggestions();
    if (res?.success) return res?.data || [];
    throw new Error(res?.message || "Failed to load categories");
  }, []);

  // ✅ One place to init modal (load options + set form)
  useEffect(() => {
    if (!isModalOpen) return;

    let alive = true;

    const init = async () => {
      setModalLoading(true);

      try {
        // ✅ Load options first (parallel)
        const [accounts, categories] = await Promise.all([
          getAccountList(),
          getExpensesCategory(),
        ]);

        if (!alive) return;

        setAccountData(accounts);
        setExpensesCategoryData(categories);

        // ✅ Add mode -> reset immediately
        if (modalMode !== "Edit" || !items) {
          reset(defaultValue);
          return;
        }

        // ✅ Edit mode -> now options are ready, set selected values
        const paymentMethodValue =
          items?.payment_method?._id ?? items?.payment_method ?? "";
        const selectedPaymentMethod = paymentMethodOptions?.find(
          (option: any) => option.value === paymentMethodValue,
        );

        const selectedAccount = accounts
          ?.map((item: any) => ({
            label: String(item?.account_name || "")
              .toLowerCase()
              .replace(/\b\w/g, (char: string) =>
                char
                  .toLowerCase()
                  .replace(/\b\w/g, (char: string) => char.toUpperCase()),
              ),
            value: item?._id,
          }))
          ?.find(
            (o: any) => o.value === (items?.account?._id ?? items?.account),
          );

        const selectedExpensesCategory = categories
          ?.map((item: any) => ({
            label: String(item?.title || "")
              .toLowerCase()
              .replace(/\b\w/g, (char: string) =>
                char
                  .toLowerCase()
                  .replace(/\b\w/g, (char: string) => char.toUpperCase()),
              ),
            value: item?._id,
          }))
          ?.find(
            (o: any) =>
              o.value ===
              (items?.expense_category?._id ?? items?.expense_category),
          );

        const categoryId = selectedExpensesCategory?.value;

        const subOptions =
          categories
            ?.find((c: any) => c?._id === categoryId)
            ?.sub_titles?.map((s: string) => ({
              label: String(s)
                .toLowerCase()
                .replace(/\b\w/g, (char: string) => char.toUpperCase()),
              value: s,
            })) || [];

        const selectedSubTitle = subOptions.find(
          (o: any) => o.value === items?.expense_sub_title,
        );

        reset({
          payment_method: selectedPaymentMethod || "",
          account: selectedAccount || "",
          expense_category: selectedExpensesCategory || "",
          expense_sub_title: selectedSubTitle || "",
          amount: items?.amount ?? null,
          note: items?.note ?? "",
        });
      } catch (err: any) {
        ToastService.error(err?.message || "Failed to init modal");
      } finally {
        if (alive) setModalLoading(false);
      }
    };

    init();

    return () => {
      alive = false;
    };
  }, [
    isModalOpen,
    modalMode,
    items,
    reset,
    getAccountList,
    getExpensesCategory,
  ]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const payload = {
      ...formData,
      payment_method: formData?.payment_method?.value,
      account: formData?.account?.value,
      expense_category: formData?.expense_category?.value,
      expense_sub_title: formData?.expense_sub_title?.value,
    };

    try {
      if (modalMode === "Edit") {
        const res: any = await AllExpensesService.updateAllExpenses(
          items?._id,
          payload,
        );
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          getAllExpenses();
        } else ToastService.error(res?.message);
      } else {
        const res: any = await AllExpensesService.createAllExpenses(payload);
        if (res?.success) {
          ToastService.success(res?.message);
          getAllExpenses();
          setIsModalOpen(false);
          reset(defaultValue);
        } else ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Request failed");
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
            {modalMode === "Edit" ? `Edit All Expenses` : "Create All Expenses"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>

        <Modal.Body>
          {modalLoading ? (
            <div className=" ">
              <ModalFormSkeleton />
            </div>
          ) : (
            <div className="w-full gap-5">
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Expense Category
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>

                <Controller
                  name="expense_category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={expensesDataOption}
                      value={field.value}
                      onChange={(val: any) => {
                        field.onChange(val);
                        setValue("expense_sub_title", "");
                      }}
                      placeholder="Select Expense Category"
                      isRequired
                    />
                  )}
                />

                {errors?.expense_category?.message ? (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.expense_category.message)}
                  </p>
                ) : null}
              </div>

              {/* Expense Sub Title */}
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Expense Sub Title
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>

                <Controller
                  name="expense_sub_title"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={expensesSubDataOption}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Expense Sub Title"
                      isRequired
                      isDisabled={!selectedExpenseCategory?.value}
                    />
                  )}
                />

                {errors?.expense_sub_title?.message ? (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.expense_sub_title.message)}
                  </p>
                ) : null}
              </div>

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
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={paymentMethodOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Payment Method"
                      isRequired
                    />
                  )}
                />

                {errors?.payment_method?.message ? (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.payment_method.message)}
                  </p>
                ) : null}
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
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={transformedDataOption}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Account"
                      isRequired
                    />
                  )}
                />

                {errors?.account?.message ? (
                  <p className="text-red-500 text-xs mt-1">
                    {String(errors.account.message)}
                  </p>
                ) : null}
              </div>

              {/* Amount */}
              <Input
                label={"Amount"}
                registerProperty={register("amount")}
                errorText={errors?.amount?.message as any}
                type="number"
                isRequired
                placeholder="Enter amount"
              />

              {/* Note */}
              <Input
                label={"Note"}
                registerProperty={register("note")}
                errorText={errors?.note?.message as any}
                type="text"
                placeholder="Enter your note"
              />
            </div>
          )}
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
            disabled={isSubmit || modalLoading}
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

export default AllExpensesModal;
