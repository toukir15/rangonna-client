"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { IProduct } from "@/@interfaces/common.interface";
import { GlobalContext } from "../Context/GlobalContext";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import {
  getDefaultVariant,
  getTotalStockQuantity,
  isProductInStock,
} from "@/utils/productStock";

interface FlashSaleCardProps {
  data: IProduct;
  /** Home uses order; shop/listing pages use cart */
  cta?: "order" | "cart";
}

const formatPrice = (n: number) =>
  `৳${Number(n || 0).toLocaleString("en-BD")}`;

const FlashSaleCard: React.FC<FlashSaleCardProps> = ({
  data,
  cta = "order",
}) => {
  const router = useRouter();
  const { setRealTimeCartItems, setIsCartDrawer, isCartDrawer } =
    useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [inCart, setInCart] = useState(false);

  const inStock = isProductInStock(data as any);
  const defaultVariant = getDefaultVariant(data as any);
  const maxQty = defaultVariant
    ? Number(defaultVariant?.inventory?.stock_quantity) || 0
    : getTotalStockQuantity(data as any);

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
  }, [data?._id, isCartDrawer]);

  const upsertCartItem = (incrementIfExists: boolean) => {
    const cartItems = readCart();
    const existingIndex = cartItems.findIndex(
      (it: { id?: string }) => it.id === data._id,
    );

    if (existingIndex >= 0) {
      if (incrementIfExists) cartItems[existingIndex].quantity += 1;
    } else {
      cartItems.push({
        id: data._id,
        title: data.title,
        price: data.pricing?.sale_price,
        quantity: 1,
        image: data.featured_image?.src,
        sku: defaultVariant?.sku || data?.sku,
        size: defaultVariant?.size || "",
        categories: data.categories,
        brand: data.brand,
        max_quantity: maxQty || undefined,
      });
    }

    setCookie("cartData", JSON.stringify(cartItems), {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    setRealTimeCartItems(true);
    setInCart(true);
  };

  const handleOrderNow = async () => {
    if (inCart) {
      router.push("/checkout");
      return;
    }

    setLoading(true);
    try {
      upsertCartItem(true);
      router.push("/checkout");
    } catch (err) {
      console.error("Error buying now:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (inCart) {
      setIsCartDrawer(true);
      return;
    }

    setLoading(true);
    try {
      upsertCartItem(false);
      setIsCartDrawer(true);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setLoading(false);
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
          sizes="(max-width: 668px) 50vw, (max-width: 1080px) 25vw, 280px"
        />
        {!inStock && (
          <div className="rongonaa-flash-card__oos">Out Of Stock</div>
        )}
      </Link>

      <div className="rongonaa-flash-card__body">
        <Link href={`/product/${data.slug}`} prefetch>
          <h3 className="rongonaa-flash-card__title">{data?.title}</h3>
        </Link>

        <div className="rongonaa-flash-card__price-row">
          <div className="rongonaa-flash-card__prices">
            <span className="rongonaa-flash-card__price">{formatPrice(sale)}</span>
            {showStrike && (
              <span className="rongonaa-flash-card__compare">
                {formatPrice(regular)}
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="rongonaa-flash-card__off">{discount}% OFF</span>
          )}
        </div>

        {inStock &&
          (cta === "cart" ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={loading}
              className={`rongonaa-flash-card__cta rongonaa-flash-card__cta--cart ${
                inCart ? "rongonaa-flash-card__cta--active" : ""
              }`}
            >
              {loading ? (
                <ButtonLoader size="sm" color="primary" />
              ) : inCart ? (
                "View Cart"
              ) : (
                "Add To Cart"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOrderNow}
              disabled={loading}
              className={`rongonaa-flash-card__cta rongonaa-flash-card__cta--buy ${
                inCart ? "rongonaa-flash-card__cta--active" : ""
              }`}
            >
              {loading ? (
                <ButtonLoader size="sm" color="primary" />
              ) : inCart ? (
                "View Order"
              ) : (
                "Order Now"
              )}
            </button>
          ))}
      </div>
    </article>
  );
};

export default FlashSaleCard;
