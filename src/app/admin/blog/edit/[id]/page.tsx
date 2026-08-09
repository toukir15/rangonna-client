"use client";
import { IProductBrandData } from "@admin/@interfaces/product/productBrand.interface";
import { BlogService } from "@admin/@services/apis/Blog/blog.service";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import Button from "@admin/components/core/Button/Button";
import ElementorLikeEditor from "@admin/components/core/Editor/CustomEditor";
import Input from "@admin/components/core/Input/Input";
import SelectComponent from "@admin/components/core/Select/Select";
import EditBlogSkeleton from "@admin/components/Skeleton/Blog/EditBlog.skeleton";
import AuthLayout from "@admin/layouts/AuthLayout";
import { processDescriptionDesImages } from "@admin/utils/processDescriptionImage";
import { ToastService } from "@admin/utils/toastr.service";
import { yupResolver } from "@hookform/resolvers/yup";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";

const SingleImageUpload = dynamic(
  () => import("@admin/components/core/Input/SingleImageUpload"),
  { ssr: false },
);

const toAbsolute = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = process.env.NEXT_PUBLIC_CDN_BASE || "";
  return `${base}${url}`;
};

const defaultValue: any = {
  title: "",
  slug: "",
  category: "",
  brand: "",
  focus_keyword: "",
  featuredImage: null,
  featured_image_title: "",
};

export const ProductSchema = yup.object({
  title: yup.string().required("Title is required"),
  slug: yup.string().required("Slug is required"),
  category: yup.mixed().nullable().required(),
  brand: yup.mixed().nullable(),
  focus_keyword: yup.string(),
  featuredImage: yup.mixed(),
  featured_image_title: yup.string(),
});

const Page: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const blogId = typeof params?.id === "string" ? params.id : params?.id?.[0];

  const [productCategoryData, setProductCategoryData] = useState<any[]>([]);
  const [productBrandData, setProductBrandData] = useState<IProductBrandData[]>(
    [],
  );
  const [htmlData, setHtmlData] = useState("");
  const [blogDetails, setBlogDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const categoryOptions = useMemo(
    () =>
      productCategoryData?.map((item) => ({
        label: item.key,
        value: item.value,
      })) ?? [],
    [productCategoryData],
  );

  const brandOptions = useMemo(
    () =>
      productBrandData?.map((item) => ({
        label: item.key,
        value: item.value,
      })) ?? [],
    [productBrandData],
  );

  const {
    handleSubmit,
    register,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const toSlug = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^_+|_+$/g, "")
      .replace(/_{2,}/g, "-");

  const titleRegister = register("title", {
    onChange: (e) => {
      const k = e.target.value as string;
      setValue("slug", toSlug(k), { shouldValidate: true, shouldDirty: true });
    },
  });

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!blogId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res: any = await BlogService.getSingleBlog(blogId);
        if (cancelled) return;
        if (res?.success) {
          setBlogDetails(res.data);
        } else {
          ToastService.error(res?.message || "Failed to load blog");
          router.push("/admin/blog");
        }
      } catch (err: any) {
        if (!cancelled) {
          ToastService.error(err?.message || "Failed to load blog");
          router.push("/admin/blog");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blogId, router]);

  useEffect(() => {
    if (!blogDetails) return;

    const catValue =
      Array.isArray(blogDetails.categories) && blogDetails.categories.length
        ? blogDetails.categories
        : [];

    const selectedCategories = categoryOptions.filter(
      (c) => catValue.includes(c.value) || catValue.includes(c.label),
    );

    const selectedBrand = brandOptions.find(
      (b) => b.value === blogDetails.brand,
    );

    const existingFeaturedUrl =
      toAbsolute(blogDetails?.featured_image?.src) || null;

    reset({
      title: blogDetails.title ?? "",
      slug: blogDetails.slug ?? "",
      brand: selectedBrand ?? null,
      focus_keyword: blogDetails.focus_keyword ?? "",
      category: selectedCategories.length ? selectedCategories : null,
      featuredImage: existingFeaturedUrl,
      featured_image_title:
        blogDetails?.featured_image?.title ??
        blogDetails?.featured_image?.alt ??
        "",
    });
  }, [blogDetails, categoryOptions, brandOptions, reset]);

  const formSubmit = async (fromData: any) => {
    if (!blogId) return;
    if (!htmlData) {
      ToastService.error("htmlData not found");
      return;
    }

    const data: any = {
      title: fromData.title || "",
      slug: fromData.slug,
      brand: fromData.brand?.value || "",
      focus_keyword: fromData.focus_keyword || "",
      categories: Array.isArray(fromData.category)
        ? fromData.category.map((sync: any) => sync.value)
        : [],
      description: htmlData,
      featured_image_title: fromData.featured_image_title?.trim() || "",
      remove_featured_image: false,
    };

    const formData = new FormData();
    data.description = await processDescriptionDesImages(htmlData, formData);
    formData.append("data", JSON.stringify(data));

    if (fromData.featuredImage instanceof File) {
      formData.append("featuredImage", fromData.featuredImage);
    } else if (fromData.featuredImage?.file instanceof File) {
      formData.append("featuredImage", fromData.featuredImage.file);
    } else if (!fromData.featuredImage && blogDetails?.featured_image) {
      data.remove_featured_image = true;
      formData.set("data", JSON.stringify(data));
    }

    try {
      const res = await BlogService.updateBlog(blogId, formData);
      if (res?.success) {
        ToastService.success(res?.message);
        router.push("/admin/blog");
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  if (loading || !blogDetails) {
    return (
      <AuthLayout>
        <div className="px-4 py-3">
          <h2 className="text-2xl font-bold">Edit Blog</h2>
        </div>
        <div className="px-4 w-full pb-6">
          <EditBlogSkeleton />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="px-4 py-3">
        <h2 className="text-2xl font-bold">Edit Blog</h2>
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
                    Basic Information
                  </h3>
                </div>
                <div>
                  <Input
                    label={"Title"}
                    placeholder="Enter title"
                    registerProperty={titleRegister}
                    errorText={errors?.title?.message}
                    isRequired
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label={"Slug"}
                    placeholder="Enter slug"
                    registerProperty={register("slug")}
                    errorText={errors?.slug?.message}
                    isRequired
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label={"Focus keyword"}
                    placeholder="Enter focus keyword"
                    registerProperty={register("focus_keyword")}
                    errorText={errors?.focus_keyword?.message}
                  />
                </div>

                <div className="flex gap-4 items-center w-full mt-4">
                  <div className="w-full">
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
                </div>
              </div>
              <div>
                <ElementorLikeEditor
                  initialHtml={blogDetails?.description || ""}
                  onChange={(finalHtml) => setHtmlData(finalHtml)}
                />
              </div>
            </div>
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
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-3 bg-white dark:bg-gray-700 rounded-lg p-4">
                <Link href="/admin/blog">
                  <Button type="button" className="bg-gray-400 text-gray-800">
                    Cancel
                  </Button>
                </Link>

                <Button
                  className="bg-blue-600 text-nowrap"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Update Blog"}
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
