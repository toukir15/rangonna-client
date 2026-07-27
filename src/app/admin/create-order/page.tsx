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
import { useGlobalContext } from "@admin/context/GlobalContext";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";

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
  shipping: yup.string().required("Shipping method is required"),
  source: yup.string().required("Source is required"),
  email: yup.string(),
});

const defaultValue = {
  first_name: "",
  phone: "",
  address: "",
  email: "",
  payment: "cash on delivery",
  shipping: "",
  source: "",
};

const page: React.FC = () => {
  const router = useRouter();
  const { sourceOptions } = useGlobalContext();
  const [isSubmit, setIsSubmit] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>({ line_items: [] });
  const [discount, setDiscount] = useState<number | null>();
  const [shippingPrice, setShippingPrice] = useState<number>(0);
  const [domain, setDomain] = useState<string>("");
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

  const inputRef = useRef<HTMLInputElement>(null);

  const statusOption = [
    { value: "all bangladesh", label: "All Bangladesh", price: 100 },
    { value: "dhaka city", label: "Dhaka City", price: 60 },
    { value: "free delivery", label: "Free Delivery", price: 0 },
  ];

  const paymentOption = [
    { value: "cash on delivery", label: "Cash On Delivery" },
  ];

  useEffect(() => {
    fetchWebList();
  }, []);

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const websites = res.data.filter(
            (item: any) => item.web_name !== "Naviforce Wholesale",
          );
          if (websites.length > 0) {
            setDomain(websites[0].web_url);
          }
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const subTotal = orderDetails.line_items.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );
  const orderTotal = subTotal + shippingPrice;
  const due = subTotal + shippingPrice - (discount ?? 0);

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
        shipping_line: { title: formData.shipping, total: shippingPrice },
        source: formData.source,
        domain,
        status: formData.source === "showroom" ? "in-transit" : "pending",
        payment: {
          title: formData.payment,
        },
        campaign: [formData.source],
      };




      const res = await OrdersService.createOrder(payload);
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
      const res = await productService.getProductSuggestion({
        searchTerm: val,
        domain,
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
            {/* Customer Information */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h2 className="font-semibold text-base md:text-lg text-[#bc1115] flex items-center gap-2">
                  <Icon name="person" variant="outlined" />
                  Customer Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter customer details to continue this order.
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

            {/* Shipping & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden ${errors?.shipping?.message ? "border-red-400" : "border-gray-200"
                  }`}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h2 className="font-semibold text-base text-[#bc1115] flex items-center gap-2">
                    <Icon name="local_shipping" variant="outlined" />
                    Shipping
                  </h2>
                </div>

                <div className="p-4">
                  <Controller
                    name="shipping"
                    control={control}
                    render={({ field }) => (
                      <RadioOrderGroup
                        name={field.name}
                        options={statusOption}
                        value={field.value}
                        onChange={(s) => {
                          field.onChange(s.value);
                          setShippingPrice(s.price || 0);
                        }}
                      />
                    )}
                  />
                  {errors?.shipping?.message && (
                    <p className="text-xs text-red-500 mt-2">
                      {errors.shipping.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h2 className="font-semibold text-base text-[#bc1115] flex items-center gap-2">
                    <Icon name="payments" variant="outlined" />
                    Payment
                  </h2>
                </div>

                <div className="p-4">
                  <Controller
                    name="payment"
                    control={control}
                    render={({ field }) => (
                      <RadioOrderGroup
                        name={field.name}
                        options={paymentOption}
                        value={field.value}
                        onChange={(s) => field.onChange(s.value)}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Order Source */}
            <div
              className={`rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden ${errors?.source?.message ? "border-red-400" : "border-gray-200"
                }`}
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h2 className="font-semibold text-base text-[#bc1115] flex items-center gap-2">
                  <Icon name="campaign" variant="outlined" />
                  Order Source
                </h2>
              </div>

              <div className="p-4">
                <Controller
                  name="source"
                  control={control}
                  render={({ field }) => (
                    <RadioOrderGroup
                      name={field.name}
                      options={sourceOptions}
                      value={field.value}
                      onChange={(s) => field.onChange(s.value)}
                    />
                  )}
                />
                {errors?.source?.message && (
                  <p className="text-xs text-red-500 mt-2">
                    {errors.source.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="xl:col-span-5">
            <div className="sticky top-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h2 className="font-semibold text-base md:text-lg text-[#bc1115] flex items-center gap-2">
                  <Icon name="shopping_cart" variant="outlined" />
                  Order Summary
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add products and review the amount before placing the order.
                </p>
              </div>

              <div className="p-4">
                {/* Search */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Search Product
                  </label>

                  <input
                    ref={inputRef}
                    type="text"
                    value={productSearch}
                    onChange={handleSearchChange}
                    disabled={!domain}
                    placeholder="Search for a product"
                    className={`w-full rounded-lg border p-2.5 pr-10 bg-white dark:bg-gray-800 outline-none transition
                border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-900/30
                ${!domain ? "opacity-50 cursor-not-allowed" : ""}`}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
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
                            className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center cursor-pointer transition-colors"
                            onClick={() => {
                              const salePrice = p.pricing?.sale_price;

                              setOrderDetails((prev: any) => {
                                const already = prev.line_items.find(
                                  (li: any) => li.product_id._id === p._id
                                );
                                if (already) {
                                  return {
                                    ...prev,
                                    line_items: prev.line_items.map((li: any) =>
                                      li.product_id._id === p._id
                                        ? {
                                          ...li,
                                          quantity: li.quantity + 1,
                                          total: (li.quantity + 1) * li.price,
                                        }
                                        : li
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
                                width={40}
                                height={40}
                                alt=""
                                className="rounded-md border border-gray-200 dark:border-gray-600 object-cover"
                              />
                              <span className="font-medium text-sm truncate">
                                {p.title}
                              </span>
                            </div>
                            <span className="font-semibold text-[#bc1115] ml-3 whitespace-nowrap">
                              ৳
                              {p.pricing?.sale_price}
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

                {/* Items */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {orderDetails?.line_items?.length ? (
                    orderDetails.line_items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/30 p-3 flex justify-between gap-3"
                      >
                        <div className="flex gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            className="h-8 w-8 shrink-0 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 flex items-center justify-center transition"
                            onClick={() =>
                              setOrderDetails((prev: any) => ({
                                ...prev,
                                line_items: prev.line_items.filter(
                                  (li: any) =>
                                    li.product_id._id !== item.product_id._id
                                ),
                              }))
                            }
                          >
                            <Icon name="delete" />
                          </button>

                          <Image
                            src={item.image || NodataImage}
                            width={80}
                            height={40}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(
                                item.image
                              );
                            }}
                            alt=""
                            className="rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0 cursor-pointer"
                          />

                          <div className="min-w-0 flex-1">
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
                                    line_items: prev.line_items.map((li: any) =>
                                      li.product_id._id === item.product_id._id &&
                                        li.quantity > 1
                                        ? {
                                          ...li,
                                          quantity: li.quantity - 1,
                                          total: (li.quantity - 1) * li.price,
                                        }
                                        : li
                                    ),
                                  }))
                                }
                              >
                                -
                              </button>

                              <span className="h-8 min-w-[36px] flex items-center justify-center text-sm font-medium border-x border-gray-300 dark:border-gray-600">
                                {item.quantity}
                              </span>

                              <button
                                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                type="button"
                                onClick={() =>
                                  setOrderDetails((prev: any) => ({
                                    ...prev,
                                    line_items: prev.line_items.map((li: any) =>
                                      li.product_id._id === item.product_id._id
                                        ? {
                                          ...li,
                                          quantity: li.quantity + 1,
                                          total: (li.quantity + 1) * li.price,
                                        }
                                        : li
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
                    <EmptyCart />
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
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">৳{subTotal}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium">৳{shippingPrice}</span>
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
              </div>

              <div className="px-4 pb-4">
                <Button
                  type="submit"
                  className="w-full !inline-flex !h-11 !items-center !justify-center !rounded-lg !bg-green-600 !px-4 !py-0 text-white font-medium shadow-sm hover:!bg-green-700"
                >
                  {isSubmit ? <ButtonLoader /> : `Confirm Order - ৳${due}`}
                </Button>
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
