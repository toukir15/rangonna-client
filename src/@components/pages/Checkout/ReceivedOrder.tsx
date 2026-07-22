"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { getCookie, deleteCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import { formateDateWithMonth } from "@/utils";
import Icon from "@/@components/core/Icon/Icon";
import Link from "next/link";
import Button from "@/@components/core/Button/Button";
import Image from "next/image";
import { pushToDataLayer } from "@/utils/gtm";

const COOKIE_ORDER = {
  maxAge: 30 * 24 * 60 * 60,
  path: "/",
  sameSite: "lax" as const,
};

const JOURNEY_STEPS = [
  {
    title: "অর্ডার প্রসেসিং",
    text: "আপনার পণ্য প্রস্তুত করা হচ্ছে",
    active: true,
  },
  {
    title: "Shipment",
    text: "শিপ হলে ট্র্যাকিং তথ্য পাবেন",
    active: false,
  },
  {
    title: "Delivery",
    text: "আপনার ঠিকানায় পণ্য পৌঁছে দেওয়া হবে",
    active: false,
  },
];

export type ReceivedOrderProps = {
  initialOrderFromSsl?: unknown | null;
  hadSslQuery?: boolean;
};

function readOrderFromCookie(): any | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = getCookie("orderedData");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw.toString());
  } catch {
    return undefined;
  }
}

function formatOrderId(id?: string) {
  if (!id) return "—";
  if (id.length <= 10) return id;
  return `#${id.slice(-8).toUpperCase()}`;
}

const ReceivedOrder: React.FC<ReceivedOrderProps> = ({
  initialOrderFromSsl = null,
  hadSslQuery = false,
}) => {
  const [orderedItems, setOrderedItems] = useState<any>(() => {
    if (initialOrderFromSsl != null) return initialOrderFromSsl;
    return readOrderFromCookie();
  });
  const { setRealTimeCartItems } = useContext(GlobalContext);
  const router = useRouter();

  useEffect(() => {
    setRealTimeCartItems(true);

    if (initialOrderFromSsl != null) {
      setCookie("orderedData", JSON.stringify(initialOrderFromSsl), COOKIE_ORDER);
      router.replace("/checkout/received-order");
      return;
    }

    if (hadSslQuery) {
      router.push("/");
      return;
    }

    const fromCookie = readOrderFromCookie();
    if (fromCookie) {
      setOrderedItems((prev: any) => prev ?? fromCookie);
      return;
    }

    router.push("/");
  }, [hadSslQuery, initialOrderFromSsl, router, setRealTimeCartItems]);

  useEffect(() => {
    const onPopState = () => {
      deleteCookie("orderedData");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const calculateSubtotal = () => {
    return orderedItems?.line_items?.reduce(
      (total: number, item: { subtotal: number }) => total + item.subtotal,
      0,
    );
  };

  const calculateTotal = () => {
    return calculateSubtotal() + (orderedItems?.shipping_line?.total || 0);
  };

  const grandTotal = useMemo(() => {
    const total = calculateTotal();
    const discount = Number(orderedItems?.discount_total) || 0;
    return Math.max(0, Number(total) - discount);
  }, [orderedItems]);

  useEffect(() => {
    if (!orderedItems) return;

    const total = orderedItems.line_items.reduce(
      (sum: any, item: any) => sum + item.price * item.quantity,
      0,
    );

    pushToDataLayer({
      event: "purchase",
      ecommerce: {
        currency: "BDT",
        value: total + orderedItems.shipping_line.total,
        transaction_id: orderedItems._id,
        coupon: orderedItems?.coupon?.code,
        items: orderedItems.line_items.map((item: any) => {
          const categoryData: Record<string, string> = {};
          item.categories?.forEach((cat: any, index: number) => {
            categoryData[`item_category${index === 0 ? "" : index + 1}`] = cat;
          });

          return {
            item_id: item?.product_id?._id,
            item_name: item.product_title,
            item_brand: item.brand,
            price: parseFloat(item.price.toString()),
            quantity: item.quantity,
            ...categoryData,
          };
        }),
        shiping: orderedItems.shipping_line.total,
        customer: {
          name: orderedItems.customer.first_name,
          phone: orderedItems.customer.phone,
          address: orderedItems.customer.address,
          email: orderedItems.customer.email,
        },
      },
    });
  }, [orderedItems]);

  if (!orderedItems) {
    return null;
  }

  return (
    <div className="rongonaa-received-page">
      <section className="rongonaa-received-celebration">
        <div className="rongonaa-received-seal" aria-hidden="true">
          <span className="rongonaa-received-seal-ring" />
          <span className="rongonaa-received-seal-ring rongonaa-received-seal-ring--inner" />
          <span className="rongonaa-received-seal-core">
            <Icon name="check" size={28} />
          </span>
        </div>

        <p className="rongonaa-received-kicker">Thank You</p>
        <h1 className="rongonaa-received-title">অর্ডার সফল!</h1>
        <p className="rongonaa-received-subtitle">Order Confirmed</p>

        <span className="rongonaa-received-order-id">
          Order ID: {formatOrderId(orderedItems?._id)}
        </span>

        <p className="rongonaa-received-message">
          আপনার অর্ডারটি গ্রহণ করা হয়েছে। কিছু সময়ের মধ্যে আমাদের প্রতিনিধি
          আপনাকে কল করে অর্ডার কনফার্ম করবেন।
        </p>
      </section>

      <div className="rongonaa-received-layout">
        <article className="rongonaa-received-receipt">
          <div className="rongonaa-received-receipt-head">
            <h2 className="rongonaa-received-receipt-title">Order Receipt</h2>
            <span className="rongonaa-received-receipt-badge">
              {orderedItems?.status || "confirmed"}
            </span>
          </div>

          <div className="rongonaa-received-meta">
            <div className="rongonaa-received-meta-row">
              <span>Order Date</span>
              <strong>
                {orderedItems?.createdAt
                  ? formateDateWithMonth(orderedItems.createdAt)
                  : "—"}
              </strong>
            </div>
            <div className="rongonaa-received-meta-row">
              <span>Payment</span>
              <strong className="capitalize">
                {orderedItems?.payment?.title || "—"}
              </strong>
            </div>
          </div>

          <div>
            {orderedItems?.line_items?.map((item: any, index: number) => (
              <div className="rongonaa-received-line-item" key={index}>
                <div className="rongonaa-received-line-left">
                  <div className="rongonaa-received-line-thumb">
                    <Image
                      className="object-cover"
                      fill
                      sizes="52px"
                      src={item?.product_id?.featured_image?.src}
                      alt={item?.product_title || "Product"}
                    />
                  </div>
                  <div className="rongonaa-received-line-body">
                    <p className="rongonaa-received-line-title">
                      {item?.product_title}
                    </p>
                    <p className="rongonaa-received-line-qty">
                      Qty: {item?.quantity}
                    </p>
                  </div>
                </div>
                <p className="rongonaa-received-line-price">৳{item?.subtotal}</p>
              </div>
            ))}
          </div>

          <div className="rongonaa-received-totals">
            <div className="rongonaa-received-total-row">
              <span>Subtotal</span>
              <span>৳{calculateSubtotal()}</span>
            </div>
            <div className="rongonaa-received-total-row">
              <span>Shipping</span>
              <span>৳{orderedItems?.shipping_line?.total || 0}</span>
            </div>
            {orderedItems?.discount_total ? (
              <div className="rongonaa-received-total-row">
                <span>Discount (−)</span>
                <span>৳{orderedItems.discount_total}</span>
              </div>
            ) : null}
            <div className="rongonaa-received-total-row rongonaa-received-total-row--grand">
              <span>Total Paid</span>
              <span>৳{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          <div className="rongonaa-received-receipt-actions">
            <Link href="/">
              <Button className="premium-cta cursor-pointer !font-bold">
                Back To Home
              </Button>
            </Link>
          </div>
        </article>

        <aside className="rongonaa-received-side">
          <div className="rongonaa-received-card">
            <div className="rongonaa-received-card-head">
              <Icon
                name="local_shipping"
                variant="outlined"
                className="text-primary"
              />
              Delivery Address
            </div>
            <div className="rongonaa-received-address">
              <address>{orderedItems?.customer?.first_name}</address>
              <address>{orderedItems?.customer?.address}</address>
              <address>{orderedItems?.customer?.phone}</address>
              {orderedItems?.customer?.email ? (
                <address>{orderedItems.customer.email}</address>
              ) : null}
            </div>
          </div>

          <div className="rongonaa-received-card">
            <div className="rongonaa-received-card-head">
              <Icon
                name="route"
                variant="outlined"
                className="text-primary"
              />
              Order Journey
            </div>
            <div className="rongonaa-received-journey">
              {JOURNEY_STEPS.map((step, index) => (
                <div
                  className={`rongonaa-received-journey-step ${
                    step.active ? "rongonaa-received-journey-step--active" : ""
                  }`}
                  key={index}
                >
                  <span className="rongonaa-received-journey-dot">
                    {index + 1}
                  </span>
                  <div>
                    <p className="rongonaa-received-journey-title">
                      {step.title}
                    </p>
                    <p className="rongonaa-received-journey-text">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/watches">
              <Button className="rongonaa-received-cta !bg-primary-light !text-primary border border-primary hover:!bg-primary-lighter cursor-pointer">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </aside>
      </div>

      <section className="rongonaa-received-community">
        <p className="rongonaa-received-community-title">
          Rongonaa পরিবারের অংশ হোন
        </p>
        <p className="rongonaa-received-community-sub">
          অফার, আপডেট ও কমিউনিটি সাপোর্ট পেতে যুক্ত হোন
        </p>
        <div className="rongonaa-received-community-grid">
          <a
            href="https://www.facebook.com/Naviforce.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="rongonaa-received-community-link"
          >
            <span className="rongonaa-received-community-icon rongonaa-received-community-icon--fb">
              <Icon name="group" variant="outlined" className="text-white" />
            </span>
            <span>
              <p className="rongonaa-received-community-label">Facebook Group</p>
              <p className="rongonaa-received-community-hint">
                কমিউনিটিতে যোগ দিন
              </p>
            </span>
          </a>
          <button
            type="button"
            onClick={() =>
              window.open(
                "https://whatsapp.com/channel/0029VasAjp5HQbS30uKAIl47",
                "_blank",
              )
            }
            className="rongonaa-received-community-link w-full"
          >
            <span className="rongonaa-received-community-icon rongonaa-received-community-icon--wa">
              <Icon
                name="chat_bubble"
                variant="outlined"
                className="text-white"
              />
            </span>
            <span>
              <p className="rongonaa-received-community-label">
                WhatsApp Channel
              </p>
              <p className="rongonaa-received-community-hint">
                ইনস্ট্যান্ট আপডেট পান
              </p>
            </span>
          </button>
        </div>
      </section>

      <section className="rongonaa-received-help">
        <p className="rongonaa-received-help-title">Need Help?</p>
        <div className="rongonaa-received-help-grid">
          <a
            href="mailto:support@rongonaa.com"
            className="rongonaa-received-help-link"
          >
            <Icon name="mail" variant="outlined" className="text-primary shrink-0" />
            <span>
              <p className="rongonaa-received-help-label">Email Support</p>
              <p className="rongonaa-received-help-value">support@rongonaa.com</p>
            </span>
          </a>
          <a href="tel:01805049380" className="rongonaa-received-help-link">
            <Icon name="call" variant="outlined" className="text-primary shrink-0" />
            <span>
              <p className="rongonaa-received-help-label">Phone Support</p>
              <p className="rongonaa-received-help-value">01805049380</p>
            </span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default ReceivedOrder;
