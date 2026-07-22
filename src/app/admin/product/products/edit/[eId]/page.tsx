"use client";
import { IProductBrandData } from "@admin/@interfaces/product/productBrand.interface";
import { IProductCategoryData } from "@admin/@interfaces/product/productCategory.interface";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import Button from "@admin/components/core/Button/Button";
import MultipleImageUpload, {
  ExistingItem,
  GalleryItem,
  NewUploadItem,
} from "@admin/components/core/Input/ImageUpload";
import Input from "@admin/components/core/Input/Input";
import SingleImageUpload from "@admin/components/core/Input/SingleImageUpload";
import SelectComponent from "@admin/components/core/Select/Select";
import Switch from "@admin/components/core/SwitchButton/SingleSwitch";
import AttributesSkeleton from "@admin/components/Skeleton/Product/EditProduct/Attributes.skeleton";
import BasicInfoSkeleton from "@admin/components/Skeleton/Product/EditProduct/BasicInfo.skeleton";
import InfosSkeleton from "@admin/components/Skeleton/Product/EditProduct/Infos.skeleton";
import PriceStockSkeleton from "@admin/components/Skeleton/Product/EditProduct/PriceStock.skeleton";
import StockSkeleton from "@admin/components/Skeleton/Product/EditProduct/Stock.skeleton";
import UploadImageSkeleton from "@admin/components/Skeleton/Product/EditProduct/UploadImage.skeleton";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthLayout from "@admin/layouts/AuthLayout";
import {
  getArrayFieldErrorMessage,
  hasPermission,
  registerWithLiveValidation,
} from "@admin/utils";
import {
  buildGroupedWebsiteOptions,
  expandWebsiteSelections,
  mapUrlsToWebsiteSelections,
} from "@admin/utils/websiteGroups";
import { processDescriptionDesImages } from "@admin/utils/processDescriptionImage";
import { stripTrailingEmptyQuillParagraphs } from "@admin/utils/stripTrailingEmptyQuillParagraphs";
import { ToastService } from "@admin/utils/toastr.service";
import { yupResolver } from "@hookform/resolvers/yup";
// import dynamic from "next/dynamic";
import ElementorLikeEditor from "@admin/components/core/Editor/CustomEditor";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import * as yup from "yup";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import Skeleton from "@admin/components/Skeleton/Skeleton";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@admin/components/core/Editor/RichTextEditor"),
  { ssr: false },
);

const toArray = (resp: any): any[] => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.data)) return resp.data;
  if (Array.isArray(resp.items)) return resp.items;
  if (resp.data && Array.isArray(resp.data.items)) return resp.data.items;
  return [];
};

export const toAbsolute = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXT_PUBLIC_CDN_BASE || "";
  return `${base}${url}`;
};

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

const defaultValue: any = {
  main_title: "",
  slug: "",
  category: [] as any[],
  websites: [] as any[],
  brand: "",
  sale_price: "",
  regular_price: "",
  purchase_price: "",
  wholesale_price: "",
  wholesale_vip_price: "",
  resaler_price: "",
  tv_sale_price: "",
  offer_text: "",
  stock_status: "",
  warranty: "",
  short_description: "",
  featuredImage: null,
  featured_image_title: "",
  productImages: [] as any[],
  product_image_title: [] as string[],
  product_image_text: [] as string[],
  attributes: Array(11).fill({ value: "" }),
  seo_title: "",
  seo_description: "",
  is_seo: false,
  focus_keyword: "",
};

export const ProductSchema = yup.object({
  main_title: yup.string().required("Title is required"),
  slug: yup.string().required("Slug is required"),
  category: yup
    .array()
    .of(
      yup.object({
        label: yup.string().required(),
        value: yup.string().required(),
      }),
    )
    .min(1, "At least one category is required"),
  websites: yup
    .array()
    .of(
      yup.object({
        label: yup.string().required(),
        value: yup.string().required(),
      }),
    )
    .min(1, "At least one Website is required"),
  brand: yup.mixed().required("Brand is required"),
  sale_price: yup.string().required("Sale price is required"),
  regular_price: yup.string().required("Regular price is required"),
  purchase_price: yup.string(),
  wholesale_price: yup.string(),
  wholesale_vip_price: yup.string(),
  resaler_price: yup.string(),
  tv_sale_price: yup.string(),
  offer_text: yup.string(),
  stock_status: yup.mixed().required("Stock status is required"),
  stock_quantity: yup.string(),
  warranty: yup.mixed().required("Warranty is required"),
  short_description: yup.string(),
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
  const { eId } = useParams();
  const isEdit = Boolean(eId);
  const { permissionList } = useGlobalContext();
  const [htmlData, setHtmlData] = useState("");

  // const [content, setContent] = useState<string>("");
  const [priceInfo, setPriceInfo] = useState<boolean>(true);
  const [attributesInfo, setAttributesInfo] = useState<boolean>(false);
  const [attributesDefaultOn, setAttributesDefaultOn] =
    useState<boolean>(false);
  const [productCategoryData, setProductCategoryData] = useState<
    IProductCategoryData[]
  >([]);
  const [websiteOption, setWebsiteOption] = useState<any[]>([]);
  const [productBrandData, setProductBrandData] = useState<IProductBrandData[]>(
    [],
  );
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState("");
  const [seoInfo, setSEOInfo] = useState<boolean>(false);

  const categoryOptions = useMemo(
    () =>
      (productCategoryData ?? []).map((item) => ({
        label: item.key,
        value: item.value,
      })),
    [productCategoryData],
  );
  const webOptionsData = useMemo(
    () => buildGroupedWebsiteOptions(websiteOption),
    [websiteOption],
  );
  const brandOptions = useMemo(
    () =>
      (productBrandData ?? []).map((item) => ({
        label: item.key,
        value: item.value,
      })),
    [productBrandData],
  );
  const stockStatusOptions = [
    { label: "In Stock", value: "in-stock" },
    { label: "Out of Stock", value: "out-of-stock" },
  ];
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

  useEffect(() => {
    (async () => {
      try {
        const [catsRes, brandsRes] = await Promise.all([
          ProductCategoryService.getProductCategorySuggestions(),
          ProductBrandService.getProductBrandSuggestions(),
        ]);
        setProductCategoryData(toArray(catsRes?.data));
        setProductBrandData(brandsRes?.data);
      } catch {
        ToastService.error("Failed to load categories/brands");
      }
    })();
  }, []);

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

  useEffect(() => {
    fetchWebsite();
  }, []);

  useEffect(() => {
    if (!eId) return;
    (async () => {
      try {
        const res: any = await productService.getSingleProduct(eId);
        if (res?.success) setProductDetails(res.data);
        else ToastService.error(res?.message || "Failed to fetch product");
      } catch (err: any) {
        ToastService.error(err?.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    })();
  }, [eId]);

  const {
    handleSubmit,
    register,
    control,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const productImagesWatch = useWatch({ control, name: "productImages" });
  const productImagesLen = productImagesWatch?.length ?? 0;

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

  const keyRegister = register("main_title");

  // const handleEditorChange = (value: any) => setContent(value ?? "");

  useEffect(() => {
    if (!productDetails) return;

    const catValue =
      Array.isArray(productDetails.categories) &&
      productDetails.categories.length
        ? productDetails.categories
        : [];
    const catWebValue =
      Array.isArray(productDetails.websites) && productDetails.websites.length
        ? productDetails.websites
        : [];

    const selectedCategories = categoryOptions.filter((c) =>
      catValue.includes(c.value),
    );
    const selectedWebsites = mapUrlsToWebsiteSelections(
      catWebValue,
      webOptionsData,
    );

    const selectedBrand = brandOptions.find(
      (b) => b.value === productDetails.brand,
    );

    const selectedWarranty =
      warrantyOptions.find((w) => w.value === productDetails.warranty) ?? null;

    const stockStatus = productDetails?.inventory?.stock_status ?? "in-stock";

    const selectedStock =
      stockStatusOptions.find((s) => s.value === stockStatus) ??
      stockStatusOptions[0];

    const attrByTitle: Record<string, string> = {};
    (productDetails.attributes ?? []).forEach((a: any) => {
      if (a?.title) attrByTitle[a.title] = a.value ?? "";
    });
    const attributes = titles.map((t) => ({ value: attrByTitle[t] ?? "" }));

    const existingFeaturedUrl =
      toAbsolute(productDetails?.featured_image?.src) || null;

    const initialGallery: any[] = (productDetails?.images || []).map(
      (im: any) => ({
        isExisting: true,
        src: toAbsolute(im?.src),
        name: im?.title || "",
        id: im?._id,
        previewUrl: toAbsolute(im?.src),
      }),
    );

    reset({
      main_title: productDetails.title ?? "",
      slug: productDetails.slug ?? "",
      category: selectedCategories,
      websites: selectedWebsites,
      brand: selectedBrand,
      sale_price: String(productDetails?.pricing?.sale_price ?? ""),
      regular_price: String(productDetails?.pricing?.regular_price ?? ""),
      purchase_price: String(productDetails?.pricing?.purchase_price ?? ""),
      wholesale_price: String(
        productDetails?.wholesale_pricing?.wholesale_price ?? "",
      ),
      wholesale_vip_price: String(
        productDetails?.wholesale_pricing?.wholesale_vip_price ?? "",
      ),
      resaler_price: String(
        productDetails?.wholesale_pricing?.resale_price ?? "",
      ),
      tv_sale_price: String(productDetails?.pricing?.tv_sale_price ?? ""),
      offer_text: productDetails.offer_text || "",
      stock_status: selectedStock,
      warranty: selectedWarranty,
      // short_description: productDetails?.short_description ?? "",
      featuredImage: existingFeaturedUrl,
      featured_image_title: productDetails?.featured_image?.title ?? "",
      productImages: initialGallery as any[],
      product_image_title: (productDetails?.images || []).map(
        (im: any) => im?.title ?? "",
      ),
      product_image_text: (productDetails?.images || []).map(
        (im: any) => im?.text ?? "",
      ),
      attributes,
      stock_quantity: productDetails?.inventory?.stock_quantity,
      seo_title: productDetails?.seo_title ?? "",
      seo_description: productDetails?.seo_description ?? "",
      focus_keyword: productDetails?.focus_keyword ?? "",
    });
    setContent(productDetails?.short_description || "");
    setSEOInfo(!!productDetails?.is_seo);
    const shouldShowAttrs = attributes.some(
      (a: any) => String(a?.value ?? "").trim().length > 0,
    );
    setAttributesInfo(shouldShowAttrs);
    setAttributesDefaultOn(shouldShowAttrs);

    // setContent(productDetails?.description ?? "");
  }, [productDetails, categoryOptions, brandOptions, webOptionsData]);

  const formSubmit = async (fromData: any) => {
    const attributes = fromData.attributes.map((attr: any, index: number) => ({
      title: titles[index],
      value: attr?.value || "",
    }));

    //  Basic JSON data prepare
    const data: any = {
      title: fromData.main_title || "",
      slug: fromData.slug,
      categories: (fromData.category || []).map((c: any) => c.value),
      websites: expandWebsiteSelections(fromData.websites ?? []),
      brand: fromData.brand?.value || "",
      short_description: stripTrailingEmptyQuillParagraphs(content || ""),
      offer_text: fromData.offer_text || "",
      pricing: {
        sale_price: parseFloat(fromData.sale_price) || 0,
        regular_price: parseFloat(fromData.regular_price) || 0,
        tv_sale_price: parseFloat(fromData.tv_sale_price) || 0,
        ...(hasPermission(permissionList, "product_pricing_view") && {
          purchase_price: parseFloat(fromData.purchase_price) || 0,
        }),
      },
      ...(hasPermission(permissionList, "product_pricing_view") && {
        wholesale_pricing: {
          wholesale_price: parseFloat(fromData.wholesale_price) || 0,
          wholesale_vip_price: parseFloat(fromData.wholesale_vip_price) || 0,
          resale_price: parseFloat(fromData.resaler_price) || 0,
        },
      }),
      inventory: {
        stock_status: fromData?.stock_status?.value || "in-stock",
        stock_quantity: fromData?.stock_quantity || 0,
      },
      warranty: fromData.warranty?.value || "",
      description: "",
      attributes,
      featured_image_title: fromData.featured_image_title?.trim() || "",
      remove_featured_image: false,
      remove_product_images: [] as string[],
      update_product_images: [] as Array<{
        src: string;
        title: string;
        text: string;
      }>,
      product_image_titles: [] as string[],
      product_image_texts: [] as string[],
      seo_title: fromData.seo_title || "",
      seo_description: fromData.seo_description || "",
      is_seo: seoInfo,
      focus_keyword: fromData.focus_keyword || "",
    };

    const formData = new FormData();

    data.description = await processDescriptionDesImages(
      htmlData || "",
      formData,
    );

    //  Product gallery handle
    const items: GalleryItem[] = fromData.productImages || [];
    const titleInputs: string[] = Array.isArray(fromData.product_image_title)
      ? fromData.product_image_title.map((t: any) => String(t ?? "").trim())
      : [];
    const textInputs: string[] = Array.isArray(fromData.product_image_text)
      ? fromData.product_image_text.map((t: any) => String(t ?? "").trim())
      : [];

    // IMPORTANT:
    // Remove detection must be robust across CDN/base differences.
    // We normalize only for *comparison*, but we send absolute `src` values to API.
    const normalizeForCompare = (src: string) => {
      if (!src) return src;
      try {
        // If absolute URL, compare by pathname only.
        const u = new URL(src);
        return u.pathname || src;
      } catch {
        // If relative path, keep as-is.
        return src;
      }
    };

    // new upload image
    items.forEach((it, idx: number) => {
      const imgTitle = titleInputs[idx] || "";
      const imgText = textInputs[idx] || "";
      if (!("isExisting" in it) || it.isExisting === false) {
        const f = (it as NewUploadItem).file;
        formData.append("productImages", f);
        data.product_image_titles.push(imgTitle);
        data.product_image_texts.push(imgText);
      } else {
        const src = (it as ExistingItem).src;
        // send absolute src (UI already holds absolute)
        data.update_product_images.push({
          src,
          title: imgTitle,
          text: imgText,
        });
      }
    });

    // old images
    const remainingExisting = items
      .filter((it) => "isExisting" in it && it.isExisting)
      .map((it) => it as ExistingItem);

    const remainingSrcSet = new Set<string>(
      remainingExisting.map((it) => normalizeForCompare(it.src)),
    );
    const remainingIdSet = new Set<string>(
      remainingExisting.map((it) => String(it.id || "")).filter(Boolean),
    );

    // send delete images
    const allPrev = (productDetails?.images || []).map((im: any) => ({
      id: String(im?._id || ""),
      // keep absolute for API, but also keep comparable key
      absSrc: toAbsolute(im?.src),
      cmpSrc: normalizeForCompare(toAbsolute(im?.src)),
    }));

    data.remove_product_images = allPrev
      .filter((im: { id: string; absSrc: string; cmpSrc: string }) => {
        // Prefer id-based diff (most reliable)
        if (im.id) return !remainingIdSet.has(im.id);
        // Fallback to src diff
        return !remainingSrcSet.has(im.cmpSrc);
      })
      .map((im: { id: string; absSrc: string; cmpSrc: string }) => im.absSrc);

    // Safety: if something lands in both lists, treat it as removed.
    // (Prevents backend from re-updating an image that user removed.)
    const removedSet = new Set<string>(data.remove_product_images || []);
    data.update_product_images = (data.update_product_images || []).filter(
      (it: { src: string; title: string }) => !removedSet.has(it.src),
    );

    if (fromData.featuredImage instanceof File) {
      formData.append("featuredImage", fromData.featuredImage);
    } else if (fromData.featuredImage?.file instanceof File) {
      formData.append("featuredImage", fromData.featuredImage.file);
    } else if (!fromData.featuredImage && productDetails?.featured_image) {
      data.remove_featured_image = true;
    }

    formData.append("data", JSON.stringify(data));

    try {
      let res: any;
      if (isEdit) res = await productService.editProduct(eId, formData);
      if (res?.success) ToastService.success(res?.message || "Product saved!");
      else ToastService.error(res?.message || "Something went wrong");
    } catch (err: any) {
      ToastService.error(err?.message || "Request failed");
    }
  };

  const handleToggle = (isChecked: boolean) => setPriceInfo(isChecked);
  const handleToggleSEO = (isChecked: boolean) => setSEOInfo(isChecked);
  const handleToggleAttributes = (isChecked: boolean) =>
    setAttributesInfo(isChecked);

  const handleEditorChange = (value: any) => {
    setContent(value);
  };

  return (
    <AuthLayout>
      <div className="px-4 py-3 flex items-center gap-4">
        <h2 className="text-2xl font-bold">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>
        <Link
          href={`/product/products/duplicate/${productDetails?._id}`}
          className="bg-teal-500 hover:bg-teal-600 px-2 py-0.5 rounded-lg text-white text-center  cursor-pointer "
        >
          Duplicate Product
        </Link>
      </div>

      <div className="px-4">
        <div className="min-h-[70vh] ">
          <form
            encType="multipart/form-data"
            onSubmit={handleSubmit(formSubmit)}
          >
            <div className="lg:flex lg:items-start gap-4 lg:h-[calc(100vh-140px)] lg:overflow-hidden">
              <div className="lg:w-3/4 w-full lg:h-full lg:overflow-y-auto">
                <div className="bg-white dark:bg-gray-700  p-8 rounded-lg ">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-semibold text-nowrap">
                      Product Type
                    </h3>
                    {loading ? (
                      <div className="w-full bg-white dark:bg-gray-700 rounded-lg ">
                        <div className="bg-[#dfdfe0] h-11 mt-2 opacity-70 dark:opacity-50 rounded-xl p-2 ">
                          <Skeleton type="text" count={1} height={22} />
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-1 grid-cols-1 gap-x-5 items-center w-full">
                        <div className="w-full">
                          <Controller
                            name="websites"
                            control={control}
                            defaultValue={null}
                            render={({ field }) => (
                              <SelectComponent
                                options={webOptionsData}
                                value={field.value}
                                onChange={(val: any) =>
                                  field.onChange(val || [])
                                }
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
                    )}
                  </div>

                  {loading ? (
                    <BasicInfoSkeleton />
                  ) : (
                    <>
                      <div>
                        <Input
                          label={"Title"}
                          placeholder="Enter title"
                          registerProperty={keyRegister}
                          errorText={errors?.main_title?.message}
                          isRequired
                        />
                        <Input
                          label={"Slug"}
                          placeholder="Enter Slug"
                          registerProperty={register("slug")}
                          errorText={errors?.slug?.message}
                          isRequired
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-x-5 items-center">
                        <div>
                          <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                            Category{" "}
                            <span className="text-red-400 text-[12px]">*</span>
                          </p>
                          <Controller
                            name="category"
                            control={control}
                            defaultValue={[]}
                            render={({ field }) => (
                              <SelectComponent
                                options={categoryOptions}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select Categories"
                                isMulti
                                isRequired
                              />
                            )}
                          />
                          {errors.category && (
                            <p className="text-red-500 text-sm">
                              {String(errors.category.message)}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300">
                            Brand{" "}
                            <span className="text-red-400 text-[12px]">*</span>
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
                                isRequired
                              />
                            )}
                          />
                          {errors.brand && (
                            <p className="text-red-500 text-sm">
                              {String(errors.brand.message)}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-8 mt-4">
                  <h3 className="text-xl font-semibold dark:text-gray-300">
                    Seo Information
                  </h3>
                  <div className="flex items-center gap-2 py-4">
                    <h4 className="dark:text-gray-300">Is SEO Enabled</h4>
                    <Switch
                      key={`seo-${productDetails?._id ?? "loading"}`}
                      onToggle={handleToggleSEO}
                      default={!!productDetails?.is_seo}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5">
                    <div>
                      <Input
                        label={"Meta Title"}
                        placeholder="Enter meta title"
                        registerProperty={register("seo_title")}
                        errorText={errors?.seo_title?.message as string}
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
                      errorText={errors?.seo_description?.message as string}
                      type="textarea"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-white dark:bg-gray-700 p-8 rounded-lg mt-4 ">
                  <h3 className="text-xl font-semibold dark:text-gray-300">
                    Pricing and Stock
                  </h3>
                  <div className="mt-2 flex items-center gap-4">
                    <p className="dark:text-gray-300">Add More Info</p>
                    <Switch onToggle={handleToggle} default={true} />
                  </div>
                  {loading ? (
                    <PriceStockSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 gap-x-5">
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
                        label={"TimeVerse Price"}
                        placeholder="Enter TimeVerse price "
                        registerProperty={register("tv_sale_price")}
                        errorText={errors?.tv_sale_price?.message}
                        type="number"
                      />

                      <Input
                        label={"Offer Text"}
                        placeholder="Enter Text"
                        registerProperty={register("offer_text")}
                        errorText={errors?.offer_text?.message}
                        type="text"
                      />

                      {hasPermission(permissionList, "product_pricing_view") ? (
                        <>
                          <Input
                            label={"Purchase Price"}
                            placeholder="Enter purchase price"
                            registerProperty={register("purchase_price")}
                            errorText={errors?.purchase_price?.message}
                            type="number"
                          />
                          {priceInfo && (
                            <>
                              <Input
                                label={"Wholesale Vip Price"}
                                placeholder="Enter wholesale vip price "
                                registerProperty={register(
                                  "wholesale_vip_price",
                                )}
                                errorText={errors?.wholesale_vip_price?.message}
                                type="number"
                              />
                              <Input
                                label={"Wholesale Price"}
                                placeholder="Enter wholesale price "
                                registerProperty={register("wholesale_price")}
                                errorText={errors?.wholesale_price?.message}
                                type="number"
                              />

                              <Input
                                label={"Resaler Price"}
                                placeholder="Enter Resaler price "
                                registerProperty={register("resaler_price")}
                                errorText={errors?.resaler_price?.message}
                                type="number"
                              />
                            </>
                          )}
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-700 p-8 rounded-lg mt-4 ">
                  <h3 className="text-xl font-semibold dark:text-gray-300">
                    Stock
                  </h3>

                  {loading ? (
                    <StockSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 gap-x-5 mt-4">
                      <div>
                        <Input
                          label={"Stock Quantity"}
                          placeholder="Enter stock quantity"
                          registerProperty={register("stock_quantity")}
                          errorText={errors?.stock_quantity?.message}
                          type="number"
                          noMargin
                        />
                      </div>

                      <div className="w-full ">
                        <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 ">
                          Stock Status{" "}
                          <span className="text-red-400 text-[12px]">*</span>
                        </p>
                        <Controller
                          name="stock_status"
                          control={control}
                          render={({ field }) => (
                            <SelectComponent
                              options={stockStatusOptions}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select Stock Status"
                              isRequired
                            />
                          )}
                        />
                        {errors.stock_status && (
                          <p className="text-red-500 text-sm">
                            {String(errors.stock_status.message)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-700 p-8 rounded-lg mt-4 ">
                  <h3 className="text-xl font-semibold dark:text-gray-300">
                    Infos
                  </h3>

                  {loading ? (
                    <InfosSkeleton />
                  ) : (
                    <div className="grid grid-cols-2 gap-x-5">
                      <div className="w-full mt-4">
                        <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 ">
                          Warranty{" "}
                          <span className="text-red-400 text-[12px]">*</span>
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
                              isRequired
                            />
                          )}
                        />
                        {errors.warranty && (
                          <p className="text-red-500 text-sm">
                            {String(errors.warranty.message)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attributes */}
                <div className="bg-white dark:bg-gray-700 p-8 rounded-lg mt-4">
                  <div className="my-2 flex items-center gap-4">
                    <h3 className="text-xl font-semibold dark:text-gray-300">
                      Attributes
                    </h3>
                    <Switch
                      key={attributesDefaultOn ? "attrs-on" : "attrs-off"}
                      onToggle={handleToggleAttributes}
                      default={attributesDefaultOn}
                    />
                  </div>
                  {attributesInfo &&
                    (loading ? (
                      <AttributesSkeleton />
                    ) : (
                      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                        {titles?.map((title, index) => (
                          <Input
                            noMargin
                            key={index}
                            label={title}
                            placeholder={`Enter ${title}`}
                            registerProperty={register(
                              `attributes.${index}.value`,
                            )}
                            type="text"
                          />
                        ))}
                      </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mt-4">
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
                    onChange={handleEditorChange}
                    placeholder="Start writing your content here..."
                  />
                </div>

                <div>
                  <ElementorLikeEditor
                    initialHtml={productDetails?.description || ""}
                    onChange={(finalHtml) => setHtmlData(finalHtml)}
                  />
                </div>
              </div>

              {/* Right: media + submit */}
              <div className="lg:w-1/4 w-full lg:sticky lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <h2 className="text-lg font-semibold dark:text-gray-300">
                    {isEdit ? "Update Images" : "Upload Image"}
                  </h2>
                  {loading ? (
                    <UploadImageSkeleton />
                  ) : (
                    <div className="mt-2">
                      {/* Featured */}
                      <Controller
                        control={control}
                        name="featuredImage"
                        render={({ field: { onChange, value } }) => (
                          <SingleImageUpload
                            onChange={onChange}
                            value={value}
                            label="Featured Image"
                            required={!isEdit}
                            accept={["image/jpeg", "image/png", "image/webp"]}
                            maxSize={5 * 1024 * 1024}
                          />
                        )}
                      />
                      {errors.featuredImage && (
                        <p className="text-red-500 text-sm">
                          {String(errors.featuredImage.message)}
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

                      {/* Gallery */}
                      <div className="mt-4">
                        <Controller
                          control={control}
                          name="productImages"
                          render={({ field: { onChange, value } }) => (
                            <MultipleImageUpload
                              value={(value as GalleryItem[]) || []}
                              onChange={onChange}
                              label="Product Images"
                              maxImages={4}
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
                            {String(errors.productImages.message)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
                    {isSubmitting
                      ? isEdit
                        ? "Updating..."
                        : "Creating..."
                      : isEdit
                        ? "Update Product"
                        : "Create Product"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
