"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";

import { ToastService } from "@admin/utils/toastr.service";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { LeaveApplicationService } from "@admin/@services/apis/TeamService/LeaveApplication.service";
import { formatDateRange } from "@admin/utils/hook.utils";

interface LeaveApplicationModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  leaveDetails?: any;
  fetchLeaveDetails?: () => void;
}

interface FormValues {
  status: { label: string; value: string } | null;
  start_date: Date | null;
  end_date: Date | null;
  total_days: number | string;
  rejection_reason: string;
}

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const webSchema = yup.object({
  status: yup.mixed().required("Status is required"),
  start_date: yup
    .date()
    .typeError("Start date is required")
    .required("Start date is required")
    .nullable(),
  end_date: yup
    .date()
    .typeError("End date is required")
    .required("End date is required")
    .nullable(),
  total_days: yup
    .number()
    .typeError("Total days must be a number")
    .required("Total days is required")
    .min(1, "Total days must be at least 1"),
  rejection_reason: yup.string().when("status", {
    is: (status: any) => status?.value === "rejected",
    then: (schema) => schema.required("Rejection reason is required"),
    otherwise: (schema) => schema.optional(),
  }),
});

const defaultValues: FormValues = {
  status: null,
  start_date: null,
  end_date: null,
  total_days: "",
  rejection_reason: "",
};

const LeaveApplicationModal: React.FC<LeaveApplicationModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  leaveDetails,
  fetchLeaveDetails,
}) => {
  const [isSubmit, setIsSubmit] = useState(false);

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
    defaultValues,
  });

  const selectedStatus = watch("status");
  const startDate = watch("start_date");
  const endDate = watch("end_date");

  useEffect(() => {
    if (leaveDetails && isModalOpen) {
      reset({
        // status:
        //   statusOptions.find((item) => item.value === leaveDetails?.status) ||
        //   null,
        start_date: leaveDetails?.start_date
          ? new Date(leaveDetails.start_date)
          : null,
        end_date: leaveDetails?.end_date
          ? new Date(leaveDetails.end_date)
          : null,
        total_days: leaveDetails?.total_days || "",
        rejection_reason: leaveDetails?.rejection_reason || "",
      });
    }
  }, [leaveDetails, isModalOpen, reset]);

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

  const formSubmit = async (formData: FormValues) => {
    if (!leaveDetails?._id) {
      ToastService.error("Leave application ID not found");
      return;
    }

    setIsSubmit(true);

    const payload = {
      status: formData.status?.value,
      start_date: formatDateRange(formData.start_date).trim(),
      end_date: formatDateRange(formData.end_date).trim(),
      total_days: Number(formData.total_days),
      ...(formData.status?.value === "rejected" && {
        rejection_reason: formData.rejection_reason,
      }),
    };

    try {
      const res = await LeaveApplicationService.updateLeaveApplication(
        leaveDetails._id,
        payload
      );

      if (res?.success) {
        ToastService.success(
          res?.message || "Leave application updated successfully"
        );
        setIsModalOpen(false);
        fetchLeaveDetails?.();
        reset(defaultValues);
      } else {
        ToastService.error(
          res?.message || "Failed to update leave application"
        );
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
            Update Leave Application
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Employee Name"
                value={leaveDetails?.user?.name || ""}
                isDisabled
                placeholder="Employee name"
              />

              <Input
                label="Leave Title"
                value={leaveDetails?.leave_title || ""}
                isDisabled
                placeholder="Leave title"
              />
            </div>

            <Input
              label="Leave Description"
              value={leaveDetails?.leave_description || ""}
              isDisabled
              type="textarea"
              placeholder="Leave description"
            />

            <div>
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Status
                <span className="text-red-400 text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={statusOptions}
                    value={field.value}
                    onChange={(val: any) => field.onChange(val || null)}
                    placeholder="Select Status"
                    isRequired
                  />
                )}
              />

              {errors?.status && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.status.message as string}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      selectedDate={field.value}
                      onChange={(date: Date | null) => field.onChange(date)}
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
                      onChange={(date: Date | null) => field.onChange(date)}
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
              type="number"
              isDisabled
              registerProperty={register("total_days")}
              errorText={errors.total_days?.message}
              placeholder="Enter total days"
            />

            {selectedStatus?.value === "rejected" && (
              <Input
                label="Rejection Reason"
                registerProperty={register("rejection_reason")}
                errorText={errors.rejection_reason?.message}
                type="textarea"
                placeholder="Enter rejection reason"
              />
            )}
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
            {isSubmit ? <ButtonLoader /> : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default LeaveApplicationModal;
