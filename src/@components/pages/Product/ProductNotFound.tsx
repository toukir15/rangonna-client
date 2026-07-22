import Button from "@/@components/core/Button/Button";
import Image from "next/image";
import React, { JSX } from "react";
import emptyCart from "@/@assets/vector/productNotFound4.avif";
import Link from "next/link";

interface ReturnToHomeProps {
  redirect?: string;
  buttonText?: string;
}

const ProductNotFound = ({
  redirect,
  buttonText = "Return",
}: ReturnToHomeProps): JSX.Element => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center w-full px-4 bg-white rounded-lg mt-5">
      <div className="text-center w-full">
        <div className="flex items-center justify-center">
          <Image
            src={emptyCart}
            alt={"Empty Cart"}
            height={200}
            width={200}
            className="h-60 w-60"
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-600">
          Product Not Found Right Now
        </h1>
        <p className="pt-4">We couldn’t find the product you’re looking for.</p>
        <p className="py-1">
          Please check back later or explore other items in
        </p>
        <p>our Shop.</p>
        <Link href={"/"} className="">
          <Button className="uppercase cursor-pointer !bg-black !font-bold mt-6">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductNotFound;
