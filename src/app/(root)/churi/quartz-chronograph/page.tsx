import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";

import QuartzChronograph from "@/@components/pages/Collection/QuartzChronograph/QuartzChronograph";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Chronograph Churi in Bangladesh",
  description:
    "Discover chronograph-style churi at Rangonaa for statement looks, delivered across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <QuartzChronograph />
    </Suspense>
  );
}
