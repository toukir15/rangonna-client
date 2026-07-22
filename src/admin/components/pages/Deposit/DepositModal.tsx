import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
// import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { DepositService } from "@admin/@services/apis/Account/Deposit/Deposit.service";
// import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { DepositCategoryService } from "@admin/@services/apis/DepositCategory/DepositCategory.service";
import { DepositContext } from "@/app/admin/account/deposit/page";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { useGlobalContext } from "@admin/context/GlobalContext";

const defaultValue: any = {
  // warehouse: "",
  payment_method: "",
  account: "",
  deposit_category: "",
  amount: null,
  note: "",
};

const webSchema = yup.object({
  // warehouse: yup.mixed().required("Warehouse is required"),
  account: yup.mixed().required("Account is required"),
  payment_method: yup.mixed().required("Payment method is required"),
  deposit_category: yup.mixed().required("Deposit Category required"),
  amount: yup.number().required("Amount is required"),
  note: yup.string(),
});

const DepositModal = () => {
  const { modalMode, items, setIsModalOpen, isModalOpen, getDeposit } =
    useContext(DepositContext);
  const { paymentMethodOptions } = useGlobalContext();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [accountData, setAccountData] = useState<any>();
  // const [warehouseData, setWarehouseData] = useState<any>();
  const [depositCategory, setDepositCategoryData] = useState<any>();

  const transformedDataOption = accountData?.map((item: any) => ({
    label: item?.account_name
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));
  // const warehouseDataOption = warehouseData?.map((item: any) => ({
  //   label: item.title.toUpperCase(),
  //   value: item._id,
  // }));
  const depositDataOption = depositCategory?.map((item: any) => ({
    label: item.title
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));

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
      // const selectedWarehouse = warehouseDataOption?.find(
      //   (option: any) => option.value === items.warehouse._id
      // );
      const selectedAccount = transformedDataOption?.find(
        (option: any) => option.value === items.account._id
      );
      const selectedPayment = paymentMethodOptions?.find(
        (option: any) => option.value === items.label
      );
      const selectedDepositCategory = depositDataOption?.find(
        (option: any) => option.value === items.deposit_category._id
      );

      reset({
        // warehouse: selectedWarehouse || "",
        account: selectedAccount || "",
        payment_method: selectedPayment || "",
        deposit_category: selectedDepositCategory || "",
        amount: items.amount || null,
        note: items.note || "",
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

        account: formData.account.value,
        payment_method: formData.payment_method.value,
        deposit_category: formData.deposit_category.value,
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
      DepositService.createDeposit({
        ...formData,
        // warehouse: formData.warehouse.value,
        account: formData.account.value,
        payment_method: formData.payment_method.value,
        deposit_category: formData.deposit_category.value,
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

  // const getWarehouse = () => {
  //   WarehouseService.getWarehouse()
  //     .then((res: any) => {
  //       if (res?.success) {
  //         setWarehouseData(res?.data.data);
  //       } else {
  //         ToastService.error(res?.message);
  //       }
  //     })
  //     .catch((err: { message: string }) => {
  //       ToastService.error(err.message);
  //     });
  // };
  const getDepositCategory = () => {
    DepositCategoryService.getDepositCategory()
      .then((res: any) => {
        if (res?.success) {
          setDepositCategoryData(res?.data.data);
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
      getDepositCategory();
      getAccountList();
      // getWarehouse();
    }
  }, [isModalOpen]);

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
              ? `Edit Deposit: ${items?.warehouse.title}`
              : "Create Deposit"}
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
              {/* <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Warehouse
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="warehouse"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={warehouseDataOption}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Warehouse"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div> */}
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
                      placeholder="Select Payment"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div>
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
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Deposit Category
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="deposit_category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={depositDataOption}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Category"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div>

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

export default DepositModal;
