"use client";
import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setCookie, getCookie } from "cookies-next";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import Link from "next/link";
import ButtonLoader from "../Button/ButtonLoader";
import {
  getDefaultVariant,
  getTotalStockQuantity,
} from "@/utils/productStock";

interface ProductCardProps {
  data: any;
  onAddToCart?: () => void;
  onOrderNow?: () => void;
  imgClassName?: string;
  isAddToCartButton?: boolean;
  priority?: boolean;
}

const formatPrice = (n: number) =>
  `৳${Number(n || 0).toLocaleString("en-BD")}`;

const metaFromProduct = (data: any) => {
  const seed = String(data?._id || data?.sku || "0")
    .split("")
    .reduce((acc: number, ch: string) => acc + ch.charCodeAt(0), 0);
  const rating = (4.7 + (seed % 3) * 0.1).toFixed(1);
  const sold =
    Number(data?.total_sales || 0) ||
    Number(data?.inventory?.sold_quantity || 0);
  const reviews = Math.max(sold || 48 + (seed % 80), 24);
  return { rating, reviews };
};

const MoreProductCard: React.FC<ProductCardProps> = ({
  data,
  onAddToCart,
  isAddToCartButton = true,
  priority = false,
}) => {
  const router = useRouter();
  const [orderLoading, setOrderLoading] = useState(false);
  const { setRealTimeCartItems } = useContext(GlobalContext);
  const cardRef = useRef<HTMLElement | null>(null);

  const href = useMemo(() => `/product/${data?.slug}`, [data?.slug]);
  const salePrice = Number(data?.pricing?.sale_price ?? 0);
  const regularPrice = Number(data?.pricing?.regular_price ?? 0);
  const hasDiscount = regularPrice > salePrice;
  const discount = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;
  const { rating, reviews } = metaFromProduct(data);
  const isFlash = Array.isArray(data?.categories)
    ? data.categories.includes("flash-sale")
    : false;

  useEffect(() => {
    if (!cardRef.current) return;

    const el = cardRef.current;
    let didPrefetch = false;

    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !didPrefetch) {
          didPrefetch = true;
          router.prefetch(href);
        }
      },
      { rootMargin: "200px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [href, router]);

  const handleOrderNow = useCallback(async () => {
    setOrderLoading(true);
    try {
      let cartItems: any[] = [];
      try {
        const existingCart = getCookie("cartData");
        cartItems = existingCart ? JSON.parse(existingCart.toString()) : [];
        if (!Array.isArray(cartItems)) cartItems = [];
      } catch {
        cartItems = [];
      }

      if (!data?._id) return;

      const existingIndex = cartItems.findIndex(
        (it: any) => it.id === data._id,
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
          sku: getDefaultVariant(data)?.sku || data?.sku,
          size: getDefaultVariant(data)?.size || "",
          categories: data.categories,
          brand: data.brand,
          max_quantity:
            Number(getDefaultVariant(data)?.inventory?.stock_quantity) ||
            getTotalStockQuantity(data) ||
            undefined,
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
      console.error("Error adding to cart:", err);
    } finally {
      setOrderLoading(false);
    }
  }, [data, router, setRealTimeCartItems]);

  return (
    <article ref={cardRef} className="rongonaa-flash-card group">
      <Link href={href} prefetch className="rongonaa-flash-card__media">
        <Image
          src={data?.featured_image?.src}
          alt={data?.featured_image?.title || data?.title || "Product image"}
          width={360}
          height={360}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px"
          decoding="async"
          priority={priority}
        />
        {isFlash && (
          <span className="rongonaa-flash-card__badge">Flash</span>
        )}
      </Link>

      <div className="rongonaa-flash-card__body">
        <p className="rongonaa-flash-card__meta">
          {rating} · {reviews.toLocaleString()} reviews
        </p>

        <Link href={href} prefetch>
          <h3 className="rongonaa-flash-card__title">{data?.title}</h3>
        </Link>

        <div className="rongonaa-flash-card__price-row">
          <span className="rongonaa-flash-card__price">
            {formatPrice(salePrice)}
          </span>
          {hasDiscount && (
            <span className="rongonaa-flash-card__compare">
              {formatPrice(regularPrice)}
            </span>
          )}
          {discount > 0 && (
            <span className="rongonaa-flash-card__badge rongonaa-flash-card__badge--price">
              {discount}% off
            </span>
          )}
        </div>

        {isAddToCartButton && (
          <button
            type="button"
            onClick={onAddToCart}
            className="rongonaa-flash-card__cta rongonaa-flash-card__cta--cart"
          >
            Add To Cart
          </button>
        )}

        <button
          type="button"
          className="rongonaa-flash-card__cta"
          onClick={handleOrderNow}
          disabled={orderLoading}
        >
          {orderLoading ? (
            <ButtonLoader size="sm" color="white" />
          ) : (
            "Order Now"
          )}
        </button>
      </div>
    </article>
  );
};

export default React.memo(MoreProductCard);
