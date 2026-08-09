"use client";
import { IProductBrandData } from "@admin/@interfaces/product/productBrand.interface";
import { IProductCategoryData } from "@admin/@interfaces/product/productCategory.interface";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import Button from "@admin/components/core/Button/Button";
import ElementorLikeEditor from "@admin/components/core/Editor/CustomEditor";
import MultipleImageUpload, {
  ExistingItem,
  GalleryItem,
  NewUploadItem,
} from "@admin/components/core/Input/ImageUpload";
import Input from "@admin/components/core/Input/Input";
import SingleImageUpload from "@admin/components/core/Input/SingleImageUpload";
import SelectComponent from "@admin/components/core/Select/Select";
import Switch from "@admin/components/core/SwitchButton/SingleSwitch";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthLayout from "@admin/layouts/AuthLayout";
import { hasPermission } from "@admin/utils";
import { processDescriptionDesImages } from "@admin/utils/processDescriptionImage";
import { stripTrailingEmptyQuillParagraphs } from "@admin/utils/stripTrailingEmptyQuillParagraphs";
import { ToastService } from "@admin/utils/toastr.service";
import { yupResolver } from "@hookform/resolvers/yup";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import * as yup from "yup";

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

const stockStatusOptions = [
  { label: "In Stock", value: "in_stock" },
  { label: "Out of Stock", value: "out_of_stock" },
  { label: "Pre Order", value: "pre_order" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

const splitCommaList = (value: string) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const defaultValue: any = {
  main_title: "",
  slug: "",
  sku: "",
  category: [] as any[],
  brand: null,
  status: statusOptions[0],
  sale_price: "",
  regular_price: "",
  purchase_price: "",
  offer_text: "",
  tags: "",
  keywords: "",
  meta_title: "",
  meta_description: "",
  featured_product: false,
  featuredImage: null,
  featured_image_title: "",
  productImages: [] as any[],
  product_image_title: [] as string[],
  variants: [
    {
      size: "",
      stock_quantity: "0",
      reserved_quantity: "0",
      sold_quantity: "0",
      stock_status: stockStatusOptions[0],
    },
  ],
};

export const ProductSchema = yup.object({
  main_title: yup.string().required("Title is required"),
  slug: yup.string().required("Slug is required"),
  sku: yup.string(),
  category: yup
    .array()
    .of(
      yup.object({
        label: yup.string().required(),
        value: yup.string().required(),
      }),
    )
    .min(1, "At least one category is required"),
  brand: yup.mixed().nullable(),
  status: yup.mixed().required("Status is required"),
  sale_price: yup.string().required("Sale price is required"),
  regular_price: yup.string().required("Regular price is required"),
  purchase_price: yup.string(),
  offer_text: yup.string(),
  tags: yup.string(),
  keywords: yup.string(),
  meta_title: yup.string(),
  meta_description: yup.string(),
  featured_product: yup.boolean(),
  featuredImage: yup.mixed(),
  featured_image_title: yup.string(),
  productImages: yup.array(),
  product_image_title: yup.array().of(yup.string()),
  variants: yup
    .array()
    .of(
      yup.object({
        size: yup.string().required("Size is required"),
        stock_quantity: yup.string().required("Stock quantity is required"),
        reserved_quantity: yup.string(),
        sold_quantity: yup.string(),
        stock_status: yup.mixed().required("Stock status is required"),
      }),
    )
    .min(1, "At least one variant is required"),
});

const Page: React.FC = () => {
  const { eId } = useParams();
  const isEdit = Boolean(eId);
  const { permissionList } = useGlobalContext();
  const [htmlData, setHtmlData] = useState("");
  const [productCategoryData, setProductCategoryData] = useState<
    IProductCategoryData[]
  >([]);
  const [productBrandData, setProductBrandData] = useState<IProductBrandData[]>(
    [],
  );
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState("");
  const [featuredProduct, setFeaturedProduct] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const categoryOptions = useMemo(
    () =>
      (productCategoryData ?? []).map((item) => ({
        label: item.key,
        value: item.value,
      })),
    [productCategoryData],
  );
  const brandOptions = useMemo(
    () =>
      (productBrandData ?? []).map((item) => ({
        label: item.key,
        value: item.value,
      })),
    [productBrandData],
  );

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
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const productImagesWatch = useWatch({ control, name: "productImages" });
  const productImagesLen = productImagesWatch?.length ?? 0;

  useEffect(() => {
    const current = getValues("product_image_title");
    const arr = Array.isArray(current) ? [...current] : [];
    if (arr.length === productImagesLen) return;
    const next = arr.slice(0, productImagesLen);
    while (next.length < productImagesLen) next.push("");
    setValue("product_image_title", next, { shouldDirty: false });
  }, [productImagesLen, getValues, setValue]);

  useEffect(() => {
    if (!productDetails) return;

    const catValue = Array.isArray(productDetails.categories)
      ? productDetails.categories
      : [];
    const selectedCategories = categoryOptions.filter((c) =>
      catValue.includes(c.value),
    );
    const selectedBrand =
      brandOptions.find((b) => b.value === productDetails.brand) ?? null;
    const selectedStatus =
      statusOptions.find((s) => s.value === productDetails.status) ??
      statusOptions[0];

    const variants = (productDetails.variants?.length
      ? productDetails.variants
      : [
          {
            size: "",
            inventory: {
              stock_quantity: 0,
              reserved_quantity: 0,
              sold_quantity: 0,
              stock_status: "in_stock",
            },
          },
        ]
    ).map((v: any) => ({
      size: v.size ?? "",
      stock_quantity: String(v.inventory?.stock_quantity ?? 0),
      reserved_quantity: String(v.inventory?.reserved_quantity ?? 0),
      sold_quantity: String(v.inventory?.sold_quantity ?? 0),
      stock_status:
        stockStatusOptions.find(
          (s) => s.value === (v.inventory?.stock_status ?? "in_stock"),
        ) ?? stockStatusOptions[0],
    }));

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
      sku: productDetails.sku ?? "",
      category: selectedCategories,
      brand: selectedBrand,
      status: selectedStatus,
      sale_price: String(productDetails?.pricing?.sale_price ?? ""),
      regular_price: String(productDetails?.pricing?.regular_price ?? ""),
      purchase_price: String(productDetails?.pricing?.purchase_price ?? ""),
      offer_text: productDetails.offer_text || "",
      tags: (productDetails.tags || []).join(", "),
      keywords: (productDetails.keywords || []).join(", "),
      meta_title: productDetails?.meta_title ?? "",
      meta_description: productDetails?.meta_description ?? "",
      featured_product: !!productDetails?.featured_product,
      featuredImage: existingFeaturedUrl,
      featured_image_title: productDetails?.featured_image?.title ?? "",
      productImages: initialGallery as any[],
      product_image_title: (productDetails?.images || []).map(
        (im: any) => im?.title ?? "",
      ),
      variants,
    });
    setContent(productDetails?.short_description || "");
    setFeaturedProduct(!!productDetails?.featured_product);
    setHtmlData(productDetails?.description || "");
    setEditorKey((k) => k + 1);
  }, [productDetails, categoryOptions, brandOptions, reset]);

  const formSubmit = async (fromData: any) => {
    const data: any = {
      title: fromData.main_title || "",
      slug: fromData.slug,
      status: fromData.status?.value || "active",
      categories: (fromData.category || []).map((c: any) => c.value),
      brand: fromData.brand?.value || "",
      short_description: stripTrailingEmptyQuillParagraphs(content || ""),
      offer_text: fromData.offer_text || "",
      pricing: {
        sale_price: parseFloat(fromData.sale_price) || 0,
        regular_price: parseFloat(fromData.regular_price) || 0,
        ...(hasPermission(permissionList, "product_pricing_view") && {
          purchase_price: parseFloat(fromData.purchase_price) || 0,
        }),
      },
      variants: (fromData.variants || []).map((v: any) => ({
        size: String(v.size || "").trim(),
        inventory: {
          stock_quantity: parseInt(v.stock_quantity, 10) || 0,
          reserved_quantity: parseInt(v.reserved_quantity, 10) || 0,
          sold_quantity: parseInt(v.sold_quantity, 10) || 0,
          stock_status: v.stock_status?.value || "in_stock",
        },
      })),
      tags: splitCommaList(fromData.tags),
      keywords: splitCommaList(fromData.keywords),
      featured_product: featuredProduct,
      meta_title: fromData.meta_title || "",
      meta_description: fromData.meta_description || "",
      videos: [],
      featured_image_title: fromData.featured_image_title?.trim() || "",
      remove_featured_image: false,
      remove_product_images: [] as string[],
      update_product_images: [] as Array<{ src: string; title: string }>,
      product_image_titles: [] as string[],
      description: "",
    };

    const formData = new FormData();
    data.description = await processDescriptionDesImages(
      htmlData || "",
      formData,
    );

    const items: GalleryItem[] = fromData.productImages || [];
    const titleInputs: string[] = Array.isArray(fromData.product_image_title)
      ? fromData.product_image_title.map((t: any) => String(t ?? "").trim())
      : [];

    const normalizeForCompare = (src: string) => {
      if (!src) return src;
      try {
        const u = new URL(src);
        return u.pathname || src;
      } catch {
        return src;
      }
    };

    items.forEach((it, idx: number) => {
      const imgTitle = titleInputs[idx] || "";
      if (!("isExisting" in it) || it.isExisting === false) {
        const f = (it as NewUploadItem).file;
        formData.append("productImages", f);
        data.product_image_titles.push(imgTitle);
      } else {
        const src = (it as ExistingItem).src;
        data.update_product_images.push({ src, title: imgTitle });
      }
    });

    const remainingExisting = items
      .filter((it) => "isExisting" in it && it.isExisting)
      .map((it) => it as ExistingItem);

    const remainingSrcSet = new Set<string>(
      remainingExisting.map((it) => normalizeForCompare(it.src)),
    );
    const remainingIdSet = new Set<string>(
      remainingExisting.map((it) => String(it.id || "")).filter(Boolean),
    );

    const allPrev = (productDetails?.images || []).map((im: any) => ({
      id: String(im?._id || ""),
      absSrc: toAbsolute(im?.src),
      cmpSrc: normalizeForCompare(toAbsolute(im?.src)),
    }));

    data.remove_product_images = allPrev
      .filter((im: { id: string; absSrc: string; cmpSrc: string }) => {
        if (im.id) return !remainingIdSet.has(im.id);
        return !remainingSrcSet.has(im.cmpSrc);
      })
      .map((im: { id: string; absSrc: string; cmpSrc: string }) => im.absSrc);

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

  return (
    <AuthLayout>
      <div className="px-4 py-3 flex items-center gap-4">
        <h2 className="text-2xl font-bold">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>
        {productDetails?._id && (
          <Link
            href={`/admin/product/products/duplicate/${productDetails._id}`}
            className="bg-teal-500 hover:bg-teal-600 px-2 py-0.5 rounded-lg text-white text-center cursor-pointer"
          >
            Duplicate Product
          </Link>
        )}
      </div>

      <div className="px-4">
        <div className="min-h-[70vh]">
          {loading ? (
            <div className="p-8 text-gray-500">Loading product...</div>
          ) : (
            <form
              encType="multipart/form-data"
              onSubmit={handleSubmit(formSubmit)}
            >
              <div className="lg:flex lg:items-start gap-4 lg:h-[calc(100vh-140px)] lg:overflow-hidden">
                <div className="lg:w-3/4 w-full lg:h-full lg:overflow-y-auto">
                  <div className="bg-white dark:bg-gray-800 p-8 rounded-lg dark:text-gray-300">
                    <h3 className="text-xl font-semibold mb-4">
                      Product Basic Information
                    </h3>
                    <Input
                      label="Title"
                      placeholder="Enter title"
                      registerProperty={register("main_title")}
                      errorText={errors?.main_title?.message}
                      isRequired
                    />
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5">
                      <Input
                        label="Slug"
                        placeholder="Enter Slug"
                        registerProperty={register("slug")}
                        errorText={errors?.slug?.message}
                        isRequired
                      />
                      <Input
                        label="SKU"
                        placeholder="Auto generated"
                        registerProperty={register("sku")}
                        errorText={errors?.sku?.message}
                        isDisabled
                      />
                    </div>
                    <div className="grid md:grid-cols-3 grid-cols-1 gap-x-5 items-start">
                      <div>
                        <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                          Category <span className="text-red-400">*</span>
                        </p>
                        <Controller
                          name="category"
                          control={control}
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
                      <div>
                        <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                          Status <span className="text-red-400">*</span>
                        </p>
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <SelectComponent
                              options={statusOptions}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select Status"
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <h4 className="text-sm font-semibold">Featured Product</h4>
                      <Switch
                        key={featuredProduct ? "fp-on" : "fp-off"}
                        onToggle={(checked: boolean) => {
                          setFeaturedProduct(checked);
                          setValue("featured_product", checked);
                        }}
                        default={featuredProduct}
                      />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 className="text-xl font-semibold">SEO Information</h3>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5 mt-2">
                      <Input
                        label="Meta Title"
                        placeholder="Enter meta title"
                        registerProperty={register("meta_title")}
                      />
                      <Input
                        label="Keywords"
                        placeholder="comma separated"
                        registerProperty={register("keywords")}
                      />
                    </div>
                    <Input
                      label="Meta Description"
                      placeholder="Enter meta description"
                      registerProperty={register("meta_description")}
                      type="textarea"
                    />
                    <Input
                      label="Tags"
                      placeholder="comma separated"
                      registerProperty={register("tags")}
                    />
                  </div>

                  <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-8 rounded-lg mt-4">
                    <h3 className="text-xl font-semibold">Pricing</h3>
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5 mt-2">
                      <Input
                        label="Regular Price"
                        placeholder="Enter regular price"
                        registerProperty={register("regular_price")}
                        errorText={errors?.regular_price?.message}
                        type="number"
                        isRequired
                      />
                      <Input
                        label="Sale Price"
                        placeholder="Enter sale price"
                        registerProperty={register("sale_price")}
                        errorText={errors?.sale_price?.message}
                        type="number"
                        isRequired
                      />
                      {hasPermission(permissionList, "product_pricing_view") && (
                        <Input
                          label="Purchase Price"
                          placeholder="Enter purchase price"
                          registerProperty={register("purchase_price")}
                          type="number"
                        />
                      )}
                      <Input
                        label="Offer Text"
                        placeholder="Enter offer text"
                        registerProperty={register("offer_text")}
                      />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-8 rounded-lg mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">
                        Variants (Size & Stock)
                      </h3>
                      <Button
                        type="button"
                        className="bg-emerald-600"
                        onClick={() =>
                          append({
                            size: "",
                            stock_quantity: "0",
                            reserved_quantity: "0",
                            sold_quantity: "0",
                            stock_status: stockStatusOptions[0],
                          })
                        }
                      >
                        Add Variant
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">
                              Variant {index + 1}
                            </h4>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                className="text-red-500 text-sm"
                                onClick={() => remove(index)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid md:grid-cols-3 grid-cols-1 gap-x-5">
                            <Input
                              label="Size"
                              placeholder="2.4"
                              registerProperty={register(
                                `variants.${index}.size`,
                              )}
                              isRequired
                            />
                            <Input
                              label="Stock Quantity"
                              type="number"
                              registerProperty={register(
                                `variants.${index}.stock_quantity`,
                              )}
                              isRequired
                            />
                            <Input
                              label="Reserved Quantity"
                              type="number"
                              registerProperty={register(
                                `variants.${index}.reserved_quantity`,
                              )}
                            />
                            <Input
                              label="Sold Quantity"
                              type="number"
                              registerProperty={register(
                                `variants.${index}.sold_quantity`,
                              )}
                            />
                            <div>
                              <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                Stock Status *
                              </p>
                              <Controller
                                name={`variants.${index}.stock_status`}
                                control={control}
                                render={({ field: f }) => (
                                  <SelectComponent
                                    options={stockStatusOptions}
                                    value={f.value}
                                    onChange={f.onChange}
                                    placeholder="Select status"
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 className="text-sm font-semibold dark:text-gray-300 pb-3">
                      Short Description
                    </h3>
                    <RichTextEditor
                      key={`short-${editorKey}`}
                      content={content}
                      onChange={setContent}
                      placeholder="Start writing your content here..."
                    />
                  </div>
                  <div>
                    <ElementorLikeEditor
                      key={`desc-${editorKey}`}
                      initialHtml={productDetails?.description || ""}
                      onChange={(finalHtml) => setHtmlData(finalHtml)}
                    />
                  </div>
                </div>

                <div className="lg:w-1/4 w-full lg:sticky lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
                  <div className="bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg p-4">
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
                            accept={["image/jpeg", "image/png"]}
                            maxSize={5 * 1024 * 1024}
                          />
                        )}
                      />
                      <div className="mt-3">
                        <Input
                          label="Featured image title (alt)"
                          placeholder="Title for featured image"
                          registerProperty={register("featured_image_title")}
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
                                <Input
                                  noMargin
                                  label="Image (alt) Tag"
                                  placeholder="Enter your (alt) Tag"
                                  registerProperty={register(
                                    `product_image_title.${i}`,
                                  )}
                                />
                              )}
                            />
                          )}
                        />
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
                      {isSubmitting ? "Saving..." : "Update Product"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
