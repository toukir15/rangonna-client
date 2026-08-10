import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { DepositCategoryService } from "@admin/@services/apis/DepositCategory/DepositCategory.service";
import Input from "@admin/components/core/Input/Input";
import { PaymentSettingService } from "@admin/@services/apis/SettingsService/PaymentSetting/Payment.service";

const defaultValue: any = {
  title: "",
  account: "",
  deposit_category: "",
};

enum DepositSource {
  WHOLESALE = "wholesale_payment",
  PATHAO = "pathao",
  BKASH = "bkash",
  SSL = "ssl",
}

const webSchema = yup.object({
  title: yup.string(),
  account: yup.mixed().required("Account is required"),
  deposit_category: yup.mixed().required("Deposit Category required"),
});

const PaymentModal = ({
  items,
  setIsModalOpen,
  isModalOpen,
  fetchPaymentSetting,
  modalMode,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [accountData, setAccountData] = useState<any>();
  const [depositCategory, setDepositCategoryData] = useState<any>();

  const transformedDataOption = accountData?.map((item: any) => ({
    label: item?.account_name
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));
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
      const selectedAccount = transformedDataOption?.find(
        (option: any) => option.value === items.account._id
      );
      const selectedDepositCategory = depositDataOption?.find(
        (option: any) => option.value === items.deposit_category._id
      );

      reset({
        title: items.title || "",
        account: selectedAccount || "",
        deposit_category: selectedDepositCategory || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset, accountData, depositCategory]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    if (modalMode === "Edit") {
      PaymentSettingService.updatePaymentSetting(items.source, {
        ...formData,
        title: formData.title,
        account: formData.account.value,
        deposit_category: formData.deposit_category.value,
      })
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            fetchPaymentSetting();
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
      PaymentSettingService.createPaymentSetting({
        ...formData,
        title: formData.title,
        account: formData.account.value,
        deposit_category: formData.deposit_category.value,
        source: formData.source.value,
      })
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            fetchPaymentSetting();
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
    }
  }, [isModalOpen]);

  const depositSourceOptions = [
    { label: "Wholesale", value: DepositSource.WHOLESALE },
    { label: "Pathao", value: DepositSource.PATHAO },
    { label: "Bkash", value: DepositSource.BKASH },
    { label: "SSL", value: DepositSource.SSL },
  ];

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
              ? `Update Payment Setting`
              : "Create Payment Setting"}
            {""}
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
                label={"Title"}
                registerProperty={register("title")}
                errorText={errors?.title?.message}
                type="text"
                isRequired
                placeholder="Enter title"
              />
              {modalMode !== "Edit" && (
                <div className="pb-2">
                  <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                    Source
                    <span className="text-red-400 text-[12px] font-semibold ms-1">
                      *
                    </span>
                  </label>
                  <Controller
                    name="source"
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
                      placeholder="Select Account"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div>
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

export default PaymentModal;
