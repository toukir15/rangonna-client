"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SelectComponent from "@admin/components/core/Select/Select";
import Input from "@admin/components/core/Input/Input";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { PurchasesService } from "@admin/@services/apis/PurchasesService/Purchases.service";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";

type PaymentModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  paymentData: any;
  modalMode: "Add" | "Edit" | "View";
  refreshData?: () => void;
  setModalMode: any;
};

type FormValues = {
  payment_choice: { label: string; value: string } | null;
  account: any | null;
  paying_amount: number | null;
  note: string;
};

const defaultValue: FormValues = {
  payment_choice: null,
  account: null,
  paying_amount: null,
  note: "",
};

const webSchema = (dueAmount: number) =>
  yup.object({
    payment_choice: yup.mixed().required("Payment choice is required"),
    account: yup.mixed().required("Account is required"),
    note: yup.string(),
    paying_amount: yup
      .number()
      .required("Paying amount is required")
      .min(1, "Paying amount must be greater than 0")
      // .max(dueAmount, "Paying amount cannot be greater than due amount")
      .typeError("Paying amount must be a number"),
  });

const CreatePaymentModal = ({
  isModalOpen,
  setIsModalOpen,
  paymentData,
  modalMode,
  refreshData,
  setModalMode,
}: PaymentModalProps) => {
  const { permissionList, paymentMethodOptions } = useGlobalContext();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [accountData, setAccountData] = useState<any[]>([]);
  const [showPaymentData, setShowPaymentData] = useState<any[]>([]);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const transformedDataOption = accountData?.map((item: any) => ({
    label: item?.account_name
      ?.toLowerCase()
      ?.replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));

  const {
    handleSubmit,
    register,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(
      webSchema(
        modalMode === "Edit"
          ? grandTotal
          : paymentData?.due !== undefined
          ? paymentData.due
          : grandTotal
      )
    ),
    defaultValues: defaultValue,
  });

  const payingAmount = Number(watch("paying_amount") || 0);
  const dueAmount = Number(paymentData?.due || 0);
  const remainingDue = Math.max(dueAmount - payingAmount, 0);
  const formSubmit = async (formData: FormValues) => {
    setIsSubmit(true);

    const formattedData: any = {
      payment_method: formData?.payment_choice?.value,
      account: formData?.account?.value,
      amount: formData?.paying_amount,
      note: formData?.note,
      source: "purchase-payment",
    };

    try {
      let res;
      if (modalMode === "Add") {
        res = await PurchasesService.createPurchasesPayment(
          paymentData?._id,
          formattedData
        );
      } else if (modalMode === "Edit" && editingPayment) {
        res = await PurchasesService.updatePurchasesPayment(
          editingPayment._id,
          {
            account: formattedData.account._id,
            amount: formattedData.amount,
          }
        );
      }

      if (res?.success) {
        ToastService.success(res?.message);
        setIsModalOpen(false);
        refreshData?.();
        reset();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
    }
  };

  const confirmRemove = async () => {
    if (!remove) return;
    try {
      const res = await PurchasesService.deletePurchasesPayment(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getShowPayment();
        setIsAlertOpen(false);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const getAccountList = () => {
    AccountListService.getAccountSuggestion()
      .then((res: any) => {
        if (res?.success) {
          setAccountData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const getShowPayment = () => {
    PurchasesService.getShowPayment(paymentData?._id)
      .then((res: any) => {
        if (res?.success) {
          setShowPaymentData(res.data.data || []);
          const total =
            res.data.data?.reduce(
              (sum: number, payment: any) => payment.purchase?.grand_total,
              0
            ) || 0;
          setGrandTotal(total);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setModalMode("Edit");

    const account = accountData.find((acc) => acc._id === payment.account?._id);

    setValue("payment_choice", {
      value: payment.payment_method,
      label:
        paymentMethodOptions.find((opt) => opt.value === payment.payment_method)
          ?.label || "",
    });

    setValue("account", {
      value: payment.account,
      label:
        account?.account_name
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase()) || "",
    });

    setValue("paying_amount", payment.amount);
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    reset();
    setModalMode("View");
  };

  useEffect(() => {
    if (paymentData?._id) {
      getAccountList();
      getShowPayment();

      setGrandTotal(paymentData?.due || 0);
    }
  }, [paymentData?._id, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      reset();
      setEditingPayment(null);
      setModalMode("View");
    }
  }, [isModalOpen]);

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-5xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {modalMode === "Add" && `Create Payment: ${paymentData?.invoice}`}
            {modalMode === "Edit" && `Edit Payment: ${paymentData?.invoice}`}
            {modalMode === "View" && `Payment History: ${paymentData?.invoice}`}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>
        <Modal.Body>
          {modalMode !== "View" ? (
            <div className="w-full gap-5 min-h-96">
              <div className="">
                {modalMode === "Edit" ? (
                  <></>
                ) : (
                  <div className="pb-2">
                    <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                      Payment Method
                      <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                        *
                      </span>
                    </label>
                    <Controller
                      name="payment_choice"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SelectComponent
                          options={paymentMethodOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Payment"
                          isRequired
                          className=""
                        />
                      )}
                    />
                  </div>
                )}

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
                        className=""
                      />
                    )}
                  />
                </div>
                <div className="flex items-center gap-5">
                  <div className="md:w-1/2">
                    <Input
                      label={"Paying Amount"}
                      registerProperty={register("paying_amount")}
                      errorText={errors?.paying_amount?.message}
                      type="number"
                      isRequired
                      placeholder="Enter paying amount"
                    />
                  </div>
                  <div className="md:w-1/2">
                    {modalMode === "Edit" ? (
                      <></>
                    ) : (
                      <Input
                        label={"Due Amount"}
                        type="number"
                        value={remainingDue}
                        isRequired
                        placeholder="Enter due amount"
                        isDisabled
                      />
                    )}
                  </div>
                </div>
                <div>
                  <Input
                    label={"Note"}
                    registerProperty={register("note")}
                    errorText={errors?.note?.message}
                    type="text"
                    placeholder="Enter your invoice"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-60">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-semibold dark:text-gray-300">
                  Payment History
                </h4>
                {permissionList.includes("purc_e") && (
                  <Button
                    onClick={() => setModalMode("Add")}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Icon name={"add"} />
                    <span className="ml-1">Add Payment</span>
                  </Button>
                )}
              </div>
              <table className="edit-order-products-table">
                <thead className="bg-blue-50 dark:bg-gray-700 h-[55px] shadow-sm border-b border-gray-300 dark:border-gray-700 p-20 ">
                  <tr>
                    <th className="dark:border-gray-600 px-4 py-2 dark:text-gray-300 text-sm">
                      Date
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 dark:text-gray-300 text-sm">
                      Reference
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 whitespace-nowrap dark:text-gray-300 text-sm">
                      Amount
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 w-28 dark:text-gray-300 text-sm">
                      Paid By
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 w-28 dark:text-gray-300 text-sm">
                      Account
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 w-28 dark:text-gray-300 text-sm">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showPaymentData?.map((data: any, index: number) => (
                    <tr key={index}>
                      <td className="border dark:border-gray-600 dark:text-gray-300 px-4 py-2 font-medium text-nowrap">
                        {formatTimeAgo(data?.createdAt)}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-center dark:text-gray-400 text-nowrap">
                        {data?.reference_no}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400 text-nowrap">
                        {data?.amount}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400 text-nowrap">
                        {
                          paymentMethodOptions.find(
                            (opt) => opt.value === data?.payment_method
                          )?.label
                        }
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400 text-nowrap">
                        {data?.account?.account_name}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <Button
                            className="flex items-center bg-green-500 !px-3 !py-1"
                            onClick={() => handleEditPayment(data)}
                          >
                            <Icon name={"edit_document"} />
                            <span className="ml-1">Edit</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {showPaymentData?.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No payment history available
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        {modalMode !== "View" ? (
          <Modal.Footer className="flex justify-end space-x-2">
            {modalMode === "Edit" && (
              <Button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Close
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmit}
            >
              {isSubmit ? (
                <ButtonLoader />
              ) : modalMode === "Add" ? (
                "Create"
              ) : (
                "Update"
              )}
            </Button>
          </Modal.Footer>
        ) : null}
      </Modal>
    </form>
  );
};

export default CreatePaymentModal;
