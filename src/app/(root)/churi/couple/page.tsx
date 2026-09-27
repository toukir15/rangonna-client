import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import CoupleWatches from "@/@components/pages/Shop/Couple/CoupleWatches";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Couple Churi Sets in Bangladesh",
  description:
    "Find matching couple churi sets at Rangonaa for weddings, anniversaries, and gifts across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <CoupleWatches />
    </Suspense>
  );
}
