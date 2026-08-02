"use client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/@components/core/Icon/Icon";
import Input from "@/@components/core/Input/Input";
import Button from "@/@components/core/Button/Button";
import { usePathname, useRouter } from "next/navigation";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import RadioGroup from "@/@components/core/Radio/RadioGroup";
import PaymentMethodRadioGroup from "@/@components/core/Radio/PaymentMethodRadioGroup";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import { pushToDataLayer } from "@/utils/gtm";
import { trimString } from "@/utils";
import Modal, { ModalType } from "@/@components/core/Modal/Modal";
import { inferShippingFromAddress } from "@/utils/data";
import { Gift, ShieldCheck, RefreshCw, Wallet } from "lucide-react";
import { ToastService } from "@/utils/toaster.service";
import { EMI_THRESHOLD } from "@/@components/pages/ProductDetails/emiData";
import CheckOutSignUp from "../pages/SignUp/CheckOutSignUp";

export type ModalState = {
  open: boolean;
  type: ModalType;
  title?: string;
  message?: string | React.ReactNode | undefined;
  autoCloseMs?: number;
};

const CUSTOMER_COOKIE_KEY = "customerInfo";
const CUSTOMER_COOKIE_MAX_AGE = 60 * 60 * 12;

const ProductSchema = yup.object({
  first_name: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 3 characters")
    .max(50, "Full name must not exceed 50 characters"),
  phone: yup
    .string()
    .required("Phone no is required")
    .transform((value) => value.replace(/[^\d]/g, ""))
    .length(11, "Phone must be exactly 11 digits"),
  address: yup
    .string()
    .required("Address is required")
    .min(3, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),
  payment: yup.mixed().required("Payment method is required"),
  shipping: yup.mixed().required("Shipping method is required"),
  email: yup.string(),
});

const defaultValue = {
  first_name: "",
  phone: "",
  address: "",
  email: "",
  // payment: "pay on bkash",
  payment: "cash on delivery",
  shipping: "all bangladesh",
};

const Checkout = ({ landingData }: any) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setRealTimeCartItems } = useContext(GlobalContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [couponData, setCouponData] = useState<any>();
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [duplicateMsg, setDuplicateMsg] = useState<string | null>(null);
  const [complete, setComplete] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<any>({});
  const [orderedItems, setOrderedItems] = useState<any>();
  const [checkOutSignup, setCheckOutSingUp] = useState<boolean>(false);
  const [duplicateData, setDuplicateData] = useState<any>();
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (landingData?.products?.length && selectedProducts.length === 0) {
      setSelectedProducts([{ ...landingData.products[0], quantity: 1 }]);
    }
  }, [landingData]);

  const selectProduct = (product: any, isCrossSell = false) => {
    if (isCrossSell) {
      const exists = selectedProducts.find((p) => p.isCrossSell);
      if (exists) {
        setSelectedProducts(selectedProducts.filter((p) => !p.isCrossSell));
      } else {
        setSelectedProducts([
          ...selectedProducts,
          { ...product, isCrossSell: true, quantity: 1 },
        ]);
      }
    } else {
      const crossSell = selectedProducts.find((p) => p.isCrossSell);
      if (crossSell)
        setSelectedProducts([{ ...product, quantity: 1 }, crossSell]);
      else setSelectedProducts([{ ...product, quantity: 1 }]);
    }
  };

  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "success",
    title: "",
    message: "",
    autoCloseMs: undefined,
  });

  const statusOption = [
    { value: "all bangladesh", label: "All Bangladesh", price: 100 },
    { value: "dhaka city", label: "Dhaka City", price: 60 },
  ];
  const defaultShippingPrice =
    statusOption.find((s) => s.value === defaultValue.shipping)?.price ?? 100;
  const [shippingPrice, setShippingPrice] =
    useState<number>(defaultShippingPrice);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  const shippingMethod = watch("shipping");
  const address = watch("address");
  const paymentMethod = watch("payment");

  const userPickedShippingRef = useRef(false);
  const saveCookieTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculateSubtotal = () =>
    selectedProducts.reduce(
      (total, item) =>
        total + item.wholesale_pricing.resale_price * (item.quantity || 1),
      0,
    );

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    let discount = 0;

    if (couponData) {
      if (couponData.discount_type === "fixed") discount = couponData.amount;
      else if (couponData.discount_type === "percentage")
        discount = (subtotal * couponData.amount) / 100;
    }

    return subtotal + shippingPrice - discount;
  };

  const paymentOption = useMemo(
    () => [
      {
        value: "cash on delivery",
        label: "Cash On Delivery",
      },
    ],
    [],
  );

  useEffect(() => {
    const subtotal = calculateSubtotal();
    let discount = 0;

    if (couponData) {
      if (couponData.discount_type === "fixed") discount = couponData?.amount;
      else if (couponData.discount_type === "percentage")
        discount = (subtotal * couponData.amount) / 100;
    }
  }, [couponData, shippingPrice, cartItems]);

  useEffect(() => {
    const selected = statusOption.find((opt) => opt.value === shippingMethod);
    if (selected) setShippingPrice(selected.price);
  }, [shippingMethod]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (userPickedShippingRef.current) return;
      const next = inferShippingFromAddress(address);
      if (next && next !== shippingMethod) {
        setValue("shipping", next, { shouldValidate: true, shouldDirty: true });
      }
    }, 250);
    return () => clearTimeout(id);
  }, [address, shippingMethod, setValue]);

  useEffect(() => {
    const cookieCart = getCookie("cartData");
    if (cookieCart) {
      try {
        const parsed = JSON.parse(cookieCart.toString());
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    const raw = getCookie(CUSTOMER_COOKIE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(String(raw));
      if (parsed && typeof parsed === "object") {
        if (parsed.first_name) setValue("first_name", parsed.first_name);
        if (parsed.phone) setValue("phone", parsed.phone);
        if (parsed.address) setValue("address", parsed.address);
        if (parsed.email) setValue("email", parsed.email);

        if (parsed.phone && String(parsed.phone).length === 11) {
          handleInComplete(parsed.phone);
          handleDuplicate(parsed.phone);
        }
      }
    } catch {}
  }, [setValue]);

  const watchedFirstName = watch("first_name");
  const watchedPhone = watch("phone");
  const watchedEmail = watch("email");
  const watchedAddress = watch("address");

  useEffect(() => {
    if (saveCookieTimerRef.current) clearTimeout(saveCookieTimerRef.current);

    saveCookieTimerRef.current = setTimeout(() => {
      const payload = {
        first_name: watchedFirstName || "",
        phone: (watchedPhone || "").replace(/[^\d]/g, ""),
        email: watchedEmail || "",
        address: watchedAddress || "",
      };

      try {
        setCookie(CUSTOMER_COOKIE_KEY, JSON.stringify(payload), {
          maxAge: CUSTOMER_COOKIE_MAX_AGE,
          path: "/",
          sameSite: "lax",
        });
      } catch {}
    }, 300);

    return () => {
      if (saveCookieTimerRef.current) clearTimeout(saveCookieTimerRef.current);
    };
  }, [watchedFirstName, watchedPhone, watchedEmail, watchedAddress]);

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
    setCookie("cartData", JSON.stringify(updatedCart), {
      path: "/",
      sameSite: "lax",
    });
  };

  const removeItem = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    setCookie("cartData", JSON.stringify(updatedCart), {
      path: "/",
      sameSite: "lax",
    });
  };

  const campaignPaths =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("campaign_paths") || "[]")
      : [];

  const formSubmit = async (formData: any) => {
    const lineItems = selectedProducts.map((item) => ({
      title: item.title,
      product_id: item._id || "N/A",
      sku: item.sku || item.variants?.[0]?.sku || "",
      size: item.size || item.variants?.[0]?.size || "",
      quantity: item.quantity,
      subtotal: item.wholesale_pricing?.resale_price * item.quantity,
      total: item.wholesale_pricing?.resale_price * item.quantity,
      price: item.wholesale_pricing?.resale_price,
      image: "",
    }));

    const selectedShipping = statusOption.find(
      (opt) => opt.value === formData.shipping,
    );

    if (paymentMethod === "pay on bkash") {
      setIsSubmit(true);
      const payload = {
        total: calculateTotal(),
        discount_total: Number(couponData?.amount) || 0,
        customer: {
          first_name: watch("first_name"),
          last_name: "",
          address: watch("address"),
          phone: watch("phone"),
          email: watch("email") || "",
        },
        line_items: lineItems,
        shipping_line: {
          title: selectedShipping?.label || "Standard Shipping",
          total: shippingPrice,
        },
        user: null,
        source: "website",
      };
      ProductService.createBkashPayment(payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success("Redirecting to Bkash...");
            window.location.href = res.data.checkoutURL;
            deleteCookie("cartData");
          }
        })
        .catch((err: any) => {
          ToastService.error(err.data.message);
        })
        .finally(() => setIsSubmit(false));
    } else if (paymentMethod === "pay with sslcommerz") {
      setIsSubmit(true);
      const payload = {
        total: calculateTotal(),
        discount_total: Number(couponData?.amount) || 0,
        customer: {
          first_name: watch("first_name"),
          last_name: "",
          address: watch("address"),
          phone: watch("phone"),
          email: watch("email") || "",
        },
        line_items: lineItems,
        shipping_line: {
          title: selectedShipping?.label || "Standard Shipping",
          total: shippingPrice,
        },
        user: null,
        source: "website",
      };

      ProductService.createSslCommerzPayment(payload)
        .then((res: any) => {
          const url =
            res?.data?.gatewayPageURL ||
            res?.data?.redirectURL ||
            res?.data?.GatewayPageURL;

          if (res?.success && url) {
            ToastService.success("Redirecting to SSLCommerz...");
            window.location.href = url;
            deleteCookie("cartData", { path: "/" });
            return;
          }

          ToastService.error(
            res?.message || "SSLCommerz checkout failed. Please try again.",
          );
        })
        .catch((err: any) => {
          ToastService.error(
            err?.data?.message || "SSLCommerz checkout failed",
          );
        })
        .finally(() => setIsSubmit(false));
    } else {
      setIsSubmit(true);
      try {
        setCustomerData({
          first_name: formData.first_name,
          email: formData.email || "",
          phone: formData.phone,
          address: formData.address,
        });

        const orderData = {
          discount_total: Number(couponData?.amount) || 0,
          total: calculateTotal(),
          due: calculateTotal(),

          customer: {
            first_name: formData.first_name,
            email: formData.email || "",
            phone: formData.phone,
            address: formData.address,
          },
          line_items: lineItems,
          shipping_line: {
            title: selectedShipping?.label || "Standard Shipping",
            total: shippingPrice,
          },
          ...(couponCode && {
            coupon: {
              code: couponCode,
              amount: Number(couponData?.amount) || 0,
            },
          }),
          payment: {
            title: formData.payment,
          },
          campaign: campaignPaths,
        };

        ProductService.createOrder(orderData)
          .then((res: any) => {
            if (res?.success) {
              deleteCookie("cartData", { path: "/" });
              setOrderedItems(res.data);

              setCookie("orderedData", JSON.stringify(res.data), {
                maxAge: 30 * 24 * 60 * 60,
                path: "/",
                sameSite: "lax",
              });

              router.push("/checkout/received-order");
              setComplete(true);

              if (res?.data) {
                const total = res?.data?.line_items?.reduce(
                  (sum: any, item: any) => sum + item.price * item.quantity,
                  0,
                );
                // pushToDataLayer({
                //   event: "purchase",
                //   ecommerce: {
                //     currency: "BDT",
                //     value: total + res?.data?.shipping_line.total,
                //     transaction_id: res?.data?._id,
                //     coupon: res?.data?.coupon.code,
                //     items: res?.data?.line_items.map((item: any) => {
                //       const categoryData: Record<string, string> = {};
                //       item.categories?.forEach((cat: any, index: number) => {
                //         categoryData[
                //           `item_category${index === 0 ? "" : index + 1}`
                //         ] = cat;
                //       });
                //       return {
                //         item_id: item?.product_id?._id,
                //         item_name: item.title,
                //         item_brand: item.brand,
                //         price: parseFloat(item.price.toString()),
                //         quantity: item.quantity,
                //         ...categoryData,
                //       };
                //     }),
                //     shiping: res?.data?.shipping_line.total,

                //     customer: {
                //       name: res?.data?.customer.first_name,
                //       phone: res?.data?.customer.phone,
                //       address: res?.data?.customer.address,
                //       email: res?.data?.customer.email,
                //     },
                //   },
                // });
              }
            } else {
              const openModal = (opts: Partial<ModalState>) =>
                setModal((s) => ({ ...s, open: true, ...opts }));

              openModal({
                type: "error",
                title: "Error",
                message: "Stock Not Avaible",
                autoCloseMs: 3000,
              });
            }
          })
          .catch((err: any) => {
            const openModal = (opts: Partial<ModalState>) =>
              setModal((s) => ({ ...s, open: true, ...opts }));

            openModal({
              type: "error",
              message: (
                <span className="text-primary">
                  {err?.data?.message === "INSUFFICIENT_STOCK"
                    ? "দুঃখিত! আপনার নির্বাচিত পণ্যের পর্যাপ্ত স্টক নেই।"
                    : err?.data?.message}
                </span>
              ),
            });
          })
          .finally(() => setIsSubmit(false));
      } catch (error) {
        console.error("Order submission error:", error);
        setIsSubmit(false);
      }
    }
  };

  const handleCoupon = () => {
    if (!couponCode.trim()) return;
    if (calculateSubtotal().toFixed(2) < 1500) {
      setCouponError(
        "Minimum order amount must be ৳1500 to apply this coupon.",
      );
      return;
    }

    const hasFlashSale = cartItems.some((item) =>
      item.categories.includes("flash-sale"),
    );

    if (hasFlashSale) {
      setCouponError("Flash sale পণ্যে কুপন প্রযোজ্য নয়");
      return;
    }

    setCouponLoading(true);
    setCouponError("");
    ProductService.applyCoupon({ code: couponCode })
      .then((res: any) => {
        if (res?.success) setCouponData(res.data);
        else setCouponError(res?.message || "Invalid coupon");
      })
      .catch((error: any) => {
        setCouponError(error?.data?.message || "Failed to apply coupon");
        const openModal = (opts: Partial<ModalState>) =>
          setModal((s) => ({ ...s, open: true, ...opts }));

        openModal({
          type: "error",
          title: "Coupon Error",
          message: "Failed to apply coupon",
          autoCloseMs: 3000,
        });
      })
      .finally(() => {
        setCouponLoading(false);
      });
  };

  const handleDuplicate = (phoneNo: string) => {
    ProductService.applyDuplicate({ phone: phoneNo })
      .then((res: any) => {
        if (res?.success) {
          let flag = Boolean(res?.data?.isDuplicate);

          setIsDuplicate(flag);
          setDuplicateMsg(
            flag ? res?.message || "Duplicate phone number found" : null,
          );
          setDuplicateData(res?.data);

          if (flag) {
            setError("phone", {
              type: "manual",
              message: res?.message || "Duplicate phone number found",
            });
          } else {
            clearErrors("phone");
          }
        }
      })
      .catch((err: { message: string }) => {
        console.error(err.message);
      });
  };

  useEffect(() => {
    handleDuplicate(watch("phone"));
  }, [paymentMethod]);

  const handleInComplete = (phoneNo: string) => {
    const lineItems = cartItems.map((item) => ({
      title: item.title,
      product_id: item.id || "N/A",
      sku: item.sku || "",
      size: item.size || "",
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      total: item.price * item.quantity,
      price: item.price,
    }));

    const orderData = {
      total: calculateTotal(),
      customer: {
        phone: phoneNo,
        first_name: watch("first_name"),
        address: watch("address"),
      },
      line_items: lineItems,
    };

    ProductService.applyInComplete(orderData).catch(
      (err: { message: string }) => {
        console.error(err.message);
      },
    );
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      pushToDataLayer({
        event: "begin_checkout",
        ecommerce: {
          currency: "BDT",
          value: parseFloat(total.toFixed(2)),
          coupon: couponCode || undefined,
          items: cartItems.map((item) => {
            const categoryData: Record<string, string> = {};
            item.categories?.forEach((cat: any, index: number) => {
              categoryData[`item_category${index === 0 ? "" : index + 1}`] =
                cat;
            });
            return {
              item_id: item.id,
              item_name: item.title,
              item_brand: item.brand,
              price: parseFloat(item.price.toString()),
              quantity: item.quantity,
              ...categoryData,
            };
          }),
          shipping: shippingPrice,
          customer: {
            name: customerData.first_name,
            phone: customerData.phone,
            address: customerData.address,
            email: customerData.email,
          },
        },
      });
    }
  }, [cartItems]);

  const normalizeCoupon = (value: string) => {
    return value.toLowerCase().replace(/[\s-_]/g, "");
  };

  const payload = {
    product_ids: cartItems?.map((item) => item.id).join(","),
  };

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    ProductService.getUpdatePrice(payload)
      .then((res: any) => {
        // ✅ safety check
        if (!res?.success || !Array.isArray(res?.data)) return;

        setCartItems((prev) => {
          const updatedCart = prev.map((item) => {
            const updatedProduct = res.data.find(
              (p: any) => String(p._id) === String(item.id),
            );

            if (!updatedProduct) return item;

            const salePrice = updatedProduct?.pricing?.sale_price ?? item.price;

            return {
              ...item,
              price: salePrice,
              total: salePrice * item.quantity,
            };
          });

          // ✅ cookie update (safe)
          setCookie("cartData", JSON.stringify(updatedCart), {
            path: "/",
            sameSite: "lax",
          });

          return updatedCart;
        });
      })
      .catch((err: any) => {
        console.error("Price update failed:", err);
      });
  }, [cartItems.length]);

  {
    selectedProducts.map((item, index) => {
      const isMain = !item.isCrossSell;
      const itemQuantity = isMain ? quantity : 1;
      return (
        <div
          key={index}
          className="flex justify-between items-center py-4 border-b border-gray-200"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                isMain ? setQuantity(1) : selectProduct(item, true)
              }
            >
              <Icon
                name="delete"
                size={16}
                className="text-primary hover:bg-primary-lighter cursor-pointer p-0.5 hover:rounded-full"
              />
            </button>
            <Image
              src={item.featured_image.src}
              height={40}
              width={50}
              alt={item.title}
              className="rounded-lg border border-gray-300"
            />
            <div>
              <p className="font-bold">{trimString(item.title, 34)}</p>
              {isMain && (
                <div className="flex items-center mt-1">
                  <button
                    disabled={quantity === 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="w-6 h-6 border rounded border-gray-400"
                  >
                    -
                  </button>
                  <span className="w-6 h-6 text-center">{quantity}</span>
                  <button
                    disabled={
                      quantity === item.inventory.stock_quantity ||
                      quantity >= 5
                    }
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-6 h-6 border rounded border-gray-400"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="font-bold">
            ৳{(item.pricing.sale_price * itemQuantity).toFixed(2)}
          </p>
        </div>
      );
    });
  }

  const updateProductQuantity = (productId: string, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p._id !== productId) return p;
        const newQty = Math.max(
          1,
          Math.min(p.inventory.stock_quantity, (p.quantity || 1) + delta),
        );
        return { ...p, quantity: newQty };
      }),
    );
  };

  return (
    <div className="max-w-layout mx-auto py-4 md:py-6 4xl:px-0 md:px-3 px-3">
      <Modal
        isOpen={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => {
          setModal((s) => ({ ...s, open: false }));
        }}
        primaryActionText={modal.type === "warning" ? "Proceed" : undefined}
        onPrimaryAction={() => {
          setModal((s) => ({ ...s, open: false }));
        }}
        secondaryActionText={modal.type === "warning" ? "Cancel" : undefined}
        onSecondaryAction={() => setModal((s) => ({ ...s, open: false }))}
      />
      <div>
        <h4 className="text-2xl font-bold text-primary">
          আপনার পছন্দের রঙ কোনটি?
        </h4>
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {landingData?.products
            .filter(
              (product: any) =>
                product.inventory?.stock_status === "in-stock" &&
                product.inventory?.stock_quantity > 0,
            )
            .map((product: any) => (
              <label
                key={product._id}
                className={`border rounded-xl p-2 cursor-pointer flex items-center gap-2 ${
                  selectedProducts[0]?._id === product._id
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="mainProduct"
                  checked={selectedProducts[0]?._id === product._id}
                  onChange={() => selectProduct(product)}
                  // className="hidden"
                />
                <Image
                  src={product.featured_image.src}
                  alt={product.title}
                  height={60}
                  width={60}
                  className="object-contain rounded-xl"
                />
                <div>
                  <h3 className="font-bold text-lg">{product.title}</h3>
                  <p className="text-primary font-bold text-lg">
                    ৳{product.wholesale_pricing.resale_price}
                  </p>
                </div>
              </label>
            ))}
        </div>
      </div>
      <form onSubmit={handleSubmit(formSubmit)}>
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Left */}
          <div className="w-full lg:w-4/7 rounded-lg">
            <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
              <h2 className="font-bold text-[18px] text-primary">
                Customer Information
              </h2>

              <Input
                label="Full Name (আপনার নাম)"
                registerProperty={register("first_name")}
                errorText={errors?.first_name?.message}
                type="text"
                isRequired
                classNames="md:mb-5 mb-4"
              />

              <Input
                label="Mobile Number (মোবাইল নাম্বার)"
                registerProperty={register("phone")}
                errorText={errors.phone?.message}
                type="text"
                isRequired
                inputmode="numeric"
                classNames="md:mb-5 mb-4"
                onChange={(e: any) => {
                  const formattedValue = String(e.target.value || "").replace(
                    /[^\d]/g,
                    "",
                  );
                  setValue("phone", formattedValue, { shouldValidate: true });

                  if (formattedValue.length === 11) {
                    handleInComplete(formattedValue);
                    handleDuplicate(formattedValue);
                  } else {
                    if (isDuplicate) setIsDuplicate(false);
                    if (duplicateMsg) setDuplicateMsg(null);
                    clearErrors("phone");
                  }
                }}
              />

              <Input
                label="Delivery Address (ঠিকানা)"
                registerProperty={register("address")}
                errorText={errors?.address?.message}
                type="textarea"
                isRequired
                classNames="md:mb-4 mb-1"
              />

              <Input
                label="Email (Optional)"
                registerProperty={register("email")}
                errorText={errors?.email?.message}
                type="email"
                classNames="md:mb-5 mb-4"
              />
            </div>

            <div className="py-4 p-5 rounded-xl shadow border border-gray-200 bg-white mt-6">
              <p className="font-bold mb-2 text-primary">Shipping</p>
              <Controller
                name="shipping"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <RadioGroup
                      name={field.name}
                      options={statusOption}
                      value={field.value}
                      onChange={(selected) => {
                        userPickedShippingRef.current = true;
                        field.onChange(selected.value);
                        setShippingPrice(selected.price || 0);
                      }}
                      errorText={error?.message}
                    />
                    {error && (
                      <p className="text-danger text-sm mt-1">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="w-full lg:w-3/7">
            <div className="h-auto bg-white rounded-lg p-5 border border-gray-200 shadow">
              <div className="flex items-center justify-between pb-3">
                <p className="font-bold text-primary">Order Summary</p>
              </div>

              {selectedProducts?.length > 0 &&
                selectedProducts.map((product, index) => (
                  <div
                    key={product._id || index}
                    className="flex justify-between items-center py-4 border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {/* Remove */}
                      <button type="button" onClick={() => setQuantity(1)}>
                        <Icon
                          name="delete"
                          size={16}
                          className="text-primary hover:bg-primary-lighter cursor-pointer p-0.5 hover:rounded-full"
                        />
                      </button>

                      <div className="flex items-start gap-2">
                        <Image
                          className="rounded-lg border border-gray-300"
                          height={40}
                          width={50}
                          src={product.featured_image.src}
                          alt={product.title}
                        />

                        <div>
                          <p className="text-md font-bold">
                            {trimString(product.title, 34)}
                          </p>

                          {/* Quantity Control */}
                          <div className="flex items-center mt-1 gap-1">
                            <button
                              type="button"
                              className="w-6 h-6 border border-gray-400 rounded"
                              disabled={product.quantity === 1}
                              onClick={() =>
                                updateProductQuantity(product._id, -1)
                              }
                            >
                              -
                            </button>

                            <span className="w-6 h-6 text-center">
                              {product.quantity}
                            </span>

                            <button
                              type="button"
                              className="w-6 h-6 border border-gray-400 rounded"
                              disabled={
                                product.quantity ===
                                  product.inventory.stock_quantity ||
                                product.quantity >= 5
                              }
                              onClick={() =>
                                updateProductQuantity(product._id, +1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <p className="font-bold">
                        ৳
                        {(
                          product.wholesale_pricing.resale_price * quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

              {couponData?.amount ? (
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <p className="font-semibold">Coupon (-)</p>
                  <p className="text-primary-dark font-semibold">
                    {couponData?.discount_type === "fixed" && "৳"}
                    {couponData?.amount}
                    {couponData?.discount_type === "percentage" && "%"}
                  </p>
                </div>
              ) : null}
              <div className="flex justify-between items-center pt-4">
                <p className="font-normal">
                  Subtotal ({cartItems?.length} items)
                </p>
                <p className="text-primary-dark font-bold">
                  ৳{calculateSubtotal().toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center pb-4 pt-2 border-b border-gray-200">
                <p className="font-normal">Shipping (+)</p>
                <p className="text-primary-dark font-bold">
                  ৳{shippingPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-2">
                  <p className="font-bold">Total</p>
                  {calculateTotal() > EMI_THRESHOLD && (
                    <span className="rounded-full border border-primary-border bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                      EMI Available
                    </span>
                  )}
                </div>
                <p className="text-primary-dark font-bold">
                  ৳{calculateTotal().toFixed(2)}
                </p>
              </div>
              {landingData?.cross_sell_product && (
                <label
                  className={`border rounded-xl p-2 cursor-pointer flex items-center gap-2 mt-4 ${
                    selectedProducts.find((p) => p.isCrossSell)?._id ===
                    landingData.cross_sell_product._id
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedProducts.find((p) => p.isCrossSell)}
                    onChange={() =>
                      selectProduct(landingData.cross_sell_product, true)
                    }
                    // className="hidden"
                  />
                  <Image
                    src={landingData.cross_sell_product.featured_image.src}
                    alt={landingData.cross_sell_product.title}
                    height={60}
                    width={60}
                    className="object-contain rounded-xl"
                  />
                  <div>
                    <h3 className="font-bold text-lg">
                      {landingData.cross_sell_product.title}
                    </h3>
                    <p className="text-primary font-bold text-lg">
                      ৳
                      {
                        landingData.cross_sell_product.wholesale_pricing
                          .resale_price
                      }
                    </p>
                  </div>
                </label>
              )}
            </div>
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-primary">
                Payment Information
              </p>
              <Controller
                name="payment"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div>
                    <PaymentMethodRadioGroup
                      name={field.name}
                      options={paymentOption}
                      value={String(field.value ?? "")}
                      onChange={(selected) => field.onChange(selected.value)}
                      errorText={error?.message}
                    />
                    {error && (
                      <p className="mt-1 text-sm text-danger">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="pt-1 lg:hidden block">
            <Button
              type="submit"
              className={`!py-3 ${
                isDuplicate || isSubmit
                  ? "!bg-primary-muted !text-gray-200 !py-1"
                  : "premium-cta"
              } w-full uppercase cursor-pointer !font-bold`}
              disabled={isDuplicate || isSubmit}
            >
              {isSubmit ? (
                <ButtonLoader className="mt-1" />
              ) : (
                `Confirm Order - ৳${calculateTotal().toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
        {/* Desktop submit */}
        <div className="pt-5 lg:block hidden">
          <Button
            type="submit"
            className={`!py-5 !text-3xl ${
              isDuplicate || isSubmit
                ? "!bg-primary-muted !text-gray-200 !py-1"
                : "premium-cta"
            } w-full uppercase cursor-pointer !font-bold`}
            disabled={isDuplicate || isSubmit}
          >
            {
              // !complete ? (
              isSubmit ? (
                <ButtonLoader className="mt-1" />
              ) : (
                `${
                  paymentMethod === "pay on bkash"
                    ? "Pay With Bkash"
                    : paymentMethod === "pay with sslcommerz"
                      ? "Pay With SSLCommerz"
                      : "Confirm Order"
                } - ৳${calculateTotal().toFixed(2)}`
              )
              // ) : (
              //   "Verify Otp"
              // )
            }
          </Button>
        </div>
        <div className="mt-6">
          <h2 className="font-bold text-3xl text-center text-green-600">
            অর্ডার কন্ফার্ম করতে Confirm Order এ ক্লিক করুন
          </h2>
        </div>
      </form>

      <CheckOutSignUp
        isModalOpen={checkOutSignup}
        setIsModalOpen={setCheckOutSingUp}
      />
    </div>
  );
};

export default Checkout;
