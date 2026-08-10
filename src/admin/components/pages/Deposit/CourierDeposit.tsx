import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useCallback, useContext, useMemo } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { DepositService } from "@admin/@services/apis/Account/Deposit/Deposit.service";
import { DepositContext } from "@/app/admin/account/deposit/page";
import SelectComponent from "@admin/components/core/Select/Select";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import ModalFormSkeleton from "@admin/components/Skeleton/ModalForm/ModalFormSkeleton";

const defaultValue: any = {
  amount: null,
  note: "",
  reference_no: "",
};

const webSchema = yup.object({
  amount: yup.number().required("Amount is required"),
  note: yup.string(),
  reference_no: yup.string().required("Reference is required"),
});

const CourierDeposit = () => {
  const { modalMode, items, setIsModalOpen, isModalOpen, getDeposit } =
    useContext(DepositContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [accountData, setAccountData] = useState<any[]>([]);
  // ✅ modal loading (options + edit init)
  const [modalLoading, setModalLoading] = useState(false);
  const { paymentMethodOptions } = useGlobalContext();

  const getAccountList = useCallback(async () => {
    const res: any = await AccountListService.getAccountSuggestion();
    if (res?.success) return res?.data || [];
    throw new Error(res?.message || "Failed to load accounts");
  }, []);

  // ✅ One place to init modal (load options + set form)
  useEffect(() => {
    if (!isModalOpen) return;

    let alive = true;

    const init = async () => {
      setModalLoading(true);

      try {
        // ✅ Load options first (parallel)
        const [accounts] = await Promise.all([getAccountList()]);

        if (!alive) return;

        setAccountData(accounts);

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

        reset({
          payment_method: selectedPaymentMethod || "",
          account: selectedAccount || "",
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
  }, [isModalOpen, modalMode, items]);

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        amount: items?.amount || null,
        note: items.note || "",
        reference_no: items.reference_no || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    if (modalMode === "Edit") {
      DepositService.updateDeposit(items._id, {
        ...formData,
        account: formData.account?.value,
        payment_method: "bank-transfer",
        payment_source: "courier-payment",
      })
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getDeposit();
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
      DepositService.createCourierPayment({
        ...formData,
        account: formData.account?.value,
        payment_method: "bank-transfer",
        payment_source: "courier-payment",
      })
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            getDeposit();
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
            {modalMode === "Edit" ? `Edit Courier Deposit}` : "Courier Deposit"}
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
              <div className="">
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
                <Input
                  label={"Invoice No"}
                  registerProperty={register("reference_no")}
                  errorText={errors?.amount?.message}
                  type="text"
                  isRequired
                  placeholder="Enter reference no"
                />
                <Input
                  label={"Amount"}
                  registerProperty={register("amount")}
                  errorText={errors?.amount?.message}
                  type="number"
                  isRequired
                  placeholder="Enter amount no"
                />
                <Input
                  label={"Note"}
                  registerProperty={register("note")}
                  errorText={errors?.note?.message}
                  type="text"
                  placeholder="Enter your invoice"
                />
              </div>
            </div>
          )}
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

export default CourierDeposit;
