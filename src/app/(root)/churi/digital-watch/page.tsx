import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import DigitalWatch from "@/@components/pages/Collection/DigitalWatch/DigitalWatch";

export const metadata: Metadata = {
  title: "Branded Digital Watches in Bangladesh",
  description:
    "Buy Original Digital Watches Best prices in Bangladesh at Naviforce Bangladesh. Digital Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <DigitalWatch />
    </Suspense>
  );
}
