import Image from "next/image";
import React from "react";
import sslpayment from "@/@assets/SSLCommerz-Pay-With-logo.png";

const NaviforceAbout: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg lg:pb-8 md:pb-6 pb-4">
      <h1 className="lg:text-3xl md:text-2xl text-xl font-bold md:pt-6 pt-4 md:pb-4 pb-2 ">
        NAVIFORCE — For Dream
      </h1>

      <p className="text-[#777777]">
        NAVIFORCE, which combines the words <strong>NAVY</strong> and{" "}
        <strong>FORCE</strong>, expresses its purpose of being a dominant force
        and a leader in the watch industry. Every NAVIFORCE watch has the words{" "}
        <strong>“For Dream”</strong> on its back cover—intended to remind us of
        our dreams as kids and students, and the dreams we pursue for the
        future. Time is the engine that drives our dream-chasing, so cherish the
        time and treasure the spirit that inspires us to be who we are.
      </p>

      <p className="text-[#777777] md:pt-3 pt-2">
        <em>For anyone with a dream</em> — that’s the idea behind the design of
        every NAVIFORCE watch!
      </p>

      <div className="h-px bg-gray-200 lg:my-8 md:my-6 my-4" />

      <h2 className="md:text-2xl text-xl font-semibold pb-2 ">
        PAYMENT SECURITY
      </h2>

      <p className="text-[#777777]">
        Naviforce Bangladesh provides over 20 payment methods through secure
        server of the <strong>SSL COMMERZ</strong>. Naviforce Bangladesh risk
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

export default NaviforceAbout;
