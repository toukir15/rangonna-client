import Button from "@/@components/core/Button/Button";
import Image from "next/image";
import React, { JSX } from "react";
import emptyCart from "@/@assets/vector/emptyCart3.png";
import Link from "next/link";

interface ReturnToHomeProps {
  redirect?: string;
  buttonText?: string;
}

const ReturnToHome = ({
  redirect,
  buttonText = "Return",
}: ReturnToHomeProps): JSX.Element => {
  return (
    <div className="min-h-[95] flex flex-col justify-center items-center w-full px-4">
      <div className="text-center w-full py-14">
        <div className="flex items-center justify-center">
          <Image
            src={emptyCart}
            alt={"Empty Cart"}
            height={200}
            width={200}
            className="h-48 w-48"
          />
        </div>

        <h1 className="text-5xl font-bold">Your cart is currently empty.</h1>
        <p className="pt-4">
          Before proceeding to checkout, you must add some products to your
        </p>
        <p className="py-1">
          shopping cart. You will find a lot of interesting products on our
        </p>
        <p>"Shop" page.</p>
        <Link href={"/"} className="">
          <Button className="uppercase cursor-pointer !bg-black !font-bold mt-6">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ReturnToHome;
