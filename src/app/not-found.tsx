import Button from "@/@components/core/Button/Button";
import Image from "next/image";
import React, { JSX } from "react";
import emptyCart from "@/@assets/vector/pageNotFound.gif";
import Link from "next/link";
import PapularProduct from "@/@components/pages/NoDataFount/ProductNotFound";
import { ENV } from "@/@config/env.config";

async function getProducts() {
  try {
    const qs = new URLSearchParams({
      limit: "5",
      category: "all",
      sort: "best-selling",
    });

    const res = await fetch(`${ENV.ApiEndpoint}/product?${qs}`, {
      next: { revalidate: 10, tags: ["products", "flash-sale"] },
    });
    if (!res.ok) return { data: [] };
    return res.json();
  } catch {
    return { data: [] };
  }
}
const ProductNotFound = async (): Promise<JSX.Element> => {
  const response = await getProducts();
  const products = response?.data?.data ?? [];

  return (
    <div className="w-full min-h-screen bg-gray-50 pt-6">
      <div className="bg-white max-w-layout mx-auto h-full px-4 sm:px-6 lg:px-8 rounded-lg shadow-sm">
        <div className="text-center py-6">
          <div className="flex items-center justify-center">
            <Image
              src={emptyCart}
              alt="Empty Cart"
              height={200}
              width={200}
              className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-700 mt-4">
            Oops! Page not found.
          </h1>
          <p className="pt-3 text-sm sm:text-base text-gray-500">
            The page you’re looking for doesn’t exist or has been moved.
          </p>

          <Link href={"/"}>
            <Button className="uppercase cursor-pointer !bg-black !font-bold mt-6 px-6 py-3 text-sm sm:text-base">
              Return To Home Page
            </Button>
          </Link>
        </div>

        <div className="mt-10">
          <PapularProduct products={products} />
        </div>
      </div>
    </div>
  );
};

export default ProductNotFound;
