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
import Button from "../Button/Button";
import { useRouter } from "next/navigation";
import { truncateByLines } from "@/utils";
import { setCookie, getCookie } from "cookies-next";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import Link from "next/link";

interface ProductCardProps {
  data: any;
  onAddToCart?: () => void;
  onOrderNow?: () => void;
  imgClassName?: string;
  isAddToCartButton?: boolean;
  priority?: boolean;
}

const MoreProductCard: React.FC<ProductCardProps> = ({
  data,
  onAddToCart,
  onOrderNow,
  imgClassName,
  isAddToCartButton = true,
  priority = false,
}) => {
  const router = useRouter();
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const { setRealTimeCartItems } = useContext(GlobalContext);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const href = useMemo(() => `/product/${data?.slug}`, [data?.slug]);
  const salePrice = data?.pricing?.sale_price ?? 0;
  const regularPrice = data?.pricing?.regular_price ?? 0;
  const hasDiscount = regularPrice > salePrice;

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
      { rootMargin: "200px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [href, router]);

  const handleOrderNow = useCallback(
    async (products: any) => {
      setOrderLoading(true);
      try {
        if (!Array.isArray(products))
          throw new Error("The input to handleOrderNow must be an array");

        let cartItems: any[] = [];
        try {
          const existingCart = getCookie("cartData");
          cartItems = existingCart ? JSON.parse(existingCart.toString()) : [];
          if (!Array.isArray(cartItems)) cartItems = [];
        } catch (e) {
          cartItems = [];
        }

        for (const product of products) {
          if (!product?._id) continue;
          const idx = cartItems.findIndex((item) => item.id === product._id);
          if (idx >= 0) cartItems[idx].quantity += 1;
          else {
            cartItems.push({
              id: product._id,
              title: product.title,
              price: product.pricing.sale_price,
              quantity: 1,
              image: product.featured_image?.src,
              sku: data?.sku,
              categories: product.categories,
              brand: product.brand,
              max_quantity: product.inventory.stock_quantity,
            });
          }
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
    },
    [router, setRealTimeCartItems]
  );

  return (
    <div
      ref={cardRef}
      className="bg-white p-3 rounded-lg relative flex flex-col h-full border border-gray-200
                 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg hover:z-10
                 will-change-transform transform-gpu"
    >
      <Link href={`/product/${data.slug}`} prefetch className="...">
        <div>
          <Image
            src={data?.featured_image?.src}
            alt={data?.featured_image?.title || data?.title || "Product image"}
            width={240}
            height={240}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 240px"
            decoding="async"
            priority={priority}
            className={`cursor-pointer ${imgClassName
              ? imgClassName
              : "rounded-lg h-auto object-cover w-48"
              }`}
          />

          <p
            className="mt-2 font-bold text-[16px] tracking-wider leading-4"
            style={truncateByLines(2)}
          >
            {data?.title}
          </p>

          <div className="sm:flex flex-wrap items-center gap-2 mt-1">
            <div className="flex items-center gap-2 mt-1">
              <span className="text-primary font-bold">
                ৳{Number(salePrice).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-gray-400 text-xs font-bold">
                  <del>৳{Number(regularPrice).toLocaleString()}</del>
                </span>
              )}
            </div>
            <div>
              {hasDiscount && (
                <div className="bg-gray-200 text-black text-xs px-1.5 py-0.5 rounded-full font-bold w-20 text-center">
                  -
                  {Math.round(
                    ((regularPrice - salePrice) / regularPrice) * 100
                  )}
                  % OFF
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-3 mt-auto">
        {isAddToCartButton && (
          <Button
            onClick={onAddToCart}
            className="w-full mt-4 premium-add-cart !text-xs font-semibold !px-2 cursor-pointer text-nowrap"
          >
            🛒 Add To Cart
          </Button>
        )}

        <Button
          className="w-full mt-4 !premium-cta font-semibold !text-xs !px-2 cursor-pointer text-nowrap"
          onClick={() => handleOrderNow([data])}
          disabled={orderLoading}
        >
          {orderLoading ? "Processing..." : "ORDER NOW"}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(MoreProductCard);
