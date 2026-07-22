"use client";

import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useEffect, useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { WeeklyHolidayContext } from "@/app/admin/duty-plan/weekly-holiday/page";
import { WeeklyHolidayService } from "@admin/@services/apis/DutyPlan/WeeklyHoliday/WeeklyHoliday.service";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import { SelectOption } from "@admin/@interfaces/orders/order.interface";

type TOption = {
    label: string;
    value: string;
};

type TWeeklyHolidayForm = {
    week_day: TOption | null;
    user: TOption | null;
};

const defaultValue: TWeeklyHolidayForm = {
    week_day: null,
    user: null,
};

const webSchema = yup.object({
    week_day: yup
        .object()
        .nullable()
        .required("Week day is required"),
    user: yup
        .object()
        .nullable()
        .required("User is required"),
});

const weekDayOptions: TOption[] = [
    { label: "Saturday - শনিবার", value: "Saturday - শনিবার" },
    { label: "Sunday - রবিবার", value: "Sunday - রবিবার" },
    { label: "Monday - সোমবার", value: "Monday - সোমবার" },
    { label: "Tuesday - মঙ্গলবার", value: "Tuesday - মঙ্গলবার" },
    { label: "Wednesday - বুধবার", value: "Wednesday - বুধবার" },
    { label: "Thursday - বৃহস্পতিবার", value: "Thursday - বৃহস্পতিবার" },
    { label: "Friday - শুক্রবার", value: "Friday - শুক্রবার" },
];

const WeeklyHolidayModal = () => {
    const { modalMode, items, setIsModalOpen, isModalOpen, getDeposit } =
        useContext(WeeklyHolidayContext);

    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [userOption, setUserOption] = useState<SelectOption[]>([]);

    const {
        handleSubmit,
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
                week_day: items?.week_day
                    ? {
                        label: items.week_day,
                        value: items.week_day,
                    }
                    : null,
                user: items?.user
                    ? {
                        label: items?.user?.name || items?.user?.label || "User",
                        value: items?.user?._id || items?.user?.value || items?.user,
                    }
                    : null,
            });
        } else {
            reset(defaultValue);
        }
    }, [items, modalMode, reset]);

    const formSubmit = async (formData: TWeeklyHolidayForm) => {
        setIsSubmit(true);

        const payload = {
            week_day: formData?.week_day?.value || "",
            user: formData?.user?.value || "",
        };

        if (modalMode === "Edit") {
            WeeklyHolidayService.updateWeeklyHoliday(items?._id, payload)
                .then((res: any) => {
                    if (res?.success) {
                        ToastService.success(res?.message || "Weekly holiday updated successfully");
                        setIsModalOpen(false);
                        getDeposit();
                    } else {
                        ToastService.error(res?.message || "Failed to update weekly holiday");
                    }
                })
                .catch((err: { message: string }) => {
                    ToastService.error(err?.message || "Something went wrong");
                })
                .finally(() => {
                    setIsSubmit(false);
                });
        } else {
            WeeklyHolidayService.createWeeklyHoliday(payload)
                .then((res: any) => {
                    if (res?.success) {
                        ToastService.success(res?.message || "Weekly holiday created successfully");
                        getDeposit();
                        setIsModalOpen(false);
                    } else {
                        ToastService.error(res?.message || "Failed to create weekly holiday");
                    }
                })
                .catch((err: { message: string }) => {
                    ToastService.error(err?.message || "Something went wrong");
                })
                .finally(() => {
                    setIsSubmit(false);
                });
        }
    };

    useEffect(() => {
        TaskService.getAssignEmploySuggestion()
            .then((res: any) => {
                if (res?.success) {
                    setUserOption(
                        res?.data?.map((u: any) => ({
                            label: `${u?.name}${u?.email ? ` (${u.email})` : ""}`,
                            value: u?._id,
                        })) || []
                    );
                }
            })
            .catch(() => {
                setUserOption([]);
            });
    }, []);

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="w-full md:w-3/4"
                maxWidth="max-w-4xl"
            >
                <Modal.Header className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {modalMode === "Edit" ? "Edit Weekly Holiday" : "Create Weekly Holiday"}
                    </h3>
                    <Icon
                        name="close"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-600 cursor-pointer"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="gap-5">
                        <div className="pb-5">
                            <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                User
                                <span className="text-red-400 text-[12px] font-semibold ms-1">*</span>
                            </label>
                            <Controller
                                name="user"
                                control={control}
                                render={({ field }) => (
                                    <SelectComponent
                                        options={userOption}
                                        value={field.value}
                                        onChange={(val: any) => field.onChange(val)}
                                        placeholder="Select User"
                                        isRequired
                                    />
                                )}
                            />
                            {errors?.user?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {String(errors.user.message)}
                                </p>
                            )}
                        </div>
                        <div className="pb-5">
                            <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                Week Day
                                <span className="text-red-400 text-[12px] font-semibold ms-1">*</span>
                            </label>
                            <Controller
                                name="week_day"
                                control={control}
                                render={({ field }) => (
                                    <SelectComponent
                                        options={weekDayOptions}
                                        value={field.value}
                                        onChange={(val: any) => field.onChange(val)}
                                        placeholder="Select Week Day"
                                        isRequired
                                    />
                                )}
                            />
                            {errors?.week_day?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {String(errors.week_day.message)}
                                </p>
                            )}
                        </div>


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

export default WeeklyHolidayModal;