import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import WatchBox from "@/@components/pages/Accessories/WatchBox/WatchBox";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Churi Gift Boxes in Bangladesh",
  description:
    "Shop churi gift boxes at Rangonaa to store and present bangle sets, delivered across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <WatchBox />
    </Suspense>
  );
}
