"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useCallback, useEffect, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SelectComponent from "@admin/components/core/Select/Select";
import Input from "@admin/components/core/Input/Input";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
// import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { WholesaleReturnService } from "@admin/@services/apis/WholesaleService/wholesale.service";

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
  // account: any | null;
  paying_amount: number | null;
  note: string | null;
  is_courier: boolean;
};

const defaultValue: FormValues = {
  payment_choice: null,
  // account: null,
  paying_amount: null,
  note: null,
  is_courier: false,
};

const webSchema = () =>
  yup.object({
    payment_choice: yup.mixed().required("Payment choice is required"),
    // account: yup.mixed().required("Account is required"),
    paying_amount: yup
      .number()
      .required("Paying amount is required")
      .min(1, "Paying amount must be greater than 0")
      .typeError("Paying amount must be a number"),
    note: yup.string().nullable(),
    is_courier: yup.boolean().default(false),
  });

const WholeSaleCreatePaymentModal = ({
  isModalOpen,
  setIsModalOpen,
  paymentData,
  modalMode,
  refreshData,
  setModalMode,
}: PaymentModalProps) => {
  const { permissionList, paymentMethodOptions } = useGlobalContext();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false);
  // const [accountData, setAccountData] = useState<any[]>([]);
  const [showPaymentData, setShowPaymentData] = useState<any[]>([]);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  // const transformedDataOption = accountData?.map((item: any) => ({
  //   label: item?.account_name
  //     .toLowerCase()
  //     .replace(/\b\w/g, (char: string) => char.toUpperCase()),
  //   value: item._id,
  // }));

  const {
    handleSubmit,
    register,
    // watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema()),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: FormValues) => {
    setIsSubmit(true);

    const formattedData: any = {
      amount: formData?.paying_amount,
      // account: formData?.account?.value,
      wholesale_user: paymentData?._id?.user_id,

      note: formData?.note,
      payment_method: formData?.payment_choice?.value,
      payment_source: "wholesale-order-payment",
      is_courier: Boolean(formData?.is_courier),
    };

    try {
      let res;
      if (modalMode === "Add") {
        res =
          await WholesaleReturnService.createWholeSaleOrderPayment(
            formattedData,
          );
      } else if (modalMode === "Edit" && editingPayment?._id) {
        res = await WholesaleReturnService.updateWholesaleOrderPayment(
          editingPayment?._id,
          {
            // account: formData?.account?.value,
            amount: formattedData.amount,
            payment_method: formData?.payment_choice?.value,
            note: formData?.note,
            is_courier: Boolean(formData?.is_courier),
          },
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
    setIsRemoveLoading(true);

    WholesaleReturnService.deleteWholesaleOrderPayment(remove)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          getShowPayment();
          setIsAlertOpen(false);
          refreshData?.();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setRemove(null);
        setIsRemoveLoading(false);
      });
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  // const getAccountList = () => {
  //   AccountListService.getAccountSuggestion()
  //     .then((res: any) => {
  //       if (res?.success) {
  //         setAccountData(res?.data);
  //       } else {
  //         ToastService.error(res?.message);
  //       }
  //     })
  //     .catch((err: { message: string }) => {
  //       ToastService.error(err.message);
  //     });
  // };

  const wholesaleUserId = paymentData?._id?.user_id as string | undefined;

  const getShowPayment = useCallback(() => {
    if (!wholesaleUserId) return;
    WholesaleReturnService.getWholesaleOrderShowPayment(wholesaleUserId)
      .then((res: any) => {
        if (res?.success) {
          setShowPaymentData(res.data.data || []);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, [wholesaleUserId]);

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment);
    setModalMode("Edit");

    // const account = accountData.find((acc) => acc._id === payment.account?._id);

    setValue("payment_choice", {
      value: payment.payment_method,
      label:
        paymentMethodOptions.find((opt) => opt.value === payment.payment_method)
          ?.label || "",
    });

    // setValue("account", {
    //   value: payment.account,
    //   label: account?.account_name.toUpperCase() || "",
    // });

    setValue("paying_amount", payment.amount);
    setValue("note", payment.note);
    setValue("is_courier", Boolean(payment.is_courier));
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    reset();
    setModalMode("View");
  };

  useEffect(() => {
    if (!isModalOpen || modalMode !== "View" || !wholesaleUserId) return;
    getShowPayment();
  }, [isModalOpen, modalMode, wholesaleUserId, getShowPayment]);

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
        isLoading={isRemoveLoading}
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
            {modalMode === "Add" &&
              `Create Payment: ${paymentData?._id?.user_name}`}
            {modalMode === "Edit" &&
              `Edit Payment: ${paymentData?._id?.user_name}`}
            {modalMode === "View" &&
              `Payment History: ${paymentData?._id?.user_name}`}
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
                {/* {modalMode === "Edit" ? (
                  <></>
                ) : ( */}
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
                {/* )} */}

                {/* <div className="pb-2">
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
                </div> */}
                <div>
                  <Input
                    label={"Paying Amount"}
                    registerProperty={register("paying_amount")}
                    errorText={errors?.paying_amount?.message}
                    type="number"
                    isRequired
                    placeholder="Enter paying amount"
                  />

                  <Input
                    label={"Note"}
                    registerProperty={register("note")}
                    errorText={errors?.note?.message}
                    type="text"
                    placeholder="Enter your note"
                  />

                  <div className="pb-2 pt-2">
                    <Controller
                      name="is_courier"
                      control={control}
                      render={({ field }) => (
                        <label className="flex cursor-pointer items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                          />
                          <span className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300">
                            Courier Payment
                          </span>
                        </label>
                      )}
                    />
                  </div>
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
                    className="flex items-center bg-blue-500 !px-4 !py-2"
                  >
                    <Icon name={"add"} />
                    <span className="ml-1">Add Payment</span>
                  </Button>
                )}
              </div>
              <table className="min-w-full border-collapse border dark:border-gray-500">
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
                      Method
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
                        {data?.payment_method}
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
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
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

export default WholeSaleCreatePaymentModal;
