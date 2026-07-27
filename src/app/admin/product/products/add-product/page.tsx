"use client";
import { IProductBrandData } from "@admin/@interfaces/product/productBrand.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import Button from "@admin/components/core/Button/Button";
import ElementorLikeEditor from "@admin/components/core/Editor/CustomEditor";
import MultipleImageUpload from "@admin/components/core/Input/ImageUpload";
import Input from "@admin/components/core/Input/Input";
import SelectComponent from "@admin/components/core/Select/Select";
import Switch from "@admin/components/core/SwitchButton/SingleSwitch";
import AuthLayout from "@admin/layouts/AuthLayout";
import { getArrayFieldErrorMessage, registerWithLiveValidation } from "@admin/utils";
import {
  buildGroupedWebsiteOptions,
  expandWebsiteSelections,
} from "@admin/utils/websiteGroups";
import { processDescriptionDesImages } from "@admin/utils/processDescriptionImage";
import { stripTrailingEmptyQuillParagraphs } from "@admin/utils/stripTrailingEmptyQuillParagraphs";
import { ToastService } from "@admin/utils/toastr.service";
import { yupResolver } from "@hookform/resolvers/yup";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";

const SingleImageUpload = dynamic(
  () => import("@admin/components/core/Input/SingleImageUpload"),
  { ssr: false },
);
const RichTextEditor = dynamic(
  () => import("@admin/components/core/Editor/RichTextEditor"),
  { ssr: false },
);

const defaultValue: any = {
  main_title: "",
  slug: "",
  category: "",
  brand: "",
  sale_price: "",
  regular_price: "",
  purchase_price: "",
  resaler_price: "",
  offer_text: "",
  stock_status: "",
  warranty: "",
  // short_description: "",
  featuredImage: null,
  featured_image_title: "",
  productImages: [],
  product_image_title: [] as string[],
  product_image_text: [] as string[],
  attributes: Array(11).fill({ value: "" }),
  websites: "",
  seo_title: "",
  seo_description: "",
  is_seo: false,
  focus_keyword: "",
};

export const ProductSchema = yup.object({
  main_title: yup.string().required("Title is required"),
  slug: yup.string().required("Slug is required"),
  category: yup.mixed().nullable().required(),
  websites: yup.mixed().nullable().required(),
  brand: yup.mixed().required("Brand is required"),
  sale_price: yup.string().required("Sale price is required"),
  regular_price: yup.string().required("Regular price is required"),
  purchase_price: yup.string().required("Purchase price is required"),
  resaler_price: yup.string(),
  offer_text: yup.string(),
  stock_status: yup.mixed().required("Stock status is required"),
  warranty: yup.mixed().required("Warranty is required"),
  // short_description: yup.string(),
  featuredImage: yup.mixed(),
  featured_image_title: yup.string(),
  productImages: yup.array(),
  product_image_title: yup.array().of(yup.string()),
  product_image_text: yup
    .array()
    .of(yup.string().max(26, "Maximum 26 characters allowed")),
  is_seo: yup.boolean(),
  seo_title: yup.string(),
  seo_description: yup.string(),
  focus_keyword: yup.string(),
});

const Page: React.FC = () => {
  const router = useRouter();
  // const [content, setContent] = useState("");
  const [priceInfo, setPriceInfo] = useState<boolean>(true);
  const [seoInfo, setSEOInfo] = useState<boolean>(false);
  const [attributesInfo, setAttributesInfo] = useState<boolean>(false);
  const [productCategoryData, setProductCategoryData] = useState<any[]>([]);
  const [websiteOption, setWebsiteOption] = useState<any[]>([]);
  const [productBrandData, setProductBrandData] = useState<IProductBrandData[]>(
    [],
  );
  const [content, setContent] = useState("");
  const handleAddChange = (value: any) => {
    setContent(value);
  };
  const [htmlData, setHtmlData] = useState("");

  const categoryOptions = productCategoryData?.map((item) => ({
    label: item.key,
    value: item.value,
  }));
  const websiteOptions = useMemo(
    () => buildGroupedWebsiteOptions(websiteOption),
    [websiteOption],
  );
  const brandOptions = productBrandData?.map((item) => ({
    label: item.key,
    value: item.value,
  }));

  const titles = [
    "Model No.",
    "Movement",
    "Case Diameter",
    "Case Thickness",
    "Band Width",
    "Case Material",
    "Band Material",
    "Window Material",
    "Water Resistance Depth",
    "Weight",
    "Feature",
  ];

  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const productImagesLen = watch("productImages")?.length ?? 0;
  useEffect(() => {
    const syncArrayField = (
      field: "product_image_title" | "product_image_text",
    ) => {
      const current = getValues(field);
      const arr = Array.isArray(current) ? [...current] : [];
      if (arr.length === productImagesLen) return;
      const next = arr.slice(0, productImagesLen);
      while (next.length < productImagesLen) next.push("");
      setValue(field, next, { shouldDirty: false });
    };
    syncArrayField("product_image_title");
    syncArrayField("product_image_text");
  }, [productImagesLen, getValues, setValue]);

  const toSlug = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^_+|_+$/g, "")
      .replace(/_{2,}/g, "-");

  const keyRegister = register("main_title", {
    onChange: (e) => {
      const k = e.target.value as string;
      setValue("slug", toSlug(k), { shouldValidate: true, shouldDirty: true });
    },
  });

  const formSubmit = async (fromData: any) => {
    const attributes = fromData.attributes.map((attr: any, index: number) => ({
      title: titles[index],
      value: attr?.value || "",
    }));

    if (!htmlData) {
      ToastService.error("htmlData not found");
      return;
    }

    const data: any = {
      title: fromData.main_title || "",
      slug: fromData.slug,
      categories: Array.isArray(fromData.category)
        ? fromData.category.map((sync: any) => sync.value)
        : [],
      websites: expandWebsiteSelections(fromData.websites ?? []),
      brand: fromData.brand?.value || "",
      short_description: stripTrailingEmptyQuillParagraphs(content || ""),
      pricing: {
        sale_price: parseFloat(fromData.sale_price) || 0,
        regular_price: parseFloat(fromData.regular_price) || 0,
        purchase_price: parseFloat(fromData.purchase_price) || 0,
      },
      wholesale_pricing: {
        resale_price: parseFloat(fromData.resaler_price) || 0,
      },
      inventory: { stock_status: "out-of-stock" },
      warranty: fromData.warranty?.value || "",
      description: htmlData,
      attributes,
      seo_title: fromData.seo_title || "",
      seo_description: fromData.seo_description || "",
      is_seo: seoInfo,
      focus_keyword: fromData.focus_keyword || "",
      featured_image_title: fromData.featured_image_title?.trim() || "",
      product_image_title: (Array.isArray(fromData.productImages)
        ? fromData.productImages
        : []
      ).map((_: unknown, i: number) =>
        String(
          Array.isArray(fromData.product_image_title)
            ? (fromData.product_image_title[i] ?? "")
            : "",
        ).trim(),
      ),
      product_image_text: (Array.isArray(fromData.productImages)
        ? fromData.productImages
        : []
      ).map((_: unknown, i: number) =>
        String(
          Array.isArray(fromData.product_image_text)
            ? (fromData.product_image_text[i] ?? "")
            : "",
        ).trim(),
      ),
    };

    const formData = new FormData();
    data.description = await processDescriptionDesImages(htmlData, formData);
    formData.append("data", JSON.stringify(data));

    if (fromData.featuredImage instanceof File) {
      formData.append("featuredImage", fromData.featuredImage);
    } else if (fromData.featuredImage?.file instanceof File) {
      formData.append("featuredImage", fromData.featuredImage.file);
    }

    if (Array.isArray(fromData.productImages)) {
      fromData.productImages.forEach((img: any) => {
        if (img instanceof File) {
          formData.append("productImages", img);
        } else if (img?.file instanceof File) {
          formData.append("productImages", img.file);
        }
      });
    }

    try {
      const res = await productService.createProduct(formData);
      if (res?.success) {
        router.push(`/product/products/edit/${res?.data?._id}`);
        ToastService.success(res?.message);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const handleToggle = (isChecked: boolean) => {
    setPriceInfo(isChecked);
  };
  const handleToggleSEO = (isChecked: boolean) => {
    setSEOInfo(isChecked);
  };
  const handleToggleAttributes = (isChecked: boolean) => {
    setAttributesInfo(isChecked);
  };

  const warrantyOptions = [
    {
      label: "৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি",
      value: "৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি",
    },
    { label: "১ বছরের ওয়ারেন্টি", value: "১ বছরের ওয়ারেন্টি" },
    { label: "২ বছরের ওয়ারেন্টি", value: "২ বছরের ওয়ারেন্টি" },
    { label: "৩ বছরের ওয়ারেন্টি", value: "৩ বছরের ওয়ারেন্টি" },
    { label: "১ মাসের ওয়ারেন্টি", value: "১ মাসের ওয়ারেন্টি" },
    { label: "৩ মাসের ওয়ারেন্টি", value: "৩ মাসের ওয়ারেন্টি" },
    { label: "৬ মাসের ওয়ারেন্টি", value: "৬ মাসের ওয়ারেন্টি" },
    {
      label: "এই পণ্যে কোনো ওয়ারেন্টি নেই",
      value: "এই পণ্যে কোনো ওয়ারেন্টি নেই",
    },
  ];

  const fetchProductCategory = () => {
    ProductCategoryService.getProductCategorySuggestions()
      .then((res: any) => {
        if (res?.success) {
          setProductCategoryData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchWebsite = () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          setWebsiteOption(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchProductBrand = () => {
    ProductBrandService.getProductBrandSuggestions()
      .then((res: any) => {
        if (res?.success) {
          setProductBrandData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    fetchProductBrand();
    fetchProductCategory();
    fetchWebsite();
  }, []);

  return (
    <AuthLayout>
      <div className="px-4 py-3">
        <h2 className="text-2xl font-bold">Add Products</h2>
      </div>

      <div className="min-h-[70vh] px-4 w-full">
        <form
          action=""
          encType="multipart/form-data"
          onSubmit={handleSubmit(formSubmit)}
        >
          <div className="2xl:flex 2xl:items-start gap-4 2xl:h-[calc(100vh-140px)] 2xl:overflow-hidden">
            <div className="2xl:w-3/4 w-full 2xl:h-full 2xl:overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg dark:text-gray-300">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl font-semibold text-nowrap">
                    Product Type
                  </h3>
                  <div className="grid md:grid-cols-1 grid-cols-1 gap-x-5 items-center w-full">
                    <div className="w-full">
                      <Controller
                        name="websites"
                        control={control}
                        defaultValue={null}
                        render={({ field }) => (
                          <SelectComponent
                            options={websiteOptions}
                            value={field.value}
                            onChange={(val: any) => field.onChange(val || [])}
                            placeholder="Select product type"
                            isMulti
                            isRequired
                            className="w-full"
                          />
                        )}
                      />
                      {errors.category && (
                        <p className="text-red-500 text-sm">
                          {errors.category.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div>
                    <Input
                      label={"Title"}
                      placeholder="Enter title"
                      registerProperty={keyRegister}
                      errorText={errors?.main_title?.message}
                      isRequired
                    />
                  </div>
                  <div>
                    <Input
                      label={"Slug"}
                      placeholder="Enter Slug"
                      registerProperty={register("slug")}
                      errorText={errors?.slug?.message}
                      isRequired
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5 items-center">
                  <div>
                    <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                      Category{" "}
                      <span className="text-red-400 font-inter text-[12px] font-semibold">
                        *
                      </span>
                    </p>
                    <Controller
                      name="category"
                      control={control}
                      defaultValue={null}
                      render={({ field }) => (
                        <SelectComponent
                          options={categoryOptions}
                          value={field.value}
                          onChange={(val: any) => field.onChange(val || [])}
                          placeholder="Select Category"
                          isMulti
                        />
                      )}
                    />
                    {errors.category && (
                      <p className="text-red-500 text-sm">
                        {errors.category.message as string}
                      </p>
                    )}
                  </div>

                  <div className=" ">
                    <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 ">
                      Brand{" "}
                      <span className="text-red-400 font-inter text-[12px] font-semibold">
                        *
                      </span>
                    </p>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          options={brandOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Brand"
                          className=""
                          isRequired
                        />
                      )}
                    />
                    {errors.brand && (
                      <p className="text-red-500 text-sm">
                        {errors.brand.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                <h3 className="text-xl font-semibold">Seo Information</h3>
                <div className="flex items-center gap-2 py-4">
                  <h4>Is SEO Enabled</h4>
                  <Switch onToggle={handleToggleSEO} default={false} />
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5 ">
                  <div>
                    <Input
                      label={"Meta Title"}
                      placeholder="Enter meta title"
                      registerProperty={register("seo_title")}
                      errorText={errors?.slug?.message}
                    />
                  </div>
                  <div>
                    <Input
                      label={"Keyword"}
                      placeholder="Enter keyword"
                      registerProperty={register("focus_keyword")}
                      errorText={errors?.focus_keyword?.message}
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <Input
                    label={"Meta Description"}
                    placeholder="Enter meta description"
                    registerProperty={register("seo_description")}
                    errorText={errors?.slug?.message}
                    type="textarea"
                  />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-8 rounded-lg mt-4 ">
                <h3 className="text-xl font-semibold">Pricing and Stock</h3>
                <div className="mt-2 flex items-center  gap-4">
                  <p>Add More Info</p>
                  <Switch onToggle={handleToggle} default={true} />
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5">
                  <Input
                    label={"Regular Price"}
                    placeholder="Enter regular price"
                    registerProperty={register("regular_price")}
                    errorText={errors?.regular_price?.message}
                    type="number"
                    isRequired
                  />
                  <Input
                    label={"Sale Price"}
                    placeholder="Enter sale price"
                    registerProperty={register("sale_price")}
                    errorText={errors?.sale_price?.message}
                    type="number"
                    isRequired
                  />
                  <Input
                    label={"Offer Text"}
                    placeholder="Enter Text"
                    registerProperty={register("offer_text")}
                    errorText={errors?.offer_text?.message}
                    type="text"
                  />
                  <Input
                    label={"Purchase Price"}
                    placeholder="Enter purchase price"
                    registerProperty={register("purchase_price")}
                    errorText={errors?.purchase_price?.message}
                    type="number"
                    isRequired
                  />
                  {priceInfo && (
                    <>
                      <Input
                        label={"Resaler Price"}
                        placeholder="Enter Resaler price "
                        registerProperty={register("resaler_price")}
                        errorText={errors?.resaler_price?.message}
                        type="number"
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-8 rounded-lg mt-4 ">
                <h3 className="text-xl font-semibold">Infos</h3>

                <div className="grid grid-cols-2 gap-x-5">
                  <div className="w-full mt-4">
                    <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 ">
                      Warranty{" "}
                      <span className="text-red-400 font-inter text-[12px] font-semibold">
                        *
                      </span>
                    </p>
                    <Controller
                      name="warranty"
                      control={control}
                      render={({ field }) => (
                        <SelectComponent
                          options={warrantyOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Warranty"
                          className=""
                          isRequired
                        />
                      )}
                    />
                    {errors.warranty && (
                      <p className="text-red-500 text-sm">
                        {errors.warranty.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-8 rounded-lg mt-4">
                <div className="my-2 flex items-center gap-4">
                  <h3 className="text-xl font-semibold">Attributes</h3>
                  <Switch onToggle={handleToggleAttributes} default={false} />
                </div>

                {attributesInfo && (
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5 gap-y-4">
                    {titles.map((title, index) => (
                      <Input
                        noMargin
                        key={index}
                        label={title}
                        placeholder={`Enter ${title}`}
                        registerProperty={register(`attributes.${index}.value`)}
                        type="text"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                <div className="w-full">
                  {/* <Input
                    type="textarea"
                    label={"Short Description"}
                    placeholder="Enter short description"
                    registerProperty={register("short_description")}
                    errorText={errors?.short_description?.message}
                  /> */}
                  <h3 className="text-sm font-semibold dark:text-gray-300 pb-3">
                    Short Description
                  </h3>

                  <RichTextEditor
                    content={content}
                    onChange={handleAddChange}
                    placeholder="Start writing your content here..."
                  />
                </div>
              </div>
              <div>
                <ElementorLikeEditor
                  onChange={(finalHtml) => setHtmlData(finalHtml)}
                />
              </div>
            </div>
            {/* Right: media + submit */}
            <div className="2xl:w-1/4 w-full 2xl:sticky 2xl:self-start 2xl:max-h-[calc(100vh-140px)] 2xl:overflow-y-auto">
              <div className="bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg p-4">
                <div className="w-full">
                  <h2 className="text-lg font-semibold">Upload Image</h2>

                  <div className="mt-2">
                    <Controller
                      control={control}
                      name="featuredImage"
                      render={({ field: { onChange, value } }) => (
                        <SingleImageUpload
                          onChange={onChange}
                          value={value}
                          label="Featured Image"
                          required
                          accept={["image/jpeg", "image/png"]}
                          maxSize={5 * 1024 * 1024}
                        />
                      )}
                    />
                    {errors.featuredImage && (
                      <p className="text-red-500 text-sm">
                        {errors.featuredImage.message as string}
                      </p>
                    )}
                    <div className="mt-3">
                      <Input
                        label="Featured image title (alt)"
                        placeholder="Title for featured image"
                        registerProperty={register("featured_image_title")}
                        errorText={
                          errors?.featured_image_title?.message as string
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <Controller
                        control={control}
                        name="productImages"
                        render={({ field: { onChange, value } }) => (
                          <MultipleImageUpload
                            onChange={onChange}
                            value={value}
                            label="Product Images"
                            layout="list"
                            pasteRequireClick={true}
                            renderImageFields={(i) => (
                              <>
                                <Input
                                  noMargin
                                  label="Image (alt) Tag"
                                  placeholder={`Enter your (alt) Tag`}
                                  registerProperty={register(
                                    `product_image_title.${i}`,
                                  )}
                                />
                                <Input
                                  noMargin
                                  label="Features Text"
                                  placeholder={`Enter your features text`}
                                  registerProperty={registerWithLiveValidation(
                                    register,
                                    trigger,
                                    `product_image_text.${i}`,
                                  )}
                                  errorText={getArrayFieldErrorMessage(
                                    errors?.product_image_text,
                                    i,
                                  )}
                                />
                              </>
                            )}
                          />
                        )}
                      />
                      {errors.productImages && (
                        <p className="text-red-500 text-sm">
                          {errors.productImages.message as string}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-3 bg-white dark:bg-gray-700 rounded-lg p-4">
                <Link href="/admin/product/products">
                  <Button type="button" className="bg-gray-400 text-gray-800">
                    Cancel
                  </Button>
                </Link>

                <Button
                  className="bg-blue-600 text-nowrap"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Page;
