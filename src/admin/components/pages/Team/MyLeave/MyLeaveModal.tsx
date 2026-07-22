"use client";
import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { ToastService } from "@admin/utils/toastr.service";
import { MyLeaveContext } from "@/app/admin/team/my-leave/page";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { MyLeaveService } from "@admin/@services/apis/TeamService/MyLeave.service";
import { formatDateRange } from "@admin/utils/hook.utils";

const defaultValue = {
  leave_title: "",
  leave_description: "",
  start_date: null,
  end_date: null,
  total_days: "",
};

const webSchema = yup.object({
  leave_title: yup.string().required("Leave title is required"),
  leave_description: yup.string().required("Leave description is required"),
  start_date: yup
    .date()
    .nullable()
    .typeError("Start date is required")
    .required("Start date is required"),
  end_date: yup
    .date()
    .nullable()
    .typeError("End date is required")
    .required("End date is required"),
  total_days: yup
    .number()
    .typeError("Total days must be a number")
    .required("Total days is required")
    .min(1, "Total days must be at least 1"),
});

const MyLeaveModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, getAdvanceList } =
    useContext(MyLeaveContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

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

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  useEffect(() => {
    if (isModalOpen) {
      reset(defaultValue);
    }
  }, [isModalOpen, reset]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end >= start
      ) {
        const diffTime = end.getTime() - start.getTime();
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setValue("total_days", days);
      }
    }
  }, [startDate, endDate, setValue]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const payload = {
      leave_title: formData.leave_title,
      leave_description: formData.leave_description,
      start_date: formatDateRange(formData.start_date).trim(),
      end_date: formatDateRange(formData.end_date).trim(),
      total_days: Number(formData.total_days),
    };

    try {
      const res = await MyLeaveService.createMyLeave(payload);

      if (res?.success) {
        ToastService.success(
          res?.message || "Leave application created successfully"
        );
        getAdvanceList?.();
        setIsModalOpen(false);
        reset(defaultValue);
      } else {
        ToastService.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Something went wrong");
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
        maxWidth="max-w-4xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Create Leave Application
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="flex flex-col gap-3">
            <Input
              label="Subject"
              registerProperty={register("leave_title")}
              errorText={errors.leave_title?.message}
              placeholder="Enter leave title"
              isRequired
            />

            <Input
              label="Description"
              registerProperty={register("leave_description")}
              errorText={errors.leave_description?.message}
              type="textarea"
              placeholder="Enter leave description"
              isRequired
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      selectedDate={field.value}
                      onChange={(date) => field.onChange(date)}
                      label="Start Date"
                      dateFormat="dd-MM-yy"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors?.start_date && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.start_date.message as string}
                  </p>
                )}
              </div>

              <div>
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      selectedDate={field.value}
                      onChange={(date) => field.onChange(date)}
                      label="End Date"
                      dateFormat="dd-MM-yy"
                      wrapperClassName="w-full"
                    />
                  )}
                />
                {errors?.end_date && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.end_date.message as string}
                  </p>
                )}
              </div>
            </div>

            <Input
              label="Total Days"
              registerProperty={register("total_days")}
              errorText={errors.total_days?.message}
              type="number"
              placeholder="Enter total days"
              isRequired
              isDisabled
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
            {isSubmit ? <ButtonLoader /> : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default MyLeaveModal;
