"use client";

import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    FieldErrors,
    UseFormRegister,
    UseFormSetValue,
    useFieldArray,
    useForm,
    Control,
    useWatch,
} from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { BannerService } from "@admin/@services/apis/CustomerFront/BannerService/Banner.service";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";

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

export type TBannerData = {
    _id: string;
    mobile?: TBannerItem[];
    desktop?: TBannerItem[];
};

type BannerFormProps = {
    mode: "create" | "edit";
    initialData?: TBannerData | null;
    bannerId?: any;
    onSuccess?: () => void;
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
        "Minimal gold and rose-gold bangles on a warm neutral background, clean luxury product photography, wide composition, no text, 1920x700px.",
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

    const watchedBanners = useWatch({
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

    const inputClass =
        "w-full h-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 px-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d]/20";
    const sizeHint = type === "mobile" ? "750 × 1000 px" : "1280 × 300 px";

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Recommended size {sizeHint}
                    </p>
                </div>
                <Button
                    type="button"
                    className="!px-3 !py-1.5 text-sm bg-[#7f1d1d] text-white"
                    onClick={() =>
                        append({
                            ...defaultBannerItem,
                            prompt: bannerImagePrompts[type][fields.length] || "",
                        })
                    }
                >
                    + Add slide
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => {
                    const itemError = Array.isArray(fieldErrors)
                        ? fieldErrors[index]
                        : undefined;
                    const previewImage = watchedBanners?.[index]?.image;
                    const uploadId = `banner-upload-${type}-${index}`;
                    const isUploading = uploadingIndex === index;

                    return (
                        <article
                            key={field.id}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-950/40 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Slide {index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                    className={`text-xs font-medium ${
                                        fields.length === 1
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-red-600 hover:text-red-700"
                                    }`}
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="space-y-3">
                                    <div className="relative h-36 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-hidden">
                                        {previewImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={previewImage}
                                                alt={`${title} preview ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                                                No image
                                            </div>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-white/80 dark:bg-black/60 flex items-center justify-center text-xs font-medium text-[#7f1d1d]">
                                                Uploading...
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id={uploadId}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="sr-only"
                                        onChange={(e) => handleImageUpload(e, index)}
                                    />
                                    <label
                                        htmlFor={uploadId}
                                        className="flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        {previewImage ? "Replace image" : "Choose image"}
                                    </label>
                                    <input
                                        {...register(`${type}.${index}.image`)}
                                        placeholder="Image URL"
                                        className={`${inputClass} text-xs`}
                                    />
                                    {itemError?.image?.message && (
                                        <p className="text-red-500 text-xs">
                                            {itemError.image.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                    <div className="sm:col-span-4">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                            Title
                                        </label>
                                        <input
                                            {...register(`${type}.${index}.title`)}
                                            placeholder="Celebrate Every Moment with Elegance"
                                            className={inputClass}
                                        />
                                        {itemError?.title?.message && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {itemError.title.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                            Priority
                                        </label>
                                        <input
                                            type="number"
                                            {...register(`${type}.${index}.priority`)}
                                            placeholder="1"
                                            className={inputClass}
                                        />
                                        {itemError?.priority?.message && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {itemError.priority.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-6">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                            Link
                                        </label>
                                        <input
                                            {...register(`${type}.${index}.link`)}
                                            placeholder="/churi"
                                            className={inputClass}
                                        />
                                        {itemError?.link?.message && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {itemError.link.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-6">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            {...register(`${type}.${index}.description`)}
                                            placeholder="Tradition meets modern beauty."
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d]/20"
                                        />
                                        {itemError?.description?.message && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {itemError.description.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-6">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                            Image Prompt
                                        </label>
                                        <textarea
                                            {...register(`${type}.${index}.prompt`)}
                                            placeholder="Describe the banner image you want to generate..."
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d]/20"
                                        />
                                        {itemError?.prompt?.message && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {itemError.prompt.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

const BannerForm: React.FC<BannerFormProps> = ({
    mode,
    initialData = null,
    bannerId,
    onSuccess,
}) => {
    const router = useRouter();
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
        if (mode === "edit" && initialData) {
            const mappedMobile =
                initialData?.mobile && initialData.mobile.length > 0
                    ? initialData.mobile.map((banner, index) => ({
                        image: banner?.image || "",
                        link: banner?.link || "",
                        title: banner?.title || "",
                        description: banner?.description || "",
                        prompt: banner?.prompt || bannerImagePrompts.mobile[index] || "",
                        priority: banner?.priority ?? "",
                    }))
                    : [{ ...defaultBannerItem, prompt: bannerImagePrompts.mobile[0] }];

            const mappedDesktop =
                initialData?.desktop && initialData.desktop.length > 0
                    ? initialData.desktop.map((banner, index) => ({
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
    }, [mode, initialData, reset, replaceMobile, replaceDesktop]);

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
                mode === "edit" && bannerId
                    ? await BannerService.updateBanner(bannerId, payload)
                    : await BannerService.createBanner(payload);

            if (res?.success) {
                ToastService.success(res?.message || "Banner saved successfully");

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/admin/customer-front/banner");
                }
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
        <div className="w-full p-4 md:p-6">
            <form onSubmit={handleSubmit(formSubmit)} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {mode === "edit" ? "Edit Banner" : "Create Banner"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Upload an image to save it immediately. Title and link apply after you update.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/banner")}
                            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className="px-5 py-2 text-sm bg-[#7f1d1d] text-white rounded-lg"
                            disabled={isSubmit}
                        >
                            {isSubmit ? (
                                <ButtonLoader />
                            ) : mode === "edit" ? (
                                "Update Banner"
                            ) : (
                                "Create Banner"
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 md:p-5">
                        <BannerFields
                            title="Mobile Banner"
                            type="mobile"
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                            bannerId={bannerId}
                        />
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 md:p-5">
                        <BannerFields
                            title="Desktop Banner"
                            type="desktop"
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                            bannerId={bannerId}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BannerForm;