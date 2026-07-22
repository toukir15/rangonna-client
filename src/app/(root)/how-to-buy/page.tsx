import React from "react";

const HowToOrder: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg">
      <h1 className="lg:text-3xl md:text-2xl text-xl font-bold md:pt-6 pt-4 md:pb-4 pb-2 ">
        How to Place an Order
      </h1>

      <p className="text-[#777777]">
        Placing an order on our website is quick and easy. Follow the steps
        below to select items, review your cart, enter delivery details, and
        complete payment.
      </p>

      {/* Step 1 */}
      <h2 className="lg:text-2xl text-xl font-semibold lg:pt-8 md:pt-6 pt-4 pb-2">
        1) Choose Your Item
      </h2>
      <p className="text-[#777777]">
        Click on the product card or the <strong>SELECT OPTION</strong> button
        to open the product details page. This page includes full specifications
        and available color variations. Select your preferred color (and any
        required options), then click <strong>ADD TO CART</strong>. The item
        will be added to your cart.
      </p>

      {/* Step 2 */}
      <h2 className="lg:text-2xl text-xl font-semibold lg:pt-8 md:pt-6 pt-4 pb-2">
        2) Review Your Cart
      </h2>
      <p className="text-[#777777]">
        Open your cart (top/right of the site). From there you can:
      </p>
      <ul className="list-disc list-inside text-[#555555] space-y-1">
        <li>Change quantity or variations (e.g., color/size) of an item</li>
        <li>Add more products or remove items you no longer need</li>
        <li>
          Click <strong>PROCEED TO CHECKOUT</strong> to continue
        </li>
      </ul>

      {/* Step 3 */}
      <h2 className="lg:text-2xl text-xl font-semibold lg:pt-8 md:pt-6 pt-4 pb-2">
        3) Enter Billing & Shipping Details
      </h2>
      <p className="text-[#777777]">
        On the checkout page, fill in the <strong>Billing Details</strong>. This
        information is used for delivery and receipts. If you want your order
        shipped to a different address, tick{" "}
        <strong>Ship to a different address</strong> and provide that address.
      </p>

      {/* Step 4 */}
      <h2 className="lg:text-2xl text-xl font-semibold lg:pt-8 md:pt-6 pt-4 pb-2">
        4) Choose Payment Method
      </h2>
      <p className="text-[#777777]">
        After entering your details, select a payment option and proceed:
      </p>
      <ul className="list-disc list-inside text-[#555555] space-y-1">
        <li>Cash on Delivery (COD)</li>
        <li>bKash, Rocket, Nagad (MFS)</li>
        <li>
          International Payment Gateway – Credit Card, MasterCard, Debit Card,
          etc.
        </li>
      </ul>
      <p className="text-[#777777] pt-3">
        Click the relevant payment button (e.g.,{" "}
        <strong>PROCEED TO bKash</strong> or{" "}
        <strong>PROCEED TO Card Payment</strong>) to complete payment. For more
        information about payments,{" "}
        <a href="/payments" className="underline font-medium">
          click here
        </a>
        .
      </p>

      {/* Helpful Tips */}
      <div className="pb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-8 ">
          <h3 className="text-lg font-semibold pb-2">Helpful Tips</h3>
          <ul className="list-disc list-inside text-[#555555] space-y-1">
            <li>
              Double-check your phone number and address for accurate delivery.
            </li>
            <li>If you have a voucher code, apply it in the cart/checkout.</li>
            <li>
              You can save addresses in your account for faster checkout next
              time.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HowToOrder;
