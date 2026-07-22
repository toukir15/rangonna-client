"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Legacy URL: same flow now lives on /checkout/received-order (SSL params preserved). */
function RedirectToReceivedOrder() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(`/checkout/received-order${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="max-w-layout mx-auto px-3 min-h-[50vh] flex items-center justify-center">
      <p className="text-gray-600 text-sm">Redirecting…</p>
    </div>
  );
}

const Page: React.FC = () => (
  <Suspense
    fallback={
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600 text-sm">
        Loading…
      </div>
    }
  >
    <RedirectToReceivedOrder />
  </Suspense>
);

export default Page;
