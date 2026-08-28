"use client";

import React, { useContext, useEffect, useState } from "react";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Controller,
    FieldErrors,
    UseFormRegister,
    UseFormSetValue,
    useFieldArray,
    useForm,
    Control,
} from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { BannerService } from "@admin/@services/apis/CustomerFront/BannerService/Banner.service";
import { BannerContext } from "@/app/admin/customer-front/banner/page";
// import { ENV } from "@admin/@config/ENV.config";

type TBannerItemForm = {
    image: string;
    link: string;
    title: string;
    description: string;
    prompt: string;
    priority: number | string;
};

type FormValues = {
    mobile: TBannerItemForm[];
    desktop: TBannerItemForm[];
};

type TBannerItem = {
    image?: string;
    link?: string;
    title?: string;
    description?: string;
    prompt?: string;
    priority?: number;
};

type TBannerData = {
    _id: string;
    mobile?: TBannerItem[];
    desktop?: TBannerItem[];
};

type TContext = {
    modalMode: "Add" | "Edit";
    items: TBannerData | null;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    fetchBanner: () => void;
    isModalOpen: boolean;
};

const defaultBannerItem: TBannerItemForm = {
    image: "",
    link: "",
    title: "",
    description: "",
    prompt: "",
    priority: "",
};

const bannerImagePrompts = {
    mobile: [
        "Premium bridal jewelry banner, elegant gold bangles and traditional churi on rich maroon silk, warm luxury lighting, no text, vertical 900x1200px.",
        "Colorful glass bangles arranged on soft ivory fabric, refined studio jewelry photography, vibrant but premium, no text, vertical 900x1200px.",
        "Luxury gold churi with subtle gemstone details on deep burgundy velvet, editorial product photography, no text, vertical 900x1200px.",
        "Festive red and gold bangles with delicate flowers and warm celebratory light, elegant premium composition, no text, vertical 900x1200px.",
        "Minimal gold and rose-gold bangles on a warm neutral background, clean luxury product photography, no text, vertical 900x1200px.",
    ],
    desktop: [
        "Premium bridal jewelry banner, elegant gold bangles and traditional churi on rich maroon silk, warm luxury lighting, wide composition, no text, 1920x700px.",
        "Colorful glass bangles arranged on soft ivory fabric, refined studio jewelry photography, vibrant but premium, wide composition, no text, 1920x700px.",
        "Luxury gold churi with subtle gemstone details on deep burgundy velvet, editorial product photography, wide composition, no text, 1920x700px.",
        "Festive red and gold bangles with delicate flowers and warm celebratory light, elegant wide composition, no text, 1920x700px.",
        "Minimal gold and rose-gold bangles on a warm neutral background, clean luxury product photography, no text, 1920x700px.",
    ],
} as const;

const defaultValue: FormValues = {
    mobile: [{ ...defaultBannerItem, prompt: bannerImagePrompts.mobile[0] }],
    desktop: [{ ...defaultBannerItem, prompt: bannerImagePrompts.desktop[0] }],
};

const bannerItemSchema: yup.ObjectSchema<TBannerItemForm> = yup.object({
    image: yup.string().trim().required("Image is required"),
    link: yup.string().trim().required("Link is required"),
    title: yup.string().trim().required("Title is required"),
    description: yup.string().trim().required("Description is required"),
    prompt: yup.string().trim().required("Image prompt is required"),
    priority: yup
        .number()
        .typeError("Priority is required")
        .required("Priority is required"),
});

const schema: yup.ObjectSchema<FormValues> = yup.object({
    mobile: yup
        .array()
        .of(bannerItemSchema)
        .min(1, "At least one mobile banner is required")
        .required(),
    desktop: yup
        .array()
        .of(bannerItemSchema)
        .min(1, "At least one desktop banner is required")
        .required(),
});

const getUploadedFileUrl = (data: any): string => {
    const fileUrl =
        data?.data?.fileUrl ||
        data?.fileUrl ||
        data?.data?.url ||
        data?.url;
    if (!fileUrl || typeof fileUrl !== "string") {
        throw new Error("Invalid upload response");
    }
    return fileUrl;
};

const uploadBannerImage = async (file: File) => {
    if (!file) throw new Error("No file selected");
    const data = await BannerService.uploadFileDirect(file, "banner");
    return getUploadedFileUrl(data);
};

type BannerFieldsProps = {
    title: string;
    type: "mobile" | "desktop";
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    setValue: UseFormSetValue<FormValues>;
    errors: FieldErrors<FormValues>;
    bannerId?: string;
};

const BannerFields: React.FC<BannerFieldsProps> = ({
    title,
    type,
    control,
    register,
    setValue,
    errors,
    bannerId,
}) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: type,
    });

    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    const fieldErrors = errors?.[type];

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingIndex(index);

            const fileUrl = await uploadBannerImage(file);

            setValue(`${type}.${index}.image`, fileUrl, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });

            if (bannerId) {
                try {
                    await BannerService.updateSlideImage(String(bannerId), {
                        type,
                        index,
                        image: fileUrl,
                    });
                    ToastService.success("Image uploaded and saved");
                } catch (persistErr: any) {
                    ToastService.error(
                        persistErr?.message ||
                            "Image uploaded but failed to save in database"
                    );
                }
            } else {
                ToastService.success("Image uploaded successfully");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Image upload failed");
        } finally {
            setUploadingIndex(null);
            e.target.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                    {title}
                </h4>
            </div>

            <div className="space-y-2">
                {fields.map((field, index) => {
                    const itemError = Array.isArray(fieldErrors) ? fieldErrors[index] : undefined;

                    return (
                        <div
                            key={field.id}
                            className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 bg-white dark:bg-gray-900"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    {title} #{index + 1}
                                </h4>

                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className={`text-sm font-medium ${fields.length === 1
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-red-500"
                                        }`}
                                    disabled={fields.length === 1}
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Upload Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, index)}
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {uploadingIndex === index && (
                                        <p className="text-blue-500 text-xs mt-1">Uploading...</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Image URL
                                    </label>
                                    <input
                                        {...register(`${type}.${index}.image`)}
                                        placeholder="https://cdn.example.com/banner.jpg"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.image?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.image.message}
                                        </p>
                                    )}
                                </div>

                                {!!fields[index]?.image && (
                                    <div className="md:col-span-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={fields[index].image}
                                            alt={`${title} preview`}
                                            className="h-28 w-full max-w-xs object-cover rounded-lg border"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Link
                                    </label>
                                    <input
                                        {...register(`${type}.${index}.link`)}
                                        placeholder="/sale"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.link?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.link.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Title
                                    </label>
                                    <input
                                        {...register(`${type}.${index}.title`)}
                                        placeholder="Summer Sale"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.title?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.title.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Priority
                                    </label>
                                    <input
                                        type="number"
                                        {...register(`${type}.${index}.priority`)}
                                        placeholder="1"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.priority?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.priority.message}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        {...register(`${type}.${index}.description`)}
                                        placeholder="Up to 50% off"
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.description?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.description.message}
                                        </p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Image Prompt
                                    </label>
                                    <textarea
                                        {...register(`${type}.${index}.prompt`)}
                                        placeholder="Describe the banner image you want to generate..."
                                        rows={4}
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.prompt?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.prompt.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-end justify-end">
                <Button
                    type="button"
                    className="!px-4 !py-2 bg-green-500 text-white"
                    onClick={() =>
                        append({
                            ...defaultBannerItem,
                            prompt: bannerImagePrompts[type][fields.length] || "",
                        })
                    }
                >
                    + Add {title}
                </Button>
            </div>
        </div>
    );
};

const BannerModal: React.FC = () => {
    const { modalMode, items, setIsModalOpen, fetchBanner, isModalOpen } =
        useContext(BannerContext) as TContext;

    const [isSubmit, setIsSubmit] = useState(false);

    const {
        handleSubmit,
        reset,
        control,
        register,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: defaultValue,
    });

    const { replace: replaceMobile } = useFieldArray({
        control,
        name: "mobile",
    });

    const { replace: replaceDesktop } = useFieldArray({
        control,
        name: "desktop",
    });

    useEffect(() => {
        if (!isModalOpen) return;

        if (modalMode === "Edit" && items) {
            const mappedMobile =
                items?.mobile && items.mobile.length > 0
                    ? items.mobile.map((banner, index) => ({
                        image: banner?.image || "",
                        link: banner?.link || "",
                        title: banner?.title || "",
                        description: banner?.description || "",
                        prompt: banner?.prompt || bannerImagePrompts.mobile[index] || "",
                        priority: banner?.priority ?? "",
                    }))
                    : [{ ...defaultBannerItem, prompt: bannerImagePrompts.mobile[0] }];

            const mappedDesktop =
                items?.desktop && items.desktop.length > 0
                    ? items.desktop.map((banner, index) => ({
                        image: banner?.image || "",
                        link: banner?.link || "",
                        title: banner?.title || "",
                        description: banner?.description || "",
                        prompt: banner?.prompt || bannerImagePrompts.desktop[index] || "",
                        priority: banner?.priority ?? "",
                    }))
                    : [{ ...defaultBannerItem, prompt: bannerImagePrompts.desktop[0] }];

            reset({
                mobile: mappedMobile,
                desktop: mappedDesktop,
            });

            replaceMobile(mappedMobile);
            replaceDesktop(mappedDesktop);
        } else {
            reset(defaultValue);
            replaceMobile(defaultValue.mobile);
            replaceDesktop(defaultValue.desktop);
        }
    }, [
        isModalOpen,
        modalMode,
        items,
        reset,
        replaceMobile,
        replaceDesktop,
    ]);

    const onCloseModal = () => {
        setIsModalOpen(false);
        reset(defaultValue);
        replaceMobile(defaultValue.mobile);
        replaceDesktop(defaultValue.desktop);
    };

    const formSubmit = async (data: FormValues) => {
        setIsSubmit(true);

        const payload = {
            mobile: (data?.mobile || []).map((item) => ({
                image: item.image,
                link: item.link,
                title: item.title,
                description: item.description,
                prompt: item.prompt,
                priority: Number(item.priority),
            })),
            desktop: (data?.desktop || []).map((item) => ({
                image: item.image,
                link: item.link,
                title: item.title,
                description: item.description,
                prompt: item.prompt,
                priority: Number(item.priority),
            })),
        };

        try {
            const res =
                modalMode === "Edit" && items?._id
                    ? await BannerService.updateBanner(items._id, payload)
                    : await BannerService.createBanner(payload);

            if (res?.success) {
                ToastService.success(res?.message || "Banner saved successfully");
                onCloseModal();
                fetchBanner();
            } else {
                ToastService.error(res?.message || "Failed to save banner");
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
                onClose={onCloseModal}
                width="w-full md:w-11/12"
                maxWidth="max-w-6xl"
            >
                <Modal.Header className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {modalMode === "Edit" ? "Edit Banner" : "Create Banner"}
                    </h3>

                    <Icon
                        name="close"
                        onClick={onCloseModal}
                        className="text-gray-600 cursor-pointer dark:text-gray-300"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="space-y-6">
                        <BannerFields
                            title="Mobile Banner"
                            type="mobile"
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                            bannerId={items?._id}
                        />

                        <BannerFields
                            title="Desktop Banner"
                            type="desktop"
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                            bannerId={items?._id}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-end gap-2 border-t dark:border-gray-700 pt-4">
                    <Button
                        type="button"
                        onClick={onCloseModal}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        className="px-5 py-2 text-sm bg-blue-500 text-white rounded-lg"
                        disabled={isSubmit}
                    >
                        {isSubmit ? (
                            <ButtonLoader />
                        ) : modalMode === "Edit" ? (
                            "Update Banner"
                        ) : (
                            "Create Banner"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </form>
    );
};

export default BannerModal;