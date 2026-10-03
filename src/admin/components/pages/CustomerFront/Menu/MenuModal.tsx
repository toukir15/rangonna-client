"use client";

import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Controller,
    useFieldArray,
    useForm,
    Control,
    UseFormRegister,
    UseFormSetValue,
    FieldErrors,
} from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { MenuContext } from "@/app/admin/customer-front/menu/page";
import { MenuService } from "@admin/@services/apis/CustomerFront/MenuService/Menu.service";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import MenuCategorySelect from "./MenuCategorySelect";
import {
    categoryMenuRoute,
    MenuCategoryOption,
    resolveMenuCategoryId,
} from "./menuCategory";

// ====================== Types ======================
type TSubmenuForm = {
    name: string;
    route: string;
    category?: string;
    icon?: string;
};

type TNavItemForm = {
    name: string;
    route: string;
    category?: string;
    icon?: string;
    submenu: TSubmenuForm[];
};

type FormValues = {
    navBarItems: TNavItemForm[];
};

type TSubmenu = {
    id?: number;
    name?: string;
    route?: string;
    category?: string;
    icon?: string;
};

type TNavItem = {
    id?: number;
    name?: string;
    route?: string;
    category?: string;
    icon?: string;
    submenu?: TSubmenu[];
};

type TMenuItem = {
    _id: string;
    navBarItems?: TNavItem[];
};

type TContext = {
    modalMode: "Add" | "Edit";
    items: TMenuItem | null;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    fetchMenu: () => void;
    isModalOpen: boolean;
};

// ====================== Default Value ======================
const defaultValue: FormValues = {
    navBarItems: [
        {
            name: "",
            route: "",
            category: "",
            icon: "",
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
                category: yup.string().optional().default(""),
                route: yup.string().trim().required("Route is required"),
                icon: yup.string().optional().default(""),
                submenu: yup.array().of(
                    yup.object({
                        name: yup.string().trim().required("Submenu name is required"),
                        category: yup.string().optional().default(""),
                        route: yup.string().trim().required("Submenu route is required"),
                        icon: yup.string().optional().default(""),
                    })
                ),
            })
        )
        .min(1, "At least one menu is required")
        .required(),
});

// ====================== Emoji Picker Field ======================
type EmojiPickerFieldProps = {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const EmojiPickerField: React.FC<EmojiPickerFieldProps> = ({
    value,
    onChange,
    placeholder = "Select Emoji",
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onChange(emojiData.emoji);
        setOpen(false);
    };

    const handleClear = () => {
        onChange("");
        setOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl leading-none">{value || "😊"}</span>
                        <span
                            className={`${value ? "text-gray-800 dark:text-white" : "text-gray-400"
                                }`}
                        >
                            {value || placeholder}
                        </span>
                    </div>

                    <Icon name={open ? "expand_less" : "expand_more"} />
                </button>

                {value ? (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="shrink-0 px-3 py-2 border rounded-lg text-sm text-red-500 border-red-200 hover:bg-red-50 dark:border-red-500/40 dark:hover:bg-red-500/10"
                    >
                        Clear
                    </button>
                ) : null}
            </div>

            {open && (
                <div className="absolute bottom-full left-0 mb-2 z-[9999] shadow-xl rounded-xl overflow-hidden">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        searchDisabled={false}
                        skinTonesDisabled={false}
                        width={320}
                        height={300}
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}
        </div>
    );
};

// ====================== Submenu Component ======================
type SubmenuFieldsProps = {
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    setValue: UseFormSetValue<FormValues>;
    errors: FieldErrors<FormValues>;
    navIndex: number;
    categories: MenuCategoryOption[];
};

const SubmenuFields: React.FC<SubmenuFieldsProps> = ({
    control,
    register,
    setValue,
    errors,
    navIndex,
    categories,
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
            }>
            | undefined) || [];

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Submenu
                </h4>

                {/* <Button
                    type="button"
                    className="!px-3 !py-1 text-sm bg-purple-500 text-white"
                    onClick={() =>
                        append({
                            name: "",
                            route: "",
                            icon: "",
                        })
                    }
                >
                    + Add Submenu
                </Button> */}
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Name
                                    </label>
                                    <input
                                        {...register(`navBarItems.${navIndex}.submenu.${subIndex}.name`)}
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
                                        Category
                                    </label>
                                    <Controller
                                        name={`navBarItems.${navIndex}.submenu.${subIndex}.category`}
                                        control={control}
                                        render={({ field }) => (
                                            <MenuCategorySelect
                                                value={field.value}
                                                options={categories}
                                                onChange={(categoryId) => {
                                                    field.onChange(categoryId);
                                                    if (categoryId) {
                                                        setValue(
                                                            `navBarItems.${navIndex}.submenu.${subIndex}.route`,
                                                            categoryMenuRoute(categoryId),
                                                            { shouldValidate: true }
                                                        );
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                        Route
                                    </label>
                                    <input
                                        {...register(`navBarItems.${navIndex}.submenu.${subIndex}.route`)}
                                        placeholder="/churi or a custom path"
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
                                        Emoji <span className="text-xs text-gray-400">(Optional)</span>
                                    </label>

                                    <Controller
                                        name={`navBarItems.${navIndex}.submenu.${subIndex}.icon`}
                                        control={control}
                                        render={({ field }) => (
                                            <EmojiPickerField
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select Emoji"
                                            />
                                        )}
                                    />

                                    {submenuErrors?.[subIndex]?.icon?.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {submenuErrors[subIndex]?.icon?.message}
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
                            category: "",
                            icon: "",
                        })
                    }
                >
                    + Add Submenu
                </Button>
            </div>
        </div>
    );
};

// ====================== Main Component ======================
const MenuModal: React.FC = () => {
    const { modalMode, items, setIsModalOpen, fetchMenu, isModalOpen } =
        useContext(MenuContext) as TContext;

    const [isSubmit, setIsSubmit] = useState(false);
    const [categories, setCategories] = useState<MenuCategoryOption[]>([]);

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

    const {
        fields: navFields,
        append: appendNav,
        // remove: removeNav,
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
                submenu?: Array<{
                    name?: { message?: string };
                    route?: { message?: string };
                    icon?: { message?: string };
                }>;
            }>
            | undefined) || [];

    useEffect(() => {
        if (!isModalOpen) return;
        ProductCategoryService.getProductCategory({ page: 1, limit: 100, sort: "key" })
            .then((res) => {
                const rows = Array.isArray(res?.data?.data)
                    ? res.data.data
                    : Array.isArray(res?.data)
                        ? res.data
                        : [];
                setCategories(
                    rows
                        .filter((row: { _id?: string; key?: string; value?: string }) =>
                            Boolean(row?._id && row?.key && row?.value)
                        )
                        .map((row: { _id: string; key: string; value: string }) => ({
                            _id: String(row._id),
                            key: row.key,
                            value: row.value,
                        }))
                );
            })
            .catch(() => undefined);
    }, [isModalOpen]);

    useEffect(() => {
        if (!isModalOpen) return;

        if (modalMode === "Edit" && items) {
            const mappedNavItems: TNavItemForm[] =
                items?.navBarItems && items.navBarItems.length > 0
                    ? items.navBarItems.map((nav) => {
                        const category = resolveMenuCategoryId(nav, categories);
                        return {
                        name: nav?.name || "",
                        route: category ? categoryMenuRoute(category) : nav?.route || "",
                        category,
                        icon: nav?.icon || "",
                        submenu:
                            nav?.submenu && nav.submenu.length > 0
                                ? nav.submenu.map((sub) => {
                                    const subCategory = resolveMenuCategoryId(sub, categories);
                                    return {
                                    name: sub?.name || "",
                                    route: subCategory ? categoryMenuRoute(subCategory) : sub?.route || "",
                                    category: subCategory,
                                    icon: sub?.icon || "",
                                };
                                })
                                : [],
                    };
                    })
                    : defaultValue.navBarItems;

            reset({
                navBarItems: mappedNavItems,
            });

            replaceNav(mappedNavItems);
        } else {
            reset(defaultValue);
            replaceNav(defaultValue.navBarItems);
        }
    }, [isModalOpen, modalMode, items, categories, reset, replaceNav]);

    const onCloseModal = () => {
        setIsModalOpen(false);
        reset(defaultValue);
        replaceNav(defaultValue.navBarItems);
    };

    const formSubmit = async (data: FormValues) => {
        setIsSubmit(true);

        const payload = {
            navBarItems: (data?.navBarItems || []).map((nav, navIndex) => ({
                id: navIndex + 1,
                name: nav?.name,
                category: nav?.category || "",
                route: nav?.category ? categoryMenuRoute(nav.category) : nav?.route,
                icon: nav?.icon || "",
                submenu: (nav?.submenu || []).map((sub, subIndex) => ({
                    id: subIndex + 1,
                    name: sub?.name,
                    category: sub?.category || "",
                    route: sub?.category ? categoryMenuRoute(sub.category) : sub?.route,
                    icon: sub?.icon || "",
                })),
            })),
        };

        try {
            const res =
                modalMode === "Edit" && items?._id
                    ? await MenuService.updateMenu(items._id, payload)
                    : await MenuService.createMenu(payload);

            if (res?.success) {
                ToastService.success(res?.message);
                onCloseModal();
                fetchMenu();
            } else {
                ToastService.error(res?.message);
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
                maxWidth="max-w-5xl"
            >
                <Modal.Header className="flex items-center justify-between border-b dark:border-gray-700 pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {modalMode === "Edit" ? "Edit Menu" : "Create Menu"}
                    </h3>

                    <Icon
                        name="close"
                        onClick={onCloseModal}
                        className="text-gray-600 cursor-pointer dark:text-gray-300"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                                Main Menu Items
                            </h4>

                            {/* <Button
                                type="button"
                                className="!px-4 !py-2 bg-blue-500 text-white"
                                onClick={() =>
                                    appendNav({
                                        name: "",
                                        route: "",
                                        icon: "",
                                        submenu: [],
                                    })
                                }
                            >
                                + Add Main Menu
                            </Button> */}
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

                                        {/* <button
                                            type="button"
                                            onClick={() => removeNav(navIndex)}
                                            className={`text-sm font-medium ${navFields.length === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-red-500"
                                                }`}
                                            disabled={navFields.length === 1}
                                        >
                                            Remove
                                        </button> */}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                Category
                                            </label>
                                            <Controller
                                                name={`navBarItems.${navIndex}.category`}
                                                control={control}
                                                render={({ field }) => (
                                                    <MenuCategorySelect
                                                        value={field.value}
                                                        options={categories}
                                                        onChange={(categoryId) => {
                                                            field.onChange(categoryId);
                                                            if (categoryId) {
                                                                setValue(
                                                                    `navBarItems.${navIndex}.route`,
                                                                    categoryMenuRoute(categoryId),
                                                                    { shouldValidate: true }
                                                                );
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                                Route
                                            </label>
                                            <input
                                                {...register(`navBarItems.${navIndex}.route`)}
                                                placeholder="/churi or a custom path"
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
                                                Emoji <span className="text-xs text-gray-400">(Optional)</span>
                                            </label>

                                            <Controller
                                                name={`navBarItems.${navIndex}.icon`}
                                                control={control}
                                                render={({ field }) => (
                                                    <EmojiPickerField
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select Emoji"
                                                    />
                                                )}
                                            />

                                            {navBarItemErrors?.[navIndex]?.icon?.message && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {navBarItemErrors[navIndex]?.icon?.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <SubmenuFields
                                        control={control}
                                        register={register}
                                        setValue={setValue}
                                        errors={errors}
                                        navIndex={navIndex}
                                        categories={categories}
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
                                        category: "",
                                        icon: "",
                                        submenu: [],
                                    })
                                }
                            >
                                + Add Main Menu
                            </Button>
                        </div>
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
                            "Update Menu"
                        ) : (
                            "Create Menu"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </form>
    );
};

export default MenuModal;