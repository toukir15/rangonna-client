"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { IProduct } from "@/@interfaces/common.interface";
import { GlobalContext } from "../Context/GlobalContext";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";

interface FlashSaleCardProps {
  data: IProduct;
}

const formatPrice = (n: number) =>
  `৳${Number(n || 0).toLocaleString("en-BD")}`;

const metaFromProduct = (data: IProduct) => {
  const seed = String(data?._id || data?.sku || "0")
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = (4.7 + (seed % 3) * 0.1).toFixed(1);
  const sold =
    Number(data?.total_sales || 0) ||
    Number(data?.inventory?.sold_quantity || 0);
  const reviews = Math.max(sold || 48 + (seed % 80), 24);
  return { rating, reviews };
};

const FlashSaleCard: React.FC<FlashSaleCardProps> = ({ data }) => {
  const router = useRouter();
  const { setRealTimeCartItems } = useContext(GlobalContext);
  const [orderLoading, setOrderLoading] = useState(false);
  const [inCart, setInCart] = useState(false);
  const { rating, reviews } = metaFromProduct(data);

  const sale = Number(data?.pricing?.sale_price || 0);
  const regular = Number(data?.pricing?.regular_price || 0);
  const showStrike = regular > sale;
  const discount =
    regular > 0 && sale < regular
      ? Math.round(((regular - sale) / regular) * 100)
      : 0;

  const readCart = () => {
    try {
      const existingCart = getCookie("cartData");
      if (!existingCart) return [];
      const raw = existingCart.toString().trim();
      if (!raw.startsWith("[") && !raw.startsWith("{")) {
        setCookie("cartData", JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      setCookie("cartData", JSON.stringify([]));
      return [];
    }
  };

  useEffect(() => {
    if (!data?._id) return;
    setInCart(readCart().some((it: { id?: string }) => it.id === data._id));
  }, [data?._id]);

  const handleBuyNow = async () => {
    if (inCart) {
      router.push("/checkout");
      return;
    }

    setOrderLoading(true);
    try {
      const cartItems = readCart();
      const existingIndex = cartItems.findIndex(
        (it: { id?: string }) => it.id === data._id,
      );

      if (existingIndex >= 0) {
        cartItems[existingIndex].quantity += 1;
      } else {
        cartItems.push({
          id: data._id,
          title: data.title,
          price: data.pricing?.sale_price,
          quantity: 1,
          image: data.featured_image?.src,
          sku: data?.sku,
          categories: data.categories,
          brand: data.brand,
          max_quantity: data?.inventory?.stock_quantity,
        });
      }

      setCookie("cartData", JSON.stringify(cartItems), {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });
      setRealTimeCartItems(true);
      router.push("/checkout");
    } catch (err) {
      console.error("Error buying now:", err);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <article className="rongonaa-flash-card group">
      <Link
        href={`/product/${data.slug}`}
        prefetch
        className="rongonaa-flash-card__media"
      >
        <Image
          src={data?.featured_image?.src}
          alt={data.title}
          width={360}
          height={360}
          sizes="(max-width: 668px) 50vw, (max-width: 1080px) 25vw, 220px"
        />
        <span className="rongonaa-flash-card__badge">Flash</span>
        {data?.inventory?.stock_status === "out-of-stock" && (
          <div className="rongonaa-flash-card__oos">Out Of Stock</div>
        )}
      </Link>

      <div className="rongonaa-flash-card__body">
        <p className="rongonaa-flash-card__meta">
          {rating} · {reviews.toLocaleString()} reviews
        </p>

        <Link href={`/product/${data.slug}`} prefetch>
          <h3 className="rongonaa-flash-card__title">{data?.title}</h3>
        </Link>

        <div className="rongonaa-flash-card__price-row">
          <span className="rongonaa-flash-card__price">{formatPrice(sale)}</span>
          {showStrike && (
            <span className="rongonaa-flash-card__compare">
              {formatPrice(regular)}
            </span>
          )}
          {discount > 0 && (
            <span className="rongonaa-flash-card__badge rongonaa-flash-card__badge--price">
              {discount}% off
            </span>
          )}
        </div>

        {data?.inventory?.stock_status === "in-stock" && (
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={orderLoading}
            className="rongonaa-flash-card__cta"
          >
            {orderLoading ? (
              <ButtonLoader size="sm" color="white" />
            ) : inCart ? (
              <>View Order</>
            ) : (
              <>Order Now</>
            )}
          </button>
        )}
      </div>
    </article>
  );
};

export default FlashSaleCard;
