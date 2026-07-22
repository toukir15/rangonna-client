"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { ToastService } from "@admin/utils/toastr.service";
import { HolidayNoticeContext } from "@/app/admin/duty-plan/holiday-notice/page";
import { HolidayNoticeService } from "@admin/@services/apis/DutyPlan/HolidayNotice/HolidayNotice.service";

type THolidayItem = {
    date: string;
    title: string;
};

type THolidayNoticeForm = {
    year: number | string;
    note?: string;
    holidays: THolidayItem[];
};

const holidayItemSchema = yup.object({
    date: yup.string().required("Holiday date is required"),
    title: yup.string().required("Holiday title is required"),
});

const holidayNoticeSchema: yup.ObjectSchema<THolidayNoticeForm> = yup.object({
    year: yup
        .number()
        .typeError("Year is required")
        .required("Year is required"),
    note: yup.string().optional(),
    holidays: yup
        .array()
        .of(holidayItemSchema)
        .min(1, "At least one holiday is required")
        .required("Holiday list is required"),
});

const HolidayNoticeModal = () => {
    const {
        isModalOpen,
        setIsModalOpen,
        modalMode,
        items,
        getDeposit,
    } = useContext(HolidayNoticeContext);

    const [loading, setLoading] = useState(false);

    const defaultValues = useMemo<THolidayNoticeForm>(
        () => ({
            year: "",
            note: "",
            holidays: [{ date: "", title: "" }],
        }),
        []
    );

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<THolidayNoticeForm>({
        resolver: yupResolver(holidayNoticeSchema),
        defaultValues,
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "holidays",
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        if (!isModalOpen) return;

        if (modalMode === "Edit" && items) {
            const mappedHolidays =
                items?.holidays?.length > 0
                    ? items.holidays.map((holiday: any) => ({
                        date: formatDate(holiday?.date) || "",
                        title: holiday?.title || "",
                    }))
                    : [{ date: "", title: "" }];

            reset({
                year: items?.year || "",
                note: items?.note || "",
                holidays: mappedHolidays,
            });

            replace(mappedHolidays);
        } else {
            reset(defaultValues);
            replace(defaultValues.holidays);
        }
    }, [isModalOpen, modalMode, items, reset, replace, defaultValues]);

    const handleClose = () => {
        reset(defaultValues);
        replace(defaultValues.holidays);
        setIsModalOpen(false);
    };

    const onSubmit = async (data: THolidayNoticeForm) => {
        setLoading(true);

        const payload = {
            year: Number(data.year),
            note: data.note?.trim() || "",
            holidays: data.holidays.map((holiday) => ({
                date: formatDate(holiday.date),
                title: holiday.title.trim(),
            })),
        };

        try {
            const res =
                modalMode === "Edit"
                    ? await HolidayNoticeService.updateHolidayNotice(
                        items?._id,
                        payload
                    )
                    : await HolidayNoticeService.createHolidayNotice(payload);

            if (res?.success) {
                ToastService.success(
                    res?.message ||
                    `Holiday notice ${modalMode === "Edit" ? "updated" : "created"
                    } successfully`
                );
                handleClose();
                getDeposit?.();
            } else {
                ToastService.error(res?.message || "Something went wrong");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={handleClose}
            width="w-full md:w-3/4"
            maxWidth="max-w-5xl"
        >
            <Modal.Header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {modalMode} Holiday Notice
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add year and holiday list
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                >
                    <Icon name="close" />
                </button>
            </Modal.Header>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Year"
                        registerProperty={register("year")}
                        errorText={errors?.year?.message}
                        type="number"
                        placeholder="Enter year"
                        isRequired
                    />

                    <Input
                        label="Note"
                        registerProperty={register("note")}
                        errorText={errors?.note?.message}
                        type="text"
                        placeholder="Enter note"
                    />
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                            Holidays
                        </h4>


                    </div>

                    <div className="space-y-4 ">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-medium text-gray-800 dark:text-gray-200">
                                        Holiday {index + 1}
                                    </h5>

                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Icon name="delete" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Holiday Title"
                                        registerProperty={register(
                                            `holidays.${index}.title`
                                        )}
                                        errorText={
                                            errors?.holidays?.[index]?.title
                                                ?.message
                                        }
                                        type="text"
                                        placeholder="Enter holiday title"
                                        isRequired
                                    />
                                    <Input
                                        label="Holiday Date"
                                        registerProperty={register(
                                            `holidays.${index}.date`
                                        )}
                                        errorText={
                                            errors?.holidays?.[index]?.date
                                                ?.message
                                        }
                                        type="date"
                                        isRequired
                                    />


                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-end justify-end pt-4">
                        <Button
                            type="button"
                            className="flex items-center bg-green-500 !px-4"
                            onClick={() =>
                                append({
                                    date: "",
                                    title: "",
                                })
                            }
                        >
                            <Icon name="add" />
                            <span className="ml-1">Add Holiday</span>
                        </Button>
                    </div>

                    {typeof errors?.holidays?.message === "string" && (
                        <p className="text-sm text-red-500 mt-2">
                            {errors.holidays.message}
                        </p>
                    )}
                </div>

                <Modal.Footer className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                    <Button
                        type="button"
                        onClick={handleClose}
                        className="bg-gray-500 !px-6"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        className="bg-blue-500 !px-6 min-w-[120px] flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <ButtonLoader />
                        ) : (
                            <>
                                <Icon
                                    name={
                                        modalMode === "Edit" ? "edit" : "save"
                                    }
                                />
                                <span className="ml-1">
                                    {modalMode === "Edit" ? "Update" : "Save"}
                                </span>
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default HolidayNoticeModal;