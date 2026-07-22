import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import CurrenBrand from "@/@components/pages/Brand/Curren/Curren";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Curren Watches in Bangladesh",
  description:
    "Buy Original Curren Watches Best prices in Bangladesh at Naviforce Bangladesh. Curren Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <CurrenBrand />
    </Suspense>
  );
}
