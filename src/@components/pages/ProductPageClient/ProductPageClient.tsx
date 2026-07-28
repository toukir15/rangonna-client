"use client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import noImageFound from "@/@assets/noImageFound.png";
import Icon from "@/@components/core/Icon/Icon";
import ProductDetails from "@/@components/pages/Product/ProductDetails";
import { EmiFacilities } from "@/@components/pages/ProductDetails/EmiFacilities";
import { useRouter } from "next/navigation";
import { setCookie, getCookie } from "cookies-next";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import { pushToDataLayer } from "@/utils/gtm";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ModalState } from "../Checkout/Checkout";
import Modal from "@/@components/core/Modal/Modal";
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
import ImagePreviewModal from "@/@components/core/ImagePreview/ImagePrevieModal";

const defaultValue = { phone: "" };

const ProductSchema = yup.object({
  phone: yup.string().trim().required("Mobile number is required"),
});

export default function ProductPageClient({
  initialSingleWatch,
  initialMoreWatchData,
}: ProductPageClientProps) {
  const router = useRouter();
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const singleWatch = useMemo(() => initialSingleWatch, [initialSingleWatch]);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [inCart, setInCart] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const moreWatchData = useMemo(
    () => initialMoreWatchData,
    [initialMoreWatchData],
  );
  /** One `view_item` dataLayer push per product per mount (GTM should map this to Meta ViewContent; do not also call fbq here or Pixel fires twice). */
  const productViewAnalyticsSentRef = useRef<string | null>(null);

  const { setRealTimeCartItems, setIsCartDrawer, isCartDrawer, userInfo } =
    useContext(GlobalContext);

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
      const lineQty = Math.max(1, productQuantity);
      totalValue += Number(p?.pricing?.sale_price || 0) * lineQty;

      const i = cartItems.findIndex((item: any) => item.id === p._id);
      if (i >= 0) {
        cartItems[i].quantity = Math.min(
          Number(p.inventory?.stock_quantity || 99),
          Number(cartItems[i].quantity || 0) + lineQty,
        );
      } else {
        cartItems.push({
          id: p._id,
          title: p.title,
          price: p.pricing?.sale_price || 0,
          quantity: lineQty,
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
          quantity: productQuantity,
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

  useEffect(() => {
    if (singleWatch?._id) {
      fetchReviewData();
    }
  }, [singleWatch?._id]);

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

  const isFlashSale: boolean = Array.isArray(singleWatch?.categories)
    ? singleWatch.categories.includes("flash-sale")
    : String(singleWatch?.categories || "").includes("flash-sale");

  const categoryLabel = useMemo(() => {
    const raw = Array.isArray(singleWatch?.categories)
      ? singleWatch.categories[0]
      : typeof singleWatch?.categories === "string"
        ? singleWatch.categories.split(",")[0]
        : "";
    if (!raw) return null;
    return String(raw)
      .trim()
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [singleWatch]);

  const shortText = useMemo(() => {
    const short = (singleWatch as any)?.short_description;
    if (typeof short === "string" && short.trim()) {
      return short
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    const html = singleWatch?.description || "";
    const plain = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!plain) return "";
    return plain.length > 180 ? `${plain.slice(0, 180).trim()}…` : plain;
  }, [singleWatch]);

  const sizeOptions = useMemo(() => {
    const attrs = Array.isArray((singleWatch as any)?.attributes)
      ? (singleWatch as any).attributes
      : [];
    const sizeAttr = attrs.find((a: any) =>
      /size|diameter|band width|case diameter/i.test(String(a?.title || "")),
    );
    if (!sizeAttr?.value) return [] as string[];
    return String(sizeAttr.value)
      .split(/[,|/]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [singleWatch]);

  const colorOptions = useMemo(() => {
    const attrs = Array.isArray((singleWatch as any)?.attributes)
      ? (singleWatch as any).attributes
      : [];
    const colorAttr = attrs.find((a: any) =>
      /color|colour|band material|case material/i.test(String(a?.title || "")),
    );
    if (!colorAttr?.value) return [] as string[];
    return String(colorAttr.value)
      .split(/[,|/]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [singleWatch]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  useEffect(() => {
    if (sizeOptions.length) setSelectedSize(sizeOptions[0]);
  }, [sizeOptions]);

  useEffect(() => {
    if (colorOptions.length) setSelectedColor(colorOptions[0]);
  }, [colorOptions]);

  const mainSrc =
    typeof mainImage?.src === "string"
      ? mainImage.src
      : (mainImage?.src as StaticImageData | undefined)?.src;

  return (
    <div className="rongonaa-pdp max-w-layout mx-auto py-4 md:py-8 2xl:px-0 px-3 sm:px-4">
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

      <div className="rongonaa-pdp__hero">
        {/* Gallery */}
        <div className="rongonaa-pdp__gallery">
          <div
            ref={containerRef}
            className="rongonaa-pdp__main select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Image
              src={
                (mainImage?.src as string | StaticImageData) ||
                (noImageFound as StaticImageData)
              }
              alt={mainImage?.title || singleWatch?.title || "Product"}
              fill
              className="object-cover"
              sizes="(max-width: 886px) 100vw, 50vw"
              priority
            />

            {singleWatch?.inventory?.stock_status === "out-of-stock" && (
              <span className="rongonaa-pdp__oos-badge">Out Of Stock</span>
            )}

            <button
              type="button"
              className="rongonaa-pdp__zoom"
              onClick={() => {
                if (mainSrc) handleImageClick(mainSrc);
              }}
            >
              <Icon name="zoom_in" size={16} />
              Zoom
            </button>
          </div>

          {images.length > 1 && (
            <div className="rongonaa-pdp__thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Select image ${idx + 1}`}
                  aria-pressed={idx === currentIndex}
                  onClick={() => handleSubImageClick(img)}
                  className={`rongonaa-pdp__thumb ${
                    idx === currentIndex ? "is-active" : ""
                  }`}
                >
                  <Image
                    src={(img.src as string | StaticImageData) || noImageFound}
                    alt={img.title || `Product image ${idx + 1}`}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="rongonaa-pdp__info">
          {categoryLabel ? (
            <p className="rongonaa-pdp__eyebrow">{categoryLabel}</p>
          ) : null}

          <h1 className="rongonaa-pdp__title">{singleWatch?.title}</h1>

          {reviewDataLength > 0 ? (
            <div className="rongonaa-pdp__rating">
              <Icon name="star" size={16} className="text-primary" />
              <span>
                {avgRating.toFixed(1).replace(/\.0$/, "")} · {reviewDataLength}{" "}
                reviews
              </span>
            </div>
          ) : null}

          <div className="rongonaa-pdp__price">
            <span className="rongonaa-pdp__price-sale">
              ৳{Number(singleWatch?.pricing?.sale_price || 0).toLocaleString()}
            </span>
            {Number(singleWatch?.pricing?.regular_price || 0) >
              Number(singleWatch?.pricing?.sale_price || 0) && (
              <span className="rongonaa-pdp__price-compare">
                ৳
                {Number(
                  singleWatch?.pricing?.regular_price || 0,
                ).toLocaleString()}
              </span>
            )}
          </div>

          {shortText ? (
            <p className="rongonaa-pdp__short">{shortText}</p>
          ) : null}

          {sizeOptions.length > 0 && (
            <div className="rongonaa-pdp__field">
              <p className="rongonaa-pdp__field-label">Size</p>
              <div className="rongonaa-pdp__chips">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`rongonaa-pdp__chip ${
                      selectedSize === opt ? "is-active" : ""
                    }`}
                    onClick={() => setSelectedSize(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colorOptions.length > 0 && (
            <div className="rongonaa-pdp__field">
              <p className="rongonaa-pdp__field-label">Color</p>
              <div className="rongonaa-pdp__chips">
                {colorOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`rongonaa-pdp__chip ${
                      selectedColor === opt ? "is-active" : ""
                    }`}
                    onClick={() => setSelectedColor(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isFlashSale && (
            <div className="mb-3">
              <ProductFlashDeal product={singleWatch} />
            </div>
          )}

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

          <div className="mt-4">
            <EmiFacilities
              salePrice={Number(singleWatch?.pricing?.sale_price || 0)}
            />
          </div>
        </div>
      </div>

      <section className="rongonaa-pdp__desc" aria-labelledby="pdp-description">
        <h2 id="pdp-description" className="rongonaa-pdp__desc-title">
          Description
        </h2>
        <div className="rongonaa-pdp__desc-body">
          <CustomHTMLParser htmlContent={singleWatch?.description} />
        </div>
      </section>

      <div className="rongonaa-product-related md:py-6 py-4">
        <ProductDetails moreWatchData={moreWatchData} />
      </div>

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
