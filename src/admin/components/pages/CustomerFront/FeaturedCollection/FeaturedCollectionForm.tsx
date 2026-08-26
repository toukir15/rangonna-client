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
import { FeaturedCollectionService } from "@admin/@services/apis/CustomerFront/FeaturedCollectionService/FeaturedCollection.service";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";

type TItemForm = {
    image: string;
    link: string;
    title: string;
    description: string;
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
    priority?: number;
};

export type TFeaturedCollectionData = {
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

type FeaturedCollectionFormProps = {
    mode: "create" | "edit";
    initialData?: TFeaturedCollectionData | null;
    collectionId?: any;
};

const defaultItem: TItemForm = {
    image: "",
    link: "",
    title: "",
    description: "",
    priority: "",
};

const defaultValue: FormValues = {
    eyebrow: "Curated for you",
    heading: "Featured Collections",
    description: "Five signature edits — bridal, glass, luxury, festival, and premium churi.",
    href: "/churi",
    linkLabel: "View all collections",
    mobile: [{ ...defaultItem }],
    desktop: [{ ...defaultItem }],
};

const itemSchema: yup.ObjectSchema<TItemForm> = yup.object({
    image: yup.string().trim().required("Image is required"),
    link: yup.string().trim().required("Link is required"),
    title: yup.string().trim().required("Title is required"),
    description: yup.string().trim().required("Description is required"),
    priority: yup
        .number()
        .typeError("Priority is required")
        .required("Priority is required"),
});

const schema: yup.ObjectSchema<FormValues> = yup.object({
    eyebrow: yup.string().trim().required("Eyebrow is required"),
    heading: yup.string().trim().required("Heading is required"),
    description: yup.string().trim().required("Description is required"),
    href: yup.string().trim().required("View all link is required"),
    linkLabel: yup.string().trim().required("View all label is required"),
    mobile: yup
        .array()
        .of(itemSchema)
        .min(1, "At least one mobile collection is required")
        .required(),
    desktop: yup
        .array()
        .of(itemSchema)
        .min(1, "At least one desktop collection is required")
        .required(),
});

const uploadImage = async (file: File) => {
    const data = await FeaturedCollectionService.uploadFileDirect(file, "featured-collection");
    const fileUrl = data?.data?.fileUrl;
    if (!fileUrl) throw new Error("Invalid upload response");
    return fileUrl as string;
};

type ItemFieldsProps = {
    title: string;
    type: "mobile" | "desktop";
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    setValue: UseFormSetValue<FormValues>;
    errors: FieldErrors<FormValues>;
};

const ItemFields: React.FC<ItemFieldsProps> = ({
    title,
    type,
    control,
    register,
    setValue,
    errors,
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
            ToastService.success("Image uploaded successfully");
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
                <p className="text-xs text-gray-500">
                    Lowest priority number becomes the large featured card
                </p>
            </div>

            <div className="space-y-2">
                {fields.map((field, index) => {
                    const itemError = Array.isArray(fieldErrors) ? fieldErrors[index] : undefined;
                    const previewImage = watched?.[index]?.image;

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
                                    className={`text-sm font-medium ${
                                        fields.length === 1
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
                                        placeholder="https://cdn.example.com/collection.jpg"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.image?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.image.message}
                                        </p>
                                    )}
                                </div>

                                {!!previewImage && (
                                    <div className="md:col-span-2">
                                        <img
                                            src={previewImage}
                                            alt="Collection preview"
                                            className="h-28 w-full max-w-xs object-cover rounded-lg border"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Title
                                    </label>
                                    <input
                                        {...register(`${type}.${index}.title`)}
                                        placeholder="Bridal"
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
                                        Link
                                    </label>
                                    <input
                                        {...register(`${type}.${index}.link`)}
                                        placeholder="/churi/bridal"
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
                                        placeholder="Heirloom stacks for her forever day"
                                        rows={2}
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {itemError?.description?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {itemError.description.message}
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
                    onClick={() => append({ ...defaultItem })}
                >
                    + Add {title}
                </Button>
            </div>
        </div>
    );
};

const FeaturedCollectionForm: React.FC<FeaturedCollectionFormProps> = ({
    mode,
    initialData = null,
    collectionId,
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

    const mapItems = (list?: TItem[]) =>
        list && list.length > 0
            ? list.map((item) => ({
                image: item?.image || "",
                link: item?.link || "",
                title: item?.title || "",
                description: item?.description || "",
                priority: item?.priority ?? "",
            }))
            : [{ ...defaultItem }];

    useEffect(() => {
        if (mode === "edit" && initialData) {
            const mappedMobile = mapItems(
                initialData.mobile?.length ? initialData.mobile : initialData.items
            );
            const mappedDesktop = mapItems(
                initialData.desktop?.length ? initialData.desktop : initialData.items
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
        } else {
            reset(defaultValue);
            replaceMobile(defaultValue.mobile);
            replaceDesktop(defaultValue.desktop);
        }
    }, [mode, initialData, reset, replaceMobile, replaceDesktop]);

    const formSubmit = async (data: FormValues) => {
        setIsSubmit(true);

        const mapPayload = (list: TItemForm[]) =>
            (list || []).map((item) => ({
                image: item.image,
                link: item.link,
                title: item.title,
                description: item.description,
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
                mode === "edit" && collectionId
                    ? await FeaturedCollectionService.updateFeaturedCollection(collectionId, payload)
                    : await FeaturedCollectionService.createFeaturedCollection(payload);

            if (res?.success) {
                ToastService.success(res?.message || "Featured collection saved successfully");
                router.push("/admin/customer-front/featured-collection");
            } else {
                ToastService.error(res?.message || "Failed to save featured collection");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Something went wrong");
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <div className="w-full p-4 md:p-6">
            <form onSubmit={handleSubmit(formSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between border-b dark:border-gray-700 px-4 md:px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {mode === "edit" ? "Edit Featured Collection" : "Create Featured Collection"}
                        </h3>

                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/featured-collection")}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                            Back
                        </Button>
                    </div>

                    <div className="p-4 md:p-6 space-y-6">
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
                                    placeholder="View all collections"
                                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                />
                                {errors.linkLabel?.message && (
                                    <p className="text-red-500 text-xs mt-1">{errors.linkLabel.message}</p>
                                )}
                            </div>
                        </div>

                        <ItemFields
                            title="Mobile Collection"
                            type="mobile"
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                        />

                        <ItemFields
                            title="Desktop Collection"
                            type="desktop"
                            control={control}
                            register={register}
                            setValue={setValue}
                            errors={errors}
                        />
                    </div>

                    <div className="flex justify-end gap-2 border-t dark:border-gray-700 px-4 md:px-6 py-4">
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/featured-collection")}
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
                            ) : mode === "edit" ? (
                                "Update Collection"
                            ) : (
                                "Create Collection"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default FeaturedCollectionForm;
