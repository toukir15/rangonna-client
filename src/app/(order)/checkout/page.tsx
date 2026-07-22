import React from "react";
import Checkout from "@/@components/pages/Checkout/Checkout";
import PaymentMethodAssetsPreload from "@/@components/core/Radio/PaymentMethodAssetsPreload";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Rongonaa",
};
const Page: React.FC = () => {
  return (
    <>
      <PaymentMethodAssetsPreload />
      <Checkout />
    </>
  );
};

export default Page;
