import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import SmartWatch from "@/@components/pages/Shop/SmartWatch/SmartWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Smart Style Churi in Bangladesh",
  description:
    "Explore modern smart-style churi at Rangonaa, designed for daily wear and gifting in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <SmartWatch />
    </Suspense>
  );
}
