"use client";
import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import Input from "@admin/components/core/Input/Input";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import AuthLayout from "@admin/layouts/AuthLayout";
import RadioOrderGroup from "@admin/components/core/Radio/RadioOrderGroup";
import Icon from "@admin/components/core/Icon/Icon";
import Image from "next/image";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ToastService } from "@admin/utils/toastr.service";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import EmptyCart from "@admin/components/pages/Orders/EmptyCart";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import SelectComponent from "@admin/components/core/Select/Select";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";

const ProductSchema = yup.object({
  first_name: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 3 characters")
    .max(50, "Full name must not exceed 50 characters"),
  phone: yup
    .string()
    .required("Phone no is required")
    .transform((v) => v.replace(/[^\d]/g, ""))
    .length(11, "Phone must be exactly 11 digits"),
  address: yup
    .string()
    .required("Address is required")
    .min(3, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),
  payment: yup.mixed().required("Payment method is required"),
  domain: yup.string().required("Website list is required"),
  user: yup.mixed().required("Salesperson is required"),
  email: yup.string(),
});

const defaultValue = {
  first_name: "",
  phone: "",
  address: "",
  email: "",
  payment: "cash on delivery",
  domain: "",
  user: null,
};

const page: React.FC = () => {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>({ line_items: [] });
  const [discount, setDiscount] = useState<number | null>();
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [salespersonOptions, setSalespersonOptions] = useState<SelectOption[]>(
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    fetchWebList();
    fetchSalespersonList();
  }, []);

  const fetchSalespersonList = async () => {
    TeamService.getWarehouseUserSuggestions()
      .then((res: any) => {
        if (res?.success) {
          setSalespersonOptions(
            res?.data?.map((item: any) => ({
              label: item.name,
              value: item._id,
            })) ?? [],
          );
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const options = res.data
            .filter((item: any) => item.web_name !== "Naviforce Wholesale")
            .map((item: any) => ({
              label: item.web_name,
              value: item.web_url,
            }));
          setWebsiteOptions(options);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const url = watch("domain");

  const subTotal = orderDetails.line_items.reduce(
    (sum: number, item: any) => sum + item.total,
    0,
  );
  const orderTotal = subTotal;
  const due = subTotal - (discount ?? 0);

  const formSubmit = async (formData: any) => {
    try {
      if (!orderDetails.line_items.length) {
        ToastService.error("Please add at least one product to the order.");
        return;
      }

      setIsSubmit(true);

      const payload = {
        total: orderTotal,
        discount_total: discount,
        due: due,
        customer: {
          first_name: formData.first_name,
          last_name: "",
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
        },
        line_items: orderDetails.line_items.map((item: any) => ({
          title: item.title,
          product_id: item.product_id._id,
          quantity: item.quantity,
          subtotal: item.subtotal,
          total: item.total,
          price: item.price,
        })),
        domain: formData.domain,
        salesman: formData.user?.value,
        status: "in-transit",
        shipping_line: {
          title: "Free Delivery",
          total: 0,
        },
        payment_method: "Cash On Delivery",
        campaign: [formData.source],
      };

      const res = await OrdersService.createShowroomOrder(payload);
      if (res?.success) {
        ToastService.success("Order created successfully!");
        router.push("/admin/create-order/order-received");
        setCookie("orderedData", JSON.stringify(res.data), {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          sameSite: "lax",
        });

        localStorage.setItem("orderedData", JSON.stringify(res.data));
      } else {
        ToastService.error(res?.message || "Failed to create order.");
      }
    } catch (err: any) {
      if (err.message === "Order already placed within the last hour.") {
        setError("phone", {
          message:
            "একই নাম্বার থেকে ১ ঘন্টার মধ্যে একাধিক অর্ডার নেওয়া যাবে না।",
        });
      } else {
        ToastService.error(err.message || "Something went wrong.");
      }
    } finally {
      setIsSubmit(false);
    }
  };

  const handleSearchChange = (e: any) => {
    const val = e.target.value;
    setProductSearch(val);
    if (val.length >= 2) fetchProductSearch(val);
    else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const fetchProductSearch = async (val: string) => {
    try {
      const res = await productService.getProductShowroomSuggestion({
        searchTerm: val,
        domain: url,
      });
      if (res?.success) {
        setFilteredProducts(res.data);
        setShowSuggestions(true);
      } else ToastService.error(res?.message);
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    if (productSearch.length >= 2) fetchProductSearch(productSearch);
  };

  return (
    <AuthLayout>
      <div className="p-3 md:p-4">
        <form
          className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start"
          onSubmit={handleSubmit(formSubmit)}
        >
          {/* Left Side */}
          <div className="xl:col-span-7 space-y-4">
            {/* Customer Info */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                <h2 className="text-base md:text-lg font-semibold text-[#bc1115] flex items-center gap-2">
                  <Icon name="person" variant="outlined" />
                  Customer Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Fill in customer details to confirm the order.
                </p>
              </div>

              <div className="p-4 space-y-3">
                <Input
                  label="Full Name"
                  registerProperty={register("first_name")}
                  errorText={errors?.first_name?.message}
                  isRequired
                />
                <Input
                  label="Phone"
                  registerProperty={register("phone")}
                  errorText={errors?.phone?.message}
                  isRequired
                />
                <Input
                  label="Address"
                  registerProperty={register("address")}
                  errorText={errors?.address?.message}
                  isRequired
                />
                <Input
                  label="Email"
                  registerProperty={register("email")}
                  errorText={errors?.email?.message}
                />
              </div>
            </div>

            {/* Website List */}
            <div
              className={`rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden ${
                errors?.domain?.message ? "border-red-400" : "border-gray-200"
              }`}
            >
              <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                <h2 className="text-base md:text-lg font-semibold text-[#bc1115] flex items-center gap-2">
                  <Icon name="language" variant="outlined" />
                  Website List
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the website where this order will be placed.
                </p>
              </div>

              <div className="p-4">
                <Controller
                  name="domain"
                  control={control}
                  render={({ field }) => (
                    <RadioOrderGroup
                      name={field.name}
                      options={websiteOptions}
                      value={field.value}
                      onChange={(s) => field.onChange(s.value)}
                    />
                  )}
                />
                {errors?.domain?.message && (
                  <p className="text-xs text-red-500 mt-2">
                    {errors.domain.message}
                  </p>
                )}
              </div>
            </div>

            {/* Salesperson List */}
            <div
              className={`rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden ${
                errors?.user?.message ? "border-red-400" : "border-gray-200"
              }`}
            >
              <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                <h2 className="text-base md:text-lg font-semibold text-[#bc1115] flex items-center gap-2">
                  <Icon name="group" variant="outlined" />
                  Salesperson List
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the salesperson for this showroom order.
                </p>
              </div>

              <div className="p-4">
                <Controller
                  name="user"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      options={salespersonOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Salesperson"
                    />
                  )}
                />
                {errors?.user?.message && (
                  <p className="text-xs text-red-500 mt-2">
                    {errors.user.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="xl:col-span-5">
            <div className="sticky top-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800">
                <h2 className="text-base md:text-lg font-semibold text-[#bc1115] flex items-center gap-2">
                  <Icon name="shopping_bag" variant="outlined" />
                  Order Summary
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add products and review total before confirming.
                </p>
              </div>

              <div className="p-4">
                {/* Product Search */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Search Product
                  </label>

                  <input
                    ref={inputRef}
                    type="text"
                    value={productSearch}
                    onChange={handleSearchChange}
                    disabled={!url}
                    placeholder="Search for a product"
                    className={`w-full rounded-lg border p-2.5 pr-10 bg-white dark:bg-gray-800 outline-none transition
                border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-900/30
                ${!url ? "opacity-50 cursor-not-allowed" : ""}`}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearchSubmit(e)
                    }
                    onFocus={() =>
                      productSearch.length >= 2 && setShowSuggestions(true)
                    }
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-blue-500 transition-colors"
                    onClick={handleSearchSubmit}
                  >
                    <Icon name="search" variant="outlined" />
                  </button>

                  {showSuggestions && productSearch.length >= 2 && (
                    <div className="absolute left-0 w-full bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 border border-gray-200 mt-2 rounded-lg z-20 max-h-80 overflow-y-auto shadow-lg">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p: any, i) => (
                          <div
                            key={i}
                            className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center cursor-pointer transition-colors gap-3"
                            onClick={() => {
                              const salePrice =
                                url === "https://timeverse.com.bd"
                                  ? p.pricing?.tv_sale_price
                                  : p.pricing?.sale_price;

                              setOrderDetails((prev: any) => {
                                const already = prev.line_items.find(
                                  (li: any) => li.product_id._id === p._id,
                                );
                                if (already) {
                                  return {
                                    ...prev,
                                    line_items: prev.line_items.map(
                                      (li: any) =>
                                        li.product_id._id === p._id
                                          ? {
                                              ...li,
                                              quantity: li.quantity + 1,
                                              total:
                                                (li.quantity + 1) * li.price,
                                            }
                                          : li,
                                    ),
                                  };
                                }
                                return {
                                  ...prev,
                                  line_items: [
                                    ...prev.line_items,
                                    {
                                      title: p.title,
                                      product_id: { _id: p._id },
                                      quantity: 1,
                                      subtotal: salePrice,
                                      total: salePrice,
                                      price: salePrice,
                                      image: p.featured_image?.src || "",
                                    },
                                  ],
                                };
                              });
                              setProductSearch("");
                              setFilteredProducts([]);
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Image
                                src={p.featured_image?.src || NodataImage}
                                width={38}
                                height={38}
                                alt=""
                                className="rounded-md object-cover border border-gray-200 dark:border-gray-600 shrink-0"
                              />
                              <span className="text-sm font-medium truncate">
                                {p.title}
                              </span>
                            </div>
                            <span className="font-semibold text-[#bc1115] whitespace-nowrap">
                              ৳
                              {url === "https://timeverse.com.bd"
                                ? p.pricing?.tv_sale_price
                                : p.pricing?.sale_price}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {orderDetails?.line_items?.length ? (
                    orderDetails.line_items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30 p-3 flex justify-between gap-3"
                      >
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="flex items-start pt-0.5">
                            <button
                              type="button"
                              className="h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 flex items-center justify-center transition shrink-0"
                              onClick={() =>
                                setOrderDetails((prev: any) => ({
                                  ...prev,
                                  line_items: prev.line_items.filter(
                                    (li: any) =>
                                      li.product_id._id !== item.product_id._id,
                                  ),
                                }))
                              }
                            >
                              <Icon name="delete" />
                            </button>
                          </div>

                          <Image
                            src={item.image || NodataImage}
                            width={80}
                            height={40}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(item.image);
                            }}
                            alt=""
                            className="rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0 cursor-pointer"
                          />

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800 dark:text-white line-clamp-2">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ৳{item.price} × {item.quantity}
                            </p>

                            <div className="mt-2 inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden bg-white dark:bg-gray-800">
                              <button
                                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                type="button"
                                onClick={() =>
                                  setOrderDetails((prev: any) => ({
                                    ...prev,
                                    line_items: prev.line_items.map(
                                      (li: any) =>
                                        li.product_id._id ===
                                          item.product_id._id && li.quantity > 1
                                          ? {
                                              ...li,
                                              quantity: li.quantity - 1,
                                              total:
                                                (li.quantity - 1) * li.price,
                                            }
                                          : li,
                                    ),
                                  }))
                                }
                              >
                                -
                              </button>

                              <span className="h-8 min-w-[34px] flex items-center justify-center text-sm font-medium border-x border-gray-300 dark:border-gray-600">
                                {item.quantity}
                              </span>

                              <button
                                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                type="button"
                                onClick={() =>
                                  setOrderDetails((prev: any) => ({
                                    ...prev,
                                    line_items: prev.line_items.map(
                                      (li: any) =>
                                        li.product_id._id ===
                                        item.product_id._id
                                          ? {
                                              ...li,
                                              quantity: li.quantity + 1,
                                              total:
                                                (li.quantity + 1) * li.price,
                                            }
                                          : li,
                                    ),
                                  }))
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right min-w-[70px] flex flex-col justify-between">
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Total
                          </p>
                          <p className="font-semibold text-sm text-[#bc1115]">
                            ৳{item.total}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="">
                      <EmptyCart />
                    </div>
                  )}
                </div>

                {/* Discount */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Discount (৳)
                  </label>
                  <input
                    type="number"
                    defaultValue={discount ?? ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    className="w-full rounded-lg border p-2.5 bg-white dark:bg-gray-800 outline-none transition
                border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-900/30"
                    placeholder="Enter discount"
                  />
                </div>

                {/* Totals */}
                <div className="mt-4 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-medium">৳{subTotal}</span>
                  </div>

                  {discount ? (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Discount</span>
                      <span>-৳{discount}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between pt-2 border-t border-dashed border-gray-300 dark:border-gray-600">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Total
                    </span>
                    <span className="font-bold text-base text-[#bc1115]">
                      ৳{orderTotal}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Due
                    </span>
                    <span className="font-bold text-lg text-red-600">
                      ৳{due}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full !h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                  >
                    {isSubmit ? <ButtonLoader /> : `Confirm Order - ৳${due}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </AuthLayout>
  );
};

export default page;
