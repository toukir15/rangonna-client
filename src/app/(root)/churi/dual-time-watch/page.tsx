import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import DualTimeWatch from "@/@components/pages/Collection/DualTimeWatch/DualTimeWatch";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Dual Time Churi in Bangladesh",
  description:
    "Shop dual-time style churi at Rangonaa, a distinctive collection delivered across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <DualTimeWatch />
    </Suspense>
  );
}
