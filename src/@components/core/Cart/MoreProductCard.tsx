"use client";
import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProductCardProps {
  data: any;
  onAddToCart?: () => void;
  imgClassName?: string;
  isAddToCartButton?: boolean;
  priority?: boolean;
}

const formatPrice = (n: number) =>
  `৳${Number(n || 0).toLocaleString("en-BD")}`;

const MoreProductCard: React.FC<ProductCardProps> = ({
  data,
  onAddToCart,
  isAddToCartButton = true,
  priority = false,
}) => {
  const router = useRouter();
  const cardRef = useRef<HTMLElement | null>(null);

  const href = useMemo(() => `/product/${data?.slug}`, [data?.slug]);
  const salePrice = Number(data?.pricing?.sale_price ?? 0);
  const regularPrice = Number(data?.pricing?.regular_price ?? 0);
  const hasDiscount = regularPrice > salePrice;
  const discount = hasDiscount
    ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
    : 0;

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

  const handleAddToCart = useCallback(() => {
    onAddToCart?.();
  }, [onAddToCart]);

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
      </Link>

      <div className="rongonaa-flash-card__body">
        <Link href={href} prefetch>
          <h3 className="rongonaa-flash-card__title">{data?.title}</h3>
        </Link>

        <div className="rongonaa-flash-card__price-row">
          <div className="rongonaa-flash-card__prices">
            <span className="rongonaa-flash-card__price">
              {formatPrice(salePrice)}
            </span>
            {hasDiscount && (
              <span className="rongonaa-flash-card__compare">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="rongonaa-flash-card__off">{discount}% OFF</span>
          )}
        </div>

        {isAddToCartButton && (
          <button
            type="button"
            onClick={handleAddToCart}
            className="rongonaa-flash-card__cta rongonaa-flash-card__cta--cart"
          >
            Add To Cart
          </button>
        )}
      </div>
    </article>
  );
};

export default React.memo(MoreProductCard);
