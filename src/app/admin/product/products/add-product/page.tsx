"use client";
import { IProductBrandData } from "@admin/@interfaces/product/productBrand.interface";
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
import { processDescriptionDesImages } from "@admin/utils/processDescriptionImage";
import { stripTrailingEmptyQuillParagraphs } from "@admin/utils/stripTrailingEmptyQuillParagraphs";
import { ToastService } from "@admin/utils/toastr.service";
import { yupResolver } from "@hookform/resolvers/yup";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from "yup";

const SingleImageUpload = dynamic(
  () => import("@admin/components/core/Input/SingleImageUpload"),
  { ssr: false },
);
const RichTextEditor = dynamic(
  () => import("@admin/components/core/Editor/RichTextEditor"),
  { ssr: false },
);

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

const defaultValue: any = {
  main_title: "",
  slug: "",
  category: [],
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
  productImages: [],
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
  category: yup.mixed().nullable().required("Category is required"),
  brand: yup.mixed().nullable(),
  status: yup.mixed().required("Status is required"),
  sale_price: yup.string().required("Sale price is required"),
  regular_price: yup.string().required("Regular price is required"),
  purchase_price: yup.string().required("Purchase price is required"),
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

const splitCommaList = (value: string) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const Page: React.FC = () => {
  const router = useRouter();
  const [productCategoryData, setProductCategoryData] = useState<any[]>([]);
  const [productBrandData, setProductBrandData] = useState<IProductBrandData[]>(
    [],
  );
  const [content, setContent] = useState("");
  const [htmlData, setHtmlData] = useState("");
  const [featuredProduct, setFeaturedProduct] = useState(false);

  const categoryOptions = productCategoryData?.map((item) => ({
    label: item.key,
    value: item.value,
  }));
  const brandOptions = productBrandData?.map((item) => ({
    label: item.key,
    value: item.value,
  }));

  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const productImagesLen = watch("productImages")?.length ?? 0;
  useEffect(() => {
    const current = getValues("product_image_title");
    const arr = Array.isArray(current) ? [...current] : [];
    if (arr.length === productImagesLen) return;
    const next = arr.slice(0, productImagesLen);
    while (next.length < productImagesLen) next.push("");
    setValue("product_image_title", next, { shouldDirty: false });
  }, [productImagesLen, getValues, setValue]);

  const toSlug = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");

  const keyRegister = register("main_title", {
    onChange: (e) => {
      const k = e.target.value as string;
      setValue("slug", toSlug(k), { shouldValidate: true, shouldDirty: true });
    },
  });

  const formSubmit = async (fromData: any) => {
    if (!htmlData) {
      ToastService.error("Product description is required");
      return;
    }

    const data: any = {
      title: fromData.main_title || "",
      slug: fromData.slug,
      status: fromData.status?.value || "active",
      categories: Array.isArray(fromData.category)
        ? fromData.category.map((c: any) => c.value)
        : [],
      brand: fromData.brand?.value || "",
      short_description: stripTrailingEmptyQuillParagraphs(content || ""),
      pricing: {
        sale_price: parseFloat(fromData.sale_price) || 0,
        regular_price: parseFloat(fromData.regular_price) || 0,
        purchase_price: parseFloat(fromData.purchase_price) || 0,
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
      offer_text: fromData.offer_text || "",
      featured_product: featuredProduct,
      meta_title: fromData.meta_title || "",
      meta_description: fromData.meta_description || "",
      videos: [],
      featured_image_title: fromData.featured_image_title?.trim() || "",
      product_image_titles: (Array.isArray(fromData.productImages)
        ? fromData.productImages
        : []
      ).map((_: unknown, i: number) =>
        String(
          Array.isArray(fromData.product_image_title)
            ? (fromData.product_image_title[i] ?? "")
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
        router.push(`/admin/product/products/edit/${res?.data?._id}`);
        ToastService.success(res?.message);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

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
                <h3 className="text-xl font-semibold mb-4">
                  Product Basic Information
                </h3>
                <div>
                  <Input
                    label={"Title"}
                    placeholder="Enter title"
                    registerProperty={keyRegister}
                    errorText={errors?.main_title?.message}
                    isRequired
                  />
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5">
                  <Input
                    label={"Slug"}
                    placeholder="Enter Slug"
                    registerProperty={register("slug")}
                    errorText={errors?.slug?.message}
                    isRequired
                  />
                </div>

                <div className="grid md:grid-cols-3 grid-cols-1 gap-x-5 items-start">
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
                      defaultValue={[]}
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
                      Status{" "}
                      <span className="text-red-400 font-inter text-[12px] font-semibold">
                        *
                      </span>
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
                          isRequired
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <h4 className="text-sm font-semibold">Featured Product</h4>
                  <Switch
                    onToggle={(checked: boolean) => {
                      setFeaturedProduct(checked);
                      setValue("featured_product", checked);
                    }}
                    default={false}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
                <h3 className="text-xl font-semibold">SEO Information</h3>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5 mt-2">
                  <Input
                    label={"Meta Title"}
                    placeholder="Enter meta title"
                    registerProperty={register("meta_title")}
                    errorText={errors?.meta_title?.message}
                  />
                  <Input
                    label={"Keywords"}
                    placeholder="glass bangles, kashmiri (comma separated)"
                    registerProperty={register("keywords")}
                    errorText={errors?.keywords?.message}
                  />
                </div>
                <Input
                  label={"Meta Description"}
                  placeholder="Enter meta description"
                  registerProperty={register("meta_description")}
                  errorText={errors?.meta_description?.message}
                  type="textarea"
                />
                <Input
                  label={"Tags"}
                  placeholder="Glass Bangles, Kashmiri, Wedding (comma separated)"
                  registerProperty={register("tags")}
                  errorText={errors?.tags?.message}
                />
              </div>

              <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-8 rounded-lg mt-4">
                <h3 className="text-xl font-semibold">Pricing</h3>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5 mt-2">
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
                    label={"Purchase Price"}
                    placeholder="Enter purchase price"
                    registerProperty={register("purchase_price")}
                    errorText={errors?.purchase_price?.message}
                    type="number"
                    isRequired
                  />
                  <Input
                    label={"Offer Text"}
                    placeholder="Enter offer text"
                    registerProperty={register("offer_text")}
                    errorText={errors?.offer_text?.message}
                    type="text"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 dark:text-gray-300 p-8 rounded-lg mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Variants (Size & Stock)</h3>
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
                {errors?.variants?.message && (
                  <p className="text-red-500 text-sm mb-2">
                    {errors.variants.message as string}
                  </p>
                )}
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
                          registerProperty={register(`variants.${index}.size`)}
                          errorText={
                            (errors?.variants as any)?.[index]?.size?.message
                          }
                          isRequired
                        />
                        <Input
                          label="Stock Quantity"
                          placeholder="30"
                          type="number"
                          registerProperty={register(
                            `variants.${index}.stock_quantity`,
                          )}
                          errorText={
                            (errors?.variants as any)?.[index]?.stock_quantity
                              ?.message
                          }
                          isRequired
                        />
                        <Input
                          label="Reserved Quantity"
                          placeholder="0"
                          type="number"
                          registerProperty={register(
                            `variants.${index}.reserved_quantity`,
                          )}
                        />
                        <Input
                          label="Sold Quantity"
                          placeholder="0"
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
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your content here..."
                />
              </div>
              <div>
                <ElementorLikeEditor
                  onChange={(finalHtml) => setHtmlData(finalHtml)}
                />
              </div>
            </div>

            <div className="2xl:w-1/4 w-full 2xl:sticky 2xl:self-start 2xl:max-h-[calc(100vh-140px)] 2xl:overflow-y-auto">
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
                        required
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
