"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { truncateByLines } from "@/utils";
import Button from "@/@components/core/Button/Button";
import { setCookie, getCookie } from "cookies-next";
import { GlobalContext } from "../Context/GlobalContext";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import Link from "next/link";
import { pushToDataLayer } from "@/utils/gtm";
import { IProduct } from "@/@interfaces/common.interface";

interface ProductCardProps {
  data: IProduct;
  imgClassName?: string;
  isAddToCartButton?: boolean;
  isByNowButton?: boolean;
}

const WatchCard: React.FC<ProductCardProps> = ({
  data,
  imgClassName,
  isAddToCartButton = true,
  isByNowButton = false,
}) => {
  const router = useRouter();
  const { setRealTimeCartItems, setIsCartDrawer, isCartDrawer } =
    useContext(GlobalContext);
  const [adLoading, setAddLoading] = useState<boolean>(false);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [inCart, setInCart] = useState<boolean>(false);

  const productId = data?._id;

  const handleDetails = () => {
    router.push(`/product/${data.slug}`);
  };

  const calculateDiscount = () => {
    const rp = Number(data?.pricing?.regular_price || 0);
    const sp = Number(data?.pricing?.sale_price || 0);
    if (!rp || sp >= rp) return 0;
    return Math.round(((rp - sp) / rp) * 100);
  };

  // const readCart = () => {
  //   try {
  //     const existingCart = getCookie("cartData");
  //     const parsed = existingCart ? JSON.parse(existingCart.toString()) : [];
  //     return Array.isArray(parsed) ? parsed : [];
  //   } catch {
  //     return [];
  //   }
  // };

  const readCart = () => {
    try {
      const existingCart = getCookie("cartData");

      if (!existingCart) return [];

      // Convert to string & clean whitespace/newline
      const raw = existingCart.toString().trim();

      // ❗ If string doesn't start with valid JSON syntax → invalid cookie → reset
      if (!raw.startsWith("[") && !raw.startsWith("{")) {
        setCookie("cartData", JSON.stringify([]));
        return [];
      }

      let parsed = JSON.parse(raw);

      // Ensure array type
      if (!Array.isArray(parsed)) {
        parsed = [];
      }

      return parsed;
    } catch (err) {
      console.error("Invalid cartData cookie detected → resetting.", err);

      // Reset corrupted cookie
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
    const items = readCart();
    setInCart(items.some((it: any) => it.id === productId));
  }, [productId, isCartDrawer]);

  const handleOrderNow = async (products: IProduct[]) => {
    setOrderLoading(true);
    try {
      if (!Array.isArray(products))
        throw new Error("The input must be an array");
      let cartItems = readCart();

      for (const product of products) {
        if (!product._id) continue;

        const existingIndex = cartItems.findIndex(
          (it: any) => it.id === product._id
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
            sku: product?.sku,
            categories: product.categories,
            brand: product.brand,
            max_quantity: product?.inventory?.stock_quantity,
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

      let cartItems = readCart();
      let totalValue = 0;

      for (const product of products) {
        if (!product._id) continue;

        totalValue += Number(product?.pricing?.sale_price || 0);

        const existingIndex = cartItems.findIndex(
          (it: any) => it.id === product._id
        );
        if (existingIndex >= 0) {
          // If somehow already there, do NOT increment (as per requirement).
          // Just keep as is.
        } else {
          cartItems.push({
            id: product._id,
            title: product.title,
            price: product.pricing?.sale_price,
            quantity: 1,
            image: product.featured_image?.src,
            sku: product?.sku,
            categories: product.categories,
            brand: product.brand,
            max_quantity: product?.inventory?.stock_quantity,
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
    <div className="premium-card p-3 rounded-xl relative flex flex-col h-full transition-all duration-300 hover:scale-[1.02]">
      <Link href={`/product/${data.slug}`} prefetch className="...">
        <div className="cursor-pointer overflow-hidden rounded-lg">
          <Image
            src={data?.featured_image?.src}
            alt={data.title}
            width={240}
            height={240}
            className={`w-full h-auto object-cover hover:opacity-90 transition-opacity ${imgClassName || ""
              }`}
          />
          {data?.inventory?.stock_status === "out-of-stock" && (
            <div className="absolute top-24 w-[89%] items-center justify-center mr-4 bg-primary/80 h-8">
              <p className="text-center text-white font-bold mt-1">
                Out Of Stock
              </p>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex-grow">
        <h3
          className="font-bold text-sm hover:text-blue-600 cursor-pointer line-clamp-2 leading-4"
          onClick={handleDetails}
          style={truncateByLines(2)}
        >
          {data?.title}
        </h3>

        <div className="sm:flex flex-wrap items-center gap-2 mt-1">
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary font-bold">
              ৳{Number(data?.pricing?.sale_price || 0).toLocaleString()}
            </span>
            {Number(data?.pricing?.regular_price || 0) >
              Number(data?.pricing?.sale_price || 0) && (
                <span className="text-gray-400 text-xs font-bold">
                  <del>
                    ৳{Number(data?.pricing?.regular_price || 0).toLocaleString()}
                  </del>
                </span>
              )}
          </div>
          <div>
            {calculateDiscount() > 0 && (
              <div className="premium-badge text-xs px-1.5 py-0.5 rounded-full w-20 text-center">
                {calculateDiscount()}% OFF
              </div>
            )}
          </div>
        </div>
      </div>

      {data?.inventory?.stock_status === "in-stock" && (
        <div className="sm:flex items-center justify-between gap-3 mt-auto">
          {isAddToCartButton && (
            <div className="w-full">
              <Button
                onClick={() =>
                  inCart ? setIsCartDrawer(true) : handleAddToCard([data])
                }
                disabled={adLoading}
                className={`w-full mt-4 !text-xs font-semibold !px-2 cursor-pointer text-nowrap ${
                  inCart ? "premium-add-cart-in" : "premium-add-cart"
                } ${adLoading ? "!py-0.5" : ""}`}
              >
                {adLoading ? (
                  <ButtonLoader size="md" color="white" />
                ) : inCart ? (
                  "✓ View Cart"
                ) : (
                  "🛒 Add To Cart"
                )}
              </Button>
            </div>
          )}

          {/* {isByNowButton && (
            <div className="w-full">
              <Button
                className={`w-full mt-2 sm:mt-4 premium-cta font-semibold !text-xs !px-2 cursor-pointer text-nowrap ${
                  orderLoading ? "!py-0.5 " : ""
                }`}
                onClick={() => handleOrderNow([data])}
              >
                {orderLoading ? (
                  <ButtonLoader size="md" color="white" />
                ) : (
                  "ORDER NOW"
                )}
              </Button>
            </div>
          )} */}

          {isByNowButton && (
            <div className="w-full">
              <Button
                className={`w-full mt-2 sm:mt-4 font-semibold !text-xs !px-2 cursor-pointer text-nowrap ${inCart
                  ? "!bg-white !text-primary border border-primary"
                  : "premium-cta"
                  } ${orderLoading ? "!py-0.5" : ""}`}
                onClick={() =>
                  inCart ? router.push("/checkout") : handleOrderNow([data])
                }
                disabled={orderLoading}
              >
                {orderLoading ? (
                  <ButtonLoader size="md" color="white" />
                ) : inCart ? (
                  "View Order"
                ) : (
                  "ORDER NOW"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchCard;
