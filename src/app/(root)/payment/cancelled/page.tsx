"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const router = useRouter();

  return (
    <div className="max-w-layout mx-auto px-3 2xl:px-0 min-h-[70vh] flex items-center justify-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center shadow-md max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-yellow-700">
          Payment Cancelled
        </h2>
        <p className="text-gray-600 mt-2">
          You cancelled the SSLCommerz payment. You can try again anytime.
        </p>

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => router.push("/checkout")}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg shadow-md transition-all"
          >
            Back to Checkout
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-yellow-800 border border-yellow-200 rounded-lg shadow-sm transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;

