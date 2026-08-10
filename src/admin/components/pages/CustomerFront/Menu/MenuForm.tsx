"use client";

import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Controller,
    useFieldArray,
    useForm,
    Control,
    UseFormRegister,
    FieldErrors,
} from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { MenuService } from "@admin/@services/apis/CustomerFront/MenuService/Menu.service";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import MaterialIconSelect from "./MaterialIconSelect";
import { materialIconOptions } from "./materialIconOptions";

// ====================== Types ======================
type TSubmenuForm = {
    name: string;
    route: string;
    icon?: string;
    color?: string;
};

type TNavItemForm = {
    name: string;
    route: string;
    icon?: string;
    color?: string;
    submenu: TSubmenuForm[];
};

export type FormValues = {
    navBarItems: TNavItemForm[];
};

type TSubmenu = {
    id?: number;
    name?: string;
    route?: string;
    icon?: string;
    color?: string;
};

type TNavItem = {
    id?: number;
    name?: string;
    route?: string;
    icon?: string;
    color?: string;
    submenu?: TSubmenu[];
};

export type TMenuItem = {
    _id: string;
    navBarItems?: TNavItem[];
};

type MenuFormProps = {
    mode: "create" | "edit";
    initialData?: TMenuItem | null;
    menuId?: string;
    onSuccess?: () => void;
};

// ====================== Default Value ======================
const defaultValue: FormValues = {
    navBarItems: [
        {
            name: "",
            route: "",
            icon: "",
            color: "#000000",
            submenu: [],
        },
    ],
};

// ====================== Validation ======================
const schema: yup.ObjectSchema<any> = yup.object({
    navBarItems: yup
        .array()
        .of(
            yup.object({
                name: yup.string().trim().required("Menu name is required"),
                route: yup.string().trim().required("Route is required"),
                icon: yup.string().optional().default(""),
                color: yup
                    .string()
                    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid color code")
                    .optional()
                    .default("#000000"),
                submenu: yup.array().of(
                    yup.object({
                        name: yup.string().trim().required("Submenu name is required"),
                        route: yup.string().trim().required("Submenu route is required"),
                        icon: yup.string().optional().default(""),
                        color: yup
                            .string()
                            .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Invalid color code")
                            .optional()
                            .default("#000000"),
                    })
                ),
            })
        )
        .min(1, "At least one menu is required")
        .required(),
});

// ====================== Reusable Color Picker ======================
type ColorPickerFieldProps = {
    value?: string;
    onChange: (value: string) => void;
};

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
    value = "#000000",
    onChange,
}) => {
    return (
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-1"
            />

            <input
                type="text"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            />
        </div>
    );
};

// ====================== Submenu Component ======================
type SubmenuFieldsProps = {
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    errors: FieldErrors<FormValues>;
    navIndex: number;
};

const SubmenuFields: React.FC<SubmenuFieldsProps> = ({
    control,
    register,
    errors,
    navIndex,
}) => {
    const { fields: submenuFields, append, remove } = useFieldArray({
        control,
        name: `navBarItems.${navIndex}.submenu`,
    });

    const submenuErrors =
        (errors?.navBarItems?.[navIndex]?.submenu as
            | Array<{
                name?: { message?: string };
                route?: { message?: string };
                icon?: { message?: string };
                color?: { message?: string };
            }>
            | undefined) || [];

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Submenu
                </h4>
            </div>

            {submenuFields.length < 1 ? (
                <div className="text-sm text-gray-500 border border-dashed rounded-lg p-3">
                    No submenu added
                </div>
            ) : (
                <div className="space-y-3">
                    {submenuFields.map((subItem, subIndex) => (
                        <div
                            key={subItem.id}
                            className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-800"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Submenu #{subIndex + 1}
                                </h5>

                                <button
                                    type="button"
                                    onClick={() => remove(subIndex)}
                                    className="text-red-500 text-sm font-medium"
                                >
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Name
                                    </label>
                                    <input
                                        {...register(
                                            `navBarItems.${navIndex}.submenu.${subIndex}.name`
                                        )}
                                        placeholder="Women"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {submenuErrors?.[subIndex]?.name?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {submenuErrors[subIndex]?.name?.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Route
                                    </label>
                                    <input
                                        {...register(
                                            `navBarItems.${navIndex}.submenu.${subIndex}.route`
                                        )}
                                        placeholder="/churi/bridal"
                                        className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                    />
                                    {submenuErrors?.[subIndex]?.route?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {submenuErrors[subIndex]?.route?.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Icon <span className="text-xs text-gray-400">(Optional)</span>
                                    </label>

                                    <Controller
                                        name={`navBarItems.${navIndex}.submenu.${subIndex}.icon`}
                                        control={control}
                                        render={({ field }) => (
                                            <MaterialIconSelect
                                                value={field.value}
                                                onChange={field.onChange}
                                                options={materialIconOptions}
                                                placeholder="Select Material Icon"
                                            />
                                        )}
                                    />

                                    {submenuErrors?.[subIndex]?.icon?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {submenuErrors[subIndex]?.icon?.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Color <span className="text-xs text-gray-400">(Optional)</span>
                                    </label>

                                    <Controller
                                        name={`navBarItems.${navIndex}.submenu.${subIndex}.color`}
                                        control={control}
                                        render={({ field }) => (
                                            <ColorPickerField
                                                value={field.value || "#000000"}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />

                                    {submenuErrors?.[subIndex]?.color?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {submenuErrors[subIndex]?.color?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end justify-end pt-1">
                <Button
                    type="button"
                    className="!px-3 !py-1 text-sm bg-purple-500 text-white"
                    onClick={() =>
                        append({
                            name: "",
                            route: "",
                            icon: "",
                            color: "#000000",
                        })
                    }
                >
                    + Add Submenu
                </Button>
            </div>
        </div>
    );
};

// ====================== Main Form ======================
const MenuForm: React.FC<MenuFormProps> = ({
    mode,
    initialData = null,
    menuId,
    onSuccess,
}) => {
    const router = useRouter();
    const [isSubmit, setIsSubmit] = useState(false);

    const {
        handleSubmit,
        reset,
        control,
        register,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: defaultValue,
    });

    const {
        fields: navFields,
        append: appendNav,
        remove: removeNav,
        replace: replaceNav,
    } = useFieldArray({
        control,
        name: "navBarItems",
    });

    const navBarItemErrors =
        (errors?.navBarItems as
            | Array<{
                name?: { message?: string };
                route?: { message?: string };
                icon?: { message?: string };
                color?: { message?: string };
                submenu?: Array<{
                    name?: { message?: string };
                    route?: { message?: string };
                    icon?: { message?: string };
                    color?: { message?: string };
                }>;
            }>
            | undefined) || [];

    useEffect(() => {
        if (mode === "edit" && initialData) {
            const mappedNavItems: TNavItemForm[] =
                initialData?.navBarItems && initialData.navBarItems.length > 0
                    ? initialData.navBarItems.map((nav) => ({
                        name: nav?.name || "",
                        route: nav?.route || "",
                        icon: nav?.icon || "",
                        color: nav?.color || "#000000",
                        submenu:
                            nav?.submenu && nav.submenu.length > 0
                                ? nav.submenu.map((sub) => ({
                                    name: sub?.name || "",
                                    route: sub?.route || "",
                                    icon: sub?.icon || "",
                                    color: sub?.color || "#000000",
                                }))
                                : [],
                    }))
                    : defaultValue.navBarItems;

            reset({
                navBarItems: mappedNavItems,
            });

            replaceNav(mappedNavItems);
        }

        if (mode === "create") {
            reset(defaultValue);
            replaceNav(defaultValue.navBarItems);
        }
    }, [mode, initialData, reset, replaceNav]);

    const formSubmit = async (data: FormValues) => {
        setIsSubmit(true);

        const payload = {
            navBarItems: (data?.navBarItems || []).map((nav, navIndex) => ({
                id: navIndex + 1,
                name: nav?.name,
                route: nav?.route,
                icon: nav?.icon || "",
                color: nav?.color || "#000000",
                submenu: (nav?.submenu || []).map((sub, subIndex) => ({
                    id: subIndex + 1,
                    name: sub?.name,
                    route: sub?.route,
                    icon: sub?.icon || "",
                    color: sub?.color || "#000000",
                })),
            })),
        };

        try {
            const res =
                mode === "edit" && menuId
                    ? await MenuService.updateMenu(menuId, payload)
                    : await MenuService.createMenu(payload);

            if (res?.success) {
                ToastService.success(res?.message || "Success");

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/admin/customer-front/menu");
                }
            } else {
                ToastService.error(res?.message || "Failed");
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
                            {mode === "edit" ? "Edit Menu" : "Create Menu"}
                        </h3>

                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/menu")}
                            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                            Back
                        </Button>
                    </div>

                    <div className="p-4 md:p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                                Main Menu Items
                            </h4>
                        </div>

                        <div className="space-y-4">
                            {navFields.map((field, navIndex) => (
                                <div
                                    key={field.id}
                                    className="border border-gray-200 dark:border-gray-600 rounded-2xl p-5 bg-white dark:bg-gray-900"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            Main Menu #{navIndex + 1}
                                        </h4>

                                        <button
                                            type="button"
                                            onClick={() => removeNav(navIndex)}
                                            className={`text-sm font-medium ${navFields.length === 1
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-red-500"
                                                }`}
                                            disabled={navFields.length === 1}
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                                Name
                                            </label>
                                            <input
                                                {...register(`navBarItems.${navIndex}.name`)}
                                                placeholder="Shop"
                                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                            />
                                            {navBarItemErrors?.[navIndex]?.name?.message && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {navBarItemErrors[navIndex]?.name?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                                Route
                                            </label>
                                            <input
                                                {...register(`navBarItems.${navIndex}.route`)}
                                                placeholder="/shop"
                                                className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                                            />
                                            {navBarItemErrors?.[navIndex]?.route?.message && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {navBarItemErrors[navIndex]?.route?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                                Icon <span className="text-xs text-gray-400">(Optional)</span>
                                            </label>

                                            <Controller
                                                name={`navBarItems.${navIndex}.icon`}
                                                control={control}
                                                render={({ field }) => (
                                                    <MaterialIconSelect
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        options={materialIconOptions}
                                                        placeholder="Select Material Icon"
                                                    />
                                                )}
                                            />

                                            {navBarItemErrors?.[navIndex]?.icon?.message && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {navBarItemErrors[navIndex]?.icon?.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                                Color <span className="text-xs text-gray-400">(Optional)</span>
                                            </label>

                                            <Controller
                                                name={`navBarItems.${navIndex}.color`}
                                                control={control}
                                                render={({ field }) => (
                                                    <ColorPickerField
                                                        value={field.value || "#000000"}
                                                        onChange={field.onChange}
                                                    />
                                                )}
                                            />

                                            {navBarItemErrors?.[navIndex]?.color?.message && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {navBarItemErrors[navIndex]?.color?.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <SubmenuFields
                                        control={control}
                                        register={register}
                                        errors={errors}
                                        navIndex={navIndex}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-end justify-end">
                            <Button
                                type="button"
                                className="!px-4 !py-2 bg-green-500 text-white"
                                onClick={() =>
                                    appendNav({
                                        name: "",
                                        route: "",
                                        icon: "",
                                        color: "#000000",
                                        submenu: [],
                                    })
                                }
                            >
                                + Add Main Menu
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t dark:border-gray-700 px-4 md:px-6 py-4">
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/menu")}
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
                                "Update Menu"
                            ) : (
                                "Create Menu"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MenuForm;