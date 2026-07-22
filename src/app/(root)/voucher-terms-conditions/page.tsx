import Image from "next/image";
import React from "react";
import voucher from "@/@assets/Gift-Voucher.webp";

const VoucherTerms: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg">
      <Image src={voucher} alt="" className="md:pt-8 pt-4" />

      <h1 className="md:text-2xl text-xl font-bold md:pt-6 pt-4 pb-4 md:text-justify text-start">
        ভাউচার ব্যবহারের শর্তাবলি (Terms & Conditions)
      </h1>

      {/* Bangla Section */}
      <h2 className="text-xl font-semibold md:pt-4 pb-2">বাংলা :</h2>
      <ul className="list-disc list-inside text-[#555555] space-y-1">
        <li>
          এই ভাউচার শুধুমাত্র যারা পণ্য অর্ডার করে সফলভাবে রিসিভ করেছেন,
          শুধুমাত্র তারাই পাবেন।
        </li>
        <li>প্রাপ্ত ভাউচারটি পরবর্তী অর্ডারে ব্যবহার করা যাবে।</li>
        <li>প্রতিটি অর্ডারে শুধুমাত্র ১টি ভাউচার ব্যবহার করা যাবে।</li>
        <li>একবার ব্যবহারের পর এই ভাউচার পুনরায় ব্যবহারযোগ্য নয়।</li>
        <li>
          ভাউচার ব্যবহারের জন্য checkout পেজে গেলে “Click here to enter your
          code” অপশন পাবেন। সেখানে ক্লিক করে কোডটি দিন:{" "}
          <span className="font-bold text-black">NF200</span>
        </li>
        <li>এই ভাউচার নগদ অর্থে পরিবর্তনযোগ্য নয়।</li>
        <li>ভাউচারের মেয়াদ: ৩ মাস।</li>
        <li>কোম্পানি যে কোনো সময় শর্তাবলি পরিবর্তন করার অধিকার রাখে।</li>
      </ul>

      {/* English Section */}
      <h2 className="text-xl font-semibold md:pt-6 pt-2 pb-2">English:</h2>
      <ul className="list-disc list-inside text-[#555555] space-y-1">
        <li>
          This voucher is issued only to customers who place an order and
          successfully receive the product.
        </li>
        <li>The received voucher can be used on the next order only.</li>
        <li>Only one voucher can be used per order.</li>
        <li>The voucher is non-reusable once applied.</li>
        <li>
          To use the voucher, go to the checkout page and click on “Click here
          to enter your code”, then apply the code:{" "}
          <span className="font-bold text-black">NF200</span>
        </li>
        <li>This voucher is non-redeemable for cash.</li>
        <li>Validity: 3 months from the date of issue.</li>
        <li>
          The company reserves the right to change the terms and conditions at
          any time.
        </li>
      </ul>

      {/* Assistance Section */}
      <div className="md:pb-8 pb-4">
        <div className="bg-gray-50 p-4 rounded-lg md:mt-8 mt-4">
          <h3 className="text-lg font-semibold pb-2">✅ For Assistance:</h3>
          <p className="text-[#555555] ">
            📞 Call:{" "}
            <a href="tel:01768509905" className="underline font-medium">
              01768509905
            </a>{" "}
            <br />
            🌐 Website:{" "}
            <a
              href="https://naviforce.com.bd/"
              target="_blank"
              rel="noreferrer"
              className="underline font-medium"
            >
              naviforce.com.bd
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoucherTerms;
