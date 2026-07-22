"use client";
import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { ToastService } from "@admin/utils/toastr.service";
import { LeavePolicyContext } from "@/app/admin/team/leave-policy/page";
import { LeavePolicyService } from "@admin/@services/apis/TeamService/LeavePolicyService/LeavePolicy.service";

export interface ILeaveFormValues {
    title: string | null;
    monthly_leaves: number | null;
}

const defaultValue: ILeaveFormValues = {
    title: null,
    monthly_leaves: null,
};

const SalarySchema: yup.ObjectSchema<ILeaveFormValues> = yup.object({
    title: yup
        .string()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .nullable()
        .required("Late Count is required"),

    monthly_leaves: yup
        .number()
        .transform((value, originalValue) => (originalValue === "" ? null : value))
        .nullable()
        .required("Absent Days is required"),
});

const LeavePolicyModal: React.FC = () => {
    const { isModalOpen, setIsModalOpen, modalMode, items, getSalaryReport } =
        useContext(LeavePolicyContext);
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const {
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<ILeaveFormValues>({
        resolver: yupResolver(SalarySchema),
        defaultValues: defaultValue,
    });

    useEffect(() => {
        if (modalMode === "Edit" && items) {
            reset({
                title: items.title ?? null,
                monthly_leaves: items.monthly_leaves ?? null,

            });
        } else {
            reset(defaultValue);
        }
    }, [items, modalMode, reset]);

    const formSubmit = async (formData: any) => {
        setIsSubmit(true);
        try {
            let res;
            if (modalMode === "Edit" && items?._id) {
                res = await LeavePolicyService.updateLeavePolicy(items?._id, formData);
            } else {
                res = await LeavePolicyService.createLeavePolicy(formData);
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
                        {modalMode === "Edit" ? `Edit Leave Policy` : "Create Leave Policy"}
                    </h3>
                    <Icon
                        name="close"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-600 cursor-pointer dark:text-gray-300"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className=" ">
                        <Input
                            label="Title"
                            registerProperty={register("title")}
                            errorText={errors.title?.message}
                            type="text"
                            isRequired
                            placeholder="Enter Title"
                        />
                        <Input
                            label="Monthly Leave"
                            registerProperty={register("monthly_leaves")}
                            errorText={errors.monthly_leaves?.message}
                            type="number"
                            isRequired
                            placeholder="Enter late count"
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

export default LeavePolicyModal;
