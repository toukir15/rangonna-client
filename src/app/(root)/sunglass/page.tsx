import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import Sunglass from "@/@components/pages/Sunglass/Sunglass";

export const metadata: Metadata = {
  title: "Sunglasses in Bangladesh",
  description:
    "Shop sunglasses at Rangonaa, with styles for everyday wear and Cash on Delivery in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <Sunglass />
    </Suspense>
  );
}
