"use client";

import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import RichTextEditor from "@admin/components/core/Editor/RichTextEditor";

import { ToastService } from "@admin/utils/toastr.service";
import { CompanyPolicyContext } from "@/app/admin/duty-plan/company-policy/page";
import { CompanyPolicyService } from "@admin/@services/apis/DutyPlan/CompanyPolicy/CompanyPolicy.service";

type TFormData = {
    title: string;
    is_active: { label: string; value: boolean } | null;
};

const defaultValue: TFormData = {
    title: "",
    is_active: { label: "Active", value: true },
};

const webSchema = yup.object({
    title: yup.string().required("Title is required"),
    is_active: yup
        .object({
            label: yup.string().required(),
            value: yup.boolean().required(),
        })
        .nullable()
        .required("Status is required"),
});

const statusOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
];

const CompanyPolicyModal = () => {
    const {
        modalMode,
        items,
        setIsModalOpen,
        isModalOpen,
        fetchCompanyPolicy,
    } = useContext(CompanyPolicyContext);

    const [isSubmit, setIsSubmit] = useState(false);
    const [content, setContent] = useState("");

    const handleEditorChange = (value: string) => {
        setContent(value);
    };

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

    useEffect(() => {
        if (modalMode === "Edit" && items) {
            reset({
                title: items?.title || "",
                is_active:
                    typeof items?.is_active === "boolean"
                        ? items.is_active
                            ? { label: "Active", value: true }
                            : { label: "Inactive", value: false }
                        : { label: "Active", value: true },
            });

            setContent(items?.description || "");
        } else {
            reset(defaultValue);
            setContent("");
        }
    }, [items, modalMode, reset]);

    const formSubmit = async (formData: TFormData) => {
        setIsSubmit(true);

        const payload = {
            title: formData.title,
            description: content || "",
            is_active: formData?.is_active?.value ?? true,
        };

        try {
            const res =
                modalMode === "Edit"
                    ? await CompanyPolicyService.updateCompanyPolicy(items?._id, payload)
                    : await CompanyPolicyService.createCompanyPolicy(payload);

            if (res?.success) {
                ToastService.success(res?.message || `Company policy ${modalMode === "Edit" ? "updated" : "created"} successfully`);
                fetchCompanyPolicy();
                setIsModalOpen(false);
                reset(defaultValue);
                setContent("");
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
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {modalMode === "Edit" ? "Edit Company Policy" : "Create Company Policy"}
                    </h3>
                    <Icon
                        name="close"
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
                                placeholder="Enter title"
                            />

                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                    Status{" "}
                                    <span className="text-red-400 font-inter text-[12px] font-semibold">
                                        *
                                    </span>
                                </label>

                                <Controller
                                    name="is_active"
                                    control={control}
                                    render={({ field }) => (
                                        <SelectComponent
                                            options={statusOptions}
                                            value={field.value}
                                            onChange={(val: any) => field.onChange(val)}
                                            placeholder="Select Status"
                                            isRequired
                                            className="w-full"
                                        />
                                    )}
                                />
                                {errors?.is_active?.message && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.is_active.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <RichTextEditor
                                    content={content}
                                    onChange={handleEditorChange}
                                    placeholder="Start writing your content here..."
                                />
                            </div>
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

export default CompanyPolicyModal;