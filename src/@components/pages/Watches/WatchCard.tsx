"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setCookie, getCookie } from "cookies-next";
import { GlobalContext } from "../Context/GlobalContext";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import Link from "next/link";
import { pushToDataLayer } from "@/utils/gtm";
import { IProduct } from "@/@interfaces/common.interface";
import {
  getDefaultVariant,
  getTotalStockQuantity,
  isProductInStock,
} from "@/utils/productStock";

interface ProductCardProps {
  data: IProduct;
  imgClassName?: string;
  isAddToCartButton?: boolean;
  isByNowButton?: boolean;
}

const formatPrice = (n: number) =>
  `৳${Number(n || 0).toLocaleString("en-BD")}`;

const WatchCard: React.FC<ProductCardProps> = ({
  data,
  isAddToCartButton = true,
  isByNowButton = false,
}) => {
  const router = useRouter();
  const { setRealTimeCartItems, setIsCartDrawer, isCartDrawer } =
    useContext(GlobalContext);
  const [adLoading, setAddLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [inCart, setInCart] = useState(false);
  const inStock = isProductInStock(data as any);
  const defaultVariant = getDefaultVariant(data as any);
  const maxQty = defaultVariant
    ? Number(defaultVariant?.inventory?.stock_quantity) || 0
    : getTotalStockQuantity(data as any);

  const productId = data?._id;
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

  const writeCart = (items: any[]) => {
    setCookie("cartData", JSON.stringify(items), {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
  };

  useEffect(() => {
    if (!productId) return;
    setInCart(readCart().some((it: any) => it.id === productId));
  }, [productId, isCartDrawer]);

  const handleOrderNow = async (products: IProduct[]) => {
    setOrderLoading(true);
    try {
      if (!Array.isArray(products))
        throw new Error("The input must be an array");
      const cartItems = readCart();

      for (const product of products) {
        if (!product._id) continue;
        const existingIndex = cartItems.findIndex(
          (it: any) => it.id === product._id,
        );
        if (existingIndex >= 0) {
          cartItems[existingIndex].quantity += 1;
        } else {
          cartItems.push({
            id: product._id,
            title: product.title,
            price: product.pricing?.sale_price,
            quantity: 1,
            image: product.featured_image?.src,
            sku: defaultVariant?.sku || product?.sku,
            size: defaultVariant?.size || "",
            categories: product.categories,
            brand: product.brand,
            max_quantity: maxQty || undefined,
          });
        }
      }

      writeCart(cartItems);
      setRealTimeCartItems(true);
      router.push("/checkout");
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleAddToCard = async (products: IProduct[]) => {
    if (inCart) {
      setIsCartDrawer(true);
      return;
    }

    setAddLoading(true);
    try {
      if (!Array.isArray(products))
        throw new Error("The input must be an array");

      const cartItems = readCart();
      let totalValue = 0;

      for (const product of products) {
        if (!product._id) continue;
        totalValue += Number(product?.pricing?.sale_price || 0);
        const existingIndex = cartItems.findIndex(
          (it: any) => it.id === product._id,
        );
        if (existingIndex < 0) {
          cartItems.push({
            id: product._id,
            title: product.title,
            price: product.pricing?.sale_price,
            quantity: 1,
            image: product.featured_image?.src,
            sku: defaultVariant?.sku || product?.sku,
            size: defaultVariant?.size || "",
            categories: product.categories,
            brand: product.brand,
            max_quantity: maxQty || undefined,
          });
        }
      }

      pushToDataLayer({
        event: "add_to_cart",
        ecommerce: {
          currency: "BDT",
          value: totalValue,
          items: products.map((product) => ({
            item_id: product._id,
            item_name: product.title,
            item_brand: product.brand,
            item_category: Array.isArray(product.categories)
              ? product.categories.join(", ")
              : product.categories || "",
            price: product.pricing?.sale_price || 0,
            quantity: 1,
          })),
        },
      });

      writeCart(cartItems);
      setRealTimeCartItems(true);
      setInCart(true);
      setIsCartDrawer(true);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setAddLoading(false);
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

        {inStock && (isAddToCartButton || isByNowButton) && (
          <div className="rongonaa-flash-card__actions">
            {isAddToCartButton && (
              <button
                type="button"
                onClick={() =>
                  inCart ? setIsCartDrawer(true) : handleAddToCard([data])
                }
                disabled={adLoading}
                className={`rongonaa-flash-card__cta rongonaa-flash-card__cta--cart ${inCart ? "rongonaa-flash-card__cta--active" : ""
                  }`}
              >
                {adLoading ? (
                  <ButtonLoader size="sm" color="primary" />
                ) : inCart ? (
                  "View Cart"
                ) : (
                  "Add To Cart"
                )}
              </button>
            )}

            {isByNowButton && (
              <button
                type="button"
                onClick={() =>
                  inCart
                    ? router.push("/checkout")
                    : handleOrderNow([data])
                }
                disabled={orderLoading}
                className={`rongonaa-flash-card__cta rongonaa-flash-card__cta--buy ${inCart ? "rongonaa-flash-card__cta--active" : ""
                  }`}
              >
                {orderLoading ? (
                  <ButtonLoader size="sm" color="primary" />
                ) : inCart ? (
                  "View Order"
                ) : (
                  "Order Now"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default WatchCard;
