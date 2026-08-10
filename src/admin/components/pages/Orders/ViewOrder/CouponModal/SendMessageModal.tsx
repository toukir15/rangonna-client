"use client";
import React, { useEffect, useState } from "react";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { MimSmsService } from "@admin/@services/apis/SettingsService/mimSmsSevice/mimSms.service";
import { IOption } from "@admin/@interfaces/reportIssue/reportIssue.interface";

type ReportIssueForm = {
    title: {
        label: string;
        value: string;
    } | null;
    message: string;
};

const defaultValue: ReportIssueForm = {
    title: null,
    message: "",
};

const webSchema = yup.object({
    title: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required(),
        })
        .nullable(),

    message: yup.string().required("Message is required"),
});

const SendMessageModal = ({
    isModalOpen,
    setIsModalOpen,
    modalMode,
    orderDetail,
}: any) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(true);
    const [messagesOption, setMessagesOption] = useState<IOption[]>([]);

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
        control,
        setValue,
    } = useForm<any>({
        resolver: yupResolver(webSchema),
        defaultValues: defaultValue,
    });

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleOpenForm = () => {
        reset(defaultValue);
        setShowForm(true);
    };

    const formSubmit = async (formData: ReportIssueForm) => {
        const mainData = {
            phone: orderDetail?.second,
            message: formData?.message,
        };
        setIsSubmit(true);
        MimSmsService.sendMimSms(mainData)
            .then((res: any) => {
                if (res?.success) {
                    ToastService.success(res?.message);
                    handleCloseModal()
                    reset(defaultValue);
                } else {
                    ToastService.error(res?.message || "Failed to create report");
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message || "Something went wrong");
            })
            .finally(() => setIsSubmit(false));
    };

    const getMimSms = () => {
        MimSmsService.getMimSmsSuggestion()
            .then((res) => {
                if (res?.success) {
                    const formattedData = res?.data?.map((item: any) => ({
                        label: item.title,
                        value: item.message,
                    }));

                    setMessagesOption(formattedData);
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            })

    };

    useEffect(() => {
        getMimSms();
    }, []);

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                width="w-full md:w-3/4"
                maxWidth="max-w-5xl"
            >
                <Modal.Header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                            Send Message - {orderDetail?.second}
                        </h3>

                        {!showForm && (
                            <Button
                                type="button"
                                onClick={handleOpenForm}
                                className="!px-4 !py-1 !text-sm bg-blue-500 text-white rounded"
                            >
                                Add New Issue
                            </Button>
                        )}
                    </div>

                    <Icon
                        name="close"
                        onClick={handleCloseModal}
                        className="text-gray-600 cursor-pointer dark:text-gray-300"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="w-full gap-5">
                        <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                            Message Suggestion
                        </label>

                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <SelectComponent
                                    options={messagesOption}
                                    value={field.value}
                                    onChange={(selectedOption: any) => {
                                        field.onChange(selectedOption);
                                        setValue("message", selectedOption?.value || "");
                                    }}
                                    placeholder="Select Message Suggestion"
                                    className=""
                                />
                            )}
                        />

                        {errors?.title && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.title.message as string}
                            </p>
                        )}

                        <Input
                            label="Message"
                            registerProperty={register("message")}
                            errorText={errors?.message?.message}
                            type="textarea"
                            isRequired
                            placeholder="Enter your message"
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-end space-x-2">
                    <Button
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                        type="button"
                    >
                        Cancel
                    </Button>

                    {showForm && (
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
                    )}
                </Modal.Footer>
            </Modal>
        </form>
    );
};

export default SendMessageModal;