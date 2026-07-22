"use client";
import Button from "@/@components/core/Button/Button";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import Icon from "@/@components/core/Icon/Icon";
import Input from "@/@components/core/Input/Input";
import { useRouter } from "next/navigation";

import React from "react";

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
}

const ProductActions: React.FC<ProductActionsProps> = ({
  singleWatch,
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
}) => {
  const router = useRouter();
  if (singleWatch?.inventory?.stock_status === "in-stock") {
    return (
      <>
        {/* Desktop Actions */}
        <div className="w-full">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              className={`rongonaa-product-btn-buy premium-cta !py-2.5 lg:!py-2 cursor-pointer`}
              // ${
              //   inCart
              //     ? "!bg-white !text-primary border border-primary"
              //     : "!bg-primary !text-white"
              // }
              onClick={() =>
                inCart
                  ? router.push("/checkout")
                  : handleOrderNow([singleWatch])
              }
              disabled={buyNowLoading}
            >
              {buyNowLoading ? (
                <ButtonLoader size="base" />
              ) : inCart ? (
                "View Order"
              ) : (
                "Buy Now"
              )}
            </Button>
            <Button
              className={`rongonaa-product-btn-cart gap-2 !py-2.5 lg:!py-2 !font-bold cursor-pointer ${
                inCart ? "premium-add-cart-in" : "premium-add-cart"
              }`}
              onClick={() =>
                inCart ? setIsCartDrawer(true) : handleAddToCart([singleWatch])
              }
            >
              {inCart ? "✓ View Cart" : "🛒 Add To Cart"}
            </Button>
          </div>

          <div className="w-full mt-3">
            <Button
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
              className="rongonaa-product-btn-wa !flex !items-center justify-center gap-3 !font-bold !text-[15px] !py-2.5"
            >
              <Icon name={"chat_bubble"} variant="outlined" size={20} />
              Order via WhatsApp
            </Button>
          </div>
          {/* <Button
            onClick={() =>
              window.open(
                "https://m.me/105230439176308",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="w-full mt-2 !flex !items-center justify-center gap-4 !text-messenger !bg-neutral-bg border border-messenger hover:bg-messenger/10 !font-bold !text-[14px] px-3 !py-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="var(--brand-messenger)"
              viewBox="0 0 24 24"
              width={20}
              height={20}
            >
              <path d="M12 2C6.48 2 2 6.04 2 11.11c0 2.86 1.37 5.43 3.57 7.18v3.71l3.28-1.8c1.02.28 2.11.43 3.15.43 5.52 0 10-4.04 10-9.11C22 6.04 17.52 2 12 2zm.5 12.9-2.65-2.83-5.35 2.83 5.85-6.18 2.65 2.83 5.35-2.83-5.85 6.18z" />
            </svg>
            Order by Messenger
          </Button> */}
        </div>

        {/* Mobile Actions */}
        {/* <div className="fixed bottom-0 left-0 w-full flex-row-reverse bg-white shadow-lg border-t border-gray-200 p-3 flex gap-3 lg:hidden z-10">
          <Button
            className="w-1/2 premium-cta !font-bold"
            onClick={() => handleOrderNow([singleWatch])}
          >
            Buy Now
          </Button>
          <Button
            className="w-1/2 gap-2 border !text-primary border-neutral-border !bg-primary-light !flex items-center justify-center !font-bold"
            onClick={() => handleAddToCart([singleWatch])}
          >
            <Icon name={"shopping_cart"} variant="outlined" />
            Add To Cart
          </Button>
        </div> */}
      </>
    );
  }

  // Out of Stock
  return (
    <>
      <div className="flex items-center justify-center border gap-1 bg-primary-light border-primary-border rounded-lg px-2 py-1 my-4">
        <div className="py-3">
          <div className="flex items-center justify-center gap-2">
            <Icon
              name={"block"}
              variant="outlined"
              className="text-primary"
              size={22}
            />
            <p className="uppercase font-bold text-base text-primary">
              CURRENTLY OUT OF STOCK
            </p>
          </div>
          <p className="uppercase font-normal mt-1.5 text-xs text-primary text-center">
            Don't miss out! Get notified when this item is back
          </p>
        </div>
      </div>

      <form
        className="w-full md:flex items-center gap-4"
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
        <Button
          type="submit"
          className={`text-base font-semibold md:w-52 w-full text-center px-3 rounded-md !py-2 text-white md:mt-7 mt-2 !justify-center mx-auto !items-center !flex gap-1 ${
            !watch?.("phone") ? "bg-primary-muted" : "premium-cta"
          }`}
          disabled={!watch?.("phone")}
        >
          {notifyLoading ? (
            <ButtonLoader size="sm" className="!py-1" />
          ) : (
            <>
              <Icon
                name={"notifications"}
                variant="outlined"
                className="text-white"
                size={22}
              />
              Get Notify
            </>
          )}
        </Button>
      </form>
    </>
  );
};

export default ProductActions;
