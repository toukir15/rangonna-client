"use client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import noImageFound from "@/@assets/noImageFound.png";
import Icon from "@/@components/core/Icon/Icon";
import ProductDetails from "@/@components/pages/Product/ProductDetails";
import { PremiumBenefits } from "@/@components/pages/ProductDetails/PremiumBenifit";
import { EmiFacilities } from "@/@components/pages/ProductDetails/EmiFacilities";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie, getCookie } from "cookies-next";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import { pushToDataLayer } from "@/utils/gtm";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ModalState } from "../Checkout/Checkout";
import Modal from "@/@components/core/Modal/Modal";
import DescriptionSection from "../ProductDetails/DescriptionSection";
import ProductActions from "../ProductDetails/ProductActions";
import { ToastService } from "@/utils/toaster.service";
import ProductReview from "@/@components/core/Carousal/ProductReview";
import CreateProductReview from "@/@components/core/Carousal/CreateProductReview";
import ProgressBar from "@/@components/core/ProgressBar/ProgressBar";
import ProductFlashDeal from "../FlashDeal/FlashDealTimer";
import {
  Product,
  ProductPageClientProps,
} from "@/@interfaces/ProductDetails/productDetails.interface";
import CustomHTMLParser from "@/@components/core/HtmlParser/HtmlParser";
import OfferBanner from "@/@assets/offer/bkashofferbanner.webp";
import OtherProduct from "../Product/OtherProduct";
import Link from "next/link";
import ImagePreviewModal from "@/@components/core/ImagePreview/ImagePrevieModal";
import { IRandomPickReviewData } from "@/@interfaces/Reviews/reviews.interface";

const defaultValue = { phone: "" };
const CATEGORY_PRODUCT_LIMIT = 6;

const ProductSchema = yup.object({
  phone: yup.string().trim().required("Mobile number is required"),
});

export default function ProductPageClient({
  initialSingleWatch,
  initialMoreWatchData,
}: ProductPageClientProps) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const singleWatch = useMemo(() => initialSingleWatch, [initialSingleWatch]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inCart, setInCart] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const moreWatchData = useMemo(
    () => initialMoreWatchData,
    [initialMoreWatchData],
  );
  const [perfumeProducts, setPerfumeProducts] = useState<any[]>([]);
  const [sunglassProducts, setSunglassProducts] = useState<any[]>([]);
  const hasFetchedCategoryProductsRef = React.useRef(false);
  /** One `view_item` dataLayer push per product per mount (GTM should map this to Meta ViewContent; do not also call fbq here or Pixel fires twice). */
  const productViewAnalyticsSentRef = useRef<string | null>(null);

  const {
    setRealTimeCartItems,
    setIsCartDrawer,
    isCartDrawer,
    setCampaignPath,
    userInfo,
    campaignPath,
    setIsSignUpDrawer,
  } = useContext(GlobalContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(ProductSchema),
    defaultValues: defaultValue,
  });

  type ImageItem = { src: string | StaticImageData; title?: string };

  const images: ImageItem[] = useMemo(() => {
    const arr: ImageItem[] = [];
    if (singleWatch?.featured_image?.src) {
      arr.push({ src: singleWatch.featured_image.src, title: "Featured" });
    }
    if (Array.isArray(singleWatch?.images)) {
      for (const im of singleWatch.images) {
        if (im?.src) arr.push({ src: im.src, title: im.title });
      }
    }
    if (arr.length === 0) {
      arr.push({ src: noImageFound, title: "Product" });
    }

    const seen = new Set<string>();
    const unique = arr.filter((it) => {
      const key =
        typeof it.src === "string"
          ? it.src
          : (it.src as StaticImageData).src || "static";
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.slice(0, 10);
  }, [singleWatch]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const mainImage = images[currentIndex] || null;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };
  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const goPrev = () =>
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "success",
    title: "",
    message: "",
    autoCloseMs: undefined,
  });

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsDragging(true);
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    const width = containerRef.current?.offsetWidth || 1;
    const THRESHOLD = width * 0.15;
    if (Math.abs(touchDeltaX) > THRESHOLD) {
      touchDeltaX < 0 ? goNext() : goPrev();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsDragging(false);
  };

  const handleSubImageClick = (image: {
    src: string | StaticImageData;
    title?: string;
  }) => {
    const idx = images.findIndex((im) => {
      const a =
        typeof im.src === "string" ? im.src : (im.src as StaticImageData).src;
      const b =
        typeof image.src === "string"
          ? image.src
          : (image.src as StaticImageData).src;
      return a === b;
    });
    setCurrentIndex(idx >= 0 ? idx : 0);
  };

  const getHighlightedDescription = (description: string, expand: boolean) => {
    if (!description) return "";

    // ✅ যদি ব্রাউজার না হয় (SSR সময়), তাহলে শুধু plain return দেবে
    if (typeof document === "undefined") {
      return expand
        ? `<div class="editor-preview">${description}</div>`
        : `<div class="editor-preview">${description
            .split("\n")
            .slice(0, 4)
            .join("<br/>")}</div>`;
    }

    // ✅ Normalize and trim
    const clean = description.trim();

    // ✅ Extract <style> blocks
    const styleMatch = clean.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    const styleHTML = styleMatch ? styleMatch.join("") : "";

    // ✅ Remove <style> tags
    const withoutStyle = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    // ✅ Expanded version → full HTML
    if (expand) {
      return `${styleHTML}<div class="editor-preview">${withoutStyle}</div>`;
    }

    // ✅ Client-only parsing (safe)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = withoutStyle;

    const childNodes = Array.from(tempDiv.childNodes);
    const previewBlocks: string[] = [];
    let count = 0;

    for (const node of childNodes) {
      if (count >= 4) break;

      if (node.nodeType === Node.ELEMENT_NODE) {
        const html = (node as HTMLElement).outerHTML;
        previewBlocks.push(html);
        count++;
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          previewBlocks.push(`<p>${text}</p>`);
          count++;
        }
      }
    }

    const formattedPreview =
      `${styleHTML}<div class="editor-preview">` +
      previewBlocks.join("\n") +
      `<div style="margin-top:2.75rem;color:#94a3b8;font-size:1.875rem;font-style:italic">...click on button see more</div>` +
      `</div>`;

    return formattedPreview;
  };

  const discountPct = useMemo(() => {
    const reg = Number(singleWatch?.pricing?.regular_price || 0);
    const sale = Number(singleWatch?.pricing?.sale_price || 0);
    if (!reg || reg <= 0 || sale <= 0 || sale >= reg) return null;
    return Math.round(((reg - sale) / reg) * 100);
  }, [singleWatch]);

  useEffect(() => {
    if (!singleWatch) return;

    const productId =
      singleWatch._id !== undefined && singleWatch._id !== null
        ? String(singleWatch._id)
        : "";
    if (!productId) return;
    if (productViewAnalyticsSentRef.current === productId) return;
    productViewAnalyticsSentRef.current = productId;

    const getCookieByName = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
      return null;
    };

    const fbp = getCookieByName("_fbp");
    const fbc = getCookieByName("_fbc");

    pushToDataLayer("view_item", {
      event: "view_item",
      fbp,
      fbc,
      ecommerce: {
        currency: "BDT",
        value: singleWatch?.pricing?.sale_price || 0,
        items: [
          {
            item_id: singleWatch?._id,
            item_name: singleWatch?.title,
            price: singleWatch?.pricing?.sale_price || 0,
            quantity: 1,
            content_type: "watches",
            first_party_collection: true,
            item_category: "category Watches",
          },
        ],
      },
    });
  }, [singleWatch]);

  useEffect(() => {
    let cancelled = false;

    const fetchCategoryProducts = async () => {
      const [perfumeRes, sunglassRes] = await Promise.allSettled([
        ProductService.getProduct({
          category: "perfume",
          limit: CATEGORY_PRODUCT_LIMIT,
        }),
        ProductService.getProduct({
          category: "sunglass",
          limit: CATEGORY_PRODUCT_LIMIT,
        }),
      ]);

      if (cancelled) return;

      setPerfumeProducts(
        perfumeRes.status === "fulfilled"
          ? (perfumeRes.value?.data?.data || []).slice(
              0,
              CATEGORY_PRODUCT_LIMIT,
            )
          : [],
      );
      setSunglassProducts(
        sunglassRes.status === "fulfilled"
          ? (sunglassRes.value?.data?.data || []).slice(
              0,
              CATEGORY_PRODUCT_LIMIT,
            )
          : [],
      );
    };
    const handleFirstScroll = () => {
      if (hasFetchedCategoryProductsRef.current) return;

      hasFetchedCategoryProductsRef.current = true;
      window.removeEventListener("scroll", handleFirstScroll);
      fetchCategoryProducts();
    };

    window.addEventListener("scroll", handleFirstScroll, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", handleFirstScroll);
    };
  }, []);

  const handleAddToCart = async (products: Product[]) => {
    if (inCart) {
      setIsCartDrawer(true);
      return;
    }

    if (!Array.isArray(products))
      throw new Error("The input must be an array of products");

    let cartItems: any[] = [];
    try {
      const existingCart = getCookie("cartData");
      cartItems = existingCart ? JSON.parse(existingCart.toString()) : [];
      if (!Array.isArray(cartItems)) cartItems = [];
    } catch {
      cartItems = [];
    }

    let totalValue = 0;

    for (const p of products) {
      if (!p?._id) continue;
      totalValue += Number(p?.pricing?.sale_price || 0);

      const i = cartItems.findIndex((item: any) => item.id === p._id);
      if (i >= 0) {
        cartItems[i].quantity += 1;
      } else {
        cartItems.push({
          id: p._id,
          title: p.title,
          price: p.pricing?.sale_price || 0,
          quantity: productQuantity,
          image: p.featured_image?.src || p.images?.[0]?.src,
          sku: p?.sku,
          categories: Array.isArray(p.categories)
            ? p.categories
            : (p.categories ?? ""),
          brand: p.brand ?? "",
          max_quantity: p.inventory.stock_quantity,
        });
      }
    }

    setCookie("cartData", JSON.stringify(cartItems), {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    setRealTimeCartItems(true);
    setInCart(true);
    setIsCartDrawer(true);
    pushToDataLayer("add_to_cart", {
      event: "add_to_cart",
      ecommerce: {
        currency: "BDT",
        value: totalValue,
        items: products.map((p) => ({
          item_id: p._id,
          item_name: p.title,
          item_brand: p.brand ?? "",
          item_category: Array.isArray(p.categories)
            ? p.categories.join(", ")
            : (p.categories ?? ""),
          price: p.pricing?.sale_price || 0,
          quantity: 1,
          max_quantity: p.inventory.stock_quantity,
        })),
      },
    });
  };

  const handleOrderNow = async (products: Product[]) => {
    setBuyNowLoading(true);

    if (!Array.isArray(products))
      throw new Error("The input must be an array of products");

    let cartItems: any[] = [];
    try {
      const existingCart = getCookie("cartData");
      cartItems = existingCart ? JSON.parse(existingCart.toString()) : [];
      if (!Array.isArray(cartItems)) cartItems = [];
    } catch {
      cartItems = [];
    }

    for (const p of products) {
      if (!p?._id) continue;

      const i = cartItems.findIndex((item: any) => item.id === p._id);
      if (i >= 0) {
        cartItems[i].quantity += productQuantity;
      } else {
        cartItems.push({
          id: p._id,
          title: p.title,
          price: p.pricing?.sale_price || 0,
          quantity: productQuantity,
          image: p.featured_image?.src || p.images?.[0]?.src,
          sku: p?.sku,
          categories: Array.isArray(p.categories)
            ? p.categories
            : (p.categories ?? ""),
          brand: p.brand ?? "",
          max_quantity: p.inventory.stock_quantity,
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
  };

  const formSubmit = async (formData: any) => {
    try {
      setNotifyLoading(true);
      const payload = {
        product: singleWatch._id,
        phone_number: formData.phone,
      };
      const res = await ProductService.createNotify(payload);
      if (res?.success) {
        const openModal = (opts: Partial<ModalState>) =>
          setModal((s) => ({ ...s, open: true, ...opts }));

        openModal({
          type: "success",
          title: "Notification ",
          message: "Notification Created Successfully",
          autoCloseMs: 3000,
        });
      } else {
        const openModal = (opts: Partial<ModalState>) =>
          setModal((s) => ({ ...s, open: true, ...opts }));

        openModal({
          type: "error",
          title: "Something Went Wrong ",
          message: "Something Went Wrong",
          autoCloseMs: 3000,
        });
      }
    } catch {
    } finally {
      setNotifyLoading(false);
    }
  };

  const readCart = () => {
    try {
      const existingCart = getCookie("cartData");

      if (!existingCart) return [];

      const raw = existingCart.toString().trim();

      // Invalid JSON pattern detected
      if (!raw.startsWith("[") && !raw.startsWith("{")) {
        setCookie("cartData", JSON.stringify([]));
        return [];
      }

      let parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        parsed = [];
      }

      return parsed;
    } catch (err) {
      // console.error("Invalid cartData cookie → resetting", err);

      // Reset corrupted cookie
      setCookie("cartData", JSON.stringify([]));

      return [];
    }
  };

  const productId = initialSingleWatch?._id;

  useEffect(() => {
    if (!productId) return;
    const items = readCart();
    setInCart(items.some((it: any) => it.id === productId));
  }, [productId, isCartDrawer]);

  useEffect(() => {
    if (productId) {
      fetchReview();
    }
  }, [productId]);

  const fetchReview = () => {
    ProductService.getReview(productId)
      .then((res: any) => {
        if (res?.success) {
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const [reviewData, setReviewData] = useState<any>();

  const [reviewDataLength, setReviewDataLength] = useState<number>(0);
  const [randomPickReviews, setRandomPickReviews] =
    useState<IRandomPickReviewData | null>(null);

  useEffect(() => {
    if (singleWatch?._id) {
      fetchReviewData();
    }
  }, [singleWatch?._id]);

  useEffect(() => {
    ProductService.getRandomPickReviews()
      .then((res: any) => {
        if (res?.success && res?.data) {
          setRandomPickReviews(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchReviewData = () => {
    ProductService.getReview(singleWatch?._id)
      .then((res: any) => {
        if (res?.success) {
          setReviewData(res?.data?.data);
          setReviewDataLength(res?.data?.meta?.total_record);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const totalReviews = reviewDataLength;
  const avgRating =
    totalReviews > 0
      ? reviewData.reduce((acc: any, curr: any) => acc + curr.rating, 0) /
        totalReviews
      : 0;

  const { average, distribution } = useMemo(() => {
    if (!reviewData?.length)
      return { average: 0, distribution: [0, 0, 0, 0, 0] };

    const total = reviewData?.reduce(
      (sum: any, r: any) => sum + (r.rating || 0),
      0,
    );
    const avg = total / reviewDataLength;

    const dist = [0, 0, 0, 0, 0];
    reviewData.forEach((r: any) => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++;
      }
    });

    return { average: avg, distribution: dist };
  }, [reviewData]);

  const isFlashSale: boolean = singleWatch!?.categories!.includes("flash-sale");

  const saveAmount = useMemo(
    () =>
      (singleWatch?.pricing?.regular_price ?? 0) -
      (singleWatch?.pricing?.sale_price ?? 0),
    [singleWatch],
  );

  const categoryLabel = useMemo(() => {
    const cat = singleWatch?.categories?.[0];
    if (!cat) return null;
    return cat
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [singleWatch]);

  return (
    <div className="rongonaa-product-page max-w-layout mx-auto py-3 md:py-8 2xl:px-0 px-3 sm:px-4">
      <Modal
        isOpen={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((s) => ({ ...s, open: false }))}
        primaryActionText={modal.type === "warning" ? "Proceed" : undefined}
        onPrimaryAction={() => {
          setModal((s) => ({ ...s, open: false }));
        }}
        secondaryActionText={modal.type === "warning" ? "Cancel" : undefined}
        onSecondaryAction={() => setModal((s) => ({ ...s, open: false }))}
      />
      <div className="rongonaa-product-showcase">
        <div className="rongonaa-product-vault">
          {images.length > 1 && (
            <span className="rongonaa-product-frame-count">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(images.length).padStart(2, "0")}
            </span>
          )}
          <div
            ref={containerRef}
            className="relative overflow-hidden group select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Track */}
            <div
              className={`flex w-full h-full ${
                isDragging
                  ? ""
                  : "transition-transform duration-500 ease-in-out"
              }`}
              style={{
                transform: ((): string => {
                  const width = containerRef.current?.offsetWidth || 1;
                  const dragPct =
                    touchStartX !== null ? (touchDeltaX / width) * 100 : 0;
                  const base = -currentIndex * 100;
                  return `translateX(calc(${base}% + ${dragPct}%))`;
                })(),
              }}
            >
              {images.map((img, idx) => (
                <div key={idx} className="flex-none w-full">
                  <div className="rongonaa-product-stage-image relative w-full aspect-square overflow-hidden rounded-xl">
                    <Image
                      src={
                        (img?.src as string | StaticImageData) ||
                        (noImageFound as StaticImageData)
                      }
                      alt={img?.title || `Product image ${idx + 1}`}
                      fill
                      className="cursor-grab active:cursor-grabbing object-cover"
                      sizes="(max-width: 640px) 100vw,
               (max-width: 1024px) 50vw,
               25vw"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>

            {singleWatch?.inventory?.stock_status === "out-of-stock" && (
              <div className="w-full absolute top-0.5 -right-49 ">
                <p className="text-base font-semibold premium-badge rounded-lg w-44 text-center px-3 py-1.5 text-white mx-auto">
                  Out Of Stock
                </p>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="rongonaa-product-stage-nav hidden xl:flex absolute top-1/2 -translate-y-1/2 left-3 cursor-pointer focus:outline-none"
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  <Icon name="chevron_left" size={22} />
                </button>
                <button
                  type="button"
                  className="rongonaa-product-stage-nav hidden xl:flex absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer focus:outline-none"
                  onClick={goNext}
                  aria-label="Next image"
                >
                  <Icon name="chevron_right" size={22} />
                </button>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 xl:hidden">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`rongonaa-product-dot ${
                      i === currentIndex ? "rongonaa-product-dot--active" : ""
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="rongonaa-product-filmstrip">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Select image ${idx + 1}`}
                  aria-pressed={idx === currentIndex}
                  onClick={() => handleSubImageClick(img)}
                  className={`rongonaa-product-filmstrip-item ${
                    idx === currentIndex
                      ? "rongonaa-product-filmstrip-item--active"
                      : ""
                  }`}
                >
                  <Image
                    src={(img.src as string | StaticImageData) || noImageFound}
                    alt={img.title || `Product image ${idx + 1}`}
                    fill
                    sizes="80px"
                    loading="lazy"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rongonaa-product-showcase-seam" aria-hidden="true" />

        <div className="rongonaa-product-story">
          <div className="rongonaa-product-meta">
            {singleWatch?.brand ? (
              <span className="rongonaa-product-meta-chip">{singleWatch.brand}</span>
            ) : null}
            {categoryLabel ? (
              <span className="rongonaa-product-meta-chip rongonaa-product-meta-chip--ghost">
                {categoryLabel}
              </span>
            ) : null}
            {singleWatch?.inventory?.stock_status === "in-stock" ? (
              <span className="rongonaa-product-meta-chip rongonaa-product-meta-chip--live">
                In Stock
              </span>
            ) : null}
          </div>

          <h1 className="rongonaa-product-headline">{singleWatch?.title}</h1>

          {saveAmount > 0 ? (
            <div className="rongonaa-product-save-ribbon">
              <span>আপনি সাশ্রয় করছেন</span>
              <strong>৳{saveAmount}</strong>
            </div>
          ) : null}

          {reviewData?.length ? (
            <div className="rongonaa-product-rating">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    className={
                      i < Math.round(avgRating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                    size={18}
                  />
                ))}
              </div>
              <p className="font-bold text-secondary">{avgRating.toFixed(1)}</p>
              <p className="text-sm text-secondary/55">
                ({reviewDataLength}) Reviews
              </p>
            </div>
          ) : null}

          <div className="rongonaa-product-price-ticket">
            <div className="rongonaa-product-price-ticket__top">
              <span className="rongonaa-product-price-ticket__label">
                আজকের বিশেষ মূল্য
              </span>
              <span className="rongonaa-product-price-ticket__tag">
                {singleWatch?.offer_text || "Limited Offer"}
              </span>
            </div>
            <div className="rongonaa-product-price-ticket__body">
              <div className="rongonaa-product-price-ticket__compare">
                <span>MRP ৳{singleWatch?.pricing?.regular_price}</span>
                <span>Market ৳{singleWatch?.pricing?.sale_price + 200}</span>
              </div>
              <p className="rongonaa-product-price-ticket__final">
                ৳{singleWatch?.pricing?.sale_price}
              </p>
            </div>
          </div>

          <div className="rongonaa-product-assurance">
            <span>ক্যাশ অন ডেলিভারি</span>
            <span>১০০% অরিজিনাল</span>
            <span>দ্রুত ডেলিভারি</span>
          </div>

          <div className="rongonaa-product-actions-dock">
            <ProductActions
              singleWatch={singleWatch}
              productQuantity={productQuantity}
              setProductQuantity={setProductQuantity}
              handleOrderNow={handleOrderNow}
              handleAddToCart={handleAddToCart}
              handleSubmit={handleSubmit}
              formSubmit={formSubmit}
              register={register}
              errors={errors}
              watch={watch}
              notifyLoading={notifyLoading}
              setIsCartDrawer={setIsCartDrawer}
              inCart={inCart}
              buyNowLoading={buyNowLoading}
            />
          </div>

          <section aria-label="bKash payment offer" className="rongonaa-product-offer-frame">
            <div className="overflow-hidden rounded-lg">
              <Image
                src={OfferBanner}
                alt="bKash payment offer - Get up to ৳300 cashback on secure and fast transactions"
                width={OfferBanner.width}
                height={OfferBanner.height}
                className="h-auto w-full object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                decoding="async"
              />
            </div>
          </section>

          {randomPickReviews && randomPickReviews.reviews.length > 0 ? (
            <div className="rongonaa-product-social-proof">
              <div className="flex items-center">
                {randomPickReviews.reviews.map((review, index) => (
                  <div
                    key={`${review.reviewer_name}-${index}`}
                    className={`group relative cursor-pointer transition-all duration-300 ease-out ${
                      index > 0 ? "-ml-3" : ""
                    } hover:z-50 hover:-translate-y-2 hover:scale-110`}
                    style={{
                      zIndex: randomPickReviews.reviews.length - index,
                    }}
                  >
                    {/* Avatar */}
                    <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-md transition-all duration-300 group-hover:shadow-xl">
                      {review.profile_url ? (
                        <Image
                          src={review.profile_url}
                          alt={review.reviewer_name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center premium-badge text-sm font-semibold text-white">
                          {review.reviewer_name
                            ?.trim()
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-[999] mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-300 group-hover:mb-4 group-hover:opacity-100">
                      {review.reviewer_name}

                      {/* Arrow */}
                      <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm font-medium text-gray-800">
                {randomPickReviews.total_reviews * 500} + সন্তুষ্ট কাস্টমার
              </p>
            </div>
          ) : null}
          <div className="mt-4">
            {isFlashSale && <ProductFlashDeal product={singleWatch} />}
          </div>
          <EmiFacilities
            salePrice={Number(singleWatch?.pricing?.sale_price || 0)}
          />
        </div>
      </div>

      <div className="mt-4">
        <PremiumBenefits singleWatch={singleWatch} />
      </div>

      <div
        id="build-quality-details"
        className="rongonaa-product-section scroll-mt-24"
      >
        <div className="rongonaa-product-section-head">
          <h3>
            কেন <span className="text-primary">{singleWatch?.title}</span> কিনবেন?
          </h3>
        </div>

        <div className="p-3 sm:p-4">
          {singleWatch?.images.length > 1 && (
            <div className="mt-2 grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {singleWatch?.images.slice(0, 5).map((image, idx) => {
                const imageSrc =
                  typeof image?.src === "string"
                    ? image.src
                    : (image?.src as StaticImageData).src;

                const activeImageSrc =
                  typeof mainImage?.src === "string"
                    ? mainImage.src
                    : (mainImage?.src as StaticImageData | undefined)?.src;

                const isActive = imageSrc === activeImageSrc;

                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Select image ${idx + 1}`}
                    aria-pressed={isActive}
                    className={`group relative aspect-square overflow-hidden rounded-xl border bg-white p-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${"border-gray-200 hover:-translate-y-1 hover:border-primary-border hover:shadow-lg"}`}
                  >
                    <Image
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof image?.src === "string")
                          handleImageClick(image?.src);
                      }}
                      src={image?.src as string | StaticImageData}
                      alt={image?.title || `Product image ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 18vw, (max-width: 1024px) 12vw, 96px"
                      loading="lazy"
                      className={`rounded-lg object-cover transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "scale-100"
                          : "scale-[0.98] group-hover:scale-105"
                      }`}
                    />
                    <div className="absolute left-1 right-1 bottom-1 rounded-lg bg-black/80 px-2 py-3 text-white backdrop-blur-sm">
                      <p className="text-sm font-semibold truncate">
                        {image?.text || `Product image ${idx + 1}`}
                      </p>
                    </div>

                    <div
                      className={`pointer-events-none absolute inset-1 rounded-lg transition-colors duration-300 ${
                        isActive
                          ? "bg-primary/5"
                          : "bg-black/0 group-hover:bg-black/5"
                      }`}
                    />

                    {isActive && (
                      <div className="absolute bottom-1.5 left-1/2 h-1 w-8 -translate-x-1/2 premium-badge shadow-sm" />
                    )}

                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-[10px] font-semibold text-white backdrop-blur-sm">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* review section  */}

      <div className="rongonaa-product-reviews md:p-6 p-3">
        {reviewData?.length ? (
          <div className="mb-6">
            <h3 className="premium-section-title mb-4 rounded-xl px-4 py-3 text-center text-lg font-bold">
              Customer Reviews ({reviewDataLength})
            </h3>

            <div className="mb-4 md:flex gap-8">
              <div className="md:w-48 w-full">
                <h3 className="font-bold text-4xl text-center">
                  {average.toFixed(1)}
                </h3>
                <div className="flex text-center justify-center pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={23}
                      className={
                        i < Math.round(average)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <p className="text-center pt-2">
                  Based on {reviewDataLength} reviews
                </p>
              </div>

              <div className="w-full space-y-0.5 md:mt-0 mt-6">
                {[5, 4, 3, 2, 1].map((stars, idx) => {
                  const count = distribution[stars - 1];

                  const totalCount = reviewDataLength;

                  const paddings = [10, 10, 10, 10, 10];
                  const paddingLeft = `${paddings[idx] || 0}px`;

                  return (
                    <div
                      key={stars}
                      className="flex items-center text-gray-700"
                    >
                      <div className="flex items-center space-x-0.5">
                        {[...Array(stars)].map((_, i) => (
                          <Icon
                            key={i}
                            name="star"
                            size={20}
                            className="text-yellow-500"
                          />
                        ))}
                      </div>

                      <div className="w-full" style={{ paddingLeft }}>
                        <ProgressBar
                          totalCount={totalCount}
                          value={count}
                          stars={stars}
                        />
                      </div>
                      <span className="text-sm w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <ProductReview reviews={reviewData} />
            </div>
          </div>
        ) : null}

        {userInfo?.phone ? (
          <div className="px-4 rounded-xl ">
            {!showForm ? (
              <div className="flex items-center justify-center">
                <button
                  className="premium-cta rounded-lg hover:bg-primary/90 transition font-bold cursor-pointer"
                  onClick={() => setShowForm(true)}
                >
                  Write a review
                </button>
              </div>
            ) : (
              <CreateProductReview
                productId={singleWatch?._id}
                onCancel={() => setShowForm(false)}
                fetchReviewData={fetchReviewData}
              />
            )}
          </div>
        ) : (
          <div className="  rounded-xl text-center flex items-center justify-center gap-3">
            <button
              className="premium-cta rounded-lg hover:bg-primary/90 transition font-bold cursor-pointer"
              onClick={() => setIsSignUpDrawer(true)}
            >
              Sign In
            </button>
            <p className="text-gray-700">to share your feedback.</p>
          </div>
        )}
      </div>

      {/* description section  */}

      <div className="rongonaa-product-description">
        <div className={`rongonaa-product-description-inner ${showMore ? "h-full" : "min-h-[500px]"}`}>
          <CustomHTMLParser htmlContent={singleWatch?.description} />
        </div>
      </div>

      {/* Related Products */}
      <div className="rongonaa-product-related md:py-6 py-4">
        <ProductDetails moreWatchData={moreWatchData} />
      </div>
      {/* {perfumeProducts.length > 0 && (
        <div className="md:mt-6 mt-4 px-4 md:py-6 py-4 rounded-lg bg-white border border-primary-border">
          <OtherProduct
            moreWatchData={perfumeProducts}
            title="Perfume"
            viewAllLink="/watches/perfume"
          />
        </div>
      )} */}
      {/* {sunglassProducts.length > 0 && (
        <div className="md:mt-6 mt-4 px-4 md:py-6 py-4 rounded-lg bg-white border border-primary-border">
          <OtherProduct
            moreWatchData={sunglassProducts}
            title="Sunglass"
            viewAllLink="/watches/sunglass"
          />
        </div>
      )} */}

      {/* Price Information */}
      <div className="rongonaa-product-seo">
        <h3 className="md:text-xl text-lg font-bold text-secondary">
          What is the best price of {singleWatch?.title} in Bangladesh?
        </h3>
        <p className="mt-4">
          The latest Price of {singleWatch?.title} in Bangladesh is ৳{" "}
          {singleWatch?.pricing?.sale_price}. You can buy it online at the best
          price from our website or visit our store.
        </p>
      </div>

      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}
