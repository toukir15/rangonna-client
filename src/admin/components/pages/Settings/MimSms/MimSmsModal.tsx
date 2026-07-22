"use client";

import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useState, useEffect } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { InferType } from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { MimSmsContext } from "@/app/admin/setting/mim-sms/page";
import { MimSmsService } from "@admin/@services/apis/SettingsService/mimSmsSevice/mimSms.service";

const WarehouseSchema = yup.object({
    title: yup.string().required("Title is required"),
    message: yup.string().required("Message is required"),
});

type WarehouseFormData = InferType<typeof WarehouseSchema>;

interface IApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

const defaultValue: WarehouseFormData = {
    title: "",
    message: "",

};

const MimSmsModal: React.FC = () => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { modalMode, items, setIsModalOpen, getMimSms, isModalOpen } =
        useContext(MimSmsContext);

    const {
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<WarehouseFormData>({
        resolver: yupResolver(WarehouseSchema),
        defaultValues: defaultValue,
    });

    useEffect(() => {
        if (modalMode === "Edit" && items) {
            reset({
                title: items.title || "",
                message: items.message || "",

            });
        } else {
            reset(defaultValue);
        }
    }, [items, modalMode, reset]);

    const formSubmit = async (formData: WarehouseFormData) => {
        setIsSubmit(true);

        if (modalMode === "Edit" && items?._id) {
            MimSmsService.updateMimSms(items._id, formData)
                .then((res: IApiResponse) => {
                    if (res?.success) {
                        ToastService.success(res?.message);
                        setIsModalOpen(false);
                        getMimSms();
                    } else {
                        ToastService.error(res?.message);
                    }
                })
                .catch((err: unknown) => {
                    if (err instanceof Error) {
                        ToastService.error(err.message);
                    } else {
                        ToastService.error("Unexpected error");
                    }
                })
                .finally(() => {
                    setIsSubmit(false);
                });
        } else {
            MimSmsService.createMimSms(formData)
                .then((res: IApiResponse) => {
                    if (res?.success) {
                        ToastService.success(res?.message);
                        getMimSms();
                        setIsModalOpen(false);
                    } else {
                        ToastService.error(res?.message);
                    }
                })
                .catch((err: unknown) => {
                    if (err instanceof Error) {
                        ToastService.error(err.message);
                    } else {
                        ToastService.error("Unexpected error");
                    }
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
                            ? `Edit SMS: ${items?.title}`
                            : "Create SMS"}
                    </h3>
                    <Icon
                        name={"close"}
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-600 cursor-pointer"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="w-full gap-5">
                        <div>
                            <Input
                                label="Title"
                                registerProperty={register("title")}
                                errorText={errors?.title?.message}
                                type="text"
                                isRequired
                                placeholder="Enter your title"
                            />

                            <Input
                                label="Message"
                                registerProperty={register("message")}
                                errorText={errors?.message?.message}
                                type="text"
                                isRequired
                                placeholder="Enter your message"
                            />
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

export default MimSmsModal;
