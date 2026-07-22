import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useEffect, useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { NoticeContext } from "@/app/admin/duty-plan/notice/page";
import RichTextEditor from "@admin/components/core/Editor/RichTextEditor";
import { NoticeService } from "@admin/@services/apis/DutyPlan/Notice/Notice.service";
import { IGroupOption } from "../../Team/Users/TeamDrawer";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";

const defaultValue = {
    title: "",
    permission: [] as string[],
};

const webSchema = yup.object({
    title: yup.string().required("Title is required"),
    permission: yup
        .array()
        .of(yup.string().required())
        .min(1, "At least one permission is required")
        .required("Permission is required"),
});

const NoticeModal = () => {
    const { modalMode, items, setIsModalOpen, isModalOpen, getDeposit } =
        useContext(NoticeContext);

    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [permissionData, setPermissionData] = useState<IGroupOption[]>([]);
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
        TeamService.getPermissionSuggestion()
            .then((res: any) => {
                if (res?.success) {
                    const formattedPermissions = res.data.map((p: any) => ({
                        value: p._id,
                        label: p.name,
                    }));
                    setPermissionData(formattedPermissions);
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            });
    }, []);

    useEffect(() => {
        if (modalMode === "Edit" && items) {
            reset({
                title: items?.title || "",
                permission: items?.permissions || items?.permission || [],
            });
            setContent(items?.description || "");
        } else {
            reset(defaultValue);
            setContent("");
        }
    }, [items, modalMode, reset, isModalOpen]);

    const formSubmit = async (formData: any) => {
        const payload = {
            title: formData.title,
            description: content || "",
            permissions: formData.permission || [],
        };

        setIsSubmit(true);

        if (modalMode === "Edit") {
            NoticeService.updateNotice(items?._id, payload)
                .then((res: any) => {
                    if (res?.success) {
                        ToastService.success(res?.message);
                        setIsModalOpen(false);
                        getDeposit();
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
        } else {
            NoticeService.createNotice(payload)
                .then((res: any) => {
                    if (res?.success) {
                        ToastService.success(res?.message);
                        getDeposit();
                        setIsModalOpen(false);
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
                        {modalMode === "Edit" ? "Edit Notice" : "Create Notice"}
                    </h3>
                    <Icon
                        name="close"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-600 cursor-pointer"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="w-full gap-5">
                        <Input
                            label="Title"
                            registerProperty={register("title")}
                            errorText={errors?.title?.message}
                            type="text"
                            isRequired
                            placeholder="Enter title"
                        />

                        <div className="mb-4">
                            <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                Permission{" "}
                                <span className="text-red-400 text-[12px] font-semibold">
                                    *
                                </span>
                            </p>

                            <Controller
                                name="permission"
                                control={control}
                                render={({ field }) => (
                                    <SelectComponent
                                        options={permissionData}
                                        value={permissionData.filter((opt) =>
                                            field.value?.includes(opt.value)
                                        )}
                                        onChange={(selected: any) => {
                                            const values = Array.isArray(selected)
                                                ? selected.map((item: IGroupOption) => item.value)
                                                : [];
                                            field.onChange(values);
                                        }}
                                        placeholder="Select Permission"
                                        isRequired
                                        isMulti
                                    />
                                )}
                            />

                            {errors.permission && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.permission.message as string}
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

export default NoticeModal;