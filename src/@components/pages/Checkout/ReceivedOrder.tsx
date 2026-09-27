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
import { categoryLabel } from "@/utils/productCategory";

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
            categoryData[`item_category${index === 0 ? "" : index + 1}`] =
              categoryLabel(cat);
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
    <div className="order-confirm">
      <header className="order-confirm-hero">
        <span className="order-confirm-mark" aria-hidden="true">
          <Icon name="check" size={18} />
        </span>
        <p className="order-confirm-kicker">Thank you</p>
        <h1 className="order-confirm-title">অর্ডার সফল</h1>
        <p className="order-confirm-lead">
          আপনার অর্ডারটি গ্রহণ করা হয়েছে। কিছু সময়ের মধ্যে আমাদের প্রতিনিধি
          কল করে অর্ডার কনফার্ম করবেন।
        </p>
        <p className="order-confirm-id">
          Order {formatOrderId(orderedItems?._id)}
          <span>·</span>
          {orderedItems?.createdAt
            ? formateDateWithMonth(orderedItems.createdAt)
            : "—"}
        </p>
      </header>

      <div className="order-confirm-sheet">
        <section className="order-confirm-receipt">
          <div className="order-confirm-section-label">
            <span>Receipt</span>
            <em className="capitalize">{orderedItems?.status || "confirmed"}</em>
          </div>

          {orderedItems?.line_items?.map((item: any, index: number) => (
            <div className="order-confirm-item" key={index}>
              <div className="order-confirm-thumb">
                <Image
                  className="object-cover"
                  fill
                  sizes="72px"
                  src={item?.product_id?.featured_image?.src}
                  alt={item?.product_title || "Product"}
                />
              </div>
              <div className="order-confirm-item-copy">
                <p>{item?.product_title}</p>
                <span>
                  {item?.size ? `Size ${item.size} · ` : ""}
                  Qty {item?.quantity}
                </span>
              </div>
              <strong>৳{item?.subtotal}</strong>
            </div>
          ))}

          <dl className="order-confirm-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>৳{calculateSubtotal()}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>৳{orderedItems?.shipping_line?.total || 0}</dd>
            </div>
            {orderedItems?.discount_total ? (
              <div>
                <dt>Discount</dt>
                <dd>−৳{orderedItems.discount_total}</dd>
              </div>
            ) : null}
            <div className="is-total">
              <dt>Total</dt>
              <dd>৳{grandTotal.toFixed(0)}</dd>
            </div>
          </dl>
        </section>

        <aside className="order-confirm-aside">
          <div>
            <p className="order-confirm-section-label">
              <span>Deliver to</span>
            </p>
            <p className="order-confirm-name">
              {orderedItems?.customer?.first_name}
            </p>
            <p className="order-confirm-address">
              {orderedItems?.customer?.address}
            </p>
            <p className="order-confirm-address">
              {orderedItems?.customer?.phone}
            </p>
            {orderedItems?.customer?.email ? (
              <p className="order-confirm-address">
                {orderedItems.customer.email}
              </p>
            ) : null}
            <p className="order-confirm-pay capitalize">
              Payment · {orderedItems?.payment?.title || "—"}
            </p>
          </div>

          <ol className="order-confirm-steps">
            {JOURNEY_STEPS.map((step, index) => (
              <li
                key={step.title}
                className={step.active ? "is-now" : undefined}
              >
                <span>{index + 1}</span>
                <div>
                  <p>{step.title}</p>
                  <small>{step.text}</small>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <div className="order-confirm-actions">
        <Link href="/churi">
          <Button className="premium-cta order-confirm-primary cursor-pointer">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/" className="order-confirm-secondary">
          Back to home
        </Link>
      </div>

      <footer className="order-confirm-foot">
        <a
          href="https://www.facebook.com/Naviforce.com.bd"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <button
          type="button"
          onClick={() =>
            window.open(
              "https://whatsapp.com/channel/0029VasAjp5HQbS30uKAIl47",
              "_blank",
            )
          }
        >
          WhatsApp
        </button>
        <a href="mailto:support@rongonaa.com">support@rongonaa.com</a>
        <a href="tel:01805049380">01805049380</a>
      </footer>
    </div>
  );
};

export default ReceivedOrder;
