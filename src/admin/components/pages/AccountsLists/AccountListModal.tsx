"use client";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useState, useEffect } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { typeOption } from "../Utilities/data";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { AccountListContext } from "@admin/context/AccountListContext";

export interface ISelectOption {
  label: string;
  value: string;
}

export interface IAccountFormValues {
  account_no: string;
  account_name: string;
  initial_balance: string | number;
  type: ISelectOption | "";
  notes?: string;
}

export interface IAccountResponse {
  _id: string;
  account_no: string;
  account_name: string;
  balance: number;
  initial_balance: number;
  notes: string;
  is_active: boolean;
  is_default: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
}

const defaultValue: IAccountFormValues = {
  account_no: "",
  account_name: "",
  initial_balance: "",
  type: "",
  notes: "",
};

const webSchema: yup.ObjectSchema<IAccountFormValues> = yup.object({
  account_no: yup.string().required("Account no is required"),
  account_name: yup.string().required("Account name is required"),
  initial_balance: yup
    .mixed<string | number>()
    .required("Initial balance is required"),
  notes: yup.string().optional(),
  type: yup.mixed<ISelectOption>().required("Account type is required"),
});

const AccountListModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, items, getAccountList } =
    useContext(AccountListContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<IAccountFormValues>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      const selectedType = typeOption.find(
        (option: ISelectOption) => option.value === items.type
      );

      reset({
        account_no: items.account_no || "",
        account_name: items.account_name || "",
        initial_balance: items.initial_balance || "",
        type: selectedType || "",
        notes: items.notes || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (formData: IAccountFormValues) => {
    setIsSubmit(true);

    const payload = {
      ...formData,
      type: (formData.type as ISelectOption).value,
    };

    if (modalMode === "Edit" && items) {
      AccountListService.updateAccountList(items._id, payload)
        .then((res: { success: boolean; message: string }) => {
          if (res?.success) {
            ToastService.success(res.message);
            setIsModalOpen(false);
            getAccountList();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        })
        .finally(() => setIsSubmit(false));
    } else {
      AccountListService.createAccountList(payload)
        .then((res: { success: boolean; message: string }) => {
          if (res?.success) {
            ToastService.success(res.message);
            getAccountList();
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
              ? `Edit Account: ${items?.account_name}`
              : "Create New Account"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5">
            <Input
              label={"Account No"}
              registerProperty={register("account_no")}
              errorText={errors?.account_no?.message}
              type="text"
              isRequired
              placeholder="Enter account no"
            />
            <Input
              label={"Account Name"}
              registerProperty={register("account_name")}
              errorText={errors?.account_name?.message}
              type="text"
              isRequired
              placeholder="Enter account name"
            />
            <Input
              label={"Initial Balance"}
              registerProperty={register("initial_balance")}
              errorText={errors?.initial_balance?.message}
              type="number"
              isRequired
              placeholder="Enter initial balance"
            />

            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Type
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Controller
                name="type"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <SelectComponent
                    options={typeOption}
                    value={field.value || null}
                    onChange={field.onChange}
                    placeholder="Select Account Type"
                    isRequired
                  />
                )}
              />
              {errors?.type && (
                <p className="text-red-500 text-sm">
                  {errors.type.message as string}
                </p>
              )}
            </div>

            <Input
              label={"Notes"}
              registerProperty={register("notes")}
              errorText={errors?.notes?.message}
              type="textarea"
              placeholder="Enter your note"
            />
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

export default AccountListModal;
