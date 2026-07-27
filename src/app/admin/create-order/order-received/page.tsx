"use client";
import React, { useEffect, useRef, useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { formateDateWithMonth } from "@admin/utils";
import Link from "next/link";
import Button from "@admin/components/core/Button/Button";
import AuthLayout from "@admin/layouts/AuthLayout";
import Image from "next/image";
import * as htmlToImage from "html-to-image";
import { ToastService } from "@admin/utils/toastr.service";

const ReceivedOrder: React.FC = () => {
  const [orderedItems, setOrderedItems] = useState<any>();
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const takeScreenshot = async () => {
    if (!contentRef.current) return;

    try {
      const blob = await htmlToImage.toBlob(contentRef.current, {
        pixelRatio: 2,
        skipFonts: false,
      });

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        ToastService.success("📸 Screenshot copied successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error("Screenshot failed:", err);
      ToastService.error("Screenshot failed!");
    }
  };

  useEffect(() => {
    const cookieCart = getCookie("orderedData");
    if (!cookieCart) {
      router.push("/admin");
    }
    if (cookieCart) {
      const parsedCart = JSON.parse(cookieCart?.toString());
      setOrderedItems(parsedCart);
    }
  }, [router]);

  useEffect(() => {
    const handleBeforeUnload = () => { };
    const handleRouteChange = () => {
      deleteCookie("orderedData");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleRouteChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      handleRouteChange();
      return originalPushState.apply(this, args as any);
    };

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleRouteChange);
      window.history.pushState = originalPushState;
    };
  }, []);


  const handleBack = () => {
    router.push(`/admin/orders/view/${orderedItems?._id}`);
  };

  return (
    <AuthLayout>
      <div className="flex justify-center px-4 mt-3">
        <button
          onClick={takeScreenshot}
          className="bg-tel-600 hover:bg-tel-700 text-green-600 px-4 py-2 rounded-lg shadow hover:shadow-lg border border-gray-300 dark:border-gray-500 font-bold"
        >
          📸 Copy Screenshot
        </button>
      </div>

      <div className="max-w-4xl mx-auto  py-4 px-3 min-h-[76vh]">
        <div
          ref={contentRef}
          className="p-5 border border-gray-300 dark:border-gray-500 rounded-lg"
          style={{ lineHeight: "1.5", letterSpacing: "0px" }}
        >
          <div className="bg-red-600 rounded mb-3">
            <p className="text-center text-white p-4">
              ধন্যবাদ স্যার, আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই আমাদের
              প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 py-2 border rounded-xl  bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 shadow-sm">
            {/* Order Info */}
            <div className="text-center md:text-start">
              <p className="text-gray-700 dark:text-gray-300 font-bold text-lg">
                {orderedItems?.sysid}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {orderedItems?.createdAt &&
                  formateDateWithMonth(orderedItems?.createdAt)}
              </p>
            </div>

            {/* Total */}
            <div className="flex flex-col items-center justify-center bg-red-50 border border-red-500 rounded-lg px-2">
              <p className="text-sm text-gray-500 font-medium">Total Amount</p>
              <p className="text-xl font-bold text-red-600 ">
                ৳ {orderedItems?.due}
              </p>
            </div>

            {/* Customer Info */}
            <div className="md:text-end text-center">
              <p className="text-gray-700 font-bold text-lg dark:text-gray-300">
                {orderedItems?.customer?.first_name}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                {orderedItems?.customer?.phone}
              </p>
            </div>
          </div>

          <div className="px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-500 shadow-sm mt-4 space-y-3">
            {orderedItems?.line_items.map((items: any, index: number) => (
              <div
                className="flex justify-between py-2 border p-2 rounded-lg border-gray-200 gap-2 dark:border-gray-500 dark:text-gray-300"
                key={index}
              >
                <div className="flex gap-2">
                  <div>
                    <p className="md:text-base text-sm">{items?.title}</p>
                    <div className="flex items-center ">
                      <p className="text-sm pt-0.5">Price: {items?.subtotal}</p>
                      <p className="px-1">-</p>
                      <p className="text-sm pt-0.5">
                        {" "}
                        Quantity: {items?.quantity}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="md:text-base text-sm font-bold text-red-500">
                  ৳{items?.subtotal * items?.quantity.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
          {orderedItems?.shipping_line?.total > 0 && (
            <div className="px-4 py-2 border rounded-xl bg-green-50 dark:bg-gray-700 border-green-600 shadow-sm mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm pt-0.5 font-bold text-green-600">
                  {" "}
                  Shipping :(+){" "}
                </p>
                <p className="text-sm pt-0.5 font-bold text-green-600">
                  {" "}
                  {orderedItems?.shipping_line?.total}{" "}
                </p>
              </div>
            </div>
          )}

          {orderedItems?.discount_total > 0 && (
            <div className="px-4 py-2 border rounded-xl bg-red-50 dark:bg-gray-700 border-red-600 shadow-sm mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm pt-0.5 font-bold text-red-600">
                  {" "}
                  Discount:(-){" "}
                </p>
                <p className="text-sm pt-0.5 font-bold text-red-600">
                  {" "}
                  {orderedItems?.discount_total}{" "}
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 p-4 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-500 shadow-sm mt-4 w-full gap-2">
            {orderedItems?.line_items.map((items: any, index: number) =>
              Array.from({ length: items.quantity }).map((_, qIndex) => (
                <div className="items-center gap-2" key={`${index}-${qIndex}`}>
                  <Image
                    className="rounded-lg border border-gray-300 md:h-64 md:w-64 w-full object-cover"
                    height={200}
                    width={200}
                    src={items?.product_id?.featured_image?.src}
                    alt={items?.product_id?.featured_image?.title}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 mt-4 md:p-6 p-4 rounded-lg border border-gray-200 dark:border-gray-500 shadow">
          <div className="md:flex items-center justify-between gap-4 !w-full">
            <Link href="/admin/create-order" className="w-full">
              <Button className="!py-2 uppercase cursor-pointer bg-blue-600 !w-full">
                Back To Create Order
              </Button>
            </Link>
            <Button
              className="!py-2 uppercase cursor-pointer bg-green-600 !w-full  md:mt-0 mt-3"
              onClick={handleBack}
            >
              Back To Orders
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ReceivedOrder;
