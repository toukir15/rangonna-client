"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { ShopOccasionService } from "@admin/@services/apis/CustomerFront/ShopOccasionService/ShopOccasion.service";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";

type TItemForm = {
    image: string;
    link: string;
    title: string;
    description: string;
    prompt: string;
    priority: number | string;
};

type FormValues = {
    eyebrow: string;
    heading: string;
    description: string;
    href: string;
    linkLabel: string;
    mobile: TItemForm[];
    desktop: TItemForm[];
};

type TItem = {
    image?: string;
    link?: string;
    title?: string;
    description?: string;
    prompt?: string;
    priority?: number;
};

export type TShopOccasionData = {
    _id: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    href?: string;
    linkLabel?: string;
    mobile?: TItem[];
    desktop?: TItem[];
    items?: TItem[];
};

type ShopOccasionFormProps = {
    mode: "create" | "edit";
    initialData?: TShopOccasionData | null;
    occasionId?: any;
};

const defaultItem: TItemForm = {
    image: "",
    link: "",
    title: "",
    description: "",
    prompt: "",
    priority: "",
};

const occasionImagePrompts = {
    mobile: [
        "Luxury bridal churi collection, elegant red and gold bangles on rich maroon silk, soft warm lighting, premium jewelry photography, vertical 800x1000px, no text.",
        "Elegant wedding guest bangles in rose gold and champagne tones, delicate floral background, refined luxury style, vertical 800x1000px, no text.",
        "Festive colorful glass bangles with traditional flowers and golden decorations, joyful warm lighting, premium product photography, vertical 800x1000px, no text.",
        "Minimal everyday churi collection, slim gold and rose-gold bangles on a warm beige background, clean modern luxury photography, vertical 800x1000px, no text.",
        "Beautiful gift-ready churi collection in elegant packaging with gold bangles, soft ivory and blush background, premium lifestyle photography, vertical 800x1000px, no text.",
    ],
    desktop: [
        "Luxury bridal churi collection, elegant red and gold bangles on rich maroon silk, soft warm lighting, premium jewelry photography, vertical 1200x1600px, no text.",
        "Elegant wedding guest bangles in rose gold and champagne tones, delicate floral background, refined luxury style, vertical 1200x1600px, no text.",
        "Festive colorful glass bangles with traditional flowers and golden decorations, joyful warm lighting, premium product photography, vertical 1200x1600px, no text.",
        "Minimal everyday churi collection, slim gold and rose-gold bangles on a warm beige background, clean modern luxury photography, vertical 1200x1600px, no text.",
        "Beautiful gift-ready churi collection in elegant packaging with gold bangles, soft ivory and blush background, premium lifestyle photography, vertical 1200x1600px, no text.",
    ],
} as const;

const defaultValue: FormValues = {
    eyebrow: "Shop by moment",
    heading: "Shop by Occasion",
    description: "Find the perfect churi set for weddings, festivals, gifts, and everyday elegance.",
    href: "",
    linkLabel: "",
    mobile: [{ ...defaultItem, prompt: occasionImagePrompts.mobile[0] }],
    desktop: [{ ...defaultItem, prompt: occasionImagePrompts.desktop[0] }],
};

const itemSchema: yup.ObjectSchema<TItemForm> = yup.object({
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
    eyebrow: yup.string().trim().required("Eyebrow is required"),
    heading: yup.string().trim().required("Heading is required"),
    description: yup.string().trim().required("Description is required"),
    href: yup.string().trim().default(""),
    linkLabel: yup.string().trim().default(""),
    mobile: yup
        .array()
        .of(itemSchema)
        .min(1, "At least one mobile occasion is required")
        .required(),
    desktop: yup
        .array()
        .of(itemSchema)
        .min(1, "At least one desktop occasion is required")
        .required(),
});

const uploadImage = async (file: File) => {
    const data = await ShopOccasionService.uploadFileDirect(file, "shop-occasion");
    const fileUrl =
        data?.data?.fileUrl ||
        data?.fileUrl ||
        data?.data?.url ||
        data?.url;
    if (!fileUrl || typeof fileUrl !== "string") {
        throw new Error("Invalid upload response");
    }
    return fileUrl as string;
};

type ItemFieldsProps = {
    title: string;
    type: "mobile" | "desktop";
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    setValue: UseFormSetValue<FormValues>;
    errors: FieldErrors<FormValues>;
    occasionId?: string;
};

const ItemFields: React.FC<ItemFieldsProps> = ({
    title,
    type,
    control,
    register,
    setValue,
    errors,
    occasionId,
}) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: type,
    });

    const watched = useWatch({ control, name: type });
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
            const fileUrl = await uploadImage(file);
            setValue(`${type}.${index}.image`, fileUrl, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            if (occasionId) {
                try {
                    await ShopOccasionService.updateShopOccasionImage(
                        String(occasionId),
                        {
                            type,
                            index,
                            image: fileUrl,
                        }
                    );
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
    const sizeHint =
        type === "mobile" ? "Mobile: 800 × 1000 px" : "Desktop: 1200 × 1600 px";

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {sizeHint} · Lowest priority shows first
                    </p>
                </div>
                <Button
                    type="button"
                    className="!px-3 !py-1.5 text-sm bg-[#7f1d1d] text-white"
                    onClick={() =>
                        append({
                            ...defaultItem,
                            prompt: occasionImagePrompts[type][fields.length] || "",
                        })
                    }
                >
                    + Add card
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => {
                    const itemError = Array.isArray(fieldErrors)
                        ? fieldErrors[index]
                        : undefined;
                    const previewImage = watched?.[index]?.image;
                    const uploadId = `occasion-upload-${type}-${index}`;
                    const isUploading = uploadingIndex === index;

                    return (
                        <article
                            key={field.id}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70 dark:border-gray-700 dark:bg-gray-950/40"
                        >
                            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    Card {index + 1}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                    className={`text-xs font-medium ${fields.length === 1
                                            ? "cursor-not-allowed text-gray-400"
                                            : "text-red-600 hover:text-red-700"
                                        }`}
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                                <div className="space-y-3">
                                    <div className="relative h-40 overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
                                        {previewImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={previewImage}
                                                alt={`${title} preview ${index + 1}`}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                                No image
                                            </div>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs font-medium text-[#7f1d1d] dark:bg-black/60">
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
                                        className="flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        {previewImage ? "Replace image" : "Choose image"}
                                    </label>
                                    <input
                                        {...register(`${type}.${index}.image`)}
                                        placeholder="Image URL"
                                        className={`${inputClass} text-xs`}
                                    />
                                    {itemError?.image?.message && (
                                        <p className="text-xs text-red-500">
                                            {itemError.image.message}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Title
                                        </label>
                                        <input
                                            {...register(`${type}.${index}.title`)}
                                            placeholder="Bridal"
                                            className={inputClass}
                                        />
                                        {itemError?.title?.message && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {itemError.title.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Priority
                                        </label>
                                        <input
                                            type="number"
                                            {...register(`${type}.${index}.priority`)}
                                            placeholder="1"
                                            className={inputClass}
                                        />
                                        {itemError?.priority?.message && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {itemError.priority.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-6">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Link
                                        </label>
                                        <input
                                            {...register(`${type}.${index}.link`)}
                                            placeholder="/churi/bridal"
                                            className={inputClass}
                                        />
                                        {itemError?.link?.message && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {itemError.link.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-6">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            {...register(`${type}.${index}.description`)}
                                            placeholder="Heirloom stacks for her forever day"
                                            rows={3}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d]/20 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                        />
                                        {itemError?.description?.message && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {itemError.description.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-6">
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Image Prompt
                                        </label>
                                        <textarea
                                            {...register(`${type}.${index}.prompt`)}
                                            placeholder="Describe the occasion image you want to generate..."
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#7f1d1d] focus:ring-1 focus:ring-[#7f1d1d]/20 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                                        />
                                        {itemError?.prompt?.message && (
                                            <p className="mt-1 text-xs text-red-500">
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

const ShopOccasionForm: React.FC<ShopOccasionFormProps> = ({
    mode,
    initialData = null,
    occasionId,
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

    const initializedFormRef = useRef<string | null>(null);

    const mapItems = (list: TItem[] | undefined, type: "mobile" | "desktop") =>
        list && list.length > 0
            ? list.map((item, index) => ({
                image: item?.image || "",
                link: item?.link || "",
                title: item?.title || "",
                description: item?.description || "",
                prompt: item?.prompt || occasionImagePrompts[type][index] || "",
                priority: item?.priority ?? "",
            }))
            : [
                {
                    ...defaultItem,
                    prompt: occasionImagePrompts[type][0],
                },
            ];

    useEffect(() => {
        if (mode === "edit" && initialData) {
            const formKey = `${mode}-${occasionId || initialData._id}`;
            if (initializedFormRef.current === formKey) return;

            const mappedMobile = mapItems(
                initialData.mobile?.length ? initialData.mobile : initialData.items,
                "mobile"
            );
            const mappedDesktop = mapItems(
                initialData.desktop?.length ? initialData.desktop : initialData.items,
                "desktop"
            );

            const values = {
                eyebrow: initialData.eyebrow || defaultValue.eyebrow,
                heading: initialData.heading || defaultValue.heading,
                description: initialData.description || defaultValue.description,
                href: initialData.href || defaultValue.href,
                linkLabel: initialData.linkLabel || defaultValue.linkLabel,
                mobile: mappedMobile,
                desktop: mappedDesktop,
            };

            reset(values);
            replaceMobile(mappedMobile);
            replaceDesktop(mappedDesktop);
            initializedFormRef.current = formKey;
        } else {
            if (initializedFormRef.current === mode) return;

            reset(defaultValue);
            replaceMobile(defaultValue.mobile);
            replaceDesktop(defaultValue.desktop);
            initializedFormRef.current = mode;
        }
    }, [mode, initialData, occasionId, reset, replaceMobile, replaceDesktop]);

    const formSubmit = async (data: FormValues) => {
        setIsSubmit(true);

        const mapPayload = (list: TItemForm[]) =>
            (list || []).map((item) => ({
                image: item.image,
                link: item.link,
                title: item.title,
                description: item.description,
                prompt: item.prompt,
                priority: Number(item.priority),
            }));

        const payload = {
            eyebrow: data.eyebrow,
            heading: data.heading,
            description: data.description,
            href: data.href,
            linkLabel: data.linkLabel,
            mobile: mapPayload(data.mobile),
            desktop: mapPayload(data.desktop),
        };

        try {
            const res =
                mode === "edit" && occasionId
                    ? await ShopOccasionService.updateShopOccasion(occasionId, payload)
                    : await ShopOccasionService.createShopOccasion(payload);

            if (res?.success) {
                ToastService.success(res?.message || "Shop occasion saved successfully");
                router.push("/admin/customer-front/shop-occasion");
            } else {
                ToastService.error(res?.message || "Failed to save shop occasion");
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
                            {mode === "edit" ? "Edit Shop by Occasion" : "Create Shop by Occasion"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create polished occasion cards for mobile and desktop shoppers.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/shop-occasion")}
                            className="border border-gray-200 px-4 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-lg bg-[#7f1d1d] px-5 py-2 text-sm text-white"
                            disabled={isSubmit}
                        >
                            {isSubmit ? <ButtonLoader /> : mode === "edit" ? "Update Occasion" : "Create Occasion"}
                        </Button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                Eyebrow
                            </label>
                            <input
                                {...register("eyebrow")}
                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            />
                            {errors.eyebrow?.message && (
                                <p className="text-red-500 text-xs mt-1">{errors.eyebrow.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                Heading
                            </label>
                            <input
                                {...register("heading")}
                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            />
                            {errors.heading?.message && (
                                <p className="text-red-500 text-xs mt-1">{errors.heading.message}</p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                Section Description
                            </label>
                            <textarea
                                {...register("description")}
                                rows={2}
                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            />
                            {errors.description?.message && (
                                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                View all link
                            </label>
                            <input
                                {...register("href")}
                                placeholder="/churi"
                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            />
                            {errors.href?.message && (
                                <p className="text-red-500 text-xs mt-1">{errors.href.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                View all label
                            </label>
                            <input
                                {...register("linkLabel")}
                                placeholder=""
                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            />
                            {errors.linkLabel?.message && (
                                <p className="text-red-500 text-xs mt-1">{errors.linkLabel.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                            <ItemFields
                                title="Mobile Occasion"
                                type="mobile"
                                control={control}
                                register={register}
                                setValue={setValue}
                                errors={errors}
                                    occasionId={occasionId}
                            />
                        </div>

                        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                            <ItemFields
                                title="Desktop Occasion"
                                type="desktop"
                                control={control}
                                register={register}
                                setValue={setValue}
                                errors={errors}
                                    occasionId={occasionId}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ShopOccasionForm;
