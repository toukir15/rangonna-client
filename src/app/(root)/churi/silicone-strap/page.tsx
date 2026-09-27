import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import SiliconStrap from "@/@components/pages/Collection/SiliconStrap/SiliconStrap";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Silicone Strap Churi in Bangladesh",
  description:
    "Browse lightweight silicone-strap churi at Rangonaa, comfortable for all-day wear across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <SiliconStrap />
    </Suspense>
  );
}
