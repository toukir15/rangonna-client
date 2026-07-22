"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Icon from "@/@components/core/Icon/Icon";
import { getCookie, setCookie } from "cookies-next";
import Button from "@/@components/core/Button/Button";
import { useRouter } from "next/navigation";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import ReturnToHome from "@/@components/pages/ReturnToHome/ReturnToHome";
import Link from "next/link";
import { pushToDataLayer } from "@/utils/gtm";

const CartView: React.FC = () => {
  const { setRealTimeCartItems } = useContext(GlobalContext);
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);

    setCookie("cartData", JSON.stringify(updatedCart));
  };

  const removeItem = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);

    setCookie("cartData", JSON.stringify(updatedCart));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    const cookieCart = getCookie("cartData");
    if (cookieCart) {
      const parsedCart = JSON.parse(cookieCart.toString());
      setCartItems(parsedCart);
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      pushToDataLayer({
        event: "view_cart",
        ecommerce: {
          value: total.toFixed(2),
          currency: "BDT",
          items: cartItems.map((item) => ({
            item_id: item.id,
            item_name: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          content_category: "Smart Watches",
          content_ids: cartItems.map((item) => item.id),
          content_name: cartItems.map((item) => item.title),
          content_type: "watches",
        },
      });

    }
  }, [cartItems]);

  return (
    <div className="max-w-layout mx-auto py-2 md:py-6">
      {cartItems.length > 0 ? (
        <>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-4/6 h-[100%] ">
              <div className="p-6 bg-white rounded-xl border-gray-200 border shadow">
                <div className="border-b border-gray-200 pb-4">
                  <p className="font-semibold">Shopping Cart</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    2 items in your cart
                  </p>
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    {cartItems?.map((item: any, index: number) => (
                      <tr className="border-b border-gray-200" key={index}>
                        <td className="py-3 px-4">
                          <Icon
                            name={"delete"}
                            size={20}
                            className="text-primary cursor-pointer"
                            variant="outlined"
                            onClick={() => {
                              removeItem(index), setRealTimeCartItems(true);
                            }}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Image
                            className="rounded-lg"
                            height={60}
                            width={60}
                            src={item.image}
                            alt={item.title}
                          />
                        </td>
                        <td className="py-3 px-4">{item.title}</td>
                        <td className="py-3 px-4">৳{item.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center  mt-1">
                            <div className="border border-gray-300 rounded flex items-center">
                              <button
                                type="button"
                                className={` w-8 h-8 flex items-center justify-center border-r border-gray-300 ${item.quantity === 1
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer"
                                  }`}
                                onClick={() => {
                                  updateQuantity(index, item.quantity - 1),
                                    setRealTimeCartItems(true);
                                }}
                              >
                                -
                              </button>
                              <span className=" w-10 h-8 text-center pt-1.5 ">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className={` w-8 h-8 flex items-center justify-center border-s border-gray-300 ${item.quantity === 10 ||
                                  Number(item.max_quantity) ===
                                  Number(item.quantity)
                                  ? "cursor-not-allowed opacity-40"
                                  : "cursor-pointer"
                                  }`}
                                onClick={() => {
                                  updateQuantity(index, item.quantity + 1),
                                    setRealTimeCartItems(true);
                                }}
                                disabled={
                                  item.quantity === 10 ||
                                  Number(item?.max_quantity) ===
                                  Number(item.quantity)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Add more rows as needed */}
                  </tbody>
                </table>
              </div>

              <div className="w-full flex items-center gap-5 mt-5">
                <Link href={"/"} className="w-full">
                  <Button className="border border-gray-300 !bg-white !text-black !w-full !rounded-xl">
                    Continue Shopping
                  </Button>
                </Link>
                <Link href={"/"} className="w-full">
                  <Button className="border border-gray-300 !bg-white !text-black !w-full !rounded-xl">
                    Save for Later
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full md:w-2/6 border-2 border-gray-200 p-5 rounded-lg bg-white">
              <div className="flex items-center gap-1 mb-8">
                <Icon
                  name={"shopping_bag"}
                  variant="outlined"
                  className="text-gray-500"
                />
                <h2 className="text-lg font-semibold text-gray-500">
                  Order Summary
                </h2>
              </div>

              <div className="flex justify-between items-center ">
                <p className="">Subtotal</p>
                <p className="text-primary-dark ">
                  {" "}
                  ৳{calculateSubtotal().toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-200">
                <p className="">Shippings</p>
                <div className="text-right">
                  <p className="">Free shipping</p>
                  <p className="py-1">All Bangladesh: ৳130</p>
                  <p className="">Dhaka City: ৳70</p>
                </div>
              </div>
              <div className="flex justify-between items-center py-4 ">
                <p className="font-semibold">Total</p>
                <p className="text-primary-dark font-semibold">
                  ৳{calculateSubtotal().toFixed(2)}
                </p>
              </div>
              <div className="pt-2">
                <Button
                  className="premium-cta !text-sm !font-bold w-full !py-2.5 cursor-pointer !flex justify-center gap-2 items-center"
                  onClick={() => {
                    router.push("/checkout");
                  }}
                >
                  <Icon name={"credit_card"} />
                  PROCEED TO CHECKOUT
                </Button>
              </div>
              <p className="text-sm text-center py-3">
                Secure checkout with 256-bit SSL encryption
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow grid grid-cols-3">
            <div>
              <div className="flex justify-center md:mb-4">
                <div className="md:bg-[#dbfce7] rounded-full p-2.5 h-10 w-10">
                  <Icon
                    name={"add_task"}
                    className="text-green-600"
                    size={20}
                  />
                </div>
              </div>
              <p className="text-center">Secure Payment </p>
              <p className="text-center text-xs mt-0.5">
                256-bit SSL encryption
              </p>
            </div>
            <div>
              <div className="flex justify-center md:mb-4">
                <div className="md:bg-[#dbeaff] rounded-full p-2.5 h-10 w-10">
                  <Icon
                    name={"add_task"}
                    className="text-[#285dfb]"
                    size={20}
                  />
                </div>
              </div>
              <p className="text-center">Fast Shipping</p>
              <p className="text-center text-xs mt-0.5">
                Free delivery on orders over ৳2000
              </p>
            </div>
            <div>
              <div className="flex justify-center md:mb-4">
                <div className="md:bg-[#fdedd4] rounded-full p-2.5 h-10 w-10">
                  <Icon
                    name={"add_task"}
                    className="text-[#f44a00]"
                    size={20}
                  />
                </div>
              </div>
              <p className="text-center">Easy Returns</p>
              <p className="text-center text-xs mt-0.5">30-day return policy</p>
            </div>
          </div>
        </>
      ) : (
        <ReturnToHome redirect="/" buttonText="Return To Shop" />
      )}
    </div>
  );
};

export default CartView;
