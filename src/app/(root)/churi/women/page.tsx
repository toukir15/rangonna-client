import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import WomenWatches from "@/@components/pages/Shop/Women/WomenWatches";

export const metadata: Metadata = {
  title: "Women's Churi & Bangles in Bangladesh",
  description:
    "Shop women's handcrafted churi and bangle sets at Rangonaa, with Cash on Delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <WomenWatches />
    </Suspense>
  );
}
