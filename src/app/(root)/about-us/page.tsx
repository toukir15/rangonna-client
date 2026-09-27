import type { Metadata } from "next";
import Image from "next/image";
import React from "react";
import sslpayment from "@/@assets/SSLCommerz-Pay-With-logo.png";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Rangonaa makes handcrafted women's churi and bangles in Bangladesh — bridal, glass, festival, and everyday collections with Cash on Delivery.",
};

const RangonaaAbout: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg lg:pb-8 md:pb-6 pb-4">
      <h1 className="lg:text-3xl md:text-2xl text-xl font-bold md:pt-6 pt-4 md:pb-4 pb-2 ">
        Rangonaa — Handcrafted Churi
      </h1>

      <p className="text-[#777777]">
        Rangonaa designs handcrafted women&apos;s churi and bangles in
        Bangladesh. The collections cover bridal sets, glass bangles, festival
        looks, and pieces for everyday wear.
      </p>

      <p className="text-[#777777] md:pt-3 pt-2">
        Each set is made to be worn, gifted, and kept. Orders ship across
        Bangladesh with Cash on Delivery.
      </p>

      <div className="h-px bg-gray-200 lg:my-8 md:my-6 my-4" />

      <h2 className="md:text-2xl text-xl font-semibold pb-2 ">
        PAYMENT SECURITY
      </h2>

      <p className="text-[#777777]">
        Rangonaa provides over 20 payment methods through secure
        server of the <strong>SSL COMMERZ</strong>. Rangonaa risk
        control system ensures your payment security. Your payment will be made
        through your bank server which make sure that your payment is secure. We
        provide Debit/Credit Cards, Bkash, Mobile Banking, Internet Banking as
        well as E-wallet payment method.
      </p>

      <h3 className="text-xl font-semibold md:pt-6 pt-4 pb-2">
        Supported Methods
      </h3>

      <div className="lg:w-[700px] mx-auto lg:py-8 md:py-6 py-4">
        <Image src={sslpayment} alt="" className="rounded-xl" />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:mt-6 mt-4">
        <h4 className="text-lg font-semibold pb-2">Online Payment</h4>
        <p className="text-[#777777]">
          Pay instantly and securely using your preferred option above. For more
          information about payment flow, limits, or refunds, visit our{" "}
          <a href="#" className="underline font-medium">
            Payments Help
          </a>{" "}
          page.
        </p>
      </div>
    </div>
  );
};

export default RangonaaAbout;
