import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { TransferMoneyService } from "@admin/@services/apis/Account/TransferMoney/TransferMoney.service";
import { TransfersMoneyContext } from "@/app/admin/account/transfer-money/page";

const defaultValue: any = {
  amount: null,
  from_account: "",
  to_account: "",
  note: "",
};

const webSchema = yup.object({
  amount: yup.number().required("Amount is required"),
  from_account: yup.mixed().required("From account is required"),
  to_account: yup.mixed().required("To Account is required"),
  note: yup.string(),
});

const TransfersMoneyModal = () => {
  const { modalMode, items, setIsModalOpen, getTransferMoney, isModalOpen } =
    useContext(TransfersMoneyContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [accountData, setAccountData] = useState<any>();

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

  const fromAccountValue = useWatch({ control, name: "from_account" });
  const toAccountValue = useWatch({ control, name: "to_account" });

  const getFilteredOptions = (currentField: string) => {
    if (!accountData) return [];

    const otherFieldValue =
      currentField === "from_account" ? toAccountValue : fromAccountValue;

    return accountData
      .filter((item: any) => {
        if (otherFieldValue) {
          return item._id !== otherFieldValue.value;
        }
        return true;
      })
      .map((item: any) => ({
        label: item.account_name
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase()),
        value: item._id,
      }));
  };

  const fromAccountOptions = getFilteredOptions("from_account");
  const toAccountOptions = getFilteredOptions("to_account");

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      const selectedFromType = accountData?.find(
        (item: any) => item?._id === items?.from_account?._id
      );
      const selectedToType = accountData?.find(
        (item: any) => item?._id === items?.to_account?._id
      );

      reset({
        amount: items?.amount || null,
        from_account: selectedFromType
          ? {
              label: selectedFromType.account_name.toUpperCase(),
              value: selectedFromType._id,
            }
          : "",
        to_account: selectedToType
          ? {
              label: selectedToType.account_name.toUpperCase(),
              value: selectedToType._id,
            }
          : "",
        note: items?.note || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, isModalOpen, accountData]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    if (modalMode === "Edit") {
      TransferMoneyService.updateTransferMoney(items._id, {
        ...formData,
        from_account: formData.from_account.value,
        to_account: formData.to_account.value,
      })
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getTransferMoney();
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
      TransferMoneyService.createTransferMoney({
        ...formData,
        from_account: formData.from_account.value,
        to_account: formData.to_account.value,
      })
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            getTransferMoney();
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
          reset();
        });
    }
  };

  const getAccountList = () => {
    AccountListService.getAccountList()
      .then((res: any) => {
        if (res?.success) {
          setAccountData(res?.data.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    if (isModalOpen) {
      getAccountList();
    }
  }, [isModalOpen]);

  if (modalMode === "Edit" && (!items || !accountData)) {
    return <div className="p-4">Loading...</div>;
  }

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
              ? `Edit Account: ${items?.from_account?.account_name}`
              : "Create Transfers Money"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5">
            <div className="">
              <Input
                label={"Amount"}
                registerProperty={register("amount")}
                errorText={errors?.amount?.message}
                type="number"
                isRequired
                placeholder="Enter account no"
              />

              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  From Account
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="from_account"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={fromAccountOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Account"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div>
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  To Account
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="to_account"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={toAccountOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Account"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div>
              <Input
                label={"Note"}
                registerProperty={register("note")}
                errorText={errors?.note?.message}
                type="textarea"
                placeholder="Enter your note"
              />
            </div>
          </div>
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

export default TransfersMoneyModal;
