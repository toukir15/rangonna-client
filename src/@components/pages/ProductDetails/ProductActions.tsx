"use client";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import Icon from "@/@components/core/Icon/Icon";
import Input from "@/@components/core/Input/Input";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";

interface ProductActionsProps {
  singleWatch: any;
  productQuantity: number;
  setProductQuantity: React.Dispatch<React.SetStateAction<number>>;
  handleOrderNow: (products: any[]) => void;
  handleAddToCart: (products: any[]) => void;
  handleSubmit?: (fn: any) => (e?: React.BaseSyntheticEvent) => void;
  formSubmit?: (data: any) => void;
  register?: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  watch?: UseFormWatch<any>;
  notifyLoading?: boolean;
  inCart?: any;
  setIsCartDrawer?: any;
  buyNowLoading?: any;
  addLoading?: boolean;
}

const WISHLIST_KEY = "rongonaa_wishlist";

const ProductActions: React.FC<ProductActionsProps> = ({
  singleWatch,
  productQuantity,
  setProductQuantity,
  handleOrderNow,
  handleAddToCart,
  handleSubmit,
  formSubmit,
  register,
  errors,
  watch,
  notifyLoading,
  setIsCartDrawer,
  inCart,
  buyNowLoading,
  addLoading,
}) => {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const maxQty = Math.max(
    1,
    Number(singleWatch?.inventory?.stock_quantity || 99),
  );

  useEffect(() => {
    if (typeof window === "undefined" || !singleWatch?._id) return;
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setWishlisted(Array.isArray(list) && list.includes(String(singleWatch._id)));
    } catch {
      setWishlisted(false);
    }
  }, [singleWatch?._id]);

  const toggleWishlist = () => {
    if (!singleWatch?._id) return;
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      let list: string[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      const id = String(singleWatch._id);
      if (list.includes(id)) {
        list = list.filter((x) => x !== id);
        setWishlisted(false);
      } else {
        list.push(id);
        setWishlisted(true);
      }
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  const decQty = () =>
    setProductQuantity((q) => Math.max(1, q - 1));
  const incQty = () =>
    setProductQuantity((q) => Math.min(maxQty, q + 1));

  if (singleWatch?.inventory?.stock_status === "in-stock") {
    return (
      <div className="rongonaa-pdp__actions">
        <div className="rongonaa-pdp__field">
          <p className="rongonaa-pdp__field-label">Quantity</p>
          <div className="rongonaa-pdp__qty">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={decQty}
              disabled={productQuantity <= 1}
            >
              −
            </button>
            <span>{productQuantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={incQty}
              disabled={productQuantity >= maxQty}
            >
              +
            </button>
          </div>
        </div>

        <div className="rongonaa-pdp__cta-row">
          <button
            type="button"
            className="rongonaa-pdp__btn rongonaa-pdp__btn--cart"
            onClick={() =>
              inCart ? setIsCartDrawer(true) : handleAddToCart([singleWatch])
            }
            disabled={addLoading}
          >
            {addLoading ? (
              <ButtonLoader size="sm" color="white" />
            ) : inCart ? (
              "View Cart"
            ) : (
              "Add to Cart"
            )}
          </button>

          <button
            type="button"
            className="rongonaa-pdp__btn rongonaa-pdp__btn--buy"
            onClick={() =>
              inCart
                ? router.push("/checkout")
                : handleOrderNow([singleWatch])
            }
            disabled={buyNowLoading}
          >
            {buyNowLoading ? (
              <ButtonLoader size="sm" color="white" />
            ) : inCart ? (
              "View Order"
            ) : (
              "Buy Now"
            )}
          </button>

          <button
            type="button"
            className={`rongonaa-pdp__btn rongonaa-pdp__btn--wish ${
              wishlisted ? "is-active" : ""
            }`}
            onClick={toggleWishlist}
            aria-pressed={wishlisted}
          >
            <Icon
              name="favorite"
              variant={wishlisted ? "filled" : "outlined"}
              size={18}
            />
            Wishlist
          </button>
        </div>

        <button
          type="button"
          className="rongonaa-pdp__wa"
          onClick={() => {
            const rawPhone = "01768509905";
            const digits = rawPhone.replace(/\D/g, "");
            const phone = /^0\d{10}$/.test(digits)
              ? `880${digits.slice(1)}`
              : digits.startsWith("880")
                ? digits
                : `88${digits}`;

            const message =
              `Product: ${singleWatch?.title}\n` +
              `Price: ${singleWatch?.pricing?.sale_price}\n` +
              `Qty: ${productQuantity}\n` +
              `URL: ${window.location.href}\n`;

            const encoded = encodeURIComponent(message);
            const isMobile =
              /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
              );
            const url = isMobile
              ? `https://wa.me/${phone}?text=${encoded}`
              : `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;

            window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          <Icon name="chat_bubble" variant="outlined" size={18} />
          Order via WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="rongonaa-pdp__actions">
      <div className="rongonaa-pdp__oos">
        <Icon name="block" variant="outlined" className="text-primary" size={22} />
        <div>
          <p className="rongonaa-pdp__oos-title">Currently out of stock</p>
          <p className="rongonaa-pdp__oos-sub">
            Get notified when this item is back
          </p>
        </div>
      </div>

      <form
        className="w-full md:flex items-end gap-3"
        onSubmit={handleSubmit?.(formSubmit)}
      >
        <Input
          label="Mobile Number for Notifications"
          registerProperty={register?.("phone")}
          errorText={errors?.phone?.message as string | undefined}
          type="text"
          isRequired
          placeholder="01XXXXXXXXX"
        />
        <button
          type="submit"
          className={`rongonaa-pdp__btn rongonaa-pdp__btn--cart md:w-44 w-full !mt-2 md:!mt-0 ${
            !watch?.("phone") ? "opacity-50" : ""
          }`}
          disabled={!watch?.("phone") || notifyLoading}
        >
          {notifyLoading ? (
            <ButtonLoader size="sm" color="white" />
          ) : (
            <>
              <Icon name="notifications" variant="outlined" size={18} />
              Get Notify
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProductActions;
