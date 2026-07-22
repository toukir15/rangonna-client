import { Suspense } from "react";
import { Metadata } from "next";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";
import PoedagarBrand from "@/@components/pages/Brand/Poedagar/Poedagar";

// ✅ DYNAMIC METADATA
export const metadata: Metadata = {
  title: "Poedagar Watches in Bangladesh",
  description:
    "Buy Original Poedagar Watches Best prices in Bangladesh at Naviforce Bangladesh. Poedagar Watches in BD",
  robots: { index: true, follow: true },
};

export default function WatchesPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <PoedagarBrand />
    </Suspense>
  );
}
