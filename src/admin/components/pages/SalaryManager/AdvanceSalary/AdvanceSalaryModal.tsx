"use client";
import React, { useContext, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import { SelectOption } from "@admin/@interfaces/orders/order.interface";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import { AdvanceSalaryService } from "@admin/@services/apis/SalaryManager/AdvanceSalary/AdvanceSalary.service";
import { ToastService } from "@admin/utils/toastr.service";
import { IWebsiteOption } from "@admin/@interfaces/common.interface";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import { AdvanceSalaryContext } from "@/app/admin/team/advance-salary/page";
import { ExpenseSource } from "../../Utilities/paymentData";
import { useGlobalContext } from "@admin/context/GlobalContext";

const defaultValue: any = {
  amount: "",
  note: "",
  employee: "",
  payment_method: "",
  account: "",
};

const webSchema = yup.object({
  employee: yup.mixed().required("Employee is required"),
  payment_method: yup.mixed().required("Payment method is required"),
  account: yup.mixed().required("Account is required"),
  amount: yup.string().required("Amount is required"),
  note: yup.string(),
});

const AdvanceSalaryModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, getAdvanceList } =
    useContext(AdvanceSalaryContext);
  const [userOption, setUserOption] = useState<SelectOption[]>([]);
  const { paymentMethodOptions } = useGlobalContext();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [accountOptions, setAccountOptions] = useState<IWebsiteOption[]>([]);

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

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const payload = {
      ...formData,
      employee: formData.employee.value,
      payment_method: formData.payment_method.value,
      account: formData.account.value,
      payment_source: ExpenseSource.ADVANCE_SALARY_PAYMENT,
    };

    AdvanceSalaryService.createAdvanceSalary(payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          getAdvanceList();
          setIsModalOpen(false);
          reset();
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
  };

  useEffect(() => {
    TaskService.getAssignEmploySuggestion().then((res: any) => {
      if (res?.success) {
        setUserOption(
          res?.data?.map((u: any) => ({
            label: u.name,
            value: u._id,
          }))
        );
      }
    });
  }, []);

  const getAccountList = () => {
    AccountListService.getAccountSuggestion()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: any) => ({
            label: item?.account_name
              ?.toLowerCase()
              .replace(/\b\w/g, (char: string) => char.toUpperCase()),
            value: item._id,
          }));
          setAccountOptions(options);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    getAccountList();
  }, []);

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {"Create Advance Salary"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="flex flex-col">
            <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
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
                    onChange={(val: any) => field.onChange(val || [])}
                    placeholder="Select Method"
                    isRequired
                  />
                )}
              />

              {errors?.payment_method && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.payment_method.message as string}
                </p>
              )}
            </div>
            <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Assign Employee
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Controller
                name="employee"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={userOption}
                    value={field.value}
                    onChange={(val: any) => field.onChange(val || [])}
                    placeholder="Select Employee"
                    isRequired
                  />
                )}
              />

              {errors?.employee && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.employee.message as string}
                </p>
              )}
            </div>
            <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
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
                    options={accountOptions}
                    value={field.value}
                    onChange={(val: any) => field.onChange(val || [])}
                    placeholder="Select Account"
                    isRequired
                  />
                )}
              />

              {errors?.account && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.account.message as string}
                </p>
              )}
            </div>

            {/* 💰 BDT */}
            <Input
              label="Amount"
              registerProperty={register("amount")}
              errorText={errors.amount?.message}
              type="number"
              isRequired
              placeholder="Enter amount"
            />

            {/* 💵 USD */}
            <Input
              label="Note"
              registerProperty={register("note")}
              errorText={errors.note?.message}
              type="textarea"
              placeholder="Enter note"
            />
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

export default AdvanceSalaryModal;
