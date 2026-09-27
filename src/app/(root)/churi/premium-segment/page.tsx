import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import LeatherStrap from "@/@components/pages/Collection/LeatherStrap/LeatherStrap";
import PremiumSegment from "@/@components/pages/Collection/PremiumSegment/PremiumSegment";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Premium Churi & Bangles in Bangladesh",
  description:
    "Shop premium and luxury churi at Rangonaa, including bridal and festival sets with delivery in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <PremiumSegment />
    </Suspense>
  );
}
