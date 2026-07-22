"use client";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import React, { useEffect, useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import Image from "next/image";
import Icon from "@admin/components/core/Icon/Icon";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { LandingService } from "@admin/@services/apis/Landing/Landing.service";
import { useParams, useRouter } from "next/navigation";

const webSchema = yup.object({
  headline: yup.string().required("Headline is required"),
  slug: yup.string().required("Slug is required"),
  description: yup.string().required("Description is required"),
  video_url: yup.string().required("Video URL is required"),
  image_url: yup.string().required("Image URL is required"),
  price1: yup.string().required(),
  price2: yup.string().required(),
  price3: yup.string().required(),
  title1: yup.string().optional(),
  title2: yup.string().optional(),
  title3: yup.string().optional(),
  title4: yup.string().optional(),
  title5: yup.string().optional(),
  whatsapp_number: yup.string().required(),
  phone_number: yup.string().required(),
  cross_sell_products_description: yup.string().required(),
  cross_sell_products_title: yup.string().required(),
});

const EditLandingPage: React.FC = () => {
  const router = useRouter();

  const { eId } = useParams();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [crossSellProduct, setCrossSellProduct] = useState<any>(null);

  // Search
  const [productSearch, setProductSearch] = useState("");
  const [crossSellSearch, setCrossSellSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [filteredCrossSell, setFilteredCrossSell] = useState<any[]>([]);

  const debouncedProductSearch = useDebounce(productSearch);
  const debouncedCrossSellSearch = useDebounce(crossSellSearch);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
  });

  // Convert headline to slug
  const toSlug = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^_+|_+$/g, "")
      .replace(/_{2,}/g, "-");

  const keyRegister = register("headline", {
    onChange: (e) => {
      const k = e.target.value as string;
      setValue("slug", toSlug(k), { shouldValidate: true, shouldDirty: true });
    },
  });

  // Fetch existing landing data
  useEffect(() => {
    if (!eId) return;
    (async () => {
      try {
        const res: any = await LandingService.getSingleLanding(eId);
        if (res?.success) {
          const data = res.data;
          // prefill form
          reset({
            headline: data.headline,
            slug: data.slug,
            description: data.description,
            video_url: data.video_url,
            image_url: data.images_url.join(", "),
            price1: data.price1,
            price2: data.price2,
            price3: data.price3,
            title1: data.title1,
            title2: data.title2,
            title3: data.title3,
            title4: data.title4,
            title5: data.title5,
            whatsapp_number: data.whatsapp_number,
            phone_number: data.phone_number,
            cross_sell_products_description:
              data.cross_sell_product_description,
            cross_sell_products_title: data.cross_sell_product_title,
          });

          setProducts(data.products || []);
          setCrossSellProduct(data.cross_sell_product || null);
        } else {
          ToastService.error(res?.message || "Failed to fetch landing data");
        }
      } catch (err: any) {
        ToastService.error(err?.message || "Failed to fetch landing data");
      }
    })();
  }, [eId, reset]);

  // Form submit
  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const payload = {
      headline: formData.headline,
      description: formData.description,
      video_url: formData.video_url,
      images_url: formData.image_url
        .split(",")
        .map((url: string) => url.trim())
        .filter((url: string) => url),

      price1: formData.price1,
      price2: formData.price2,
      price3: formData.price3,

      title1: formData.title1,
      title2: formData.title2,
      title3: formData.title3,
      title4: formData.title4,
      title5: formData.title5,

      whatsapp_number: formData.whatsapp_number,
      phone_number: formData.phone_number,

      products: products.map((p) => p._id),
      cross_sell_product: crossSellProduct?._id || null,

      cross_sell_product_description: formData.cross_sell_products_description,
      cross_sell_product_title: formData.cross_sell_products_title,

      slug: formData.slug,
    };

    LandingService.updateLanding(eId, payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push("/admin/landing-page");
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
      });
  };

  // Fetch products for search
  const fetchProductSearch = async (
    search: string,
    type: "product" | "cross"
  ) => {
    try {
      const res: any = await productService.getPurchaseProductSuggestion({
        searchTerm: search,
      });
      if (res?.success) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        type === "product"
          ? setFilteredProducts(res.data)
          : setFilteredCrossSell(res.data);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  useEffect(() => {
    if (debouncedProductSearch.length >= 2)
      fetchProductSearch(debouncedProductSearch, "product");
  }, [debouncedProductSearch]);

  useEffect(() => {
    if (debouncedCrossSellSearch.length >= 2)
      fetchProductSearch(debouncedCrossSellSearch, "cross");
  }, [debouncedCrossSellSearch]);

  // Select & remove products
  const handleProductSelect = (product: any) => {
    if (products.some((p) => p._id === product._id)) {
      ToastService.warning("Product already added");
      return;
    }
    setProducts((prev) => [...prev, product]);
    setProductSearch("");
    setFilteredProducts([]);
  };
  const handleCrossSellSelect = (product: any) => {
    setCrossSellProduct(product);
    setCrossSellSearch("");
    setFilteredCrossSell([]);
  };
  const removeProduct = (id: string) =>
    setProducts((prev) => prev.filter((p) => p._id !== id));
  const removeCrossSell = () => setCrossSellProduct(null);

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="lg:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
            Edit Landing Product
          </h2>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <form onSubmit={handleSubmit(formSubmit)}>
          <div className="w-full gap-5 ">
            <div className=" grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
              <Input
                label={"Headline"}
                registerProperty={keyRegister}
                errorText={errors?.headline?.message}
                type="text"
                isRequired
                placeholder="Enter headline"
              />
              <Input
                label={"Slug"}
                placeholder="Enter Slug"
                registerProperty={register("slug")}
                errorText={errors?.slug?.message}
                isRequired
              />
              <Input
                label={"Description"}
                registerProperty={register("description")}
                errorText={errors?.description?.message}
                type="text"
                isRequired
                placeholder="Enter description"
              />
              <Input
                label={"Video Url"}
                registerProperty={register("video_url")}
                errorText={errors?.video_url?.message}
                type="text"
                isRequired
                placeholder="Enter video url"
              />

              <Input
                label={"Image URLs"}
                registerProperty={register("image_url")}
                errorText={errors?.image_url?.message}
                type="text"
                isRequired
                placeholder="Enter image URLs separated by commas"
              />

              <Input
                label={"Price One"}
                registerProperty={register("price1")}
                errorText={errors?.price1?.message}
                type="text"
                isRequired
                placeholder="Enter price one"
              />
              <Input
                label={"Price Two"}
                registerProperty={register("price2")}
                errorText={errors?.price2?.message}
                type="text"
                isRequired
                placeholder="Enter price two"
              />
              <Input
                label={"Price Three"}
                registerProperty={register("price3")}
                errorText={errors?.price3?.message}
                type="text"
                isRequired
                placeholder="Enter price three"
              />
              <Input
                label={"Title One"}
                registerProperty={register("title1")}
                errorText={errors?.title1?.message}
                type="text"
                placeholder="Enter title"
              />
              <Input
                label={"Title Two"}
                registerProperty={register("title2")}
                errorText={errors?.title2?.message}
                type="text"
                placeholder="Enter title"
              />
              <Input
                label={"Title Three"}
                registerProperty={register("title3")}
                errorText={errors?.title3?.message}
                type="text"
                placeholder="Enter title"
              />
              <Input
                label={"Title Four"}
                registerProperty={register("title4")}
                errorText={errors?.title4?.message}
                type="text"
                placeholder="Enter title"
              />
              <Input
                label={"Title Five"}
                registerProperty={register("title5")}
                errorText={errors?.title5?.message}
                type="text"
                placeholder="Enter title"
              />
              <Input
                label={"Whatsapp Number"}
                registerProperty={register("whatsapp_number")}
                errorText={errors?.whatsapp_number?.message}
                type="number"
                isRequired
                placeholder="Enter whatsapp number"
              />
              <Input
                label={"Phone Number"}
                registerProperty={register("phone_number")}
                errorText={errors?.phone_number?.message}
                type="number"
                isRequired
                placeholder="Enter phone number"
              />
              <Input
                label={"Cross Sale Description"}
                registerProperty={register("cross_sell_products_description")}
                errorText={errors?.cross_sell_products_description?.message}
                type="text"
                isRequired
                placeholder="Enter description"
              />
              <Input
                label={"Cross Sell Title"}
                registerProperty={register("cross_sell_products_title")}
                errorText={errors?.cross_sell_products_title?.message}
                type="text"
                isRequired
                placeholder="Enter description"
              />
            </div>

            {/* Main Products Search */}
            <h3>Main Products</h3>
            <div className="my-4 relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="p-4 px-4 pr-10 w-full border bg-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                placeholder="Search for a product"
              />
              {filteredProducts.length > 0 && productSearch.length >= 2 && (
                <div className="absolute w-full bg-white dark:bg-gray-700 border rounded z-10 max-h-72 overflow-y-auto">
                  {filteredProducts.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleProductSelect(p)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex gap-4 items-center"
                    >
                      <Image
                        src={p.featured_image.src}
                        width={40}
                        height={40}
                        alt="Product"
                      />
                      <span>{p.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Main Products Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border dark:border-gray-500">
                <thead className="bg-blue-100 dark:bg-gray-800 dark:text-gray-300 h-[40px] shadow-sm border-b border-gray-300">
                  <tr>
                    <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                      Serial
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                      Product Image
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                      Product Name
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((p, idx) => (
                      <tr
                        key={p._id}
                        className="odd:bg-gray-100 dark:odd:bg-gray-700"
                      >
                        <td className="border dark:border-gray-600 px-4 py-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border dark:border-gray-600 px-4 py-2 text-center">
                          <Image
                            src={p.featured_image.src}
                            width={50}
                            height={50}
                            alt="Product"
                          />
                        </td>
                        <td className="border dark:border-gray-600 px-4 py-2">
                          {p.title}
                        </td>
                        <td className="border dark:border-gray-600 px-4 py-2 text-center">
                          <button
                            onClick={() => removeProduct(p._id)}
                            className="text-red-600"
                          >
                            <Icon name="delete" variant="filled" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 dark:text-gray-400"
                      >
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Cross Sell Search */}
            <h3>Cross Sell Product</h3>
            <div className="my-4 relative">
              <input
                type="text"
                value={crossSellSearch}
                onChange={(e) => setCrossSellSearch(e.target.value)}
                className="p-4 px-4 pr-10 w-full border bg-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                placeholder="Search for a cross sell product"
              />
              {filteredCrossSell.length > 0 && crossSellSearch.length >= 2 && (
                <div className="absolute w-full bg-white dark:bg-gray-700 border rounded z-10 max-h-72 overflow-y-auto">
                  {filteredCrossSell.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCrossSellSelect(p)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex gap-4 items-center"
                    >
                      <Image
                        src={p.featured_image.src}
                        width={40}
                        height={40}
                        alt="Product"
                      />
                      <span>{p.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {crossSellProduct && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border dark:border-gray-500 mb-4">
                  <thead className="bg-blue-100 dark:bg-gray-800 dark:text-gray-300 h-[40px] shadow-sm border-b border-gray-300">
                    <tr>
                      <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                        Serial
                      </th>
                      <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                        Product Image
                      </th>
                      <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                        Product Name
                      </th>
                      <th className="border dark:border-gray-600 px-4 py-2 text-sm font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border dark:border-gray-600 px-4 py-2 text-center">
                        1
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-center">
                        <Image
                          src={crossSellProduct.featured_image.src}
                          width={50}
                          height={50}
                          alt="Product"
                        />
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2">
                        {crossSellProduct.title}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-center">
                        <button
                          onClick={removeCrossSell}
                          className="text-red-600"
                        >
                          <Icon name="delete" variant="filled" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6 gap-3">
            <Button
              onClick={() => router.push("/admin/landing-page")}
              className="px-14 py-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-14 py-2 text-sm bg-blue-500 text-white rounded"
              disabled={isSubmit}
            >
              {isSubmit ? <ButtonLoader /> : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default EditLandingPage;
