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
// import OtpModal from "../SignUp/OtpModal";
import CheckOutSignUp from "../SignUp/CheckOutSignUp";
import { ShieldCheck, Truck, Banknote, PackageCheck } from "lucide-react";
import { ToastService } from "@/utils/toaster.service";
import { EMI_THRESHOLD } from "@/@components/pages/ProductDetails/emiData";

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

const Checkout: React.FC = () => {
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
  // const [isOtpModal, setIsOtpModal] = useState<boolean>(false);
  const [complete, setComplete] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<any>({});
  const [orderedItems, setOrderedItems] = useState<any>();
  const [checkOutSignup, setCheckOutSingUp] = useState<boolean>(false);
  const [duplicateData, setDuplicateData] = useState<any>();

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
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    let discount = 0;

    if (couponData) {
      if (couponData.discount_type === "fixed") {
        discount = couponData.amount;
      } else if (couponData.discount_type === "percentage") {
        discount = (subtotal * couponData.amount) / 100;
      }
    }
    return subtotal + shippingPrice;
  };
  const calculateDue = () => {
    const subtotal = calculateSubtotal();
    let discount = 0;

    if (couponData) {
      if (couponData.discount_type === "fixed") {
        discount = couponData.amount;
      } else if (couponData.discount_type === "percentage") {
        discount = (subtotal * couponData.amount) / 100;
      }
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
    const lineItems = cartItems.map((item) => ({
      title: item.title,
      product_id: item.id || "N/A",
      sku: item.sku || "",
      size: item.size || "",
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      total: item.price * item.quantity,
      price: item.price,
      image: "",
    }));

    const selectedShipping = statusOption.find(
      (opt) => opt.value === formData.shipping,
    );

    if (paymentMethod === "pay on bkash") {
      setIsSubmit(true);
      const payload = {
        total: calculateTotal(),
        due: calculateDue(),
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
        ...(couponCode && {
          coupon: {
            code: couponCode,
            amount: Number(couponData?.amount) || 0,
          },
        }),
        user: null,
        source: "website",
        domain: window.location.origin,
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
        due: calculateDue(),
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

        ...(couponCode && {
          coupon: {
            code: couponCode,
            amount: Number(couponData?.amount) || 0,
          },
        }),
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
          due: calculateDue(),
          domain: typeof window !== "undefined" ? window.location.origin : "",

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
          // if (paymentMethod === "pay on bkash") {
          //   flag = false;
          // }

          setIsDuplicate(flag);
          setDuplicateMsg(
            flag ? res?.message || "Duplicate phone number found" : null,
          );
          setDuplicateData(res?.data);
          // if (res?.data?.isDuplicate && !res?.data?.is_verified) {
          //   setIsOtpModal(true);
          // }

          // if (paymentMethod === "pay on bkash") {
          //   flag = false;
          //   setIsOtpModal(false);
          // }

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

  // GTM: begin_checkout
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

  const totalItemCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  const submitLabel =
    paymentMethod === "pay on bkash"
      ? `Pay With Bkash - ৳${calculateDue().toFixed(2)}`
      : `Confirm Order - ৳${calculateDue().toFixed(2)}`;

  const renderTrustBenefits = (variant: "strip" | "grid" = "grid") => (
    <div
      className={
        variant === "strip"
          ? "rongonaa-checkout-trust-strip"
          : "rongonaa-checkout-trust-grid"
      }
    >
      <span className="rongonaa-checkout-trust-chip">
        <ShieldCheck aria-hidden />
        ১০০% অরিজিনাল
      </span>
      <span className="rongonaa-checkout-trust-chip">
        <Banknote aria-hidden />
        ক্যাশ অন ডেলিভারি
      </span>
      <span className="rongonaa-checkout-trust-chip">
        <Truck aria-hidden />
        দ্রুত ডেলিভারি
      </span>
      <span className="rongonaa-checkout-trust-chip">
        <PackageCheck aria-hidden />
        হাতে চেক করে নেওয়া
      </span>
    </div>
  );

  const renderSubmitButton = (className = "") => (
    <Button
      type="submit"
      className={`rongonaa-checkout-submit ${
        isDuplicate || cartItems?.length === 0 || isSubmit
          ? "!bg-primary-muted !text-gray-200"
          : "premium-cta"
      } ${className}`}
      disabled={isDuplicate || cartItems?.length === 0 || isSubmit}
    >
      {isSubmit ? <ButtonLoader className="mt-1" /> : submitLabel}
    </Button>
  );

  return (
    <div className="rongonaa-checkout-page">
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
      <header className="rongonaa-checkout-top">
        <h1 className="rongonaa-checkout-title">Checkout</h1>
        <p className="rongonaa-checkout-subtitle">
          ডেলিভারি তথ্য দিন — Cash on Delivery available
        </p>
        <nav className="rongonaa-checkout-progress" aria-label="Checkout progress">
          <span className="rongonaa-checkout-progress-step is-done">Bag</span>
          <span className="rongonaa-checkout-progress-line" aria-hidden />
          <span className="rongonaa-checkout-progress-step is-active">Details</span>
          <span className="rongonaa-checkout-progress-line" aria-hidden />
          <span className="rongonaa-checkout-progress-step">Confirm</span>
        </nav>
      </header>

      <form
        className="rongonaa-checkout-layout"
        onSubmit={handleSubmit(formSubmit)}
      >
        <div className="rongonaa-checkout-form">
          <section className="rongonaa-checkout-section">
            <h2 className="rongonaa-checkout-section-title">Your details</h2>
            <div className="rongonaa-checkout-fields">
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
          </section>

          <section className="rongonaa-checkout-section">
            <h2 className="rongonaa-checkout-section-title">Shipping</h2>
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
                    <p className="text-danger text-sm mt-1">{error.message}</p>
                  )}
                </div>
              )}
            />
          </section>

          <section className="rongonaa-checkout-section">
            <h2 className="rongonaa-checkout-section-title">Payment</h2>
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
                    <p className="mt-1 text-sm text-danger">{error.message}</p>
                  )}
                </div>
              )}
            />
            {/* {paymentMethod === "pay on bkash" && (
              <div className="flex items-end justify-end">
                <Button className="premium-cta" onClick={handleBkashPayment}>
                  Payment
                </Button>
              </div>
            )} */}
          </section>

          <div className="rongonaa-checkout-submit-wrap rongonaa-checkout-submit-wrap--desktop">
            {renderSubmitButton()}
          </div>
        </div>

        <aside className="rongonaa-checkout-aside">
          <div className="rongonaa-checkout-order">
            <div className="rongonaa-checkout-order-head">
              <h2 className="rongonaa-checkout-order-title">Order</h2>
              {totalItemCount > 0 ? (
                <span className="rongonaa-checkout-order-count">
                  {totalItemCount} items
                </span>
              ) : null}
            </div>

            {cartItems?.map((item: any, index: number) => (
              <div className="rongonaa-checkout-item" key={index}>
                <div className="rongonaa-checkout-item-left">
                  <button
                    type="button"
                    className="rongonaa-checkout-item-remove"
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    <Icon name="delete" size={14} />
                  </button>
                  <div className="rongonaa-checkout-item-thumb">
                    <Image
                      className="object-cover"
                      fill
                      sizes="56px"
                      src={item.image}
                      alt={item.title}
                    />
                  </div>
                  <div className="rongonaa-checkout-item-body">
                    <p className="rongonaa-checkout-item-title">
                      {trimString(item.title, 40)}
                      {item.size ? ` (${item.size})` : ""}
                    </p>
                    <p className="rongonaa-checkout-item-price">
                      ৳{(item.price * item.quantity).toFixed(0)}
                    </p>
                    <div className="rongonaa-checkout-qty">
                      <button
                        type="button"
                        className="rongonaa-checkout-qty-btn"
                        disabled={item.quantity === 1}
                        onClick={() => {
                          updateQuantity(index, item.quantity - 1);
                          setRealTimeCartItems(true);
                        }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="rongonaa-checkout-qty-value">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="rongonaa-checkout-qty-btn"
                        disabled={
                          item.quantity === 10 ||
                          Number(item.max_quantity) === Number(item.quantity)
                        }
                        onClick={() => {
                          updateQuantity(index, item.quantity + 1);
                          setRealTimeCartItems(true);
                        }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {couponData?.amount ? (
              <div className="rongonaa-checkout-total-row">
                <span>Coupon (−)</span>
                <span>
                  {couponData?.discount_type === "fixed" && "৳"}
                  {couponData?.amount}
                  {couponData?.discount_type === "percentage" && "%"}
                </span>
              </div>
            ) : (
              <div className="rongonaa-checkout-coupon">
                <p className="rongonaa-checkout-coupon-label">
                  <Icon name="sell" size={18} variant="outlined" />
                  Have a coupon code?
                </p>
                <div className="rongonaa-checkout-coupon-row">
                  <div className="rongonaa-checkout-coupon-field">
                    <Input
                      placeholder="Enter coupon code"
                      onChange={(e: any) =>
                        setCouponCode(normalizeCoupon(e.target.value))
                      }
                      type="text"
                      classNames="mb-0"
                      noMargin
                      defaultValue={couponCode}
                      errorText={couponError}
                    />
                  </div>
                  <Button
                    className={`rongonaa-checkout-coupon-btn${
                      !couponCode ? " is-disabled" : ""
                    }`}
                    onClick={handleCoupon}
                    type="button"
                    disabled={!couponCode}
                  >
                    {couponLoading ? (
                      <ButtonLoader size="sm" className="!px-4" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="rongonaa-checkout-totals">
              <div className="rongonaa-checkout-total-row">
                <span>Subtotal ({cartItems?.length} items)</span>
                <span>৳{calculateSubtotal().toFixed(0)}</span>
              </div>
              <div className="rongonaa-checkout-total-row">
                <span>Shipping (+)</span>
                <span>৳{shippingPrice.toFixed(0)}</span>
              </div>
              <div className="rongonaa-checkout-total-row rongonaa-checkout-total-row--grand">
                <span>
                  Total
                  {calculateDue() > EMI_THRESHOLD && (
                    <span className="rongonaa-checkout-emi-badge">
                      EMI Available
                    </span>
                  )}
                </span>
                <span>৳{calculateDue().toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="rongonaa-checkout-trust hidden lg:block">
            {renderTrustBenefits("strip")}
          </div>
        </aside>

        <div className="rongonaa-checkout-submit-wrap rongonaa-checkout-submit-wrap--mobile">
          {renderSubmitButton()}
        </div>

        <div className="rongonaa-checkout-trust lg:hidden">
          {renderTrustBenefits()}
        </div>
      </form>

      {/* <OtpModal
        phoneNumber={watchedPhone}
        isModalOpen={isOtpModal}
        setIsModalOpen={setIsOtpModal}
        order_id={orderedItems?._id || duplicateData?.order_id}
      /> */}

      <CheckOutSignUp
        isModalOpen={checkOutSignup}
        setIsModalOpen={setCheckOutSingUp}
      />
    </div>
  );
};

export default Checkout;
