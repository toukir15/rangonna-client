import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import QuartzStandard from "@/@components/pages/Collection/QuartzStandard/QuartzStandard";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Quartz Churi Collection in Bangladesh",
  description:
    "Shop the quartz churi collection at Rangonaa, with classic styles and Cash on Delivery in Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <QuartzStandard />
    </Suspense>
  );
}
