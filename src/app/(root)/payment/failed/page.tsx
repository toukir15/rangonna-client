"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Page: React.FC = () => {
  const router = useRouter();

  return (
    <div className="max-w-layout mx-auto px-3 2xl:px-0 min-h-[70vh] flex items-center justify-center">
      <div className="bg-primary-light border border-primary-border rounded-xl p-8 text-center shadow-md max-w-md">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-2xl font-semibold text-primary">Payment Failed</h2>
        <p className="text-gray-600 mt-2">
          Sorry! Your SSLCommerz payment was not completed.
        </p>

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-primary-dark border border-primary-border rounded-lg shadow-sm transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;

