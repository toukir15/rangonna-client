import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import DigitalWatch from "@/@components/pages/Collection/DigitalWatch/DigitalWatch";

export const metadata: Metadata = {
  title: "Digital Style Churi in Bangladesh",
  description:
    "Shop digital-style churi at Rangonaa for a modern look, with Cash on Delivery in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <DigitalWatch />
    </Suspense>
  );
}
