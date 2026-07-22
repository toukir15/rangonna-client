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
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import { SalaryReportService } from "@admin/@services/apis/SalaryManager/SalaryReport/SalaryReport.service";
import { SalaryReportContext } from "@/app/admin/team/salary/page";

export interface ISalaryFormValues {
  employee: SelectOption | null;

  absent_days: number | null;
  late_count: number | null;
  bonus: number | null;
}

const defaultValue: ISalaryFormValues = {
  employee: null,

  absent_days: null,
  late_count: null,
  bonus: null,
};

const SalarySchema: yup.ObjectSchema<ISalaryFormValues> = yup.object({
  employee: yup
    .object({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .nullable()
    .required("Employee is required"),

  absent_days: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .required("Absent Days is required"),

  late_count: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .required("Late Count is required"),

  bonus: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .default(null),
});

const SalaryReportModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, items, getSalaryReport } =
    useContext(SalaryReportContext);
  const [userOption, setUserOption] = useState<SelectOption[]>([]);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<ISalaryFormValues>({
    resolver: yupResolver(SalarySchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        employee: items.employee
          ? {
              label: items.employee.name,
              value: items.employee._id,
            }
          : null,

        absent_days: items.absent_days ?? null,
        late_count: items.late_count ?? null,
        bonus: items.bonus ?? null,
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const payload = {
      ...formData,
      employee: formData.employee.value,
    };

    try {
      let res;
      if (modalMode === "Edit" && items?._id) {
        res = await SalaryReportService.updateSalaryReport(items?._id, payload);
      } else {
        res = await SalaryReportService.createSalaryReport(payload);
      }

      if (res?.success) {
        ToastService.success(res.message);
        getSalaryReport();
        setIsModalOpen(false);
        reset();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message || "Something went wrong");
    } finally {
      setIsSubmit(false);
    }
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
            {modalMode === "Edit" ? `Edit Salary` : "Create New Salary"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className=" ">
            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Employee
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

            <Input
              label="Absent Days"
              registerProperty={register("absent_days")}
              errorText={errors.absent_days?.message}
              type="number"
              isRequired
              placeholder="Enter absent days"
            />
            <Input
              label="Late Count"
              registerProperty={register("late_count")}
              errorText={errors.late_count?.message}
              type="number"
              isRequired
              placeholder="Enter late count"
            />
            <Input
              label="Bonus"
              registerProperty={register("bonus")}
              errorText={errors.bonus?.message}
              type="number"
              placeholder="Enter bonus"
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

export default SalaryReportModal;
