import { Suspense } from "react";
import { Metadata } from "next";
import AllWatches from "@/@components/pages/Shop/All/AllWatches";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";

export const metadata: Metadata = {
  title: "Rangonaa Churi & Bangles in Bangladesh | Bridal, Glass & Luxury",
  description:
    "Shop handcrafted women's churi and bangles at Rangonaa — bridal, glass, festival, premium, and luxury collections with Cash on Delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <AllWatches />
    </Suspense>
  );
}
