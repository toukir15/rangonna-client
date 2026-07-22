"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { DutyContext } from "@/app/admin/duty-plan/duty/page";
import { DutyService } from "@admin/@services/apis/DutyPlan/Duty/Duty.service";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { shiftTimeOptions } from "../../Utilities/data";

type TOption = {
    label: string;
    value: string;
};

type TFormData = {
    team_members: TOption[];
    team_leader: TOption | null;
    break_start: string;
    break_end: string;
    from_date: string;
    to_date: string;
    start_time: string;
    end_time: string;
    shift_time: TOption | null;
};

const dutySchema: yup.ObjectSchema<TFormData> = yup.object({
    team_members: yup
        .array()
        .of(
            yup
                .object({
                    label: yup.string().required(),
                    value: yup.string().required(),
                })
                .required()
        )
        .min(1, "At least one team member is required")
        .required("Team members are required"),

    team_leader: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required(),
        })
        .nullable()
        .required("Team leader is required"),

    break_start: yup.string().required("Break start time is required"),
    break_end: yup.string().required("Break end time is required"),
    from_date: yup.string().required("From date is required"),
    to_date: yup.string().required("To date is required"),
    start_time: yup.string().required("Start time is required"),
    end_time: yup.string().required("End time is required"),
    shift_time: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required(),
        })
        .nullable()
        .required("Shift time is required"),
});

const defaultValue: TFormData = {
    team_members: [],
    team_leader: null,
    break_start: "",
    break_end: "",
    from_date: "",
    to_date: "",
    start_time: "",
    end_time: "",
    shift_time: null,
};

const DutyModal = () => {
    const { modalMode, items, setIsModalOpen, isModalOpen, getDeposit } =
        useContext(DutyContext);

    const [isSubmit, setIsSubmit] = useState(false);
    const [userOption, setUserOption] = useState<SelectOption[]>([]);

    const fetchUser = () => {
        TaskService.getAssignEmploySuggestion()
            .then((res: any) => {
                if (res?.success) {
                    const userOptions = res.data.map((item: any) => ({
                        label: item.name,
                        value: item._id,
                    }));
                    setUserOption(userOptions);
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            });
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const {
        control,
        handleSubmit,
        register,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TFormData>({
        resolver: yupResolver(dutySchema),
        defaultValues: defaultValue,
    });

    const selectedTeamMembers = watch("team_members");
    const selectedLeader = watch("team_leader");

    const teamLeaderOptions = useMemo(() => {
        return selectedTeamMembers || [];
    }, [selectedTeamMembers]);

    useEffect(() => {
        const selectedMembers = selectedTeamMembers || [];

        if (
            selectedLeader &&
            !selectedMembers.some((member) => member.value === selectedLeader.value)
        ) {
            setValue("team_leader", null, { shouldValidate: true });
        }
    }, [selectedTeamMembers, selectedLeader, setValue]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}-${month}-${year}`;
    };

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";

        if (dateStr.includes("-")) {
            const parts = dateStr.split("-");

            if (parts[0]?.length === 4) {
                return dateStr;
            }

            if (parts[2]?.length === 4) {
                const [day, month, year] = parts;
                return `${year}-${month}-${day}`;
            }
        }

        return "";
    };

    const formatTimeTo12Hour = (time: string) => {
        if (!time) return "";

        const [hourStr, minute = "00"] = time.split(":");
        let hour = parseInt(hourStr, 10);

        if (Number.isNaN(hour)) return time;

        const ampm = hour >= 12 ? "pm" : "am";
        hour = hour % 12 || 12;

        return minute === "00" ? `${hour} ${ampm}` : `${hour}:${minute} ${ampm}`;
    };

    const convert12HourTo24Hour = (time: string) => {
        if (!time) return "";

        const normalized = time.trim().toLowerCase();
        const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);

        if (!match) return "";

        let hour = parseInt(match[1], 10);
        const minute = match[2] || "00";
        const meridiem = match[3];

        if (meridiem === "am") {
            if (hour === 12) hour = 0;
        } else {
            if (hour !== 12) hour += 12;
        }

        return `${String(hour).padStart(2, "0")}:${minute}`;
    };

    const splitBreakTime = (breakTime: string) => {
        if (!breakTime) {
            return {
                break_start: "",
                break_end: "",
            };
        }

        const [start, end] = breakTime.split(" - ");

        return {
            break_start: convert12HourTo24Hour(start || ""),
            break_end: convert12HourTo24Hour(end || ""),
        };
    };

    useEffect(() => {
        if (modalMode === "Edit" && items && userOption.length) {
            const editTeamMembers: TOption[] = Array.isArray(items?.team_members)
                ? items.team_members
                    .map((member: any) => {
                        const memberId =
                            typeof member === "string" ? member : member?._id;
                        return userOption.find((u) => u.value === memberId) || null;
                    })
                    .filter(Boolean) as TOption[]
                : [];

            const editTeamLeader =
                userOption.find(
                    (u) =>
                        u.value === items?.team_leader ||
                        u.value === items?.team_leader?._id
                ) || null;

            const editShiftTime =
                shiftTimeOptions.find(
                    (u) =>
                        u.value === items?.shift_time ||
                        u.value === items?.shift_time?._id
                ) || null;

            const breakTimes = splitBreakTime(items?.break_time || "");

            reset({
                team_members: editTeamMembers,
                team_leader: editTeamLeader,
                break_start: breakTimes.break_start,
                break_end: breakTimes.break_end,
                from_date: formatDateForInput(items?.from_date || ""),
                to_date: formatDateForInput(items?.to_date || ""),
                start_time: convert12HourTo24Hour(items?.start_time || ""),
                end_time: convert12HourTo24Hour(items?.end_time || ""),
                shift_time: editShiftTime,
            });
        } else {
            reset(defaultValue);
        }
    }, [items, modalMode, reset, userOption]);

    const formSubmit = async (formData: TFormData) => {
        setIsSubmit(true);

        const payload = {
            team_members: formData.team_members.map((item) => item.value),
            team_leader: formData.team_leader?.value || "",
            break_time: `${formatTimeTo12Hour(formData.break_start)} - ${formatTimeTo12Hour(
                formData.break_end
            )}`,
            from_date: formatDate(formData.from_date),
            to_date: formatDate(formData.to_date),
            start_time: formatTimeTo12Hour(formData.start_time),
            end_time: formatTimeTo12Hour(formData.end_time),
            shift_time: formData.shift_time?.value || "",
        };

        const request =
            modalMode === "Edit"
                ? DutyService.updateDuty(items?._id, payload)
                : DutyService.createDuty(payload);

        request
            .then((res: any) => {
                if (res?.success) {
                    ToastService.success(res?.message);
                    setIsModalOpen(false);
                    getDeposit();
                    reset(defaultValue);
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

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset(defaultValue);
                }}
                width="w-full md:w-3/4"
                maxWidth="max-w-4xl"
            >
                <Modal.Header className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {modalMode === "Edit" ? "Edit Duty Team" : "Create Duty Team"}
                    </h3>

                    <Icon
                        name="close"
                        onClick={() => {
                            setIsModalOpen(false);
                            reset(defaultValue);
                        }}
                        className="text-gray-600 cursor-pointer"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                Shift Time
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <Controller
                                name="shift_time"
                                control={control}
                                render={({ field }) => (
                                    <SelectComponent
                                        options={shiftTimeOptions}
                                        value={field.value}
                                        onChange={(val: any) => field.onChange(val || null)}
                                        placeholder="Select Shift Time"
                                        className="w-full"
                                        isRequired
                                    />
                                )}
                            />
                            {errors?.shift_time?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.shift_time.message as string}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                Team Members
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <Controller
                                name="team_members"
                                control={control}
                                render={({ field }) => (
                                    <SelectComponent
                                        options={userOption}
                                        value={field.value}
                                        onChange={(val: any) => field.onChange(val || [])}
                                        placeholder="Select Team Members"
                                        isMulti
                                        className="w-full"
                                        isRequired
                                    />
                                )}
                            />

                            <p className="text-red-500 text-sm mt-1">
                                {errors?.team_members?.message as string}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                Team Leader
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <Controller
                                name="team_leader"
                                control={control}
                                render={({ field }) => (
                                    <SelectComponent
                                        options={teamLeaderOptions}
                                        value={field.value}
                                        onChange={(val: any) => field.onChange(val || null)}
                                        placeholder="Select Team Leader"
                                        className="w-full"
                                        isRequired
                                        isDisabled={!selectedTeamMembers?.length}
                                    />
                                )}
                            />
                            {errors?.team_leader?.message && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.team_leader.message as string}
                                </p>
                            )}
                        </div>

                        <Input
                            label="From Date"
                            registerProperty={register("from_date")}
                            errorText={errors?.from_date?.message}
                            type="date"
                            isRequired
                        />

                        <Input
                            label="To Date"
                            registerProperty={register("to_date")}
                            errorText={errors?.to_date?.message}
                            type="date"
                            isRequired
                        />

                        <Input
                            label="Start Time"
                            registerProperty={register("start_time")}
                            errorText={errors?.start_time?.message}
                            type="time"
                            isRequired
                        />

                        <Input
                            label="End Time"
                            registerProperty={register("end_time")}
                            errorText={errors?.end_time?.message}
                            type="time"
                            isRequired
                        />

                        <Input
                            label="Break Start"
                            registerProperty={register("break_start")}
                            errorText={errors?.break_start?.message}
                            type="time"
                            isRequired
                        />

                        <Input
                            label="Break End"
                            registerProperty={register("break_end")}
                            errorText={errors?.break_end?.message}
                            type="time"
                            isRequired
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(false);
                            reset(defaultValue);
                        }}
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

export default DutyModal;