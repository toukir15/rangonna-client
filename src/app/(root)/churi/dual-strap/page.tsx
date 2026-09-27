import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import DualStrap from "@/@components/pages/Collection/DualStrap/DualStrap";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Dual Strap Churi in Bangladesh",
  description:
    "Browse dual-strap churi at Rangonaa, with two looks in one set and delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <DualStrap />
    </Suspense>
  );
}
